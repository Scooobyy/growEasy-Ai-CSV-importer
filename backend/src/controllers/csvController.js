// src/controllers/csvController.js
import { parseCSV } from '../services/csvParser.js';
import { mapCSVToCRM } from '../services/fieldMapper.js';
import { validateCSVStructure } from '../utils/validators.js';

export const uploadCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No file uploaded' 
      });
    }

    // Parse CSV from uploaded file
    const csvContent = req.file.buffer.toString('utf-8');
    const parsed = await parseCSV(csvContent);

    if (!parsed.records || parsed.records.length === 0) {
      return res.status(400).json({ 
        error: 'CSV file is empty' 
      });
    }

    // Validate CSV structure
    const validation = validateCSVStructure(parsed.headers, parsed.records);
    
    res.status(200).json({
      success: true,
      totalRecords: parsed.records.length,
      preview: parsed.records.slice(0, 5), // Return first 5 rows as preview
      validation,
      records: parsed.records,
      headers: parsed.headers
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Upload failed',
      message: error.message 
    });
  }
};

export const processCSV = async (req, res) => {
  try {
    const { records } = req.body;
    
    if (!records || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ 
        error: 'No records provided for processing' 
      });
    }

    // Try AI processing with Gemini
    let mappedRecords;
    let rateLimitReached = false;
    try {
      const result = await mapCSVToCRM(records);
      mappedRecords = result.records;
      rateLimitReached = result.rateLimitReached;
    } catch (aiError) {
      console.error('AI processing failed, using fallback:', aiError);
      // Fallback to intelligent keyword matching
      mappedRecords = records.map(record => {
        const keys = Object.keys(record);
        const findField = (keywords) => {
          const key = keys.find(k => 
            keywords.some(keyword => 
              k.toLowerCase().includes(keyword.toLowerCase())
            )
          );
          return key ? record[key] : '';
        };

        return {
          created_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
          name: findField(['name', 'full name', 'customer', 'dish']),
          email: findField(['email', 'mail', 'e-mail']),
          country_code: '+91',
          mobile_without_country_code: findField(['phone', 'mobile', 'cell', 'contact']).toString().replace(/\D/g, ''),
          company: findField(['company', 'organization', 'business', 'employer']),
          city: findField(['city']),
          state: findField(['state', 'region', 'province']),
          country: findField(['country']) || 'India',
          lead_owner: findField(['sales rep', 'representative', 'owner', 'agent']),
          crm_status: findField(['status', 'deal status', 'stage']) || 'GOOD_LEAD_FOLLOW_UP',
          crm_note: findField(['note', 'follow up', 'comment', 'remark', 'deal value']),
          data_source: '',
          possession_time: '',
          description: findField(['description', 'details', 'info'])
        };
      });
    }
    
    // Separate valid and skipped records
    const { valid, skipped, warnings } = separateRecords(mappedRecords);

    // Add rate limit warning if applicable
    if (rateLimitReached) {
      warnings.push({
        record: 'System',
        message: 'Groq AI rate limit reached. Using intelligent keyword matching instead.'
      });
    }

    res.status(200).json({
      success: true,
      imported: valid.length,
      skipped: skipped.length,
      records: valid,
      skippedRecords: skipped,
      total: mappedRecords.length,
      aiUsed: mappedRecords !== records && !rateLimitReached, // Indicate if AI was used
      warnings: warnings,
      rateLimitReached: rateLimitReached
    });
    
  } catch (error) {
    console.error('Processing error:', error);
    res.status(500).json({ 
      error: 'Processing failed',
      message: error.message 
    });
  }
};

function separateRecords(records) {
  const valid = [];
  const skipped = [];
  const warnings = [];
  
  records.forEach(record => {
    // Check if record has email or mobile
    const hasEmail = record.email && record.email.trim() !== '';
    const hasMobile = record.mobile_without_country_code && 
                     record.mobile_without_country_code.trim() !== '';
    
    // Check if explicitly marked as skip
    const isSkipped = record.skip === true;
    
    // Add warning if missing contact info
    if (!hasEmail && !hasMobile) {
      warnings.push({
        record: record.name || 'Unknown',
        message: 'Missing email and phone number'
      });
      record.contact_warning = 'No email or phone provided';
    }
    
    if (isSkipped) {
      skipped.push(record);
    } else {
      valid.push(record);
    }
  });
  
  return { valid, skipped, warnings };
}
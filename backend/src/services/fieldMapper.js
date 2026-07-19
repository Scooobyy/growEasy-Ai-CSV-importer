import client, { AI_CONFIG } from '../config/aiConfig.js';

const CRM_FIELDS = [
  'created_at', 'name', 'email', 'country_code', 
  'mobile_without_country_code', 'company', 'city', 'state', 
  'country', 'lead_owner', 'crm_status', 'crm_note', 
  'data_source', 'possession_time', 'description'
];

const ALLOWED_STATUSES = [
  'GOOD_LEAD_FOLLOW_UP',
  'DID_NOT_CONNECT',
  'BAD_LEAD',
  'SALE_DONE'
];

const ALLOWED_SOURCES = [
  'leads_on_demand',
  'meridian_tower',
  'eden_park',
  'varah_swamy',
  'sarjapur_plots'
];

export async function mapCSVToCRM(csvRecords) {
  const batches = [];
  const batchSize = AI_CONFIG.batchSize;

  for (let i = 0; i < csvRecords.length; i += batchSize) {
    batches.push(csvRecords.slice(i, i + batchSize));
  }

  const allResults = [];
  
  for (const batch of batches) {
    try {
      const batchResults = await processBatch(batch);
      allResults.push(...batchResults);
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Batch processing failed:', error);
      // Continue with next batch
    }
  }

  return allResults;
}

async function processBatch(records) {
  // If AI is not enabled, use fallback directly
  if (!AI_CONFIG.isEnabled || !client) {
    return records.map(record => ({
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
      name: record.name || record.full_name || record.Name || '',
      email: record.email || record.Email || '',
      country_code: '+91',
      mobile_without_country_code: record.phone || record.mobile || record.Phone || record.Mobile || '',
      company: record.company || record.Company || '',
      city: record.city || record.City || '',
      state: record.state || record.State || '',
      country: record.country || record.Country || 'India',
      lead_owner: '',
      crm_status: 'GOOD_LEAD_FOLLOW_UP',
      crm_note: '',
      data_source: '',
      possession_time: '',
      description: ''
    }));
  }

  try {
    const prompt = buildAIPrompt(records);
    
    // Call Groq API
    const chatCompletion = await AI_CONFIG.client.chat.completions.create({
      model: AI_CONFIG.modelName,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: AI_CONFIG.temperature,
      max_tokens: AI_CONFIG.maxTokens,
    });
    
    const text = chatCompletion.choices[0].message.content;
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }
    
    const parsedResult = JSON.parse(jsonMatch[0]);
    return parsedResult.records || [];
    
  } catch (error) {
    console.error('AI processing error:', error);
    // Fallback: return records with basic mapping
    return records.map(record => ({
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
      name: record.name || record.full_name || record.Name || '',
      email: record.email || record.Email || '',
      country_code: '+91',
      mobile_without_country_code: record.phone || record.mobile || record.Phone || record.Mobile || '',
      company: record.company || record.Company || '',
      city: record.city || record.City || '',
      state: record.state || record.State || '',
      country: record.country || record.Country || 'India',
      lead_owner: '',
      crm_status: 'GOOD_LEAD_FOLLOW_UP',
      crm_note: '',
      data_source: '',
      possession_time: '',
      description: ''
    }));
  }
}

function buildAIPrompt(records) {
  const sampleRecords = records.slice(0, 5);
  const allColumns = Object.keys(records[0] || {});
  
  return `You are an expert at mapping CSV columns to CRM fields. 
Follow these rules strictly:

1. Only use these CRM status values: ${ALLOWED_STATUSES.join(', ')}
2. Only use these data source values: ${ALLOWED_SOURCES.join(', ')}
3. created_at must be a valid date string
4. If multiple emails exist, use first as email, others in crm_note
5. If multiple phones exist, use first as mobile, others in crm_note
6. Do NOT skip records - process all records regardless of missing contact info
7. Return ONLY valid JSON

CSV Columns: ${allColumns.join(', ')}

Sample records:
${JSON.stringify(sampleRecords, null, 2)}

Map each record to this CRM structure:
{
  records: [
    {
      created_at: string (date),
      name: string,
      email: string,
      country_code: string (like +91),
      mobile_without_country_code: string,
      company: string,
      city: string,
      state: string,
      country: string,
      lead_owner: string,
      crm_status: string (one of ${ALLOWED_STATUSES.join(', ')}),
      crm_note: string,
      data_source: string (one of ${ALLOWED_SOURCES.join(', ')}, or empty),
      possession_time: string,
      description: string
    }
  ]
}

Return ONLY the JSON object, no other text.`;
}
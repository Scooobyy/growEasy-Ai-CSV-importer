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
  let rateLimitReached = false;
  
  for (const batch of batches) {
    try {
      const batchResults = await processBatch(batch);
      allResults.push(...batchResults);
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Batch processing failed:', error);
      // Check if it's a rate limit error (handle nested error structure and message content)
      const errorMessage = error.message || (error.error && error.error.message) || JSON.stringify(error);
      const isRateLimit = error.status === 429 || 
                         error.code === 'rate_limit_exceeded' ||
                         (error.error && error.error.code === 'rate_limit_exceeded') ||
                         errorMessage.toLowerCase().includes('rate limit');
      
      console.log('Error detection - isRateLimit:', isRateLimit, 'errorMessage:', errorMessage);
      
      if (isRateLimit) {
        rateLimitReached = true;
        console.warn('Rate limit reached, switching to intelligent keyword matching');
        // Fall back to intelligent mapping for remaining batches
        const fallbackResults = batch.map(record => {
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
        allResults.push(...fallbackResults);
        console.log('Fallback applied, processed', fallbackResults.length, 'records');
      } else {
        // For other errors, continue with next batch
        console.log('Non-rate-limit error, skipping batch');
        continue;
      }
    }
  }

  return { records: allResults, rateLimitReached };
}

async function processBatch(records) {
  // If AI is not enabled, use fallback directly
  if (!AI_CONFIG.isEnabled || !client) {
    return records.map(record => {
      // Intelligent field mapping using keyword matching
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
    // Check if it's a rate limit error - if so, throw it up to be handled by outer catch
    const errorMessage = error.message || (error.error && error.error.message) || JSON.stringify(error);
    const isRateLimit = error.status === 429 || 
                       error.code === 'rate_limit_exceeded' ||
                       (error.error && error.error.code === 'rate_limit_exceeded') ||
                       errorMessage.toLowerCase().includes('rate limit');
    
    if (isRateLimit) {
      console.log('Rate limit detected in processBatch, throwing to outer handler');
      throw error; // Re-throw to be caught by outer handler
    }
    
    // For other errors, use fallback
    console.log('Non-rate-limit AI error, using fallback mapping');
    return records.map(record => {
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
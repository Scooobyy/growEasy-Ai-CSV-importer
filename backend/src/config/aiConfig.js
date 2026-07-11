import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Groq with error handling
let client;
let isAIEnabled = false;

const apiKey = process.env.GROQ_API_KEY;

if (apiKey && apiKey.trim() && apiKey !== 'your_groq_api_key_here') {
  try {
    client = new Groq({
      apiKey: apiKey,
    });
    isAIEnabled = true;
    console.log('✓ Groq AI initialized successfully');
  } catch (error) {
    console.warn('⚠ Failed to initialize Groq AI:', error.message);
    console.warn('AI processing will fall back to basic mapping');
    client = null;
    isAIEnabled = false;
  }
} else {
  console.warn('⚠ GROQ_API_KEY not configured. AI processing will fall back to basic mapping.');
  client = null;
  isAIEnabled = false;
}

export const AI_CONFIG = {
  client: client,
  temperature: 0.1,
  maxTokens: 2000,
  batchSize: 5,
  modelName: 'llama-3.3-70b-versatile',
  isEnabled: isAIEnabled
};

export default client;
# GrowEasy CSV Importer

An intelligent CSV import system that uses AI to automatically map diverse CSV structures to CRM fields. The system handles different column names, layouts, and data formats while ensuring data quality through validation.

## 🚀 Features

- **AI-Powered Field Mapping**: Uses Groq AI (llama-3.3-70b-versatile) to intelligently map CSV columns to CRM fields
- **Diverse CSV Support**: Handles CSVs with different column names, layouts, and structures
- **Fallback Mechanism**: Rule-based mapping when AI is unavailable
- **Data Validation**: Skips records without email or phone number (CRM requirement)
- **Batch Processing**: Processes large files efficiently with rate limit protection
- **Real-time Preview**: Shows CSV preview before import
- **Import Results**: Detailed success/skip statistics with record-level details

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express
- **Groq SDK** for AI integration
- **CSV Parser** for file processing

### Frontend
- **React** for user interface
- **TailwindCSS** for styling
- **Lucide** for icons

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Groq API key (free at [console.groq.com](https://console.groq.com))

## 🔧 Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd growEasy-csv-importer
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Install frontend dependencies**
```bash
cd ../frontend
npm install
```

4. **Configure environment variables**

Create a `.env` file in the `backend` directory:
```env
PORT=5000
GROQ_API_KEY=your_groq_api_key_here
NODE_ENV=development
```

## 🚀 Running the Application

### Start Backend Server
```bash
cd backend
npm run dev
```
Backend runs on `process.env.NEXT_PUBLIC_API_URL`

### Start Frontend Development Server
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:3000` (or as configured)

## 📖 Usage

1. **Upload CSV File**: Click the upload button and select your CSV file
2. **Preview Data**: Review the parsed CSV structure and sample records
3. **Process Import**: Click "Import CSV" to process with AI mapping
4. **View Results**: See imported vs skipped records with detailed information

## 🧪 Test Files

The project includes test CSV files to demonstrate AI mapping capabilities:

- **test_leads.csv**: Lead data with diverse column names
- **sales_report.csv**: Sales report with business-specific fields
- **food.csv**: Nutritional data (requires contact columns for import)

## 🔍 How AI Mapping Works

The system analyzes your CSV structure:

1. **Column Detection**: Extracts all column names from your CSV
2. **Sample Analysis**: Processes sample records to understand data patterns
3. **Intelligent Mapping**: Uses AI to map columns to CRM fields:
   - `Client Name` → `name`
   - `EmailAddress` → `email`
   - `Contact Number` → `mobile`
   - `Organization` → `company`
   - And many more variations

4. **Validation**: Ensures required fields (email/phone) are present
5. **CRM Formatting**: Formats data according to CRM requirements

## 📊 CRM Field Mapping

The system maps to the following CRM fields:

- `created_at` - Timestamp
- `name` - Contact name
- `email` - Email address
- `country_code` - Phone country code (+91 default)
- `mobile_without_country_code` - Phone number
- `company` - Organization name
- `city` - City
- `state` - State/Region
- `country` - Country
- `lead_owner` - Assigned owner
- `crm_status` - Lead status (GOOD_LEAD_FOLLOW_UP, DID_NOT_CONNECT, BAD_LEAD, SALE_DONE)
- `crm_note` - Additional notes
- `data_source` - Lead source
- `possession_time` - Time information
- `description` - Description

## ⚙️ Configuration

### AI Configuration (backend/src/config/aiConfig.js)
```javascript
export const AI_CONFIG = {
  client: client,
  temperature: 0.1,        // AI creativity (0-1)
  maxTokens: 2000,        // Response length limit
  batchSize: 5,           // Records per batch (rate limit protection)
  modelName: 'llama-3.3-70b-versatile',
  isEnabled: true
};
```

### Rate Limit Protection
- Batch size: 5 records per API call
- Delay: 500ms between batches
- Prevents API rate limiting issues

## 🐛 Troubleshooting

### Records Being Skipped
- **Cause**: Missing email or phone number
- **Solution**: Ensure CSV has contact information columns

### AI Processing Errors
- **Cause**: API key issues or rate limits
- **Solution**: Check GROQ_API_KEY in .env, verify API credits

### Model Decommissioned
- **Cause**: Using outdated AI model
- **Solution**: Update modelName in aiConfig.js to current model

## 📝 API Endpoints

### Backend Endpoints

- `POST /api/upload` - Upload and parse CSV file
- `POST /api/process` - Process CSV with AI mapping

## 🔒 Security Notes

- **Never commit** `.env` files to version control
- **Use environment variables** for sensitive data
- **Validate** all uploaded files
- **Sanitize** user inputs

## 📄 License

This project is provided as-is for demonstration purposes.

## 🤝 Contributing

This is a demonstration project. For production use, consider:
- Adding authentication
- Implementing proper error handling
- Adding unit tests
- Setting up CI/CD pipeline
- Adding monitoring and logging

## 📞 Support

For issues or questions, please refer to the project documentation or contact the development team.

---

**Built with ❤️ using Groq AI**

// src/routes/csvRoutes.js
import express from 'express';
import multer from 'multer';
import { uploadCSV, processCSV } from '../controllers/csvController.js';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

// Route for uploading and previewing CSV
router.post('/upload', upload.single('csvFile'), uploadCSV);

// Route for processing CSV with AI
router.post('/process', processCSV);

export default router;
// src/middleware/errorHandler.js
export function errorHandler(err, req, res, next) {
  console.error('Error:', err);
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ 
      error: 'File too large',
      message: 'Maximum file size is 10MB'
    });
  }
  
  if (err.message.includes('CSV')) {
    return res.status(400).json({ 
      error: 'CSV Error',
      message: err.message
    });
  }
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}
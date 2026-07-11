// src/utils/validators.js
export function validateCSVStructure(headers, records) {
  if (!headers || headers.length === 0) {
    return { valid: false, message: 'No headers found in CSV' };
  }
  
  if (!records || records.length === 0) {
    return { valid: false, message: 'No data rows found in CSV' };
  }
  
  // Check if at least one row has data
  const hasData = records.some(row => 
    Object.values(row).some(val => val && val.trim() !== '')
  );
  
  if (!hasData) {
    return { valid: false, message: 'CSV appears to be empty' };
  }
  
  return { valid: true };
}
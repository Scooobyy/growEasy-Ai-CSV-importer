// src/services/csvParser.js
import csv from 'csv-parser';
import { Readable } from 'stream';

export function parseCSV(data) {
  return new Promise((resolve, reject) => {
    const results = [];
    const headers = [];
    
    // Convert string to readable stream
    const stream = Readable.from([data]);
    
    stream
      .pipe(csv({
        mapHeaders: ({ header }) => header.trim(),
        mapValues: ({ value }) => value?.trim() || '',
        skipEmptyLines: true,
      }))
      .on('headers', (headerList) => {
        headers.push(...headerList);
      })
      .on('data', (data) => {
        // Filter out empty rows
        const hasData = Object.values(data).some(val => val !== '');
        if (hasData) {
          results.push(data);
        }
      })
      .on('end', () => {
        resolve({
          headers,
          records: results,
          totalRows: results.length,
        });
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}
// frontend/src/app/page.js
'use client';

import { useState } from 'react';
import CSVUploader from './components/CSVUploader';
import CSVPreview from './components/CSVPreview';
import ImportResults from './components/ImportResults';
import LoadingSpinner from './components/LoadingSpinner';
import { useCSVImport } from '../hooks/useCSVImport';

export default function Home() {
  const [uploadedData, setUploadedData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  const {
    loading,
    error,
    results,
    uploadCSV,
    processWithAI,
    reset
  } = useCSVImport();

  const handleUpload = async (file) => {
    const data = await uploadCSV(file);
    if (data) {
      setUploadedData(data);
      setShowPreview(true);
      setShowResults(false);
    }
  };

  const handleConfirmImport = async () => {
    if (uploadedData) {
      const processResult = await processWithAI(uploadedData.records);
      if (processResult) {
        setShowPreview(false);
        setShowResults(true);
      }
    }
  };

  const handleReset = () => {
    reset();
    setUploadedData(null);
    setShowPreview(false);
    setShowResults(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            GrowEasy CSV Importer
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            AI-powered CSV to CRM mapping
          </p>
        </header>

        {!showPreview && !showResults && (
          <div className="max-w-3xl mx-auto">
            <CSVUploader onUpload={handleUpload} loading={loading} />
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        )}

        {error && (
          <div className="max-w-3xl mx-auto mt-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-6 py-4 rounded-lg">
              <p className="font-semibold">Error</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {showPreview && uploadedData && !loading && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  CSV Preview
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Found {uploadedData.totalRecords} records
                </p>
              </div>
              <div className="space-x-3">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmImport}
                  className="px-6 py-2 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition"
                >
                  Confirm Import
                </button>
              </div>
            </div>
            
            <CSVPreview data={{
              headers: uploadedData.headers,
              records: uploadedData.records,
              totalRows: uploadedData.totalRecords,
              hasMore: uploadedData.totalRecords > 5
            }} />
          </div>
        )}

        {showResults && results && !loading && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Import Results
              </h2>
              <button
                onClick={handleReset}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Import Another File
              </button>
            </div>
            
            <ImportResults results={results} />
          </div>
        )}

        <footer className="mt-16 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Built with AI-powered CSV mapping for GrowEasy CRM</p>
        </footer>
      </div>
    </main>
  );
}
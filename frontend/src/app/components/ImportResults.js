// frontend/src/app/components/ImportResults.js
'use client';

import { useState } from 'react';

export default function ImportResults({ results }) {
  const { imported, skipped, records, skippedRecords, total, warnings } = results;
  const [showAll, setShowAll] = useState(false);
  const [activeTab, setActiveTab] = useState('imported');

  const displayRecords = activeTab === 'imported' 
    ? (showAll ? records : records.slice(0, 20))
    : (showAll ? skippedRecords : skippedRecords.slice(0, 20));

  const headers = activeTab === 'imported' && records.length > 0
    ? Object.keys(records[0])
    : activeTab === 'skipped' && skippedRecords.length > 0
    ? Object.keys(skippedRecords[0])
    : [];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-sm text-green-600 dark:text-green-400">Successfully Imported</p>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300">{imported}</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-sm text-yellow-600 dark:text-yellow-400">Skipped Records</p>
          <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{skipped}</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-600 dark:text-blue-400">Total Processed</p>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{total}</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
          <p className="text-sm text-purple-600 dark:text-purple-400">Success Rate</p>
          <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
            {total > 0 ? Math.round((imported / total) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Warnings Section */}
      {warnings && warnings.length > 0 && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <h3 className="text-sm font-semibold text-orange-800 dark:text-orange-300">
              Warnings ({warnings.length})
            </h3>
          </div>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {warnings.slice(0, 10).map((warning, index) => (
              <div key={index} className="text-xs text-orange-700 dark:text-orange-400">
                • {warning.record}: {warning.message}
              </div>
            ))}
            {warnings.length > 10 && (
              <div className="text-xs text-orange-600 dark:text-orange-500">
                ... and {warnings.length - 10} more warnings
              </div>
            )}
          </div>
        </div>
      )}

      {/* Results Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-600">
          <div className="flex space-x-4 px-6 py-3">
            <button
              onClick={() => setActiveTab('imported')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'imported'
                  ? 'bg-primary text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Imported Records ({imported})
            </button>
            <button
              onClick={() => setActiveTab('skipped')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'skipped'
                  ? 'bg-primary text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Skipped Records ({skipped})
            </button>
          </div>
        </div>

        {headers.length > 0 && displayRecords.length > 0 ? (
          <div className="overflow-x-auto relative">
            <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
              <table className="w-full text-sm text-left">
                <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                      #
                    </th>
                    {headers.map((header, index) => (
                      <th
                        key={index}
                        className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap border-b border-gray-200 dark:border-gray-600"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {displayRecords.map((record, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {rowIndex + 1}
                      </td>
                      {headers.map((header, colIndex) => (
                        <td
                          key={colIndex}
                          className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap max-w-xs truncate"
                          title={record[header] || ''}
                        >
                          {record[header] || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No records to display in this category
          </div>
        )}

        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600 flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {Math.min(displayRecords.length, 20)} of {displayRecords.length} rows
          </div>
          {displayRecords.length > 20 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-sm text-primary hover:text-primary/80 dark:text-primary-light font-medium transition"
            >
              {showAll ? 'Show Less' : 'Show All'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
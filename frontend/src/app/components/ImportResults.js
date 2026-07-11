// frontend/src/app/components/ImportResults.js
'use client';

import { useState } from 'react';

export default function ImportResults({ results }) {
  const { imported, skipped, records, skippedRecords, total } = results;
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
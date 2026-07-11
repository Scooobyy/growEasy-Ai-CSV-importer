// frontend/src/app/components/CSVPreview.js
'use client';

import { useState } from 'react';

export default function CSVPreview({ data }) {
  const { headers, records, totalRows, hasMore } = data;
  const [showAll, setShowAll] = useState(false);
  
  const displayRecords = showAll ? records : records.slice(0, 20);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto relative">
        <div className="max-h-[500px] overflow-y-auto scrollbar-thin">
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
      
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600 flex items-center justify-between">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing {Math.min(records.length, 20)} of {totalRows} rows
          {hasMore && ' (limited preview)'}
        </div>
        {records.length > 20 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-primary hover:text-primary/80 dark:text-primary-light font-medium transition"
          >
            {showAll ? 'Show Less' : 'Show All'}
          </button>
        )}
      </div>
    </div>
  );
}
// frontend/src/app/components/LoadingSpinner.js
export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin absolute top-0"></div>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">
        Processing with AI...
      </p>
    </div>
  );
}
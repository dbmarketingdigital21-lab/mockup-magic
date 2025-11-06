
import React from 'react';

interface LoadingOverlayProps {
  isLoading: boolean;
  message: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading, message }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center z-50 transition-opacity duration-300">
      <div className="flex flex-col items-center justify-center text-white">
        <svg className="animate-spin h-12 w-12 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-4 text-lg font-semibold">{message}</p>
        <p className="mt-1 text-sm text-slate-300">This may take a moment...</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;

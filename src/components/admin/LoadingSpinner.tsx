
import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">Loading admin panel...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;

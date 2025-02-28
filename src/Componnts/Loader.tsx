import React from "react";

const Loader: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="relative">
        <div className="w-10-10 order-4 border-gray-300 border-opacity-20 rounded-full animate-spin-slow absolute"></div>
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent border-l-transparent rounded-full animate-spin-fast"></div>
      </div>
    </div>
  );
};

export default Loader;

import React from 'react';

interface LoaderUploadProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

const LoaderUpload: React.FC<LoaderUploadProps> = ({ 
  size = 'md', 
  color = 'purple',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4'
  };

  const colorClasses = {
    purple: 'border-purple-200 border-t-purple-600',
    blue: 'border-blue-200 border-t-blue-600',
    green: 'border-green-200 border-t-green-600',
    red: 'border-red-200 border-t-red-600',
    gray: 'border-gray-200 border-t-gray-600'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`
          ${sizeClasses[size]}
          ${colorClasses[color as keyof typeof colorClasses]}
          rounded-full
          animate-spin
          ease-in-out
        `}
      />
    </div>
  );
};

export default LoaderUpload;
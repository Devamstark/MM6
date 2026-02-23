import React from 'react';

interface SkeletonCardProps {
  count?: number;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="animate-pulse"
        >
          {/* Image Placeholder */}
          <div className="bg-gray-200 dark:bg-gray-700 aspect-square rounded-lg mb-3" />
          
          {/* Brand/Category */}
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2" />
          
          {/* Product Name */}
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
          
          {/* Price */}
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
        </div>
      ))}
    </>
  );
};

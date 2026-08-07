import React from 'react';
import { View } from 'react-native';
import { MotiView } from 'moti';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  className?: string;
}

export default function Skeleton({ width = '100%', height = 20, borderRadius = 8, className = '' }: SkeletonProps) {
  return (
    <MotiView
      from={{ opacity: 0.3 }}
      animate={{ opacity: 0.7 }}
      transition={{
        type: 'timing',
        duration: 1000,
        loop: true,
      }}
      style={{ width: width as any, height: height as any, borderRadius }}
      className={`bg-gray-200 dark:bg-gray-700 ${className}`}
    />
  );
}

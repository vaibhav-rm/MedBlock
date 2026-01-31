import { View } from 'react-native';
import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 1
  color?: string;
  className?: string;
}

export default function ProgressBar({ progress, color = '#008080', className }: ProgressBarProps) {
  return (
    <View className={`h-2 bg-gray-200 rounded-full overflow-hidden ${className}`}>
      <View 
        style={{ width: `${Math.max(0, Math.min(100, progress * 100))}%`, backgroundColor: color }} 
        className="h-full rounded-full"
      />
    </View>
  );
}

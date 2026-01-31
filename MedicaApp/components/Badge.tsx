import { View, Text } from 'react-native';
import React from 'react';

interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'error' | 'neutral';
  className?: string;
}

export default function Badge({ label, variant = 'neutral', className }: BadgeProps) {
  let bgClass = 'bg-gray-100';
  let textClass = 'text-gray-600';

  switch (variant) {
    case 'success':
      bgClass = 'bg-green-100';
      textClass = 'text-green-700';
      break;
    case 'warning':
      bgClass = 'bg-orange-100';
      textClass = 'text-orange-700';
      break;
    case 'error':
      bgClass = 'bg-red-100';
      textClass = 'text-red-700';
      break;
  }

  return (
    <View className={`px-2 py-1 rounded-md self-start ${bgClass} ${className}`}>
      <Text className={`text-xs font-medium ${textClass}`}>{label}</Text>
    </View>
  );
}

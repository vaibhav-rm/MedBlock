import { View, ViewProps } from 'react-native';
import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';

interface GradientBackgroundProps extends ViewProps {
  children: React.ReactNode;
}

export default function GradientBackground({ children, className, style, ...props }: GradientBackgroundProps) {
  return (
    <LinearGradient
      // Soft Teal to Light Blue/White gradient
      colors={['#E0F7FA', '#FFFFFF', '#F0F4F8']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className={`flex-1 ${className}`}
      style={style}
      {...props}
    >
      {children}
    </LinearGradient>
  );
}

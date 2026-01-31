import { View, Text, ViewProps } from 'react-native';
import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  title?: string;
  variant?: 'default' | 'glass' | 'glass-dark' | 'elevated' | 'gradient';
  headerColor?: string;
  className?: string;
}

export default function Card({ 
  children, 
  title, 
  variant = 'default',
  headerColor,
  className = '',
  ...props 
}: CardProps) {
  // Variant class names
  const variantClasses = {
    default: 'bg-white shadow-soft border border-gray-100',
    glass: 'glass shadow-card',
    'glass-dark': 'glass-dark shadow-elevated',
    elevated: 'bg-white card-elevated',
    gradient: '',
  };

  const baseClasses = `rounded-2xl p-4 mb-4 ${variant !== 'gradient' ? variantClasses[variant] : ''} ${className}`;

  if (variant === 'gradient') {
    return (
      <View className={`rounded-2xl overflow-hidden mb-4 ${className}`} {...props}>
        <LinearGradient
          colors={['#14b8a6', '#0d9488']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="p-4"
        >
          {title && (
            <Text className="text-lg font-bold text-white mb-2">{title}</Text>
          )}
          {children}
        </LinearGradient>
      </View>
    );
  }

  return (
    <View className={baseClasses} {...props}>
      {title && (
        <View className={`pb-3 mb-3 border-b ${headerColor ? `border-${headerColor}-100` : 'border-gray-100'}`}>
          <Text className={`text-lg font-bold ${headerColor ? `text-${headerColor}-700` : 'text-gray-800'}`}>
            {title}
          </Text>
        </View>
      )}
      {children}
    </View>
  );
}

import { View, Text, TextInput, TextInputProps } from 'react-native';
import React from 'react';
import { Colors } from '../constants/Colors';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className, ...props }: InputProps) {
  return (
    <View className={`mb-4 ${className}`}>
      {label && <Text className="text-gray-600 font-medium mb-1.5 ml-1">{label}</Text>}
      <TextInput
        placeholderTextColor="#999"
        className={`bg-white border border-gray-200 p-4 rounded-xl text-gray-800 ${error ? 'border-error' : 'focus:border-primary'}`}
        {...props}
      />
      {error && <Text className="text-error text-xs ml-1 mt-1">{error}</Text>}
    </View>
  );
}

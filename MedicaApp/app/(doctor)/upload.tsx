import { View, Text, Alert } from 'react-native';
import React, { useState } from 'react';
import ScreenWrapper from '@/components/ScreenWrapper';
import Input from '@/components/Input';
import Button from '@/components/Button';
import AnimatedCard from '@/components/AnimatedCard';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

export default function Upload() {
  const [loading, setLoading] = useState(false);

  const handleUpload = () => {
    setLoading(true);
    setTimeout(() => {
        setLoading(false);
        Alert.alert("Success", "Record uploaded/minted successfully!");
    }, 2000);
  };

  return (
    <ScreenWrapper>
      <Text className="text-2xl font-bold text-gray-800 mb-6">Upload Record</Text>
      
      <AnimatedCard className="p-0 overflow-hidden mb-6">
        <View className="bg-gray-50 p-8 items-center justify-center border-b border-gray-100 border-dashed">
            <View className="w-16 h-16 bg-blue-50 rounded-full items-center justify-center mb-2">
                <Ionicons name="cloud-upload-outline" size={32} color={Colors.light.primary} />
            </View>
            <Text className="text-gray-500 font-medium">Tap to select file</Text>
            <Text className="text-gray-400 text-xs">PDF, JPG, PNG up to 10MB</Text>
        </View>

        <View className="p-5">
            <Input label="Patient Address" placeholder="0x..." className="mb-4" />
            <Input label="Record Title" placeholder="e.g. Blood Test Report" className="mb-4" />
            
            <Button title="Upload to IPFS & Blockchain" onPress={handleUpload} loading={loading} />
        </View>
      </AnimatedCard>
    </ScreenWrapper>
  );
}

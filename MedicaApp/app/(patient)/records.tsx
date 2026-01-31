import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import React from 'react';
import ScreenWrapper from '@/components/ScreenWrapper';
import AnimatedCard from '@/components/AnimatedCard';
import HealthIllustration from '@/components/HealthIllustration';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

// Dummy Data
const MOCK_RECORDS = [
  { id: '1', title: 'Blood Test Report', date: '2 days ago', type: 'Lab', doctor: 'Dr. Sarah Smith', fileType: 'PDF' },
  { id: '2', title: 'MRI Scan - Knee', date: '1 week ago', type: 'Radiology', doctor: 'Dr. John Doe', fileType: 'DICOM' },
  { id: '3', title: 'Vaccination Certificate', date: '1 month ago', type: 'Immunization', doctor: 'Dr. Emily Chen', fileType: 'PDF' },
  { id: '4', title: 'General Checkup', date: '3 months ago', type: 'Consultation', doctor: 'Dr. Sarah Smith', fileType: 'PDF' },
  { id: '5', title: 'X-Ray Chest', date: '4 months ago', type: 'Radiology', doctor: 'Dr. Mike Wilson', fileType: 'DICOM' },
];

const getIconForType = (type: string) => {
  switch (type) {
    case 'Lab': return 'flask';
    case 'Radiology': return 'body';
    case 'Immunization': return 'shield-checkmark';
    case 'Consultation': return 'medical';
    default: return 'document';
  }
};

const getGradientForType = (type: string): [string, string] => {
  switch (type) {
    case 'Lab': return ['#3b82f6', '#2563eb'];
    case 'Radiology': return ['#8b5cf6', '#7c3aed'];
    case 'Immunization': return ['#10b981', '#059669'];
    case 'Consultation': return ['#f59e0b', '#d97706'];
    default: return ['#14b8a6', '#0d9488'];
  }
};

export default function Records() {
  const handleView = (title: string) => {
    Alert.alert(`Opening ${title}`, "This would open the encrypted PDF from IPFS.");
  };

  const handleDownload = (title: string) => {
    Alert.alert(`Downloading ${title}`, "Downloading from IPFS...");
  };

  return (
    <ScreenWrapper className="bg-background">
      {/* Header */}
      <Animated.View entering={FadeIn.delay(100)} className="mb-6">
        <Text className="text-3xl font-display font-bold text-text-dark">My Records</Text>
        <Text className="text-text-light mt-1">Securely stored on IPFS & Blockchain</Text>
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {MOCK_RECORDS.length > 0 ? (
          MOCK_RECORDS.map((record, index) => {
            const gradientColors = getGradientForType(record.type);
            const iconName = getIconForType(record.type);

            return (
              <AnimatedCard 
                key={record.id} 
                delay={150 + index * 100} 
                className="mb-4 p-0 overflow-hidden border-0 shadow-card"
              >
                <View className="flex-row items-center p-5">
                  {/* Icon with Gradient Background */}
                  <LinearGradient
                    colors={gradientColors}
                    className="w-14 h-14 rounded-2xl items-center justify-center mr-4"
                  >
                    <Ionicons name={iconName as any} size={24} color="#ffffff" />
                  </LinearGradient>
                  
                  <View className="flex-1">
                    <Text className="font-bold text-text-dark text-base">{record.title}</Text>
                    <View className="flex-row items-center mt-1">
                      <Text className="text-text-light text-xs">{record.date}</Text>
                      <View className="w-1 h-1 bg-text-light rounded-full mx-2" />
                      <Text className="text-text-light text-xs">{record.doctor}</Text>
                    </View>
                    <View className="bg-gray-100 px-2 py-0.5 rounded mt-2 self-start">
                      <Text className="text-text-light text-[10px] font-semibold">{record.fileType}</Text>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View className="flex-row gap-2">
                    <TouchableOpacity 
                      onPress={() => handleView(record.title)}
                      className="bg-primary-50 p-3 rounded-xl"
                    >
                      <Ionicons name="eye-outline" size={20} color="#0d9488" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => handleDownload(record.title)}
                      className="bg-gray-100 p-3 rounded-xl"
                    >
                      <Ionicons name="download-outline" size={20} color="#64748b" />
                    </TouchableOpacity>
                  </View>
                </View>
              </AnimatedCard>
            );
          })
        ) : (
          <AnimatedCard delay={200} className="p-8 items-center border-0">
            <HealthIllustration type="empty-records" size="md" className="mb-4" />
            <Text className="text-text-dark font-bold text-lg mb-2">No records yet</Text>
            <Text className="text-text-light text-center text-sm">
              Your medical records will appear here once uploaded by healthcare providers.
            </Text>
          </AnimatedCard>
        )}

        {/* Summary Card */}
        <AnimatedCard delay={700} className="mt-4 p-0 overflow-hidden border-0">
          <LinearGradient
            colors={['#f8fafc', '#f1f5f9']}
            className="p-5 flex-row items-center justify-between"
          >
            <View className="flex-row items-center">
              <View className="bg-primary-600 w-10 h-10 rounded-full items-center justify-center mr-3">
                <Ionicons name="shield-checkmark" size={20} color="#ffffff" />
              </View>
              <View>
                <Text className="text-text-dark font-bold">All records encrypted</Text>
                <Text className="text-text-light text-xs">Stored securely on IPFS</Text>
              </View>
            </View>
            <Text className="text-success-dark font-bold text-2xl">{MOCK_RECORDS.length}</Text>
          </LinearGradient>
        </AnimatedCard>
      </ScrollView>
    </ScreenWrapper>
  );
}

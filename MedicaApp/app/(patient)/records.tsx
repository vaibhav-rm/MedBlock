import { View, Text, ScrollView, TouchableOpacity, Alert, Linking, RefreshControl } from 'react-native';
import React, { useEffect, useState } from 'react';
import ScreenWrapper from '@/components/ScreenWrapper';
import AnimatedCard from '@/components/AnimatedCard';
import HealthIllustration from '@/components/HealthIllustration';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { getProvider, getContracts } from '@/services/web3';
import { getIpfsUrl } from '@/services/ipfs';



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
  const { id } = useLocalSearchParams();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchRecords();
  }, [id]);

  const fetchRecords = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const provider = getProvider();
      const { patientContract } = await getContracts(provider);
      
      const patientId = (Array.isArray(id) ? id[0] : id).toLowerCase();
      const result = await patientContract.getMedicalRecords(patientId);
      
      // Map result (array of structs) to our format
      // Struct: (ipfsHash, fileType, fileName, title, resume, timestamp, doctor, isActive, ...)
      const formattedRecords = result.map((r: any, index: number) => ({
        id: index.toString(),
        ipfsHash: r.ipfsHash || r[0],
        fileType: r.fileType || r[1],
        fileName: r.fileName || r[2],
        title: r.title || r[3],
        resume: r.resume || r[4],
        timestamp: r.timestamp || r[5],
        doctor: r.doctor || r[6],
        isActive: r.isActive || r[7],
        // Mapped fields for UI
        type: (r.fileType || r[1])?.includes('Lab') ? 'Lab' : 'Consultation', // Simplified mapping
        date: new Date(Number(r.timestamp || r[5]) * 1000).toLocaleDateString(),
        doctorName: `${(r.doctor || r[6]).slice(0,6)}...` // We could fetch doctor name if needed
      }));

      // Filter only active records
      setRecords(formattedRecords.filter((r: any) => r.isActive));
    } catch (e) {
      console.error("Error fetching records:", e);
      Alert.alert("Error", "Could not fetch medical records");
    } finally {
      setLoading(false);
    }
  };

  const handleView = (record: any) => {
    const url = getIpfsUrl(record.ipfsHash);
    Linking.openURL(url);
  };

  const handleDownload = (record: any) => {
     const url = getIpfsUrl(record.ipfsHash);
     Linking.openURL(url);
  };

  return (
    <ScreenWrapper className="bg-background">
      {/* Header */}
      <Animated.View entering={FadeIn.delay(100)} className="mb-6">
        <Text className="text-3xl font-display font-bold text-text-dark">My Records</Text>
        <Text className="text-text-light mt-1">Securely stored on IPFS & Blockchain</Text>
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchRecords} />}
      >
        {records.length > 0 ? (
          records.map((record, index) => {
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
                      <Text className="text-text-light text-xs">{record.doctorName}</Text>
                    </View>
                    <View className="bg-gray-100 px-2 py-0.5 rounded mt-2 self-start">
                      <Text className="text-text-light text-[10px] font-semibold">{record.fileName}</Text>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View className="flex-row gap-2">
                    <TouchableOpacity 
                      onPress={() => handleView(record)}
                      className="bg-primary-50 p-3 rounded-xl"
                    >
                      <Ionicons name="eye-outline" size={20} color="#0d9488" />
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
            <Text className="text-success-dark font-bold text-2xl">{records.length}</Text>
          </LinearGradient>
        </AnimatedCard>
      </ScrollView>
    </ScreenWrapper>
  );
}

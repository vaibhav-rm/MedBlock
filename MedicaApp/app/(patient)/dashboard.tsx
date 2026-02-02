import { View, Text, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import React, { useEffect, useState } from 'react';
import ScreenWrapper from '@/components/ScreenWrapper';
import Card from '@/components/Card';
import AnimatedCard from '@/components/AnimatedCard';
import PulseAnimation from '@/components/PulseAnimation';
import HealthIllustration from '@/components/HealthIllustration';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { getProvider, getContracts } from '@/services/web3';

export default function PatientDashboard() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [patientName, setPatientName] = useState('Patient');
  const [recordCount, setRecordCount] = useState(0);
  const [activeGrants, setActiveGrants] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const fetchData = async () => {
    if (!id) return;
    try {
      const provider = getProvider();
      const { patientContract } = await getContracts(provider);
      
      const patientId = (Array.isArray(id) ? id[0] : id).toLowerCase();
      
      // Get Patient Info
      try {
        const info = await patientContract.getPatient(patientId);
        setPatientName(info[0]);
      } catch (e) { console.log("Error fetching patient", e); }

      // Get Records
      try {
        const records = await patientContract.getMedicalRecords(patientId);
        setRecordCount(records.length);
      } catch (e) { console.log("Error fetching records", e); }

      // Mock Active Grants
      setActiveGrants(0); 

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!id) {
     return (
         <ScreenWrapper className="bg-background justify-center items-center">
             <Text className="text-gray-500">No Patient ID provided.</Text>
         </ScreenWrapper>
     );
  }

  return (
    <ScreenWrapper className="bg-background">
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} />}>
        {/* Header */}
        <Animated.View 
          entering={FadeIn.delay(100)}
          className="flex-row justify-between items-center mb-6"
        >
          <View>
            <Text className="text-text-light text-xs font-medium uppercase tracking-wider">Dashboard</Text>
            <Text className="text-3xl font-display font-bold text-text-dark mt-1">Hello, {patientName}</Text>
          </View>
          <TouchableOpacity className="w-12 h-12 bg-white shadow-soft rounded-full items-center justify-center border border-gray-100">
            <Image 
              source={{ uri: `https://ui-avatars.com/api/?name=${patientName}&background=14b8a6&color=fff` }} 
              className="w-full h-full rounded-full"
            />
          </TouchableOpacity>
        </Animated.View>

        {/* Health Hero Illustration */}
        <AnimatedCard delay={150} className="bg-white rounded-3xl mb-6 p-6 shadow-card overflow-hidden">
          <HealthIllustration type="hero-health" size="md" className="mb-4" />
          <Text className="text-center text-text-dark font-bold text-lg">Your Health Vault</Text>
          <Text className="text-center text-text-light text-sm mt-1">
            Securely managing your medical records
          </Text>
        </AnimatedCard>

        {/* Hero / Vault Status */}
        <AnimatedCard delay={200} className="bg-slate-900 p-6 rounded-3xl mb-8 shadow-elevated overflow-hidden relative border-0">
          {/* Decorative Background Circles */}
          <View className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full" />
          <View className="absolute bottom-10 right-10 w-20 h-20 bg-primary-500/10 rounded-full" />

          <View className="flex-row justify-between items-start mb-6">
            <View className="flex-1">
              <View className="flex-row items-center mb-2">
                <PulseAnimation>
                  <View className="w-2 h-2 bg-success rounded-full mr-2" />
                </PulseAnimation>
                <Text className="text-success-light font-medium text-xs uppercase tracking-widest">System Online</Text>
              </View>
              <Text className="text-white font-display font-bold text-2xl">Medical Vault</Text>
              <Text className="text-slate-400 text-sm mt-1">{id ? `${(id as string).slice(0,6)}...${(id as string).slice(-4)}` : 'Loading...'}</Text>
            </View>
            <View className="bg-white/10 p-3 rounded-2xl items-center border border-white/5">
              <Ionicons name="shield-checkmark" size={28} color="#10b981" />
            </View>
          </View>
          
          <View className="flex-row justify-between mt-4 pt-4 border-t border-white/10">
            <View>
              <Text className="text-slate-400 text-xs uppercase mb-1">Total Records</Text>
              <Text className="text-white text-2xl font-bold">{recordCount}</Text>
            </View>
            <View>
              <Text className="text-slate-400 text-xs uppercase mb-1">Active Grants</Text>
              <Text className="text-white text-2xl font-bold">{activeGrants}</Text>
            </View>
            <View>
              <Text className="text-slate-400 text-xs uppercase mb-1">Network</Text>
              <Text className="text-primary-400 text-xl font-bold">Sepolia</Text>
            </View>
          </View>
        </AnimatedCard>

        {/* Active Permissions */}
        <View className="flex-row justify-between items-center mb-4 px-1">
          <Text className="text-lg font-bold text-text-dark">Quick Actions</Text>
        </View>
        
        <View className="flex-row flex-wrap justify-between mb-6">
          <TouchableOpacity 
            className="w-[48%] mb-4"
            onPress={() => router.push({ 
              pathname: '/(patient)/records', 
              params: { id: Array.isArray(id) ? id[0] : id } 
            })}
          >
            <AnimatedCard delay={450} className="items-center py-6 bg-white border border-gray-100 rounded-2xl shadow-soft">
              <LinearGradient
                colors={['#14b8a6', '#0d9488']}
                className="w-16 h-16 rounded-2xl items-center justify-center mb-3 shadow-glow-teal"
              >
                <Ionicons name="documents" size={28} color="#ffffff" />
              </LinearGradient>
              <Text className="font-bold text-text-dark">My Records</Text>
              <Text className="text-text-light text-xs mt-1">{recordCount} Files Stored</Text>
            </AnimatedCard>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="w-[48%] mb-4"
            onPress={() => router.push({ 
              pathname: '/(patient)/access', 
              params: { id: Array.isArray(id) ? id[0] : id } 
            })}
          >
            <AnimatedCard delay={500} className="items-center py-6 bg-white border border-gray-100 rounded-2xl shadow-soft">
              <LinearGradient
                colors={['#6366f1', '#4f46e5']}
                className="w-16 h-16 rounded-2xl items-center justify-center mb-3"
              >
                <Ionicons name="share-social" size={28} color="#ffffff" />
              </LinearGradient>
              <Text className="font-bold text-text-dark">Grant Access</Text>
              <Text className="text-text-light text-xs mt-1">Share Data</Text>
            </AnimatedCard>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

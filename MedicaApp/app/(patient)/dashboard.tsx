import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import ScreenWrapper from '@/components/ScreenWrapper';
import Card from '@/components/Card';
import AnimatedCard from '@/components/AnimatedCard';
import PulseAnimation from '@/components/PulseAnimation';
import HealthIllustration from '@/components/HealthIllustration';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

export default function PatientDashboard() {
  const router = useRouter();

  return (
    <ScreenWrapper className="bg-background">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View 
          entering={FadeIn.delay(100)}
          className="flex-row justify-between items-center mb-6"
        >
          <View>
            <Text className="text-text-light text-xs font-medium uppercase tracking-wider">Dashboard</Text>
            <Text className="text-3xl font-display font-bold text-text-dark mt-1">Hello, Vaibhav</Text>
          </View>
          <TouchableOpacity className="w-12 h-12 bg-white shadow-soft rounded-full items-center justify-center border border-gray-100">
            <Image 
              source={{ uri: 'https://ui-avatars.com/api/?name=Vaibhav&background=14b8a6&color=fff' }} 
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
              <Text className="text-slate-400 text-sm mt-1">0x71C...9A23</Text>
            </View>
            <View className="bg-white/10 p-3 rounded-2xl items-center border border-white/5">
              <Ionicons name="shield-checkmark" size={28} color="#10b981" />
            </View>
          </View>
          
          <View className="flex-row justify-between mt-4 pt-4 border-t border-white/10">
            <View>
              <Text className="text-slate-400 text-xs uppercase mb-1">Total Records</Text>
              <Text className="text-white text-2xl font-bold">12</Text>
            </View>
            <View>
              <Text className="text-slate-400 text-xs uppercase mb-1">Active Grants</Text>
              <Text className="text-white text-2xl font-bold">3</Text>
            </View>
            <View>
              <Text className="text-slate-400 text-xs uppercase mb-1">Network</Text>
              <Text className="text-primary-400 text-xl font-bold">Sepolia</Text>
            </View>
          </View>
        </AnimatedCard>

        {/* Health Score Card */}
        <AnimatedCard delay={250} className="mb-6 p-0 overflow-hidden border-0">
          <LinearGradient
            colors={['#14b8a6', '#0d9488']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="p-6 flex-row items-center justify-between"
          >
            <View className="flex-1">
              <Text className="text-white/80 text-sm font-medium mb-1">Health Score</Text>
              <Text className="text-white font-display font-bold text-4xl">92</Text>
              <Text className="text-white/70 text-xs mt-1">Excellent condition</Text>
            </View>
            <View className="w-20 h-20 bg-white/20 rounded-full items-center justify-center border-4 border-white/30">
              <Ionicons name="heart" size={32} color="#ffffff" />
            </View>
          </LinearGradient>
        </AnimatedCard>

        {/* Active Permissions */}
        <View className="flex-row justify-between items-center mb-4 px-1">
          <Text className="text-lg font-bold text-text-dark">Who has access?</Text>
          <TouchableOpacity onPress={() => router.push('/(patient)/access')}>
            <Text className="text-primary-600 font-semibold text-sm">Manage →</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8 -mx-4 px-4">
          {/* Doctor 1 */}
          <AnimatedCard delay={300} className="mr-4 w-64 p-4 bg-white border border-gray-100 rounded-2xl shadow-card">
            <View className="flex-row items-start justify-between mb-3">
              <View className="flex-row items-center flex-1">
                <LinearGradient
                  colors={['#6366f1', '#4f46e5']}
                  className="w-12 h-12 rounded-full items-center justify-center mr-3"
                >
                  <Text className="text-xl">👨‍⚕️</Text>
                </LinearGradient>
                <View className="flex-1">
                  <Text className="font-bold text-text-dark text-base">Dr. Smith</Text>
                  <Text className="text-text-light text-xs">Cardiologist</Text>
                </View>
              </View>
              <View className="bg-success-light/20 px-2.5 py-1 rounded-full">
                <Text className="text-success-dark text-[10px] font-bold">ACTIVE</Text>
              </View>
            </View>
            <View className="bg-gray-50 p-3 rounded-xl flex-row items-center justify-center">
              <Ionicons name="time-outline" size={16} color="#64748b" />
              <Text className="text-text-light text-xs ml-1.5 font-medium">Expires in 23 hours</Text>
            </View>
          </AnimatedCard>

          {/* Doctor 2 */}
          <AnimatedCard delay={350} className="mr-4 w-64 p-4 bg-white border border-gray-100 rounded-2xl shadow-card">
            <View className="flex-row items-start justify-between mb-3">
              <View className="flex-row items-center flex-1">
                <LinearGradient
                  colors={['#ec4899', '#db2777']}
                  className="w-12 h-12 rounded-full items-center justify-center mr-3"
                >
                  <Text className="text-xl">👩‍⚕️</Text>
                </LinearGradient>
                <View className="flex-1">
                  <Text className="font-bold text-text-dark text-base">Dr. Emily</Text>
                  <Text className="text-text-light text-xs">Neurologist</Text>
                </View>
              </View>
              <View className="bg-success-light/20 px-2.5 py-1 rounded-full">
                <Text className="text-success-dark text-[10px] font-bold">ACTIVE</Text>
              </View>
            </View>
            <View className="bg-gray-50 p-3 rounded-xl flex-row items-center justify-center">
              <Ionicons name="time-outline" size={16} color="#64748b" />
              <Text className="text-text-light text-xs ml-1.5 font-medium">Expires in 5 days</Text>
            </View>
          </AnimatedCard>

          {/* Add more card */}
          <TouchableOpacity onPress={() => router.push('/(patient)/access')}>
            <AnimatedCard delay={400} className="w-64 p-6 bg-primary-50 border-2 border-dashed border-primary-300 rounded-2xl items-center justify-center">
              <View className="w-12 h-12 bg-primary-100 rounded-full items-center justify-center mb-3">
                <Ionicons name="add" size={24} color="#0d9488" />
              </View>
              <Text className="text-primary-700 font-semibold">Grant New Access</Text>
              <Text className="text-primary-600/70 text-xs mt-1">Share your records</Text>
            </AnimatedCard>
          </TouchableOpacity>
        </ScrollView>

        {/* Quick Actions */}
        <Text className="text-lg font-bold text-text-dark mb-4 px-1">Quick Actions</Text>
        
        <View className="flex-row flex-wrap justify-between mb-6">
          <TouchableOpacity 
            className="w-[48%] mb-4"
            onPress={() => router.push('/(patient)/records')}
          >
            <AnimatedCard delay={450} className="items-center py-6 bg-white border border-gray-100 rounded-2xl shadow-soft">
              <LinearGradient
                colors={['#14b8a6', '#0d9488']}
                className="w-16 h-16 rounded-2xl items-center justify-center mb-3 shadow-glow-teal"
              >
                <Ionicons name="documents" size={28} color="#ffffff" />
              </LinearGradient>
              <Text className="font-bold text-text-dark">My Records</Text>
              <Text className="text-text-light text-xs mt-1">12 Files Stored</Text>
            </AnimatedCard>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="w-[48%] mb-4"
            onPress={() => router.push('/(patient)/access')}
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
          
          <TouchableOpacity className="w-[48%]">
            <AnimatedCard delay={550} className="items-center py-6 bg-white border border-gray-100 rounded-2xl shadow-soft">
              <LinearGradient
                colors={['#f59e0b', '#d97706']}
                className="w-16 h-16 rounded-2xl items-center justify-center mb-3"
              >
                <Ionicons name="time" size={28} color="#ffffff" />
              </LinearGradient>
              <Text className="font-bold text-text-dark">History</Text>
              <Text className="text-text-light text-xs mt-1">View Activity</Text>
            </AnimatedCard>
          </TouchableOpacity>
          
          <TouchableOpacity className="w-[48%]">
            <AnimatedCard delay={600} className="items-center py-6 bg-white border border-gray-100 rounded-2xl shadow-soft">
              <LinearGradient
                colors={['#ec4899', '#db2777']}
                className="w-16 h-16 rounded-2xl items-center justify-center mb-3"
              >
                <Ionicons name="notifications" size={28} color="#ffffff" />
              </LinearGradient>
              <Text className="font-bold text-text-dark">Alerts</Text>
              <Text className="text-text-light text-xs mt-1">3 New</Text>
            </AnimatedCard>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

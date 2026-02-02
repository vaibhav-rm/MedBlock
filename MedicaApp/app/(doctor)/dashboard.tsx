import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import React from 'react';
import ScreenWrapper from '@/components/ScreenWrapper';
import AnimatedCard from '@/components/AnimatedCard';
import Badge from '@/components/Badge';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'expo-router';

export default function DoctorDashboard() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  return (
    <ScreenWrapper className="bg-background">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View 
          entering={FadeIn.delay(100)}
          className="mb-6 flex-row justify-between items-end"
        >
          <View>
            <Text className="text-text-light text-sm font-medium">Have a great day,</Text>
            <Text className="text-3xl font-display font-bold text-primary-700 mt-1">Dr. Smith</Text>
          </View>
          <View className="flex-row gap-2">
             <TouchableOpacity 
              onPress={handleLogout}
              className="bg-red-50 p-3 rounded-full shadow-soft border border-red-100"
            >
              <Ionicons name="power" size={24} color="#ef4444" />
            </TouchableOpacity>
            <TouchableOpacity className="bg-white p-3 rounded-full shadow-soft border border-gray-100">
              <View className="relative">
                <Ionicons name="notifications-outline" size={24} color="#0d9488" />
                <View className="absolute -top-1 -right-1 w-3 h-3 bg-secondary-500 rounded-full border-2 border-white" />
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Search Bar */}
        <AnimatedCard delay={150} className="bg-white p-4 rounded-2xl flex-row items-center border border-gray-200 shadow-soft mb-6">
          <Ionicons name="search" size={22} color="#64748b" />
          <TextInput 
            placeholder="Search patients..." 
            placeholderTextColor="#94a3b8"
            className="flex-1 ml-3 text-text-dark text-base"
          />
          <TouchableOpacity className="bg-primary-50 p-2 rounded-xl">
            <Ionicons name="options-outline" size={20} color="#0d9488" />
          </TouchableOpacity>
        </AnimatedCard>

        {/* Stats Cards */}
        <View className="flex-row justify-between mb-6">
          <AnimatedCard delay={200} className="w-[48%] p-0 overflow-hidden border-0">
            <LinearGradient
              colors={['#3b82f6', '#2563eb']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="p-5"
            >
              <View className="bg-white/20 w-12 h-12 rounded-2xl items-center justify-center mb-3">
                <Ionicons name="people" size={24} color="#ffffff" />
              </View>
              <Text className="text-white text-3xl font-bold mb-1">24</Text>
              <Text className="text-white/80 text-xs">Total Patients</Text>
            </LinearGradient>
          </AnimatedCard>

          <AnimatedCard delay={250} className="w-[48%] p-0 overflow-hidden border-0">
            <LinearGradient
              colors={['#f59e0b', '#d97706']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="p-5"
            >
              <View className="bg-white/20 w-12 h-12 rounded-2xl items-center justify-center mb-3">
                <Ionicons name="time" size={24} color="#ffffff" />
              </View>
              <Text className="text-white text-3xl font-bold mb-1">5</Text>
              <Text className="text-white/80 text-xs">Pending Requests</Text>
            </LinearGradient>
          </AnimatedCard>
        </View>

        {/* Additional Stats */}
        <View className="flex-row justify-between mb-6">
          <AnimatedCard delay={300} className="flex-1 mr-2 p-4 bg-white border border-gray-100 rounded-2xl shadow-soft">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-text-light text-xs mb-1">Today's Appointments</Text>
                <Text className="text-text-dark text-2xl font-bold">8</Text>
              </View>
              <View className="bg-primary-50 p-3 rounded-xl">
                <Ionicons name="calendar" size={20} color="#0d9488" />
              </View>
            </View>
          </AnimatedCard>

          <AnimatedCard delay={350} className="flex-1 ml-2 p-4 bg-white border border-gray-100 rounded-2xl shadow-soft">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-text-light text-xs mb-1">Records Uploaded</Text>
                <Text className="text-text-dark text-2xl font-bold">42</Text>
              </View>
              <View className="bg-success-light/20 p-3 rounded-xl">
                <Ionicons name="cloud-upload" size={20} color="#10b981" />
              </View>
            </View>
          </AnimatedCard>
        </View>

        {/* Recent Patients Header */}
        <View className="flex-row justify-between items-center mb-4 px-1">
          <Text className="text-lg font-bold text-text-dark">Recent Patients</Text>
          <TouchableOpacity>
            <Text className="text-primary-600 font-semibold text-sm">View All →</Text>
          </TouchableOpacity>
        </View>
        
        {/* Patient List */}
        {[1, 2, 3, 4, 5].map((i) => (
          <AnimatedCard 
            key={i} 
            delay={400 + (i * 50)} 
            className="mb-3 flex-row justify-between items-center p-4 bg-white border border-gray-100 shadow-soft"
          >
            <View className="flex-row items-center flex-1">
              {/* Patient Avatar */}
              <LinearGradient
                colors={i % 2 === 0 ? ['#14b8a6', '#0d9488'] : ['#6366f1', '#4f46e5']}
                className="w-14 h-14 rounded-2xl mr-4 items-center justify-center"
              >
                <Text className="text-2xl">
                  {i % 3 === 0 ? '👨' : i % 3 === 1 ? '👩' : '🧑'}
                </Text>
              </LinearGradient>

              <View className="flex-1">
                <Text className="font-bold text-text-dark text-base">Patient #{200 + i}</Text>
                <View className="flex-row items-center mt-1.5">
                  <Badge 
                    label={i === 1 ? 'Expired' : 'Active'} 
                    variant={i === 1 ? 'error' : 'success'} 
                  />
                  {i !== 1 && (
                    <View className="flex-row items-center ml-3">
                      <Ionicons name="time-outline" size={14} color="#64748b" />
                      <Text className="text-text-light text-xs ml-1">{i}d left</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            <TouchableOpacity className="bg-primary-50 p-3 rounded-full">
              <Ionicons name="chevron-forward" size={20} color="#0d9488" />
            </TouchableOpacity>
          </AnimatedCard>
        ))}

        {/* Floating Action Button */}
        <View className="absolute bottom-6 right-6">
          <TouchableOpacity className="bg-primary-600 w-16 h-16 rounded-full items-center justify-center shadow-elevated">
            <Ionicons name="add" size={32} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

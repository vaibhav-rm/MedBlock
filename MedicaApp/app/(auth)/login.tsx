import { View, Text, Alert } from 'react-native';
import React, { useState } from 'react';
import ScreenWrapper from '@/components/ScreenWrapper';
import Button from '@/components/Button';
import HealthIllustration from '@/components/HealthIllustration';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // For now, just redirect to patient dashboard
    // In production, this would connect to WalletConnect
    router.replace('/(patient)/dashboard');
  };

  return (
    <View className="flex-1">
      <LinearGradient
        colors={['#f0fdfa', '#e0f2fe', '#fef3c7']}
        locations={[0, 0.5, 1]}
        className="flex-1"
      >
        <ScreenWrapper className="justify-center items-center">
          {/* Decorative background elements */}
          <View className="absolute top-20 left-10 w-24 h-24 bg-primary-200/30 rounded-full" />
          <View className="absolute bottom-32 right-5 w-32 h-32 bg-secondary-200/20 rounded-full" />

          <Animated.View 
            entering={FadeInUp.delay(100).springify()}
            className="items-center mb-10"
          >
            {/* Hero Illustration */}
            <HealthIllustration type="wallet-connect" size="lg" className="mb-6" />

            <Animated.View entering={FadeIn.delay(200)}>
              <Text className="text-4xl font-display font-bold text-text-dark mb-3 text-center">
                Connect Your Wallet
              </Text>
              <Text className="text-text-light text-center px-8 text-base leading-6">
                Secure, decentralized access to your medical records using blockchain technology.
              </Text>
            </Animated.View>
          </Animated.View>

          <Animated.View 
            entering={FadeInDown.delay(300).springify()}
            className="w-full px-6"
          >
            <View className="bg-primary-50 p-4 rounded-2xl mb-4 border border-primary-200">
              <View className="flex-row items-center">
                <View className="bg-primary-600 w-10 h-10 rounded-full items-center justify-center mr-3">
                  <Text className="text-white font-bold text-xs">ℹ️</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-text-dark font-semibold text-sm mb-0.5">Demo Mode</Text>
                  <Text className="text-text-light text-xs">
                    WalletConnect setup required for wallet features
                  </Text>
                </View>
              </View>
            </View>

            <Button 
              title="Continue to Dashboard" 
              onPress={handleLogin}
              loading={loading}
              variant="gradient"
              size="sm"
              icon="checkmark-circle"
              className="mb-4"
            />

            <Button 
              title="Back to Home" 
              variant="outline" 
              size="sm"
              onPress={() => router.back()}
            />
          </Animated.View>
        </ScreenWrapper>
      </LinearGradient>
    </View>
  );
}

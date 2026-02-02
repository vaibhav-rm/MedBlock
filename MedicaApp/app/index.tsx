import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenWrapper from '../components/ScreenWrapper';
import Button from '../components/Button';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useAuthStore } from '@/stores/authStore';
import { useEffect } from 'react';

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, role, walletAddress } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && role && walletAddress) {
      // Small delay to ensure hydration or smooth transition
      const timer = setTimeout(() => {
        if (role === 'doctor') {
            router.replace(`/(doctor)/dashboard` as any);
        } else if (role === 'patient') {
             // For patient, we often need the ID. Assuming walletAddress IS the ID for now or we stored it.
             // The store has walletAddress.
             router.replace({ pathname: '/(patient)/dashboard', params: { id: walletAddress } } as any);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, role, walletAddress]);

  return (
    <View className="flex-1">
      <LinearGradient
        colors={['#f0fdfa', '#e0f2fe', '#fef3c7']}
        locations={[0, 0.5, 1]}
        className="flex-1"
      >
        <ScreenWrapper>
          <ScrollView 
            className="flex-1" 
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingVertical: 40 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Decorative background circles */}
            <View className="absolute top-20 right-10 w-32 h-32 bg-primary-200/30 rounded-full" />
            <View className="absolute bottom-40 left-5 w-24 h-24 bg-secondary-200/30 rounded-full" />
            
            <Animated.View 
              entering={FadeInUp.delay(100).springify()}
              className="items-center mb-8"
            >
              {/* Logo container with gradient background */}
              <LinearGradient
                colors={['#2dd4bf', '#0d9488']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="w-24 h-24 rounded-3xl items-center justify-center mb-4"
                style={{ transform: [{ rotate: '3deg' }] }}
              >
                <Text className="text-5xl">🏥</Text>
              </LinearGradient>
              
              <Animated.Text 
                entering={FadeIn.delay(200)}
                className="text-4xl font-display font-bold text-text-dark tracking-tight"
              >
                MedBlock
              </Animated.Text>
              
              <Animated.Text 
                entering={FadeIn.delay(300)}
                className="text-text-light mt-2 text-lg px-6 text-center"
              >
                Your Health. Your Control.
              </Animated.Text>
              
              <Animated.Text 
                entering={FadeIn.delay(400)}
                className="text-text-light mt-1 text-sm px-8 text-center"
              >
                Secure, decentralized medical records
              </Animated.Text>
            </Animated.View>

            {/* Action Buttons */}
            <Animated.View 
              entering={FadeInDown.delay(500).springify()}
              className="w-full px-8 gap-3"
            >
              <Button 
                title="Patient Login"
                variant="gradient"
                size="sm"
                icon="person"
                onPress={() => router.push('/(auth)/plogin')}
              />

              <Button 
                title="Doctor Login"
                variant="outline"
                size="sm"
                icon="medical"
                onPress={() => router.push('/(auth)/dlogin')}
              />
              
              <TouchableOpacity 
                onPress={() => router.push('/(auth)/login')}
                className="py-2"
              >
                <Text className="text-text-light text-center text-sm">
                  Connect with Wallet →
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Small tagline at bottom */}
            <Animated.View 
              entering={FadeIn.delay(600)}
              className="mt-8"
            >
              <Text className="text-text-light text-xs text-center">
                Powered by Blockchain Technology
              </Text>
            </Animated.View>
          </ScrollView>
        </ScreenWrapper>
      </LinearGradient>
    </View>
  );
}

import { View, Text, Alert, TouchableWithoutFeedback, Keyboard } from 'react-native';
import React, { useState } from 'react';
import ScreenWrapper from '@/components/ScreenWrapper';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { TwilioService } from '@/services/twilio';
import { useAuthStore } from '../../stores/authStore';

export default function OtpVerify() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore(state => state.login);

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter the 6-digit code sent to your phone.');
      return;
    }

    setLoading(true);
    try {
      await TwilioService.verifyOTP(phone!, code);
      
      // Auto-assign role for demo purpose (or ask user)
      // Login as patient by default for this flow
      login('patient', phone!);
      
      router.replace('/(patient)/dashboard');
    } catch (error) {
      console.error('OTP Verification Error:', error);
      Alert.alert('Verification Failed', 'The code you entered is incorrect. Please try again or resend the code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper useGradient className="justify-center">
       <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 justify-center">
            <View className="mb-8">
                <Text className="text-3xl font-bold text-gray-800 mb-2">Verify OTP</Text>
                <Text className="text-gray-500">
                Enter the 6-digit code sent to {phone}
                </Text>
            </View>

            <View className="w-full">
                <Input 
                    placeholder="123456" 
                    keyboardType="number-pad"
                    maxLength={6}
                    value={code}
                    onChangeText={setCode}
                    style={{ letterSpacing: 10, textAlign: 'center', fontSize: 24, fontWeight: 'bold' }}
                    className="mb-8"
                />
                
                <Button 
                    title="Verify & Login" 
                    onPress={handleVerify} 
                    loading={loading}
                    className="shadow-lg shadow-primary/30"
                />

                <Button 
                    title="Resend Code" 
                    variant="outline"
                    onPress={() => TwilioService.sendOTP(phone!)}
                    className="mt-4 border-gray-300"
                />
            </View>
        </View>
       </TouchableWithoutFeedback>
    </ScreenWrapper>
  );
}

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
  const params = useLocalSearchParams();
  const login = useAuthStore(state => state.login);
  const pendingAuth = useAuthStore(state => (state as any).pendingAuth);

  // Fallback to store if params are missing (Router issue fix)
  const phone = (params.phone as string) || pendingAuth?.phone;
  const role = (params.role as string) || pendingAuth?.role;
  const address = (params.address as string) || pendingAuth?.address;
  const redirectTo = (params.redirectTo as string) || pendingAuth?.redirectTo;
  
  console.log("OTP Verify Params:", { phone, role, address, redirectTo });
  
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter the 6-digit code sent to your phone.');
      return;
    }

    setLoading(true);
    try {
      if (!phone) throw new Error("Phone number missing");
      
      const roleStr = Array.isArray(role) ? role[0] : role;
      console.log("Verifying OTP for role:", roleStr);

      await TwilioService.verifyOTP(phone, code);
      
      // Login with specified role and address
      login(roleStr as any || 'patient', address || '', phone || '');
      
      if (roleStr === 'patient') {
         console.log("Redirecting to Patient Dashboard");
         router.replace({
            pathname: '/(patient)/dashboard',
            params: { id: address }
         });
      } else if (roleStr === 'doctor') {
         console.log("Redirecting to Doctor Dashboard");
         const target = `/(doctor)/dashboard/${address}`;
         router.replace(target as any);
      } else {
         console.warn("Unknown role:", roleStr);
         Alert.alert("Login Error", "Unknown user role. Returning to home.");
         router.replace('/');
      }
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

import { View, Text, Alert, TouchableWithoutFeedback, Keyboard } from 'react-native';
import React, { useState } from 'react';
import ScreenWrapper from '@/components/ScreenWrapper';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { useRouter } from 'expo-router';
import { TwilioService } from '@/services/twilio';

export default function LoginPhone() {
  const router = useRouter();
  const [phone, setPhone] = useState('+91');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!phone || phone.length < 10) {
      Alert.alert('Invalid Phone', 'Please enter a valid phone number.');
      return;
    }

    setLoading(true);
    try {
      await TwilioService.sendOTP(phone);
      router.push({ pathname: '/(auth)/otp-verify', params: { phone } });
    } catch (error) {
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper useGradient className="justify-center">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 justify-center">
            <View className="items-center mb-10">
                <View className="w-24 h-24 bg-white/50 rounded-full items-center justify-center mb-6 shadow-sm">
                    <Text className="text-4xl">📱</Text>
                </View>
                <Text className="text-3xl font-bold text-gray-800 mb-2">Welcome</Text>
                <Text className="text-gray-500 text-center px-6">
                Enter your mobile number to securely access your medical records.
                </Text>
            </View>

            <View className="w-full">
                <Input 
                    label="Mobile Number" 
                    placeholder="+91 98765 43210" 
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                    className="mb-6"
                />
                
                <Button 
                    title="Send OTP" 
                    onPress={handleSendOTP} 
                    loading={loading}
                    className="shadow-lg shadow-primary/30"
                />

                <Text className="text-center text-gray-400 mt-6 text-xs">
                    By continuing, you agree to our Terms & Privacy Policy.
                </Text>
            </View>
        </View>
      </TouchableWithoutFeedback>
    </ScreenWrapper>
  );
}

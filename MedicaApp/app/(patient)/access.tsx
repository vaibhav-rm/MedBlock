import { View, Text, Alert, ScrollView } from 'react-native';
import React, { useState } from 'react';
import ScreenWrapper from '@/components/ScreenWrapper';
import Input from '@/components/Input';
import Button from '@/components/Button';
import AnimatedCard from '@/components/AnimatedCard';
import HealthIllustration from '@/components/HealthIllustration';
import { TwilioService } from '@/services/twilio';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

export default function Access() {
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [doctorAddress, setDoctorAddress] = useState('');
  const [duration, setDuration] = useState('');

  const sendConsentOTP = async () => {
    if (!doctorAddress || !duration) {
      Alert.alert("Missing Info", "Please fill in all fields");
      return;
    }

    setLoading(true);
    // Simulate getting user's phone from context
    const userPhone = "+1234567890"; 
    await TwilioService.sendOTP(userPhone);
    setLoading(false);
    setStep(2);
    Alert.alert("Consent Required", "A verification code has been sent to confirm sharing access.");
  };

  const confirmAccess = async () => {
    setLoading(true);
    try {
      await TwilioService.verifyOTP("+1234567890", otp);
      Alert.alert("Success!", "Access granted to doctor successfully!");
      setStep(1);
      setOtp('');
      setDoctorAddress('');
      setDuration('');
    } catch (e) {
      Alert.alert("Error", "Invalid Code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper className="bg-background">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeIn.delay(100)} className="mb-6">
          <Text className="text-3xl font-display font-bold text-text-dark">Grant Access</Text>
          <Text className="text-text-light mt-1">Share your records with healthcare providers</Text>
        </Animated.View>

        {/* Hero Illustration */}
        <AnimatedCard delay={150} className="mb-6 p-6 items-center border-0">
          <HealthIllustration type="grant-access" size="md" />
        </AnimatedCard>

        <AnimatedCard delay={200} className="p-6 border-0 shadow-card">
          {step === 1 ? (
            <Animated.View entering={FadeInDown}>
              {/* Step 1: Enter Details */}
              <View className="flex-row items-center mb-6 pb-4 border-b border-gray-100">
                <LinearGradient
                  colors={['#14b8a6', '#0d9488']}
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                >
                  <Text className="text-white font-bold">1</Text>
                </LinearGradient>
                <View>
                  <Text className="font-bold text-text-dark">Access Details</Text>
                  <Text className="text-text-light text-xs">Enter doctor and duration</Text>
                </View>
              </View>

              <View className="mb-4">
                <Text className="text-text-dark font-semibold mb-2 text-sm">Doctor Address / ID</Text>
                <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                  <Ionicons name="person" size={20} color="#64748b" />
                  <Input 
                    placeholder="0x123... or Dr. Name" 
                    className="flex-1 ml-2 bg-transparent border-0 p-0"
                    value={doctorAddress}
                    onChangeText={setDoctorAddress}
                  />
                </View>
              </View>

              <View className="mb-6">
                <Text className="text-text-dark font-semibold mb-2 text-sm">Duration (Days)</Text>
                <View className="flex-row gap-2">
                  {['7', '14', '30'].map((days) => (
                    <Button
                      key={days}
                      title={`${days}d`}
                      variant={duration === days ? 'primary' : 'outline'}
                      size="sm"
                      className="flex-1"
                      onPress={() => setDuration(days)}
                    />
                  ))}
                </View>
                <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 mt-2">
                  <Ionicons name="calendar" size={20} color="#64748b" />
                  <Input 
                    placeholder="Or enter custom days" 
                    keyboardType="numeric"
                    className="flex-1 ml-2 bg-transparent border-0 p-0"
                    value={duration}
                    onChangeText={setDuration}
                  />
                </View>
              </View>
              
              <View className="bg-warning-light/20 p-4 rounded-xl mb-6 flex-row">
                <Ionicons name="warning" size={20} color="#f59e0b" style={{ marginRight: 8 }} />
                <Text className="text-warning-dark text-xs flex-1">
                  You will need to verify via SMS to authorize this action.
                </Text>
              </View>

              <Button 
                title="Request Access Token" 
                variant="gradient"
                icon="send"
                onPress={sendConsentOTP} 
                loading={loading}
                className="shadow-elevated"
              />
            </Animated.View>
          ) : (
            <Animated.View entering={FadeInDown}>
              {/* Step 2: Verify OTP */}
              <View className="flex-row items-center mb-6 pb-4 border-b border-gray-100">
                <LinearGradient
                  colors={['#14b8a6', '#0d9488']}
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                >
                  <Text className="text-white font-bold">2</Text>
                </LinearGradient>
                <View>
                  <Text className="font-bold text-text-dark">Verify Consent</Text>
                  <Text className="text-text-light text-xs">Enter the code sent to your phone</Text>
                </View>
              </View>

              <View className="items-center mb-6">
                <View className="w-20 h-20 bg-primary-50 rounded-full items-center justify-center mb-4">
                  <Ionicons name="lock-closed" size={32} color="#0d9488" />
                </View>
                <Text className="text-text-dark font-semibold text-lg mb-2">Verification Code</Text>
                <Text className="text-text-light text-sm text-center">
                  We've sent a 6-digit code to your phone
                </Text>
              </View>
              
              <Input 
                placeholder="000000" 
                keyboardType="number-pad" 
                value={otp}
                onChangeText={setOtp}
                className="mb-6 text-center text-3xl tracking-[8px] font-bold"
                maxLength={6}
              />

              <Button 
                title="Confirm Access" 
                variant="gradient"
                icon="checkmark-circle"
                onPress={confirmAccess} 
                loading={loading}
                className="mb-3 shadow-elevated"
              />
              <Button 
                title="Cancel" 
                variant="outline" 
                onPress={() => setStep(1)}
              />
            </Animated.View>
          )}
        </AnimatedCard>

        {/* Info Card */}
        <AnimatedCard delay={250} className="mt-4 p-0 overflow-hidden border-0">
          <LinearGradient
            colors={['#f0fdfa', '#ccfbf1']}
            className="p-5"
          >
            <View className="flex-row items-start">
              <View className="bg-primary-600 w-10 h-10 rounded-full items-center justify-center mr-3">
                <Ionicons name="information" size={20} color="#ffffff" />
              </View>
              <View className="flex-1">
                <Text className="text-text-dark font-bold mb-1">How it works</Text>
                <Text className="text-text-light text-xs leading-5">
                  Access grants are temporary and automatically expire. You can revoke access anytime from your dashboard.
                </Text>
              </View>
            </View>
          </LinearGradient>
        </AnimatedCard>
      </ScrollView>
    </ScreenWrapper>
  );
}

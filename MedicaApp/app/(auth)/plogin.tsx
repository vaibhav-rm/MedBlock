import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import ScreenWrapper from '@/components/ScreenWrapper';
import { useRouter } from 'expo-router';
import { getProvider, getContracts } from '@/services/web3';
import { TwilioService } from '@/services/twilio';
import { useAuthStore } from '../../stores/authStore';

export default function PatientLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [inputPhone, setInputPhone] = useState('');

  const handleLogin = async () => {
    if (!inputPhone || inputPhone.length < 10) {
      Alert.alert("Error", "Please enter a valid phone number");
      return;
    }

    setLoading(true);
    try {
      const provider = getProvider();
      const { patientContract } = await getContracts(provider);
      
      console.log("Searching for patient with phone:", inputPhone);

      // Ensure phone has +91 prefix
      const formattedInputPhone = inputPhone.startsWith('+') ? inputPhone : `+91${inputPhone}`;
      console.log("Formatted Phone for Search:", formattedInputPhone);

      // reverse lookup: Fetch all patients and find match
      // Note: This is inefficient for large datasets but works for demo/hackathon
      const allAddresses = await patientContract.getAllPatients();
      console.log("Total patients to check:", allAddresses.length);

      let foundAddress = null;
      let foundDetails = null;

      // Check all patients
      const checks = allAddresses.map(async (addr: string) => {
          try {
              const details = await patientContract.getPatient(addr);
              // details: [username, role, phoneNumber, isRegistered]
              return { address: addr, phone: details[2] };
          } catch (e) { return null; }
      });

      const results = await Promise.all(checks);
      // Check match against both raw and formatted phone to be safe, or just formatted
      const match = results.find(r => r && (r.phone === inputPhone || r.phone === formattedInputPhone));

      if (match) {
          foundAddress = match.address;
          foundDetails = match;
      }

      if (!foundAddress) {
        Alert.alert("Not Found", "No patient account found with this phone number.");
        setLoading(false);
        return;
      }

      console.log("Found Address:", foundAddress);
      
      // Verified phone exists on chain, send OTP to verify ownership
      // Use the phone number found on chain to match exactly what is registered
      const registeredPhone = match?.phone || formattedInputPhone;
      await TwilioService.sendOTP(registeredPhone);
      
      // Use Store for reliable data passing
      useAuthStore.getState().setPendingAuth({
          role: 'patient', 
          phone: registeredPhone, 
          address: foundAddress,
          redirectTo: `/(patient)/dashboard?id=${foundAddress}`
      });

      const targetUrl = `/(auth)/otp-verify?phone=${encodeURIComponent(registeredPhone)}&role=patient&address=${encodeURIComponent(foundAddress)}&redirectTo=${encodeURIComponent(`/(patient)/dashboard?id=${foundAddress}`)}`;
      
      router.push(targetUrl as any);

    } catch (error: any) {
      console.error(error);
      Alert.alert("Login Failed", "Error searching for user. " + (error.reason || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper className="flex-1 bg-white">
      <View className="flex-1 justify-center items-center px-6">
        <View className="w-24 h-24 bg-green-100 rounded-full items-center justify-center mb-8">
          <Text className="text-4xl">📱</Text>
        </View>
        
        <Text className="text-3xl font-bold text-gray-900 mb-2">Patient Login</Text>
        <Text className="text-gray-500 text-center mb-10">
          Enter your registered mobile number
        </Text>

        <View className="w-full space-y-4">
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1 ml-1">Phone Number</Text>
            <TextInput 
              value={inputPhone}
              onChangeText={setInputPhone}
              placeholder="+91..."
              keyboardType="phone-pad"
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-800"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity 
            onPress={handleLogin}
            disabled={loading}
            className="w-full py-4 bg-green-600 rounded-2xl shadow-lg shadow-green-200 items-center"
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">
                Continue
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()} className="mt-4">
            <Text className="text-center text-gray-500">Back to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
}

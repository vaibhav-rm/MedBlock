import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import ScreenWrapper from '@/components/ScreenWrapper';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { getProvider, getContracts, isValidAddress } from '@/services/web3';

export default function DoctorLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [manualAddress, setManualAddress] = useState('');

  const handleLogin = async () => {
    if (!manualAddress) {
      Alert.alert("Error", "Please enter your wallet address");
      return;
    }

    if (!isValidAddress(manualAddress)) {
      Alert.alert("Invalid Address", "Please enter a valid Ethereum address");
      return;
    }

    setLoading(true);
    try {
      const provider = getProvider();
      const { doctorContract } = await getContracts(provider);
      console.log("Checking doctor status for:", manualAddress);
      
      const doctor = await doctorContract.doctors(manualAddress);
      
      if (doctor && doctor.isRegistered) {
        router.replace(`/(doctor)/dashboard/${manualAddress}`);
      } else {
        Alert.alert("Access Denied", "This address is not registered as a doctor.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Login Failed", "Could not verify doctor status. Network might be invalid.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper className="flex-1 bg-white">
      <View className="flex-1 justify-center items-center px-6">
        <View className="w-24 h-24 bg-blue-100 rounded-full items-center justify-center mb-8">
          <Text className="text-4xl">🩺</Text>
        </View>
        
        <Text className="text-3xl font-bold text-gray-900 mb-2">Doctor Portal</Text>
        <Text className="text-gray-500 text-center mb-10">
          Secure access for medical professionals
        </Text>

        <View className="w-full space-y-4">
          {/* Manual Entry */}
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1 ml-1">Wallet Address</Text>
            <TextInput 
              value={manualAddress}
              onChangeText={setManualAddress}
              placeholder="0x..."
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-800"
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity 
            onPress={handleLogin}
            disabled={loading}
            className="w-full py-4 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 items-center"
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">
                {manualAddress ? "Login with Address" : "Enter Address to Login"}
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

import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import ScreenWrapper from '@/components/ScreenWrapper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getProvider, getContracts } from '@/services/web3';
import { useAuthStore } from '../../stores/authStore';

export default function RegisterPatient() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore(state => state.login);

  const handleRegister = async () => {
    if (!name) {
      Alert.alert("Error", "Please enter your name");
      return;
    }

    setLoading(true);
    try {
      const provider = getProvider();
      const signer = await provider.getSigner();
      
      const { patientContract } = await getContracts(signer);
      
      console.log("Registering patient:", name, phone);
      
      const tx = await patientContract.registerPatient(name, "patient", phone);
      await tx.wait();
      
      Alert.alert("Success", "Registration Completed!");
      login('patient', phone!);
      router.replace('/(patient)/dashboard');

    } catch (error) {
      console.error(error);
      Alert.alert("Registration Failed", "Could not register on blockchain. " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper className="flex-1 bg-white">
      <View className="flex-1 justify-center items-center px-6">
        <View className="mb-10 items-center">
            <Text className="text-3xl font-bold text-gray-900 mb-2">Patient Registration</Text>
            <Text className="text-gray-500 text-center">
            Complete your profile to continue
            </Text>
        </View>

        <View className="w-full space-y-4">
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1 ml-1">Full Name</Text>
            <TextInput 
              value={name}
              onChangeText={setName}
              placeholder="John Doe"
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-800"
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1 ml-1">Phone Number</Text>
             <TextInput 
              value={phone}
              editable={false}
              className="w-full p-4 bg-gray-100 border border-gray-200 rounded-2xl text-gray-500"
            />
          </View>

          <TouchableOpacity 
            onPress={handleRegister}
            disabled={loading}
            className="w-full py-4 bg-teal-600 rounded-2xl shadow-lg shadow-teal-200 items-center mt-4"
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">
                Complete Registration
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
}

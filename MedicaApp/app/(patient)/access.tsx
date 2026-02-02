import { View, Text, Alert, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ScreenWrapper from '@/components/ScreenWrapper';
import Input from '@/components/Input';
import Button from '@/components/Button';
import AnimatedCard from '@/components/AnimatedCard';
import Badge from '@/components/Badge';
import { TwilioService } from '@/services/twilio';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { getProvider, getContracts } from '@/services/web3';
import { useAuthStore } from '../../stores/authStore';

type AccessTab = 'doctors' | 'insurers' | 'researchers';

const DEFAULT_DURATION_DAYS = 7;

export default function Access() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const walletAddress = useAuthStore(state => state.walletAddress);
  const activeId = id ? (Array.isArray(id) ? id[0] : id) : walletAddress;

  const [activeTab, setActiveTab] = useState<AccessTab>('doctors');
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // store provider address being modified

  // Verification State
  const [verifyModalVisible, setVerifyModalVisible] = useState(false);
  const [pendingProvider, setPendingProvider] = useState<string | null>(null);
  const [otp, setOtp] = useState('');
  const [userPhone, setUserPhone] = useState('');

  useEffect(() => {
    if (activeId) fetchProviders();
  }, [activeId, activeTab]);

  const fetchProviders = async () => {
    if (!activeId) return;
    try {
      setLoading(true);
      const provider = getProvider();
      const { doctorContract, insuranceContract, researcherContract, patientContract } = await getContracts(provider);
      
      let addresses: string[] = [];
      let contract: any = null;
      let getDetailsMethod: any = null;

      if (activeTab === 'doctors') {
        addresses = await doctorContract.getAllDoctors();
        contract = doctorContract;
        getDetailsMethod = doctorContract.getDoctor;
      } else if (activeTab === 'insurers') {
        addresses = await insuranceContract.getAllInsurers(); // Assuming this exists
        contract = insuranceContract;
        getDetailsMethod = insuranceContract.getInsurer; 
      } else {
        addresses = await researcherContract.getAllResearchers(); // Assuming this exists
        contract = researcherContract;
        getDetailsMethod = researcherContract.getResearcher;
      }

      const patientId = activeId.toLowerCase();
      
      const items = await Promise.all(addresses.map(async (addr: string) => {
          try {
             // Get details (username, role, phone...)
             const details = await getDetailsMethod(addr);
             
             // Check access expiry
             const expiry = await patientContract.accessExpiry(patientId, addr);
             const isAccessActive = Number(expiry) > Math.floor(Date.now() / 1000);
             
             return {
                 address: addr,
                 name: details[0] || 'Unknown',
                 role: details[1],
                 accessGranted: isAccessActive,
                 expiry: Number(expiry)
             };
          } catch (e) {
              console.warn(`Failed to fetch details for ${addr}`, e);
              return null;
          }
      }));

      setProviders(items.filter(i => i !== null));

    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to fetch providers.");
    } finally {
      setLoading(false);
    }
  };

  const initiateGrantAccess = async (providerAddress: string) => {
      setPendingProvider(providerAddress);
      setActionLoading(providerAddress);
      try {
        const provider = getProvider();
        const { patientContract } = await getContracts(provider);
        const patientId = activeId!.toLowerCase();
        
        const info = await patientContract.getPatient(patientId);
        const phone = info[2];

        if (!phone) {
             Alert.alert("Error", "No registered phone number found on your account.");
             setActionLoading(null);
             return;
        }

        setUserPhone(phone);
        await TwilioService.sendOTP(phone);
        
        setVerifyModalVisible(true);
        setActionLoading(null);
      } catch (e: any) {
        console.error(e);
        Alert.alert("Error", "Failed to initiate access grant. " + e.message);
        setActionLoading(null);
      }
  };

  const confirmGrantAccess = async () => {
      if (!pendingProvider || !userPhone) return;
      
      setActionLoading(pendingProvider); // Show loading on the modal button effectively (or global)
      try {
        // 1. Verify OTP
        await TwilioService.verifyOTP(userPhone, otp);

        // 2. Grant Access
        const provider = getProvider();
        const patientId = activeId!.toString();
        const signer = await provider.getSigner(patientId); // Mock signer for local
        const { patientContract } = await getContracts(signer);

        const durationSeconds = DEFAULT_DURATION_DAYS * 24 * 60 * 60;
        const tx = await patientContract.grantAccess(pendingProvider, durationSeconds);
        await tx.wait();

        Alert.alert("Success", "Access granted successfully!");
        setVerifyModalVisible(false);
        setOtp('');
        setPendingProvider(null);
        fetchProviders(); // Refresh list
      } catch (e: any) {
        console.error(e);
        Alert.alert("Failed", "Could not grant access. " + e.message);
      } finally {
        setActionLoading(null);
      }
  };

  const revokeAccess = async (providerAddress: string) => {
      setActionLoading(providerAddress);
      try {
        const provider = getProvider();
        const patientId = activeId!.toString();
        const signer = await provider.getSigner(patientId);
        const { patientContract } = await getContracts(signer);

        const tx = await patientContract.revokeAccess(providerAddress);
        await tx.wait();

        Alert.alert("Revoked", "Access has been revoked.");
        fetchProviders();
      } catch (e: any) {
        console.error(e);
        Alert.alert("Error", "Failed to revoke access.");
      } finally {
        setActionLoading(null);
      }
  };

  if (verifyModalVisible) {
      return (
        <ScreenWrapper className="bg-background justify-center px-6">
            <AnimatedCard className="p-6">
                <View className="items-center mb-6">
                    <View className="w-16 h-16 bg-primary-50 rounded-full items-center justify-center mb-4">
                        <Ionicons name="lock-closed" size={28} color="#0d9488" />
                    </View>
                    <Text className="text-xl font-bold text-text-dark">Verify to Grant Access</Text>
                    <Text className="text-center text-text-light mt-2">
                        Enter code sent to {userPhone.slice(0, 4)}...{userPhone.slice(-4)}
                    </Text>
                </View>

                <Input 
                    placeholder="000000" 
                    keyboardType="number-pad" 
                    value={otp} 
                    onChangeText={setOtp}
                    className="mb-6 text-center text-2xl tracking-widest font-bold"
                    maxLength={6}
                />

                <Button 
                    title="Confirm Grant" 
                    variant="gradient"
                    onPress={confirmGrantAccess}
                    loading={actionLoading === pendingProvider}
                    disabled={otp.length !== 6}
                />
                <Button 
                    title="Cancel" 
                    variant="ghost" 
                    onPress={() => {
                        setVerifyModalVisible(false);
                        setPendingProvider(null);
                        setOtp('');
                    }}
                    className="mt-2"
                />
            </AnimatedCard>
        </ScreenWrapper>
      );
  }

  return (
    <ScreenWrapper className="bg-background">
      {/* Header */}
      <View className="mb-6">
        <Text className="text-3xl font-display font-bold text-text-dark">Manage Access</Text>
        <Text className="text-text-light mt-1">Control who can view your records</Text>
      </View>

      {/* Tabs */}
      <View className="flex-row mb-6 bg-gray-100 p-1 rounded-xl">
          {(['doctors', 'insurers', 'researchers'] as AccessTab[]).map(tab => (
              <TouchableOpacity 
                key={tab}
                onPress={() => setActiveTab(tab)}
                className={`flex-1 py-2 rounded-lg items-center ${activeTab === tab ? 'bg-white shadow-sm' : ''}`}
              >
                  <Text className={`font-semibold capitalize ${activeTab === tab ? 'text-primary-700' : 'text-gray-500'}`}>
                      {tab}
                  </Text>
              </TouchableOpacity>
          ))}
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchProviders} />}
      >
          {loading ? (
             <ActivityIndicator size="large" color="#0d9488" className="mt-10" />
          ) : providers.length === 0 ? (
              <View className="items-center mt-10">
                  <Ionicons name="people-outline" size={48} color="#cbd5e1" />
                  <Text className="text-gray-400 mt-4">No {activeTab} found</Text>
              </View>
          ) : (
              providers.map((item, index) => (
                  <AnimatedCard key={item.address} delay={index * 100} className="mb-4 p-4 border border-gray-100 flex-row items-center justify-between">
                      <View className="flex-1 mr-4">
                          <View className="flex-row items-center mb-1">
                              <Text className="font-bold text-lg text-text-dark">{item.name}</Text>
                              {item.accessGranted && (
                                  <View className="ml-2 bg-green-100 px-2 py-0.5 rounded text-xs flex-row items-center">
                                      <Ionicons name="checkmark-circle" size={12} color="#16a34a" />
                                      <Text className="text-green-700 text-[10px] font-bold ml-1">ACCESS GRANTED</Text>
                                  </View>
                              )}
                          </View>
                          <Text className="text-xs text-gray-400 mb-1">{item.address}</Text>
                          {item.accessGranted && (
                              <Text className="text-xs text-primary-600">
                                  Expires: {new Date(item.expiry * 1000).toLocaleDateString()}
                              </Text>
                          )}
                      </View>

                      <View>
                          {item.accessGranted ? (
                              <TouchableOpacity 
                                onPress={() => revokeAccess(item.address)}
                                disabled={!!actionLoading}
                                className="bg-red-50 border border-red-100 px-4 py-2 rounded-lg"
                              >
                                  {actionLoading === item.address ? (
                                      <ActivityIndicator size="small" color="#ef4444" />
                                  ) : (
                                      <Text className="text-red-600 font-semibold text-xs">Revoke</Text>
                                  )}
                              </TouchableOpacity>
                          ) : (
                              <TouchableOpacity 
                                onPress={() => initiateGrantAccess(item.address)}
                                disabled={!!actionLoading}
                                className="bg-primary-600 px-4 py-2 rounded-lg shadow-sm"
                              >
                                  {actionLoading === item.address ? (
                                      <ActivityIndicator size="small" color="white" />
                                  ) : (
                                      <Text className="text-white font-semibold text-xs">Grant Access</Text>
                                  )}
                              </TouchableOpacity>
                          )}
                      </View>
                  </AnimatedCard>
              ))
          )}
      </ScrollView>
    </ScreenWrapper>
  );
}

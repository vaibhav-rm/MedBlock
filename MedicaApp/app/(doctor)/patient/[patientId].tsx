import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, Linking } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ScreenWrapper from '../../../components/ScreenWrapper';
import { getProvider, getContracts } from '../../../services/web3';
import { getIpfsUrl } from '../../../services/ipfs';
import { Colors } from '../../../constants/Colors';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function PatientDetail() {
  const { patientId, doctorId } = useLocalSearchParams();
  const router = useRouter();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patientName, setPatientName] = useState('');

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const provider = getProvider();
      
      // On Sepolia/Infura, we cannot get a signer for an arbitrary address without a private key.
      // Instead, we use the provider and specify 'from' in the call overrides for view functions.
      const { patientContract } = await getContracts(provider);

      const pid = (patientId as string).toLowerCase();
      
      // Get Patient Name
      try {
          const info = await patientContract.getPatient(pid);
          setPatientName(info[0]);
      } catch (e) { setPatientName("Patient"); }

      // Get Shared Records associated with patient
      // We explicitly pass { from: doctorId } so the contract sees msg.sender as the doctor
      const data = await patientContract.getSharedRecords(pid, { from: doctorId });
      
      // Parse data
      const parsed = data.map((r: any) => ({
          cid: r[0],
          fileType: r[1],
          fileName: r[2],
          title: r[3],
          description: r[4],
          timestamp: r[5] ? Number(r[5]) : Date.now() / 1000
      }));

      setRecords(parsed);

    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to fetch records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) fetchRecords();
  }, [patientId]);

  const viewFile = (cid: string) => {
      const url = getIpfsUrl(cid);
      Linking.openURL(url);
  };

  const renderRecord = ({ item }) => (
    <View className="bg-white p-5 rounded-2xl mb-4 border border-gray-100 shadow-sm">
        <View className="flex-row justify-between items-start mb-2">
            <View className="flex-1">
                <Text className="text-lg font-bold text-gray-900">{item.title}</Text>
                <Text className="text-xs text-gray-500 mt-1">
                    {new Date(item.timestamp * 1000).toLocaleDateString()} • {item.fileName}
                </Text>
            </View>
            <TouchableOpacity 
                onPress={() => viewFile(item.cid)}
                className="bg-blue-50 p-2 rounded-lg"
            >
                <Ionicons name="document-text-outline" size={20} color="#2563EB" />
            </TouchableOpacity>
        </View>
        <Text className="text-gray-600 text-sm leading-relaxed">{item.description}</Text>
    </View>
  );

  return (
    <ScreenWrapper className="bg-gray-50 flex-1">
      <View className="px-5 py-4 flex-row justify-between items-center bg-white border-b border-gray-100">
          <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text className="font-bold text-lg">{patientName}</Text>
          <View style={{ width: 24 }} />
      </View>

      <View className="flex-1 px-5 pt-4">
          <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-gray-800">Medical Records</Text>
              <TouchableOpacity
                onPress={() => router.push({
                    pathname: '/(doctor)/add-record',
                    params: { patientId, doctorId }
                })}
                className="bg-blue-600 px-4 py-2 rounded-xl flex-row items-center gap-1"
              >
                  <Ionicons name="add" size={18} color="white" />
                  <Text className="text-white font-bold text-sm">Add New</Text>
              </TouchableOpacity>
          </View>

          {loading ? (
              <ActivityIndicator size="large" color="#008080" />
          ) : (
              <FlatList
                  data={records}
                  renderItem={renderRecord}
                  keyExtractor={(item, index) => index.toString()}
                  ListEmptyComponent={
                      <View className="items-center mt-10 p-10 bg-white rounded-2xl border border-dashed border-gray-200">
                          <Ionicons name="folder-open-outline" size={48} color="#D1D5DB" />
                          <Text className="text-gray-400 mt-2 text-center">No records found for this patient.</Text>
                      </View>
                  }
              />
          )}
      </View>
    </ScreenWrapper>
  );
}

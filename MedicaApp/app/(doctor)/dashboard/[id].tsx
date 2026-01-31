import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ScreenWrapper from '@/components/ScreenWrapper';
import { getProvider, getContracts } from '@/services/web3';
import { Colors } from '../../constants/Colors';

export default function DoctorDashboard() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctorName, setDoctorName] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const provider = getProvider();
      const { doctorContract, patientContract } = await getContracts(provider);
      
      const doctorId = (id as string).toLowerCase();

      // Get Doctor Info
      try {
        const doctorInfo = await doctorContract.doctors(doctorId); // Note: verify struct/mapping usage
        // Web App used getDoctor(id) which returned array. Smart contract mapping usually returns struct.
        // If public mapping: await doctorContract.doctors(id) -> Result
        // Web app: const doctorInfo = await doctorContract.getDoctor(sanitizedId); const name = doctorInfo[0];
        // We will try both or assume ABI matches Web App usage.
         const info = await doctorContract.getDoctor(doctorId);
         setDoctorName(info[0]);
      } catch (e) {
         console.log("Error fetching doctor info", e);
         setDoctorName("Doctor");
      }

      // Get Patients
      // Web App: await patientContract.getAllPatients()
      const allPatientIds = await patientContract.getAllPatients();
      
      const patientsData = await Promise.all(
          allPatientIds.map(async (pid: string) => {
              try {
                  const pInfo = await patientContract.getPatient(pid);
                  // Basic info: name is pInfo[0]
                  return {
                      id: pid,
                      name: pInfo[0],
                      recordCount: 0 // We can fetch records later for performance or now
                  };
              } catch (e) { return null; }
          })
      );

      setPatients(patientsData.filter(p => p !== null));

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const renderPatient = ({ item }) => (
    <TouchableOpacity 
      className="bg-white p-4 rounded-xl mb-3 border border-gray-100 shadow-sm flex-row items-center justify-between"
      onPress={() => router.push({
          pathname: '/(doctor)/patient/[patientId]',
          params: { patientId: item.id, doctorId: id }
      })}
    >
        <View className="flex-row items-center gap-4">
            <View className="w-12 h-12 bg-blue-50 rounded-full items-center justify-center">
                <Text className="text-xl font-bold text-blue-600">{item.name.charAt(0)}</Text>
            </View>
            <View>
                <Text className="font-bold text-gray-800 text-lg">{item.name}</Text>
                <Text className="text-gray-400 text-xs font-mono">{item.id.slice(0,6)}...{item.id.slice(-4)}</Text>
            </View>
        </View>
        <Text className="text-blue-600 font-medium">View</Text>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper className="bg-gray-50 h-full">
      <View className="px-5 pt-4 pb-2 flex-row justify-between items-center">
          <View>
              <Text className="text-gray-500 text-sm">Welcome back,</Text>
              <Text className="text-2xl font-bold text-gray-900">{doctorName}</Text>
          </View>
          <View className="bg-blue-100 px-3 py-1 rounded-full">
               <Text className="text-blue-700 text-xs font-mono">{id?.toString().slice(0,6)}...</Text>
          </View>
      </View>

      <View className="flex-1 px-5 mt-4">
          <Text className="text-lg font-bold text-gray-800 mb-4">My Patients</Text>
          {loading ? (
             <ActivityIndicator size="large" color="#008080" />
          ) : (
            <FlatList 
                data={patients}
                renderItem={renderPatient}
                keyExtractor={item => item.id}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} />}
                ListEmptyComponent={
                    <View className="items-center mt-10">
                        <Text className="text-gray-400">No patients found.</Text>
                    </View>
                }
            />
          )}
      </View>
    </ScreenWrapper>
  );
}

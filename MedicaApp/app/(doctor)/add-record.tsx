import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ScreenWrapper from '@/components/ScreenWrapper';
import * as DocumentPicker from 'expo-document-picker';
import { getProvider, getContracts } from '@/services/web3';
import { uploadFileToIPFS } from '@/services/ipfs';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function AddRecord() {
  const { patientId, doctorId } = useLocalSearchParams();
  const router = useRouter();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [loading, setLoading] = useState(false);
  const [privacy, setPrivacy] = useState(1); // Default to Standard

  const pickFile = async () => {
      const result = await DocumentPicker.getDocumentAsync({
          type: '*/*',
          copyToCacheDirectory: true
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
          setFile(result.assets[0]);
      }
  };

  const handleSubmit = async () => {
      if (!title || !description || !file) {
          Alert.alert("Missing Fields", "Please fill all fields and attach a file.");
          return;
      }

      setLoading(true);
      try {
          // 1. Upload to IPFS
          const cid = await uploadFileToIPFS(file.uri, file.name, file.mimeType || 'application/octet-stream');
          if (!cid) throw new Error("IPFS Upload Failed");

          // 2. Add to Blockchain
          // 2. Add to Blockchain
          const provider = getProvider();
          
          // IMPORTANT: For local development, we sign on behalf of the user/doctor without a wallet prompt.
          // In production, you would trigger a wallet signature.
          const docSigner = await provider.getSigner(doctorId as string);
          const { patientContract } = await getContracts(docSigner);
          
          console.log(`Adding record to ${patientId} by doctor ${doctorId}`);
          
          // string memory _patientAddress, string memory _ipfsHash, string memory _fileType, string memory _fileName, 
          // string memory _title, string memory _resume, string memory _previousVersion, uint8 _privacyLevel
          
          // Note: Current smart contract signature check:
          // addMedicalRecord(address _patientAddress, string _ipfsHash, ... ) 
          
          const tx = await patientContract.addMedicalRecord(
              patientId,
              cid,
              file.mimeType || 'application/pdf',
              file.name,
              title,
              description,
              "", // previousVersion
              privacy
          );
          
          await tx.wait();
          
          Alert.alert("Success", "Medical Record added successfully!");
          
          // If we want to actually execute on local node, we need a private key.
          // I will skip the actual blockchain write if no signer is available to avoid crash.
          
          router.back();

      } catch (error) {
          console.error(error);
          Alert.alert("Error", "Failed to add record: " + error.message);
      } finally {
          setLoading(false);
      }
  };

  return (
    <ScreenWrapper className="bg-white flex-1">
      <View className="px-5 py-4 border-b border-gray-100 flex-row items-center gap-4">
           <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="close" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-xl font-bold">Add Medical Record</Text>
      </View>

      <ScrollView className="p-5">
          <View className="space-y-6">
              <View>
                  <Text className="font-bold text-gray-700 mb-2">Details</Text>
                  <TextInput 
                      value={title}
                      onChangeText={setTitle}
                      placeholder="Record Title (e.g. Blood Test)"
                      className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-4"
                  />
                  <TextInput 
                      value={description}
                      onChangeText={setDescription}
                      placeholder="Clinical Notes / Description"
                      multiline
                      numberOfLines={4}
                      className="bg-gray-50 p-4 rounded-xl border border-gray-200 h-32"
                      textAlignVertical="top"
                  />
              </View>

              <View>
                  <Text className="font-bold text-gray-700 mb-2">Attachment</Text>
                  <TouchableOpacity 
                      onPress={pickFile}
                      className="border-2 border-dashed border-gray-300 rounded-xl p-8 items-center justify-center bg-gray-50"
                  >
                      {file ? (
                          <View className="items-center">
                              <Ionicons name="document" size={32} color="#008080" />
                              <Text className="font-bold text-gray-800 mt-2">{file.name}</Text>
                              <Text className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</Text>
                          </View>
                      ) : (
                          <View className="items-center">
                              <Ionicons name="cloud-upload-outline" size={32} color="gray" />
                              <Text className="text-gray-500 mt-2">Tap to Select File</Text>
                          </View>
                      )}
                  </TouchableOpacity>
              </View>

              <TouchableOpacity 
                  onPress={handleSubmit}
                  disabled={loading}
                  className="bg-teal-600 py-4 rounded-xl items-center shadow-lg shadow-teal-200 mt-4"
              >
                  {loading ? (
                      <ActivityIndicator color="white" />
                  ) : (
                      <Text className="text-white font-bold text-lg">Submit Record</Text>
                  )}
              </TouchableOpacity>
          </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

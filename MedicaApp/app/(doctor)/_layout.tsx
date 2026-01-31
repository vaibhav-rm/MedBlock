import { Stack } from 'expo-router';
import { Colors } from '../../constants/Colors';

export default function DoctorLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard/[id]" options={{ title: 'Dashboard' }} />
      <Stack.Screen name="patient/[patientId]" options={{ title: 'Patient Details', presentation: 'card' }} />
      <Stack.Screen name="add-record" options={{ title: 'Add Record', presentation: 'modal' }} />
    </Stack>
  );
}

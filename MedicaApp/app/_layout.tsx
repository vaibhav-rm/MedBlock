import "react-native-get-random-values";
import { Slot } from 'expo-router';
import { View } from 'react-native';
import "../global.css";

// WalletConnect has been removed to prevent initialization errors
// To enable wallet features, install WalletConnect dependencies and configure properly

export default function RootLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Slot />
    </View>
  );
}

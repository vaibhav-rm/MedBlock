import "react-native-get-random-values";
import { Slot } from 'expo-router';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import "../global.css";

// WalletConnect has been removed to prevent initialization errors
// To enable wallet features, install WalletConnect dependencies and configure properly

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Slot />
    </GestureHandlerRootView>
  );
}

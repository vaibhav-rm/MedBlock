import { View, Image } from 'react-native';
import React from 'react';

interface HealthIllustrationProps {
  type: 'hero-health' | 'wallet-connect' | 'grant-access' | 'empty-records' | 'onboarding-blockchain' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const illustrations = {
  'hero-health': require('../assets/images/hero-health.png'),
  'wallet-connect': require('../assets/images/wallet-connect.png'),
  'grant-access': require('../assets/images/grant-access.png'),
  'empty-records': require('../assets/images/empty-records.png'),
  'onboarding-blockchain': require('../assets/images/onboarding-blockchain.png'),
  'success': require('../assets/images/success.png'),
};

const sizeMap = {
  sm: { width: 120, height: 120 },
  md: { width: 200, height: 200 },
  lg: { width: 280, height: 280 },
  xl: { width: 350, height: 350 },
};

export default function HealthIllustration({ 
  type, 
  size = 'md',
  className = '' 
}: HealthIllustrationProps) {
  const dimensions = sizeMap[size];
  
  return (
    <View className={`items-center justify-center ${className}`}>
      <Image 
        source={illustrations[type]} 
        style={dimensions}
        resizeMode="contain"
      />
    </View>
  );
}

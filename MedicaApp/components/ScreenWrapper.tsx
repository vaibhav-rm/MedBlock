import { View, Text, SafeAreaView, Platform, StatusBar } from 'react-native';
import React from 'react';
import { Colors } from '../constants/Colors';
import GradientBackground from './GradientBackground';

interface ScreenWrapperProps {
  children: React.ReactNode;
  bg?: string;
  className?: string;
  useGradient?: boolean;
}

export default function ScreenWrapper({ children, bg, className, useGradient = false }: ScreenWrapperProps) {
  const paddingTop = Platform.OS === 'android' ? StatusBar.currentHeight! + 10 : 0;
  
  const Wrapper = useGradient ? GradientBackground : View;
  
  return (
    <SafeAreaView 
      style={{ paddingTop, flex: 1, backgroundColor: useGradient ? 'transparent' : (bg || Colors.light.background) }} 
      className={className}
    >
      <StatusBar barStyle="dark-content" backgroundColor={useGradient ? 'transparent' : (bg || Colors.light.background)} translucent={useGradient} />
      <Wrapper className="flex-1 px-4" style={useGradient ? { flex: 1 } : {}}>
        {children}
      </Wrapper>
    </SafeAreaView>
  );
}

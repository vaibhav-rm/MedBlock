import { View, ViewProps } from 'react-native';
import React, { useEffect } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay } from 'react-native-reanimated';

interface AnimatedCardProps extends ViewProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export default function AnimatedCard({ children, delay = 0, className, style, ...props }: AnimatedCardProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 500 }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 500 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  });

  return (
    <Animated.View 
      className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 ${className}`}
      style={[animatedStyle, style]} 
      {...props}
    >
      {children}
    </Animated.View>
  );
}

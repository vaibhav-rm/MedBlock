import { View, ViewProps } from 'react-native';
import React, { useEffect } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';

export default function PulseAnimation({ children, style, className }: ViewProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    // Pulse effect: scale up slightly then back down, repeating forever
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 500 }),
        withTiming(1, { duration: 500 })
      ),
      -1, // Infinite loop
      true // Reverse
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <Animated.View style={[animatedStyle, style]} className={className}>
      {children}
    </Animated.View>
  );
}

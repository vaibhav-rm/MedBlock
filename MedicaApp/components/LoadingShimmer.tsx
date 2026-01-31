import { View, ViewProps } from 'react-native';
import React from 'react';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat, 
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface LoadingShimmerProps extends ViewProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  className?: string;
}

export default function LoadingShimmer({ 
  width = '100%', 
  height = 20, 
  borderRadius = 8,
  className = '',
  ...props 
}: LoadingShimmerProps) {
  const translateX = useSharedValue(-1);

  React.useEffect(() => {
    translateX.value = withRepeat(
      withTiming(1, {
        duration: 1500,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: translateX.value * (typeof width === 'number' ? width : 200),
      },
    ],
  }));

  const widthStyle = typeof width === 'number' ? { width } : {};
  const widthClass = typeof width === 'string' ? width : '';

  return (
    <View
      className={`bg-gray-200 overflow-hidden ${widthClass} ${className}`}
      style={[
        widthStyle,
        { height, borderRadius },
      ]}
      {...props}
    >
      <Animated.View
        className="h-full w-full bg-gradient-to-r from-transparent via-white/60 to-transparent"
        style={[
          animatedStyle,
          {
            width: '50%',
          },
        ]}
      />
    </View>
  );
}

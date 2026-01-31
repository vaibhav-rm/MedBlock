import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming 
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  className?: string;
  disabled?: boolean;
}

export default function Button({ 
  title, 
  onPress, 
  loading = false, 
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  className = '',
  disabled = false
}: ButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  // Size configurations
  const sizeClasses = {
    sm: 'px-5 py-2.5',
    md: 'px-6 py-3',
    lg: 'px-8 py-3.5',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  // Variant styles
  let bgClass = '';
  let textClass = '';
  let iconColor = '#ffffff';

  switch (variant) {
    case 'primary':
      bgClass = 'bg-primary-600';
      textClass = 'text-white';
      iconColor = '#ffffff';
      break;
    case 'secondary':
      bgClass = 'bg-secondary-500';
      textClass = 'text-white';
      iconColor = '#ffffff';
      break;
    case 'outline':
      bgClass = 'bg-transparent border-2 border-primary-600';
      textClass = 'text-primary-600';
      iconColor = '#0d9488';
      break;
    case 'ghost':
      bgClass = 'bg-transparent';
      textClass = 'text-primary-600';
      iconColor = '#0d9488';
      break;
    case 'gradient':
      bgClass = 'bg-transparent'; // Gradient is handled by LinearGradient component
      textClass = 'text-white';
      iconColor = '#ffffff';
      break;
    case 'danger':
      bgClass = 'bg-error';
      textClass = 'text-white';
      iconColor = '#ffffff';
      break;
    default:
      bgClass = 'bg-primary-600';
      textClass = 'text-white';
  }

  const baseClasses = `rounded-2xl shadow-card ${sizeClasses[size]} ${bgClass} ${disabled || loading ? 'opacity-50' : ''} ${className}`;

  const buttonContent = (
    <View className="flex-row items-center justify-center">
      {loading ? (
        <ActivityIndicator color={iconColor} />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons name={icon} size={iconSizes[size]} color={iconColor} style={{ marginRight: 8 }} />
          )}
          <Text className={`font-bold ${textSizeClasses[size]} ${textClass}`}>
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <Ionicons name={icon} size={iconSizes[size]} color={iconColor} style={{ marginLeft: 8 }} />
          )}
        </>
      )}
    </View>
  );

  if (variant === 'gradient') {
    return (
      <AnimatedTouchable
        onPress={disabled || loading ? undefined : onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        className={`rounded-2xl shadow-card ${sizeClasses[size]} overflow-hidden ${disabled || loading ? 'opacity-50' : ''} ${className}`}
        style={animatedStyle}
        disabled={disabled || loading}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['#14b8a6', '#0d9488']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="flex-row items-center justify-center px-5 py-2.5"
        >
          {buttonContent}
        </LinearGradient>
      </AnimatedTouchable>
    );
  }

  return (
    <AnimatedTouchable
      onPress={disabled || loading ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      className={baseClasses}
      style={animatedStyle}
      disabled={disabled || loading}
      activeOpacity={0.9}
    >
      {buttonContent}
    </AnimatedTouchable>
  );
}

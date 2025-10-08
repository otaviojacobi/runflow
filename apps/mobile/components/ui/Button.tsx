import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface ButtonProps {
  onPress?: () => void;
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'destructive' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  onPress,
  children,
  variant = 'default',
  size = 'default',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) {
  const { theme } = useTheme();

  const getButtonStyles = (): ViewStyle => {
    const baseStyles: ViewStyle = {
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    };

    // Size styles
    const sizeStyles: { [key: string]: ViewStyle } = {
      default: { paddingVertical: 12, paddingHorizontal: 16 },
      sm: { paddingVertical: 8, paddingHorizontal: 12 },
      lg: { paddingVertical: 16, paddingHorizontal: 24 },
    };

    // Variant styles
    const variantStyles: { [key: string]: ViewStyle } = {
      default: { backgroundColor: theme.primary },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.border,
      },
      destructive: { backgroundColor: theme.destructive },
      ghost: { backgroundColor: 'transparent' },
      secondary: { backgroundColor: theme.secondary },
    };

    return {
      ...baseStyles,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...(disabled && { opacity: 0.5 }),
      ...style,
    };
  };

  const getTextStyles = (): TextStyle => {
    const baseStyles: TextStyle = {
      fontWeight: '600',
      textAlign: 'center',
    };

    // Size text styles
    const sizeTextStyles: { [key: string]: TextStyle } = {
      default: { fontSize: 16 },
      sm: { fontSize: 14 },
      lg: { fontSize: 18 },
    };

    // Variant text styles
    const variantTextStyles: { [key: string]: TextStyle } = {
      default: { color: theme.primaryForeground },
      outline: { color: theme.foreground },
      destructive: { color: theme.destructiveForeground },
      ghost: { color: theme.foreground },
      secondary: { color: theme.secondaryForeground },
    };

    return {
      ...baseStyles,
      ...sizeTextStyles[size],
      ...variantTextStyles[variant],
      ...textStyle,
    };
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={getButtonStyles()}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'default' || variant === 'destructive' ? theme.primaryForeground : theme.foreground}
          size="small"
        />
      ) : typeof children === 'string' ? (
        <Text style={getTextStyles()}>{children}</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Badge({
  children,
  variant = 'default',
  style,
  textStyle,
}: BadgeProps) {
  const { theme } = useTheme();

  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'default':
        return {
          container: { backgroundColor: theme.primary },
          text: { color: theme.primaryForeground },
        };
      case 'secondary':
        return {
          container: { backgroundColor: theme.secondary },
          text: { color: theme.secondaryForeground },
        };
      case 'destructive':
        return {
          container: { backgroundColor: theme.destructive },
          text: { color: theme.destructiveForeground },
        };
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: theme.border,
          },
          text: { color: theme.foreground },
        };
      default:
        return {
          container: { backgroundColor: theme.primary },
          text: { color: theme.primaryForeground },
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <View
      style={[
        {
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 12,
          alignSelf: 'flex-start',
        },
        variantStyles.container,
        style,
      ]}
    >
      <Text
        style={[
          {
            fontSize: 12,
            fontWeight: '600',
          },
          variantStyles.text,
          textStyle,
        ]}
      >
        {children}
      </Text>
    </View>
  );
}

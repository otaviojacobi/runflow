import React from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
}

export function Input({
  label,
  error,
  containerStyle,
  labelStyle,
  style,
  ...props
}: InputProps) {
  const { theme } = useTheme();

  return (
    <View style={containerStyle}>
      {label && (
        <Text
          style={[
            {
              fontSize: 14,
              fontWeight: '500',
              color: theme.foreground,
              marginBottom: 6,
            },
            labelStyle,
          ]}
        >
          {label}
        </Text>
      )}
      <TextInput
        style={[
          {
            backgroundColor: theme.background,
            borderWidth: 1,
            borderColor: error ? theme.destructive : theme.input,
            borderRadius: 8,
            paddingVertical: 12,
            paddingHorizontal: 16,
            fontSize: 16,
            color: theme.foreground,
          },
          style,
        ]}
        placeholderTextColor={theme.mutedForeground}
        {...props}
      />
      {error && (
        <Text
          style={{
            fontSize: 12,
            color: theme.destructive,
            marginTop: 4,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
}

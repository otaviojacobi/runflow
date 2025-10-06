import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PasswordInputProps extends Omit<TextInputProps, 'secureTextEntry'> {
  value: string;
  onChangeText: (text: string) => void;
}

export function PasswordInput({ value, onChangeText, style, ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      <TextInput
        {...props}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!showPassword}
        style={[styles.input, style]}
      />
      <TouchableOpacity
        onPress={() => setShowPassword(!showPassword)}
        style={styles.iconButton}
      >
        <Ionicons
          name={showPassword ? 'eye-off-outline' : 'eye-outline'}
          size={24}
          color="#9CA3AF"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  input: {
    paddingRight: 48,
  },
  iconButton: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
});

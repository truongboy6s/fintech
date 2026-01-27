import React from 'react';
import { View, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Colors } from '@/constants/colors';

interface AppInputProps extends TextInputProps {}

export default function AppInput(props: AppInputProps) {
  return (
    <View style={styles.container}>
      <TextInput
        {...props}
        placeholderTextColor={Colors.textMuted}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginVertical: 6,
  },
  input: {
    padding: 14,
    fontSize: 15,
    color: Colors.text,
  },
});

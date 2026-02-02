import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { Layout } from '@/constants/layout';

interface DividerProps {
  text?: string;
  spacing?: 'sm' | 'md' | 'lg';
}

export const Divider: React.FC<DividerProps> = ({
  text,
  spacing = 'md',
}) => {
  const spacingValue = Layout.spacing[spacing];

  if (text) {
    return (
      <View style={[styles.container, { marginVertical: spacingValue }]}>
        <View style={styles.line} />
        <Text style={styles.text}>{text}</Text>
        <View style={styles.line} />
      </View>
    );
  }

  return (
    <View style={[styles.simpleDivider, { marginVertical: spacingValue }]} />
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  text: {
    marginHorizontal: Layout.spacing.md,
    fontSize: Layout.fontSize.sm,
    color: Colors.textMuted,
  },
  simpleDivider: {
    height: 1,
    backgroundColor: Colors.border,
  },
});

import { View, StyleSheet } from 'react-native';
import React from 'react';

interface AppCardProps {
  children: React.ReactNode;
}

export default function AppCard({ children }: AppCardProps) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    elevation: 3,
  },
});

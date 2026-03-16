import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export function GradientCard({ colors, style, children }) {
  return (
    <LinearGradient colors={colors} style={[styles.card, style]}>
      <View style={styles.inner}>{children}</View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  inner: {
    padding: 16,
  },
});


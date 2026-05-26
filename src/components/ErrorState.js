import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { fonts } from '../theme/fonts';

export function ErrorState({ message, onRetry }) {
  return (
    <View style={styles.wrap}>
      <Feather name="alert-circle" size={32} color="rgba(255,255,255,0.5)" />
      <Text style={styles.text}>{message || 'Something went wrong'}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.btn} activeOpacity={0.8} onPress={onRetry}>
          <Feather name="refresh-cw" size={14} color="#7300ff" />
          <Text style={styles.btnText}>Try again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export function ErrorStateDark({ message, onRetry }) {
  return (
    <View style={styles.wrap}>
      <Feather name="alert-circle" size={32} color="#d1d5db" />
      <Text style={[styles.text, { color: '#6b7280' }]}>{message || 'Something went wrong'}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.btn} activeOpacity={0.8} onPress={onRetry}>
          <Feather name="refresh-cw" size={14} color="#7300ff" />
          <Text style={styles.btnText}>Try again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  text: {
    fontSize: 15,
    fontFamily: fonts.regular,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 22,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  btnText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: '#7300ff',
  },
});

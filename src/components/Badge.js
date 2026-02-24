import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { fonts } from '../theme/fonts';

export function Badge({ label, style, textStyle }) {
  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.text, textStyle]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    color: '#fff',
    fontSize: 12,
    fontFamily: fonts.semiBold,
  },
});

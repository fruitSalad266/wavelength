import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { fonts } from '../theme/fonts';
import { colors } from '../theme/colors';

export function SectionHeader({ title, right, style }) {
  return (
    <View style={[styles.row, style]}>
      <Text style={styles.title}>{title}</Text>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  title: {
    color: colors.white,
    fontSize: 20,
    fontFamily: fonts.semiBold,
  },
});


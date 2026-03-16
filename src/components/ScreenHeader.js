import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { fonts } from '../theme/fonts';
import { colors } from '../theme/colors';

export function ScreenHeader({ insets, title, onBack, right, showBackground = true }) {
  return (
    <View
      style={[
        styles.header,
        showBackground && { backgroundColor: colors.overlayStrong },
        { paddingTop: insets?.top || 0 },
      ]}
    >
      <View style={styles.headerInner}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color={colors.whiteSoft} />
        </TouchableOpacity>
        <View style={styles.center}>
          {title ? <Text style={styles.title} numberOfLines={1}>{title}</Text> : null}
        </View>
        <View style={styles.right}>{right}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
  },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.white,
    fontSize: 18,
    fontFamily: fonts.semiBold,
  },
  right: {
    width: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});


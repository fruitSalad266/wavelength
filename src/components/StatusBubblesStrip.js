import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Avatar } from './Avatar';
import { fonts } from '../theme/fonts';

const BUBBLE = 72;
const AVATAR = 56;
const RINGS = [
  ['#f97316', '#db2777'],
  ['#a855f7', '#6366f1'],
  ['#06b6d4', '#3b82f6'],
  ['#10b981', '#14b8a6'],
  ['#eab308', '#f97316'],
  ['#ec4899', '#8b5cf6'],
];

function StatusBubble({ item, index, onPress }) {
  const colors = RINGS[index % RINGS.length];
  const preview = item.isSelf
    ? (item.text ? item.text : 'Tap to add…')
    : item.text;
  const emptySelf = item.isSelf && !item.text;

  return (
    <TouchableOpacity style={styles.cell} activeOpacity={0.8} onPress={() => onPress(item)}>
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.ring}>
        <View style={[styles.inner, emptySelf && styles.innerEmpty]}>
          {emptySelf ? (
            <Feather name="plus" size={28} color="rgba(113,0,255,0.55)" />
          ) : (
            <Avatar uri={item.avatar} name={item.name} size={AVATAR} style={{ borderWidth: 0 }} />
          )}
        </View>
      </LinearGradient>
      <Text style={styles.caption} numberOfLines={1}>
        {item.displayTitle}
      </Text>
      <Text style={styles.preview} numberOfLines={2}>
        {preview}
      </Text>
    </TouchableOpacity>
  );
}

export function StatusBubblesStrip({ items, onSelect }) {
  if (!items?.length) return null;

  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {items.map((item, index) => (
          <StatusBubble key={item.id} item={item} index={index} onPress={onSelect} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 10,
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  row: {
    paddingHorizontal: 4,
    gap: 4,
    paddingBottom: 4,
  },
  cell: {
    width: BUBBLE + 8,
    alignItems: 'center',
  },
  ring: {
    width: BUBBLE,
    height: BUBBLE,
    borderRadius: BUBBLE / 2,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    width: BUBBLE - 6,
    height: BUBBLE - 6,
    borderRadius: (BUBBLE - 6) / 2,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  innerEmpty: {
    backgroundColor: '#f5f3ff',
  },
  caption: {
    marginTop: 6,
    fontSize: 11,
    fontFamily: fonts.semiBold,
    color: '#fff',
    maxWidth: BUBBLE + 12,
    textAlign: 'center',
  },
  preview: {
    marginTop: 2,
    fontSize: 10,
    fontFamily: fonts.regular,
    color: 'rgba(255,255,255,0.82)',
    maxWidth: BUBBLE + 12,
    textAlign: 'center',
    lineHeight: 13,
    minHeight: 26,
  },
});

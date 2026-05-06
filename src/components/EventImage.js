import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';

const UW_LOGO = require('../../assets/uw-logo.png');
const UW_SOURCES = ['huskylink', 'trumba'];

export function EventImage({ uri, source, style }) {
  const [failed, setFailed] = useState(false);
  const isUW = UW_SOURCES.includes(source);
  const showFallback = !uri || failed;

  if (!showFallback) {
    return (
      <Image
        source={{ uri }}
        style={[StyleSheet.absoluteFill, style]}
        contentFit="cover"
        cachePolicy="disk"
        transition={200}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <View style={[StyleSheet.absoluteFill, styles.fallback, style]}>
      {isUW ? (
        <Image source={UW_LOGO} style={styles.uwLogo} contentFit="contain" />
      ) : (
        <View style={styles.genericIcon} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: '#4b0082',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uwLogo: {
    width: '50%',
    height: '50%',
    opacity: 0.4,
  },
  genericIcon: {},
});

import React, { useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';

const UW_LOGO = require('../../assets/uw-logo.png');
const UW_SOURCES = ['huskylink', 'trumba'];

/**
 * Event image with fallback.
 * - If the event has a valid backgroundImage URL, renders it.
 * - If it fails to load or is missing, shows the UW logo on a purple
 *   background for UW-sourced events, or a plain purple background otherwise.
 *
 * Props: uri, source, style (applied to outer container)
 */
export function EventImage({ uri, source, style }) {
  const [failed, setFailed] = useState(false);
  const isUW = UW_SOURCES.includes(source);
  const showFallback = !uri || failed;

  if (!showFallback) {
    return (
      <Image
        source={{ uri }}
        style={[StyleSheet.absoluteFill, style]}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <View style={[StyleSheet.absoluteFill, styles.fallback, style]}>
      {isUW ? (
        <Image source={UW_LOGO} style={styles.uwLogo} resizeMode="contain" />
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

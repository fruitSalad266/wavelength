import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { fonts } from '../../theme/fonts';
import { colors } from '../../theme/colors';

export default function ResetPasswordScreen({ navigation, onDone }) {
  const insets = useSafeAreaInsets();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!password || !confirm) {
      Alert.alert('Missing fields', 'Please fill in both fields.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Too short', 'Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Mismatch', 'Passwords do not match.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Your password has been updated.', [
        { text: 'OK', onPress: () => onDone?.() },
      ]);
    }
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#6610f2', '#7300ff', '#00ac9b']} style={StyleSheet.absoluteFill} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={s.flex}
      >
        <View style={[s.content, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 20 }]}>
          <View style={s.header}>
            <Text style={s.title}>Set New Password</Text>
            <Text style={s.subtitle}>Enter your new password below</Text>
          </View>

          <View style={s.form}>
            <View style={s.inputWrapper}>
              <Feather name="lock" size={18} color={colors.textMuted} style={s.inputIcon} />
              <TextInput
                style={s.input}
                placeholder="New password"
                placeholderTextColor={colors.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                textContentType="newPassword"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={s.eyeBtn}>
                <Feather name={showPassword ? 'eye-off' : 'eye'} size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={s.inputWrapper}>
              <Feather name="lock" size={18} color={colors.textMuted} style={s.inputIcon} />
              <TextInput
                style={s.input}
                placeholder="Confirm password"
                placeholderTextColor={colors.textTertiary}
                value={confirm}
                onChangeText={setConfirm}
                secureTextEntry={!showPassword}
                textContentType="newPassword"
              />
            </View>

            <TouchableOpacity style={s.btn} onPress={handleReset} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={s.btnText}>Update Password</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1 }} />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: { alignItems: 'center', marginBottom: 40 },
  title: {
    fontSize: 28,
    fontFamily: fonts.bold,
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
  },
  form: { gap: 14 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.text,
  },
  eyeBtn: { padding: 4 },
  btn: {
    backgroundColor: colors.primary,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  btnText: {
    color: '#fff',
    fontSize: 17,
    fontFamily: fonts.semiBold,
  },
});

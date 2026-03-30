import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import AppShell from '../../components/layout/AppShell';
import KeyboardScreen from '../../components/utility/KeyboardScreen';
import api from '../../src/services/api';
import COLORS from '../../theme/colors';
import useLoadingDots from '../../src/hooks/useLoadingDots';

const PASSWORD_RULE = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [step, setStep] = useState('EMAIL');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const loadingDots = useLoadingDots(loading);

  const canReset = useMemo(
    () => PASSWORD_RULE.test(newPassword) && newPassword === confirmPassword,
    [newPassword, confirmPassword]
  );

  const run = async (fn, nextStep = null) => {
    try {
      setLoading(true);
      setError('');
      await fn();
      if (nextStep) setStep(nextStep);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell hideChrome hideSupport>
      <KeyboardScreen contentContainerStyle={styles.container}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          {step === 'EMAIL' && 'Enter your registered email to receive an OTP.'}
          {step === 'OTP' && 'Enter the OTP sent to your email address.'}
          {step === 'RESET' && 'Choose a strong new password for your account.'}
        </Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor={COLORS.placeholder}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={step === 'EMAIL'}
          style={styles.input}
        />

        {step !== 'EMAIL' ? (
          <TextInput
            value={otp}
            onChangeText={setOtp}
            placeholder="OTP"
            placeholderTextColor={COLORS.placeholder}
            keyboardType="number-pad"
            style={styles.input}
          />
        ) : null}

        {step === 'RESET' ? (
          <>
            <View style={styles.passwordRow}>
              <TextInput
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="New Password"
                placeholderTextColor={COLORS.placeholder}
                secureTextEntry={!showPassword}
                style={styles.passwordInput}
              />
              <Pressable style={styles.toggleBtn} onPress={() => setShowPassword((prev) => !prev)}>
                <Text style={styles.toggleText}>{showPassword ? 'Hide' : 'Show'}</Text>
              </Pressable>
            </View>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm Password"
              placeholderTextColor={COLORS.placeholder}
              secureTextEntry={!showPassword}
              style={styles.input}
            />
            <Text style={styles.hint}>Use 8+ characters with 1 uppercase, 1 number, and 1 special character.</Text>
          </>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {step === 'EMAIL' ? (
          <Pressable
            style={styles.primaryButton}
            disabled={loading || email.trim().length < 4}
            onPress={() => run(() => api.forgotPassword({ email: email.trim() }), 'OTP')}
          >
            <Text style={styles.primaryButtonText}>{loading ? `Sending${loadingDots}` : 'Send OTP'}</Text>
          </Pressable>
        ) : null}

        {step === 'OTP' ? (
          <Pressable
            style={styles.primaryButton}
            disabled={loading || otp.trim().length < 4}
            onPress={() => run(() => api.verifyOtp({ email: email.trim(), otp: otp.trim() }), 'RESET')}
          >
            <Text style={styles.primaryButtonText}>{loading ? `Verifying${loadingDots}` : 'Verify OTP'}</Text>
          </Pressable>
        ) : null}

        {step === 'RESET' ? (
          <Pressable
            style={styles.primaryButton}
            disabled={loading || !canReset}
            onPress={() =>
              run(async () => {
                await api.resetPassword({ email: email.trim(), otp: otp.trim(), newPassword });
                router.replace('/auth/signin');
              })
            }
          >
            <Text style={styles.primaryButtonText}>{loading ? `Updating${loadingDots}` : 'Reset Password'}</Text>
          </Pressable>
        ) : null}

        <Pressable style={styles.backBtn} onPress={() => router.replace('/auth/signin')}>
          <Text style={styles.backText}>Back to sign in</Text>
        </Pressable>
      </KeyboardScreen>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    justifyContent: 'center',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.muted,
    textAlign: 'center',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: COLORS.text,
  },
  passwordRow: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    color: COLORS.text,
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  toggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  toggleText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  hint: {
    color: COLORS.muted,
    fontSize: 12,
  },
  error: {
    color: COLORS.danger,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  backBtn: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  backText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});

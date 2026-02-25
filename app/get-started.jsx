import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AppShell from '../components/layout/AppShell';
import { useRouter } from 'expo-router';
import COLORS from '../theme/colors';

const GetStartedScreen = () => {
  const router = useRouter();
  return (
    <AppShell hideChrome hideSupport>
      <View style={ styles.container }>
        <TouchableOpacity style={ styles.skipButton } onPress={ () => router.replace('/') }>
          <Text style={ styles.skipText }>Skip</Text>
        </TouchableOpacity>
        <Text style={ styles.title }>Let&apos;s get you moving</Text>
        <Text style={ styles.subtitle }>Create an account or sign in to book mechanics.</Text>
        <TouchableOpacity style={ styles.primaryButton } onPress={ () => router.push('/auth/signup') }>
          <Text style={ styles.primaryButtonText }>Create Account</Text>
        </TouchableOpacity>
        <TouchableOpacity style={ styles.secondaryButton } onPress={ () => router.push('/auth/signin') }>
          <Text style={ styles.secondaryButtonText }>Sign In</Text>
        </TouchableOpacity>
      </View>
    </AppShell>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  skipButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  skipText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 14,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 14,
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});

export default GetStartedScreen;

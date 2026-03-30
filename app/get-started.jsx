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
        <TouchableOpacity style={styles.skipButton} onPress={ () => router.replace('/') }>
          <Text style={ styles.skipText }>Skip</Text>
        </TouchableOpacity>
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>MyGarage</Text>
          <Text style={ styles.title }>Roadside help, booking, and live tracking in one place</Text>
          <Text style={ styles.subtitle }>
            Create an account to find approved mechanics, track arrivals live, and manage your service flow without guesswork.
          </Text>
        </View>
        <View style={styles.featureRow}>
          <View style={styles.featurePill}><Text style={styles.featureText}>Approved mechanics</Text></View>
          <View style={styles.featurePill}><Text style={styles.featureText}>Live ETA</Text></View>
          <View style={styles.featurePill}><Text style={styles.featureText}>Support chat</Text></View>
        </View>
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
    gap: 14,
    backgroundColor: '#F7FAFC',
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
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 21,
  },
  heroCard: {
    borderRadius: 24,
    padding: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D8E3F0',
    gap: 10,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  eyebrow: {
    color: COLORS.primary,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  featureRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  featurePill: {
    backgroundColor: '#EAF1F7',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  featureText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 16,
    minWidth: 220,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 16,
    minWidth: 220,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});

export default GetStartedScreen;

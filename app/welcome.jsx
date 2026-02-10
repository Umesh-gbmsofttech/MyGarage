import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AppShell from '../components/layout/AppShell';
import { useRouter } from 'expo-router';
import COLORS from '../theme/colors';

const WelcomeScreen = () => {
  const router = useRouter();
  return (
    <AppShell hideChrome hideSupport>
      <View style={styles.container}>
        <Image source={require('../assets/images/MyGarage.png')} style={styles.logo} />
        <Text style={styles.title}>Welcome to MyGarage</Text>
        <Text style={styles.subtitle}>Book trusted mechanics or fix it yourself.</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/get-started')}>
          <Text style={styles.primaryButtonText}>Get Started</Text>
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
  logo: {
    width: 180,
    height: 90,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 22,
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
});

export default WelcomeScreen;

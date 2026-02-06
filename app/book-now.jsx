import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AppShell from '../components/layout/AppShell';
import { useRouter } from 'expo-router';

const BookNowScreen = () => {
  const router = useRouter();
  return (
    <AppShell title="Book Now">
      <View style={styles.container}>
        <Text style={styles.title}>Book a mechanic in minutes</Text>
        <Text style={styles.subtitle}>Search nearby mechanics and send a booking request.</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/search')}>
          <Text style={styles.primaryButtonText}>Find Mechanics</Text>
        </TouchableOpacity>
      </View>
    </AppShell>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2A24',
  },
  subtitle: {
    fontSize: 14,
    color: '#5C6B64',
  },
  primaryButton: {
    backgroundColor: '#1B6B4E',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default BookNowScreen;

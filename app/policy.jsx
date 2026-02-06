import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import AppShell from '../components/layout/AppShell';

const PolicyScreen = () => {
  return (
    <AppShell title="Policy">
      <View style={styles.container}>
        <Text style={styles.title}>Privacy & Service Policy</Text>
        <Text style={styles.text}>We only collect information required to fulfill bookings and improve service quality.</Text>
        <Text style={styles.text}>Location sharing is required only during an active booking.</Text>
      </View>
    </AppShell>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2A24',
  },
  text: {
    fontSize: 14,
    color: '#5C6B64',
  },
});

export default PolicyScreen;

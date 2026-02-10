import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import AppShell from '../components/layout/AppShell';
import COLORS from '../theme/colors';

const TermsScreen = () => {
  return (
    <AppShell title="Terms & Conditions">
      <View style={styles.container}>
        <Text style={styles.title}>Terms & Conditions</Text>
        <Text style={styles.text}>Use of this platform is subject to our safety, payment, and service policies.</Text>
        <Text style={styles.text}>Always verify mechanic credentials and share accurate vehicle details.</Text>
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
    color: COLORS.text,
  },
  text: {
    fontSize: 14,
    color: COLORS.muted,
  },
});

export default TermsScreen;

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import AppShell from '../../components/layout/AppShell';

const SupportChatScreen = () => {
  return (
    <AppShell title="Support Chat" hideSupport>
      <View style={ styles.container }>
        <Text style={ styles.title }>Support Chat</Text>
        <Text style={ styles.subtitle }>This space is ready for future AI chat support.</Text>
      </View>
    </AppShell>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2A24',
  },
  subtitle: {
    fontSize: 14,
    color: '#5C6B64',
  },
});

export default SupportChatScreen;

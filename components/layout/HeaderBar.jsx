import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const HeaderBar = ({ onMenuPress, title = 'MyGarage' }) => {
  const router = useRouter();

  return (
    <LinearGradient colors={['#E9F5E1', '#FDFCF7']} style={styles.container}>
      <TouchableOpacity onPress={onMenuPress} style={styles.iconButton}>
        <Ionicons name="menu" size={24} color="#0B3B2E" />
      </TouchableOpacity>
      <View style={styles.titleWrap}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>Trusted mechanic network</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => router.push('/my-bookings')} style={styles.iconButton}>
          <Ionicons name="notifications-outline" size={22} color="#0B3B2E" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/profile')} style={styles.iconButton}>
          <Ionicons name="person-circle-outline" size={24} color="#0B3B2E" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 40,
    paddingBottom: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleWrap: {
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0B3B2E',
    letterSpacing: 0.4,
  },
  subtitle: {
    fontSize: 12,
    color: '#5B6B62',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default HeaderBar;

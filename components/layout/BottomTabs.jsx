import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const BottomTabs = () => {
  const router = useRouter();
  const segments = useSegments();
  const current = segments[0] === '(tabs)' ? segments[1] : segments[0];

  const items = [
    { key: 'index', label: 'Home', icon: 'home-outline', route: '/' },
    { key: 'bookings', label: 'Bookings', icon: 'calendar-check-outline', route: '/bookings' },
    { key: 'profile', label: 'Profile', icon: 'account-circle-outline', route: '/profile' },
  ];

  return (
    <View style={styles.container}>
      {items.map((item) => {
        const isActive = current === item.key;
        return (
          <TouchableOpacity key={item.key} style={styles.tab} onPress={() => router.push(item.route)}>
            <Icon name={item.icon} size={22} color={isActive ? '#1B6B4E' : '#8A8A8A'} />
            <Text style={[styles.label, isActive && styles.labelActive]}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E4E8E4',
    backgroundColor: '#FFFFFF',
  },
  tab: {
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 11,
    color: '#8A8A8A',
    fontWeight: '600',
  },
  labelActive: {
    color: '#1B6B4E',
  },
});

export default BottomTabs;

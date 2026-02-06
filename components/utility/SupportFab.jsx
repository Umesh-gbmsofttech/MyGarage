import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const SupportFab = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleCall = () => {
    Linking.openURL('tel:+919226224019');
    setOpen(false);
  };

  const handleChat = () => {
    router.push('/support/chat');
    setOpen(false);
  };

  const handleDIY = () => {
    router.push({ pathname: '/', params: { section: 'diy' } });
    setOpen(false);
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      {open && (
        <View style={styles.menu}>
          <TouchableOpacity style={styles.menuItem} onPress={handleCall}>
            <Ionicons name="call" size={18} color="#0B3B2E" />
            <Text style={styles.menuText}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleChat}>
            <Ionicons name="chatbubble-ellipses" size={18} color="#0B3B2E" />
            <Text style={styles.menuText}>Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleDIY}>
            <Ionicons name="construct" size={18} color="#0B3B2E" />
            <Text style={styles.menuText}>DIY Guide</Text>
          </TouchableOpacity>
        </View>
      )}
      <TouchableOpacity style={styles.fab} onPress={() => setOpen((prev) => !prev)}>
        <Ionicons name={open ? 'close' : 'help'} size={22} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 18,
    bottom: 24,
    alignItems: 'flex-end',
  },
  fab: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#1B6B4E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 6,
  },
  menu: {
    marginBottom: 14,
    gap: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  menuText: {
    fontSize: 14,
    color: '#1F2A24',
    fontWeight: '600',
  },
});

export default SupportFab;

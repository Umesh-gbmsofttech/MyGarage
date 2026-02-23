import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useSegments } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import apiBase from '../../api';
import { useAuth } from '../../src/context/AuthContext';
import api from '../../src/services/api';
import COLORS from '../../theme/colors';

const HeaderBar = ({ onMenuPress, title = 'MyGarage' }) => {
  const router = useRouter();
  const segments = useSegments();
  const { token } = useAuth();
  const [profileImagePath, setProfileImagePath] = useState('');
  const isProfileTab = segments[0] === '(tabs)' && segments[1] === 'profile';
  const profileImageUri = profileImagePath ? `${apiBase.replace('/api', '')}${profileImagePath}` : '';

  useEffect(() => {
    let mounted = true;
    const loadProfileImage = async () => {
      if (!token) {
        setProfileImagePath('');
        return;
      }
      try {
        const profile = await api.getProfile(token);
        const imagePath = profile?.profileImageUrl || profile?.avatarUrl || '';
        if (mounted) {
          setProfileImagePath(imagePath);
        }
      } catch (_err) {
        if (mounted) {
          setProfileImagePath('');
        }
      }
    };
    loadProfileImage();
    return () => {
      mounted = false;
    };
  }, [token]);

  return (
    <LinearGradient colors={[COLORS.accent, COLORS.background]} style={styles.container}>
      <TouchableOpacity onPress={onMenuPress} style={styles.iconButton}>
        <Ionicons name="menu" size={24} color={COLORS.primary} />
      </TouchableOpacity>
      <View style={styles.titleWrap}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>Trusted mechanic network</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => {
            if (isProfileTab) return;
            router.push('/my-bookings');
          }}
          style={styles.iconButton}
          disabled={isProfileTab}
        >
          <Ionicons name="notifications-outline" size={22} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            if (isProfileTab) return;
            router.push('/profile');
          }}
          style={styles.iconButton}
          disabled={isProfileTab}
        >
          {profileImageUri ? (
            <Image source={{ uri: profileImageUri }} style={styles.profileImage} />
          ) : (
            <Ionicons name="person-circle-outline" size={24} color={COLORS.primary} />
          )}
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
    color: COLORS.primary,
    letterSpacing: 0.4,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.muted,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
});

export default HeaderBar;

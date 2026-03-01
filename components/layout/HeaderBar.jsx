import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { usePathname, useRouter, useSegments } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import apiBase from '../../api';
import { useAuth } from '../../src/context/AuthContext';
import api from '../../src/services/api';
import { emitNotificationBadgeRefresh, subscribeNotificationBadgeRefresh } from '../../src/utils/notificationBadgeEvents';
import COLORS from '../../theme/colors';

const HeaderBar = ({ onMenuPress, title = 'MyGarage' }) => {
  const router = useRouter();
  const pathname = usePathname();
  const segments = useSegments();
  const { token, user } = useAuth();
  const [profileImagePath, setProfileImagePath] = useState('');
  const [profileRole, setProfileRole] = useState(user?.role || '');
  const [unreadCount, setUnreadCount] = useState(0);
  const bellScale = useRef(new Animated.Value(1)).current;
  const isProfileTab = segments[0] === '(tabs)' && segments[1] === 'profile';
  const profileImageUri = profileImagePath
    ? (profileImagePath.startsWith('http') ? profileImagePath : `${apiBase.replace('/api', '')}${profileImagePath}`)
    : '';
  const isAdmin = (profileRole || user?.role) === 'ADMIN';
  const normalizedPath = (pathname || '').replace('/(tabs)', '') || '/';
  const isRootTab = normalizedPath === '/' || normalizedPath === '/bookings' || normalizedPath === '/profile';

  useEffect(() => {
    let mounted = true;
    const loadProfileImage = async () => {
      if (!token) {
        setProfileImagePath('');
        setProfileRole('');
        return;
      }
      try {
        const profile = await api.getProfile(token);
        const imagePath = profile?.profileImageUrl || profile?.avatarUrl || '';
        if (mounted) {
          setProfileImagePath(imagePath);
          setProfileRole(profile?.role || user?.role || '');
        }
      } catch (_err) {
        // Keep the last resolved image on transient request failures.
      }
    };
    loadProfileImage();
    return () => {
      mounted = false;
    };
  }, [token, pathname, user?.role]);

  useEffect(() => {
    let mounted = true;
    let intervalId = null;

    const resolveUnreadCount = (items) => {
      if (!Array.isArray(items)) return 0;
      return items.filter((item) => {
        if (!item || typeof item !== 'object') return false;
        if (typeof item.unread === 'boolean') return item.unread;
        if (typeof item.read === 'boolean') return !item.read;
        if (typeof item.isRead === 'boolean') return !item.isRead;
        if (typeof item.seen === 'boolean') return !item.seen;
        if (typeof item.viewed === 'boolean') return !item.viewed;
        if (typeof item.status === 'string') return item.status.toUpperCase() === 'UNREAD';
        return false;
      }).length;
    };

    const loadNotifications = async () => {
      if (!token) {
        if (mounted) setUnreadCount(0);
        return;
      }
      try {
        const notifications = await api.notifications(token);
        if (mounted) {
          setUnreadCount(resolveUnreadCount(notifications));
        }
      } catch (_err) {
        // Keep last unread count when notification fetch fails.
      }
    };

    loadNotifications();
    intervalId = setInterval(loadNotifications, 25000);
    const unsubscribe = subscribeNotificationBadgeRefresh(() => {
      loadNotifications();
    });

    return () => {
      mounted = false;
      unsubscribe();
      if (intervalId) clearInterval(intervalId);
    };
  }, [token, pathname]);

  useEffect(() => {
    if (unreadCount <= 0) {
      bellScale.stopAnimation();
      bellScale.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bellScale, {
          toValue: 1.12,
          duration: 380,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bellScale, {
          toValue: 1,
          duration: 380,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => {
      loop.stop();
    };
  }, [bellScale, unreadCount]);

  const badgeLabel = unreadCount > 0 ? String(Math.min(unreadCount, 3)) : null;

  const handleNotificationPress = async () => {
    if (isProfileTab) return;
    if (token) {
      try {
        await api.markAllNotificationsRead(token);
        setUnreadCount(0);
        emitNotificationBadgeRefresh();
      } catch (_err) {
        // Ignore read-all failures; navigation should still work.
      }
    }
    router.push('/my-bookings');
  };

  return (
    <LinearGradient colors={[COLORS.accent, COLORS.background]} style={styles.container}>
      <TouchableOpacity
        onPress={() => {
          if (isRootTab) {
            onMenuPress?.();
          } else if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/');
          }
        }}
        style={styles.iconButton}
      >
        <Ionicons name={isRootTab ? 'menu' : 'arrow-back'} size={22} color={COLORS.primary} />
      </TouchableOpacity>
      <View style={styles.titleWrap}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>Trusted mechanic network</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={handleNotificationPress}
          style={styles.iconButton}
          disabled={isProfileTab}
        >
          <Animated.View style={{ transform: [{ scale: bellScale }] }}>
            <Ionicons name="notifications-outline" size={22} color={COLORS.primary} />
          </Animated.View>
          {badgeLabel ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badgeLabel}</Text>
            </View>
          ) : null}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            if (isProfileTab) return;
            router.push('/profile');
          }}
          style={styles.iconButton}
          disabled={isProfileTab}
        >
          {isAdmin ? (
            <Image source={require('../../assets/images/MyGarage.png')} style={styles.profileImage} />
          ) : profileImageUri ? (
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
    paddingTop: 10,
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
    position: 'relative',
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
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E53935',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
  },
  profileImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
});

export default HeaderBar;

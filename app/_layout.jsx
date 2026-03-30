import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { AppState, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import COLORS from '../theme/colors';
import { BASE_URL } from '../api';

const AuthGate = ({ children }) => {
  const { token, ready, signout, sessionExpiredVisible, setSessionExpiredVisible } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    const isAuthGroup = segments[0] === 'auth';
    const isWelcome = segments[0] === 'welcome';
    const isGetStarted = segments[0] === 'get-started';

    if (token && (isAuthGroup || isWelcome || isGetStarted)) {
      router.replace('/');
    }
  }, [ready, token, segments, router]);

  const handleLoginPress = () => {
    signout();
    setSessionExpiredVisible(false);
    router.replace('/auth/signin');
  };

  const handleCancelPress = () => {
    signout();
    setSessionExpiredVisible(false);
  };

  return (
    <>
      {children}
      <Modal transparent visible={sessionExpiredVisible} animationType="fade" onRequestClose={handleCancelPress}>
        <View style={styles.updateBackdrop}>
          <View style={styles.updateCard}>
            <Text style={styles.updateTitle}>Session expired</Text>
            <Text style={styles.updateSubtitle}>
              Your login session has expired. Please login again to continue.
            </Text>
            <View style={styles.updateActions}>
              <Pressable onPress={handleCancelPress} style={[styles.updateButton, styles.cancelButton]}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleLoginPress} style={[styles.updateButton, styles.downloadButton]}>
                <Text style={styles.downloadText}>Login</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const KeepAlive = () => {
  useEffect(() => {
    let pingInterval = null;

    const pingServer = async () => {
      try {
        await fetch(BASE_URL);
      } catch (error) {
        console.error('Keep-alive ping failed:', error);
      }
    };

    const startPinging = () => {
      if (pingInterval) clearInterval(pingInterval);
      pingServer();
      pingInterval = setInterval(pingServer, 60000);
    };

    const stopPinging = () => {
      if (pingInterval) {
        clearInterval(pingInterval);
        pingInterval = null;
      }
    };

    startPinging();

    const appStateListener = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        startPinging();
      } else {
        stopPinging();
      }
    });

    return () => {
      stopPinging();
      appStateListener.remove();
    };
  }, []);

  return null;
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGate>
        <KeepAlive />
        <Stack screenOptions={{ headerShown: false }} initialRouteName="welcome">
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="welcome" />
          <Stack.Screen name="get-started" />
          <Stack.Screen name="auth/signin" />
          <Stack.Screen name="auth/forgot-password" />
          <Stack.Screen name="auth/signup" />
          <Stack.Screen name="garage-owner/register" />
          <Stack.Screen name="vehicle-form" />
          <Stack.Screen name="booking" />
          <Stack.Screen name="search" />
          <Stack.Screen name="book-now" />
          <Stack.Screen name="my-bookings" />
          <Stack.Screen name="terms" />
          <Stack.Screen name="policy" />
          <Stack.Screen name="feedback" />
          <Stack.Screen name="rating" />
          <Stack.Screen name="support/chat" />
        </Stack>
      </AuthGate>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  updateBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  updateCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 20,
  },
  updateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  updateSubtitle: {
    fontSize: 14,
    color: COLORS.muted,
    marginBottom: 18,
  },
  updateActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  updateButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.background,
  },
  downloadButton: {
    backgroundColor: COLORS.primary,
  },
  cancelText: {
    color: COLORS.text,
    fontWeight: '600',
  },
  downloadText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});

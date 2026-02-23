import { Stack, useRouter, useSegments } from 'expo-router';
import Constants from 'expo-constants';
import { useEffect, useMemo, useState } from 'react';
import { Linking, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import COLORS from '../theme/colors';

const RELEASES_LATEST_URL = 'https://github.com/Umesh-gbmsofttech/MyGarage/releases/latest';
const RELEASES_API_URL = 'https://api.github.com/repos/Umesh-gbmsofttech/MyGarage/releases/latest';

const extractRunNumber = (value) => {
  if (!value) return null;
  const match = String(value).trim().replace(/^v/i, '').match(/(\d+)/);
  if (!match) return null;
  const parsed = parseInt(match[1], 10);
  return Number.isNaN(parsed) ? null : parsed;
};

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

const UpdatePrompt = () => {
  const [visible, setVisible] = useState(false);
  const [latestTag, setLatestTag] = useState('');
  const currentRunNumber = useMemo(() => {
    const value =
      Constants.expoConfig?.extra?.buildNumber ||
      Constants.manifest?.extra?.buildNumber ||
      Constants.manifest2?.extra?.expoClient?.buildNumber;
    return extractRunNumber(value);
  }, []);

  useEffect(() => {
    let mounted = true;
    const checkLatest = async () => {
      try {
        const response = await fetch(RELEASES_API_URL, {
          headers: { Accept: 'application/vnd.github+json' },
        });
        if (!response.ok) return;
        const data = await response.json();
        const latest = extractRunNumber(data?.tag_name);
        if (!latest || !mounted || !currentRunNumber) return;
        if (latest === currentRunNumber) return;
        if (latest > currentRunNumber) {
          setLatestTag(`v${latest}`);
          setVisible(true);
        }
      } catch (error) {
        // fail silently
      }
    };
    checkLatest();
    return () => {
      mounted = false;
    };
  }, [currentRunNumber]);

  const handleDownload = () => {
    setVisible(false);
    Linking.openURL(RELEASES_LATEST_URL);
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={() => setVisible(false)}>
      <View style={styles.updateBackdrop}>
        <View style={styles.updateCard}>
          <Text style={styles.updateTitle}>New version available</Text>
          <Text style={styles.updateSubtitle}>
            A new version ({latestTag}) is available. Download the latest release.
          </Text>
          <View style={styles.updateActions}>
            <Pressable onPress={() => setVisible(false)} style={[styles.updateButton, styles.cancelButton]}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable onPress={handleDownload} style={[styles.updateButton, styles.downloadButton]}>
              <Text style={styles.downloadText}>Download</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGate>
        <UpdatePrompt />
        <Stack screenOptions={{ headerShown: false }} initialRouteName="welcome">
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="welcome" />
          <Stack.Screen name="get-started" />
          <Stack.Screen name="auth/signin" />
          <Stack.Screen name="auth/signup" />
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

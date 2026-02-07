import { Stack, useRouter, useSegments } from 'expo-router';
import Constants from 'expo-constants';
import { useEffect, useMemo, useState } from 'react';
import { Linking, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { AuthProvider, useAuth } from '../src/context/AuthContext';

const RELEASES_LATEST_URL = 'https://github.com/Umesh-gbmsofttech/MyGarage/releases/latest';
const RELEASES_API_URL = 'https://api.github.com/repos/Umesh-gbmsofttech/MyGarage/releases/latest';

const normalizeVersion = (value) => {
  if (!value) return '';
  return String(value).trim().replace(/^v/i, '');
};

const compareSemver = (a, b) => {
  const pa = normalizeVersion(a).split('.').map((n) => parseInt(n, 10) || 0);
  const pb = normalizeVersion(b).split('.').map((n) => parseInt(n, 10) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i += 1) {
    const na = pa[i] ?? 0;
    const nb = pb[i] ?? 0;
    if (na > nb) return 1;
    if (na < nb) return -1;
  }
  return 0;
};

const AuthGate = ({ children }) => {
  const { user, token, ready } = useAuth();
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

  return children;
};

const UpdatePrompt = () => {
  const [visible, setVisible] = useState(false);
  const [latestTag, setLatestTag] = useState('');
  const currentVersion = useMemo(() => normalizeVersion(Constants.expoConfig?.version), []);

  useEffect(() => {
    let mounted = true;
    const checkLatest = async () => {
      try {
        const response = await fetch(RELEASES_API_URL, {
          headers: { Accept: 'application/vnd.github+json' },
        });
        if (!response.ok) return;
        const data = await response.json();
        const tag = normalizeVersion(data?.tag_name);
        if (!tag || !mounted || !currentVersion) return;
        if (compareSemver(tag, currentVersion) > 0) {
          setLatestTag(tag);
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
  }, [currentVersion]);

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
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 20,
  },
  updateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#121212',
    marginBottom: 6,
  },
  updateSubtitle: {
    fontSize: 14,
    color: '#4a4a4a',
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
    backgroundColor: '#f2f2f2',
  },
  downloadButton: {
    backgroundColor: '#111111',
  },
  cancelText: {
    color: '#333333',
    fontWeight: '600',
  },
  downloadText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});

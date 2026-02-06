import { Stack } from 'expo-router';
import { AuthProvider } from '../src/context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
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
    </AuthProvider>
  );
}

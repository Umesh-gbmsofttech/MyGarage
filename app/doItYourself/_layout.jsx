import { Stack } from 'expo-router';

export default function DoItYourselfLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}

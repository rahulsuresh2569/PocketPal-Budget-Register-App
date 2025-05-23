import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      {/* You can add other stack screens here if needed, e.g., for modals not part of tabs */}
    </Stack>
  );
} 
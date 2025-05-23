import { Stack } from 'expo-router';
import { BudgetProvider } from '../store/BudgetContext'; // Adjusted path

export default function RootLayout() {
  return (
    <BudgetProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        {/* You can add other stack screens here if needed, e.g., for modals not part of tabs */}
      </Stack>
    </BudgetProvider>
  );
} 
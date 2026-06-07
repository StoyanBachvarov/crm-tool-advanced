import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { SessionProvider } from '@/lib/session';

export default function RootLayout() {
  return (
    <SessionProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: '#F6F7F9' },
          headerStyle: { backgroundColor: '#ffffff' },
          headerShadowVisible: false,
          headerTitleStyle: { color: '#172026', fontWeight: '700' },
        }}>
        <Stack.Screen name="index" options={{ title: 'CRM Mobile' }} />
        <Stack.Screen name="login" options={{ title: 'Login' }} />
        <Stack.Screen name="customers/index" options={{ title: 'Customers' }} />
        <Stack.Screen name="customers/[id]" options={{ title: 'Customer Details' }} />
        <Stack.Screen name="activities/index" options={{ title: 'Activities' }} />
        <Stack.Screen name="activities/[id]" options={{ title: 'Activity Details' }} />
      </Stack>
    </SessionProvider>
  );
}

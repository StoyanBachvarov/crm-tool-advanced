import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { apiBaseUrl } from '@/lib/api';
import { useResponsiveLayout } from '@/lib/responsive';
import { useSession } from '@/lib/session';

export default function LoginScreen() {
  const router = useRouter();
  const { isAuthenticated, login } = useSession();
  const [email, setEmail] = useState('peter.rep@example.com');
  const [password, setPassword] = useState('pass123');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { containerStyle, isWide } = useResponsiveLayout(520);

  if (isAuthenticated) {
    return <Redirect href="/" />;
  }

  async function handleLogin() {
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      router.replace('/');
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Unable to login');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={[styles.content, containerStyle, isWide && styles.wideContent]}>
        <View style={styles.header}>
          <Text style={styles.title}>Login</Text>
          <Text style={styles.subtitle}>Use your CRM account to access protected mobile screens.</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="Email"
            style={styles.input}
            value={email}
          />
          <TextInput
            autoCapitalize="none"
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry
            style={styles.input}
            value={password}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            disabled={isSubmitting}
            onPress={handleLogin}
            style={({ pressed }) => [
              styles.primaryButton,
              (pressed || isSubmitting) && styles.buttonPressed,
            ]}>
            {isSubmitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.primaryButtonText}>Login</Text>
            )}
          </Pressable>
        </View>

        <Text style={styles.apiText}>API: {apiBaseUrl}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F6F7F9',
  },
  content: {
    flex: 1,
    gap: 22,
  },
  wideContent: {
    justifyContent: 'center',
  },
  header: {
    gap: 8,
    paddingTop: 28,
  },
  title: {
    color: '#172026',
    fontSize: 32,
    fontWeight: '800',
  },
  subtitle: {
    color: '#586370',
    fontSize: 16,
    lineHeight: 23,
  },
  form: {
    gap: 12,
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: '#D6DAE1',
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#176B87',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  buttonPressed: {
    opacity: 0.72,
  },
  error: {
    color: '#B42318',
    fontSize: 15,
    fontWeight: '700',
  },
  apiText: {
    color: '#586370',
    fontSize: 13,
  },
});

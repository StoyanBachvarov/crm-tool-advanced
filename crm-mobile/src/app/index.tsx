import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useResponsiveLayout } from '@/lib/responsive';
import { useSession } from '@/lib/session';

export default function HomeScreen() {
  const { isAuthenticated, isLoading, user, logout } = useSession();
  const { containerStyle, isWide } = useResponsiveLayout(960);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={[styles.content, containerStyle, isWide && styles.wideContent]}>
        <View style={[styles.header, isWide && styles.wideHeader]}>
          <Text style={styles.eyebrow}>Field sales workspace</Text>
          <Text style={[styles.title, isWide && styles.wideTitle]}>Welcome to CRM Mobile</Text>
          <Text style={styles.subtitle}>
            Manage assigned customers, active activities, outcomes, and follow-up work from the road.
          </Text>
        </View>

        {isLoading ? (
          <Text style={styles.muted}>Loading session...</Text>
        ) : isAuthenticated ? (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Signed in as {user?.name}</Text>
            <Text style={styles.muted}>{user?.email}</Text>
            <Link href="/customers" asChild>
              <Pressable style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Open Customers</Text>
              </Pressable>
            </Link>
            <Link href="/activities" asChild>
              <Pressable style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Open Activities</Text>
              </Pressable>
            </Link>
            <Pressable onPress={logout} style={styles.logoutButton}>
              <Text style={styles.logoutText}>Logout</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Start your sales day</Text>
            <Text style={styles.muted}>Login to access protected CRM screens.</Text>
            <Link href="/login" asChild>
              <Pressable style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Login</Text>
              </Pressable>
            </Link>
          </View>
        )}
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
    gap: 24,
  },
  wideContent: {
    justifyContent: 'center',
  },
  header: {
    gap: 10,
    paddingTop: 28,
  },
  wideHeader: {
    paddingTop: 0,
  },
  eyebrow: {
    color: '#176B87',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  title: {
    color: '#172026',
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
  },
  wideTitle: {
    fontSize: 42,
    lineHeight: 48,
  },
  subtitle: {
    color: '#586370',
    fontSize: 16,
    lineHeight: 24,
  },
  panel: {
    gap: 12,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E4EA',
    backgroundColor: '#ffffff',
  },
  panelTitle: {
    color: '#172026',
    fontSize: 18,
    fontWeight: '800',
  },
  muted: {
    color: '#586370',
    fontSize: 15,
    lineHeight: 22,
  },
  primaryButton: {
    minHeight: 50,
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
  secondaryButton: {
    minHeight: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#176B87',
  },
  secondaryButtonText: {
    color: '#176B87',
    fontSize: 16,
    fontWeight: '800',
  },
  logoutButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    color: '#B42318',
    fontSize: 15,
    fontWeight: '800',
  },
});

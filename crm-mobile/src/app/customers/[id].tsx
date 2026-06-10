import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Customer, getCustomer } from '@/lib/api';
import { formatDate, titleCase } from '@/lib/format';
import { useResponsiveLayout } from '@/lib/responsive';
import { ProtectedRoute, useSession } from '@/lib/session';

export default function CustomerDetailsScreen() {
  return (
    <ProtectedRoute>
      <CustomerDetailsContent />
    </ProtectedRoute>
  );
}

function CustomerDetailsContent() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useSession();
  const { containerStyle, isWide } = useResponsiveLayout(1120);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCustomer = useCallback(async () => {
    if (!token || !id) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      setCustomer(await getCustomer(token, Number(id)));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load customer');
    } finally {
      setIsLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    loadCustomer();
  }, [loadCustomer]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  if (error || !customer) {
    return (
      <SafeAreaView style={styles.screen}>
        <Text style={styles.error}>{error || 'Customer not found'}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.content, containerStyle]}>
        <View style={styles.header}>
          <Text style={styles.title}>{customer.companyName}</Text>
          <Text style={styles.status}>{titleCase(customer.status)}</Text>
        </View>

        <View style={[styles.infoGrid, isWide && styles.infoGridWide]}>
          <Info label="Main contact" value={customer.mainContactName} wide={isWide} />
          <Info label="Position" value={customer.contactPosition} wide={isWide} />
          <Info label="Phone" value={customer.phone} wide={isWide} />
          <Info label="Email" value={customer.email} wide={isWide} />
          <Info label="Industry" value={customer.industrySector} wide={isWide} />
          <Info label="Sales rep" value={customer.salesRepName} wide={isWide} />
          <Info label="Last activity" value={formatDate(customer.lastActivityDate)} wide={isWide} />
          <Info label="Delivery address" value={customer.deliveryAddress} wide={isWide} />
          <Info
            label="Administrative address"
            value={customer.administrativeAddress}
            wide={isWide}
          />
          <Info label="Communication address" value={customer.communicationAddress} wide={isWide} />
          <Info label="Notes" value={customer.notes} wide={isWide} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Info({ label, value, wide = false }: { label: string; value?: string | null; wide?: boolean }) {
  return (
    <View style={[styles.infoCard, wide && styles.infoCardWide]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || 'Not set'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F6F7F9',
  },
  content: {
    gap: 10,
    padding: 16,
    paddingBottom: 32,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F6F7F9',
  },
  header: {
    gap: 8,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E0E4EA',
  },
  title: {
    color: '#172026',
    fontSize: 26,
    fontWeight: '800',
  },
  status: {
    alignSelf: 'flex-start',
    color: '#176B87',
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#E8F3F1',
  },
  infoCard: {
    gap: 4,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E0E4EA',
  },
  infoGrid: {
    gap: 10,
  },
  infoGridWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  infoCardWide: {
    flexBasis: '32%',
    flexGrow: 1,
  },
  label: {
    color: '#586370',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  value: {
    color: '#172026',
    fontSize: 16,
    lineHeight: 23,
  },
  error: {
    color: '#B42318',
    margin: 16,
    fontWeight: '700',
  },
});

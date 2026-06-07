import { Link } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Customer, listCustomers } from '@/lib/api';
import { formatDate, titleCase } from '@/lib/format';
import { ProtectedRoute, useSession } from '@/lib/session';

const pageSize = 10;

export default function CustomersScreen() {
  return (
    <ProtectedRoute>
      <CustomersContent />
    </ProtectedRoute>
  );
}

function CustomersContent() {
  const { token } = useSession();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCustomers = useCallback(
    async (nextPage = 1, refresh = false) => {
      if (!token) {
        return;
      }

      if (refresh) {
        setIsRefreshing(true);
      } else if (nextPage > 1) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      setError(null);

      try {
        const response = await listCustomers(token, nextPage, pageSize);
        setPage(response.paging.page);
        setTotal(response.paging.total);
        setCustomers((current) =>
          nextPage === 1 ? response.data : mergeById(current, response.data)
        );
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load customers');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
        setIsLoadingMore(false);
      }
    },
    [token]
  );

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const hasMore = customers.length < total;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Customers</Text>
        <Text style={styles.subtitle}>Assigned customer portfolio</Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={customers}
          keyExtractor={(item) => String(item.id)}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={() => loadCustomers(1, true)} />
          }
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Link href={`/customers/${item.id}`} asChild>
              <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{item.companyName}</Text>
                  <Text style={styles.status}>{titleCase(item.status)}</Text>
                </View>
                <Text style={styles.line}>Contact: {item.mainContactName || 'Not set'}</Text>
                <Text style={styles.line}>Phone: {item.phone || 'Not set'}</Text>
                <Text style={styles.line}>Last activity: {formatDate(item.lastActivityDate)}</Text>
              </Pressable>
            </Link>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No customers found.</Text>}
          ListFooterComponent={
            hasMore ? (
              <Pressable
                disabled={isLoadingMore}
                onPress={() => loadCustomers(page + 1)}
                style={styles.loadMoreButton}>
                <Text style={styles.loadMoreText}>
                  {isLoadingMore ? 'Loading...' : 'Load more customers'}
                </Text>
              </Pressable>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

function mergeById<T extends { id: number }>(current: T[], incoming: T[]) {
  const map = new Map(current.map((item) => [item.id, item]));
  incoming.forEach((item) => map.set(item.id, item));
  return Array.from(map.values());
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: '#F6F7F9',
  },
  header: {
    paddingVertical: 14,
  },
  title: {
    color: '#172026',
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: '#586370',
    fontSize: 15,
  },
  listContent: {
    gap: 10,
    paddingBottom: 28,
  },
  card: {
    gap: 8,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E4EA',
    backgroundColor: '#ffffff',
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  cardTitle: {
    flex: 1,
    color: '#172026',
    fontSize: 17,
    fontWeight: '800',
  },
  status: {
    color: '#176B87',
    fontSize: 12,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#E8F3F1',
  },
  line: {
    color: '#586370',
    fontSize: 14,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    color: '#B42318',
    marginBottom: 10,
    fontWeight: '700',
  },
  empty: {
    color: '#586370',
    textAlign: 'center',
    marginTop: 40,
  },
  loadMoreButton: {
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#176B87',
  },
  loadMoreText: {
    color: '#176B87',
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.72,
  },
});

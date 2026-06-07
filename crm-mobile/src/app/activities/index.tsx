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

import { Activity, listActivities } from '@/lib/api';
import { formatDate, formatTime, titleCase } from '@/lib/format';
import { ProtectedRoute, useSession } from '@/lib/session';

const pageSize = 10;

export default function ActivitiesScreen() {
  return (
    <ProtectedRoute>
      <ActivitiesContent />
    </ProtectedRoute>
  );
}

function ActivitiesContent() {
  const { token } = useSession();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadActivities = useCallback(
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
        const response = await listActivities(token, nextPage, pageSize);
        setPage(response.paging.page);
        setTotal(response.paging.total);
        setActivities((current) =>
          nextPage === 1 ? response.data : mergeById(current, response.data)
        );
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load activities');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
        setIsLoadingMore(false);
      }
    },
    [token]
  );

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const hasMore = activities.length < total;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Activities</Text>
        <Text style={styles.subtitle}>Active customer activities</Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={activities}
          keyExtractor={(item) => String(item.id)}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={() => loadActivities(1, true)} />
          }
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Link href={`/activities/${item.id}`} asChild>
              <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
                <View style={styles.cardHeader}>
                  <View style={styles.dateBox}>
                    <Text style={styles.dateText}>{formatDate(item.startDate)}</Text>
                    <Text style={styles.timeText}>{formatTime(item.startDate)}</Text>
                  </View>
                  <View style={styles.cardBody}>
                    <Text style={styles.cardTitle}>{item.customerName}</Text>
                    <Text style={styles.line}>{titleCase(item.type)}</Text>
                  </View>
                  <Text style={styles.status}>{titleCase(item.state || item.status)}</Text>
                </View>
              </Pressable>
            </Link>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No active activities found.</Text>}
          ListFooterComponent={
            hasMore ? (
              <Pressable
                disabled={isLoadingMore}
                onPress={() => loadActivities(page + 1)}
                style={styles.loadMoreButton}>
                <Text style={styles.loadMoreText}>
                  {isLoadingMore ? 'Loading...' : 'Load more activities'}
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
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E4EA',
    backgroundColor: '#ffffff',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateBox: {
    width: 90,
    gap: 4,
  },
  dateText: {
    color: '#172026',
    fontSize: 13,
    fontWeight: '800',
  },
  timeText: {
    color: '#586370',
    fontSize: 13,
  },
  cardBody: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    color: '#172026',
    fontSize: 16,
    fontWeight: '800',
  },
  line: {
    color: '#586370',
    fontSize: 14,
  },
  status: {
    color: '#925400',
    fontSize: 12,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#FFF2D6',
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

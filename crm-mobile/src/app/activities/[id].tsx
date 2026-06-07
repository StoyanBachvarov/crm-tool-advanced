import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Activity,
  cancelActivity,
  completeActivity,
  createFollowUp,
  getActivity,
} from '@/lib/api';
import { formatDateTime, titleCase } from '@/lib/format';
import { ProtectedRoute, useSession } from '@/lib/session';

const activityTypes = ['follow-up task', 'phone call', 'visit', 'meeting', 'email', 'demo', 'other'];

export default function ActivityDetailsScreen() {
  return (
    <ProtectedRoute>
      <ActivityDetailsContent />
    </ProtectedRoute>
  );
}

function ActivityDetailsContent() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useSession();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [outcome, setOutcome] = useState('');
  const [nextAction, setNextAction] = useState('');
  const [followUpTitle, setFollowUpTitle] = useState('');
  const [followUpType, setFollowUpType] = useState(activityTypes[0]);
  const [followUpDate, setFollowUpDate] = useState(defaultFollowUpDate());
  const [followUpNote, setFollowUpNote] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadActivity = useCallback(async () => {
    if (!token || !id) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const nextActivity = await getActivity(token, Number(id));
      setActivity(nextActivity);
      setOutcome(nextActivity.outcome ?? '');
      setNextAction(nextActivity.nextAction ?? '');
      setFollowUpTitle(`Follow up: ${nextActivity.customerName}`);
      setFollowUpNote(nextActivity.nextAction ?? '');
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load activity');
    } finally {
      setIsLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    loadActivity();
  }, [loadActivity]);

  async function handleComplete() {
    if (!token || !activity) {
      return;
    }

    if (!outcome.trim()) {
      setError('Outcome notes are required.');
      return;
    }

    setIsSaving(true);
    setError(null);
    setNotice(null);

    try {
      const updatedActivity = await completeActivity(token, activity.id, {
        outcome: outcome.trim(),
        nextAction: nextAction.trim() || undefined,
      });
      setActivity(updatedActivity);
      setNotice('Activity completed.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to complete activity');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCancel() {
    if (!token || !activity) {
      return;
    }

    setIsSaving(true);
    setError(null);
    setNotice(null);

    try {
      const updatedActivity = await cancelActivity(token, activity.id);
      setActivity(updatedActivity);
      setNotice('Activity cancelled.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to cancel activity');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCreateFollowUp() {
    if (!token || !activity) {
      return;
    }

    if (!followUpTitle.trim() || !followUpDate.trim()) {
      setError('Follow-up title and date are required.');
      return;
    }

    const startDate = new Date(followUpDate);

    if (Number.isNaN(startDate.getTime())) {
      setError('Use a valid follow-up date and time.');
      return;
    }

    setIsSaving(true);
    setError(null);
    setNotice(null);

    try {
      await createFollowUp(token, activity.id, {
        title: followUpTitle.trim(),
        type: followUpType,
        description: followUpNote.trim() || undefined,
        startDate: startDate.toISOString(),
        nextAction: followUpNote.trim() || undefined,
      });
      setNotice('Follow-up activity created.');
      setFollowUpTitle(`Follow up: ${activity.customerName}`);
      setFollowUpDate(defaultFollowUpDate());
      setFollowUpNote('');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to create follow-up');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  if (error && !activity) {
    return (
      <SafeAreaView style={styles.screen}>
        <Text style={styles.error}>{error}</Text>
      </SafeAreaView>
    );
  }

  if (!activity) {
    return (
      <SafeAreaView style={styles.screen}>
        <Text style={styles.error}>Activity not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{activity.title}</Text>
          <Text style={styles.status}>{titleCase(activity.status)}</Text>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {notice ? <Text style={styles.notice}>{notice}</Text> : null}

        <Info label="Customer" value={activity.customerName} />
        <Info label="Contact person" value={activity.customerContactName} />
        <Info label="Phone" value={activity.customerPhone} />
        <Info label="Email" value={activity.customerEmail} />
        <Info label="Activity type" value={titleCase(activity.type)} />
        <Info label="Date and time" value={formatDateTime(activity.startDate)} />
        <Info label="Notes" value={activity.description} />
        <Info label="Status" value={titleCase(activity.state || activity.status)} />
        <Info label="Outcome" value={activity.outcome} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Complete activity</Text>
          <TextInput
            multiline
            onChangeText={setOutcome}
            placeholder="Outcome notes"
            style={[styles.input, styles.textArea]}
            value={outcome}
          />
          <TextInput
            multiline
            onChangeText={setNextAction}
            placeholder="Next action"
            style={[styles.input, styles.textAreaSmall]}
            value={nextAction}
          />
          <View style={styles.actionRow}>
            <Pressable
              disabled={isSaving}
              onPress={handleComplete}
              style={({ pressed }) => [
                styles.primaryButton,
                (pressed || isSaving) && styles.buttonPressed,
              ]}>
              <Text style={styles.primaryButtonText}>Complete</Text>
            </Pressable>
            <Pressable
              disabled={isSaving}
              onPress={handleCancel}
              style={({ pressed }) => [
                styles.dangerButton,
                (pressed || isSaving) && styles.buttonPressed,
              ]}>
              <Text style={styles.dangerButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Create follow-up</Text>
          <TextInput
            onChangeText={setFollowUpTitle}
            placeholder="Follow-up title"
            style={styles.input}
            value={followUpTitle}
          />
          <View style={styles.typeRow}>
            {activityTypes.map((type) => (
              <Pressable
                key={type}
                onPress={() => setFollowUpType(type)}
                style={[styles.typeChip, followUpType === type && styles.typeChipActive]}>
                <Text
                  style={[styles.typeChipText, followUpType === type && styles.typeChipTextActive]}>
                  {titleCase(type)}
                </Text>
              </Pressable>
            ))}
          </View>
          <TextInput
            onChangeText={setFollowUpDate}
            placeholder="Date and time, e.g. 2026-06-09 09:00"
            style={styles.input}
            value={followUpDate}
          />
          <TextInput
            multiline
            onChangeText={setFollowUpNote}
            placeholder="Follow-up notes"
            style={[styles.input, styles.textAreaSmall]}
            value={followUpNote}
          />
          <Pressable
            disabled={isSaving}
            onPress={handleCreateFollowUp}
            style={({ pressed }) => [
              styles.secondaryButton,
              (pressed || isSaving) && styles.buttonPressed,
            ]}>
            <Text style={styles.secondaryButtonText}>Create follow-up</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <View style={styles.infoCard}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || 'Not set'}</Text>
    </View>
  );
}

function defaultFollowUpDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(9, 0, 0, 0);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')} 09:00`;
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
    fontSize: 25,
    fontWeight: '800',
  },
  status: {
    alignSelf: 'flex-start',
    color: '#925400',
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#FFF2D6',
  },
  infoCard: {
    gap: 4,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E0E4EA',
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
  section: {
    gap: 10,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E0E4EA',
  },
  sectionTitle: {
    color: '#172026',
    fontSize: 18,
    fontWeight: '800',
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#D6DAE1',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    fontSize: 15,
  },
  textArea: {
    minHeight: 92,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  textAreaSmall: {
    minHeight: 68,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#176B87',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '800',
  },
  dangerButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#B42318',
  },
  dangerButtonText: {
    color: '#B42318',
    fontWeight: '800',
  },
  secondaryButton: {
    minHeight: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#176B87',
  },
  secondaryButtonText: {
    color: '#176B87',
    fontWeight: '800',
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    borderWidth: 1,
    borderColor: '#D6DAE1',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: '#ffffff',
  },
  typeChipActive: {
    borderColor: '#176B87',
    backgroundColor: '#E8F3F1',
  },
  typeChipText: {
    color: '#586370',
    fontSize: 12,
    fontWeight: '800',
  },
  typeChipTextActive: {
    color: '#176B87',
  },
  error: {
    color: '#B42318',
    fontWeight: '700',
  },
  notice: {
    color: '#067647',
    fontWeight: '700',
  },
  buttonPressed: {
    opacity: 0.72,
  },
});

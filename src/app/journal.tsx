import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import ActionButton from '../components/ActionButton';
import { addJournalEntry } from '../logic/journal';
import { readStore } from '../storage';
import { journalStore, profileStore } from '../storage/stores';
import type { CaregiverMode, JournalEntry } from '../storage/types';
import { colors } from '../theme/colors';
import { getCaregiverLabel, getCaregiverPossessive } from '../utils/caregiverPhrasing';

const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const JournalScreen = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [text, setText] = useState('');
  const [modeLabel, setModeLabel] = useState<CaregiverMode>('patient');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const patientEntries = entries.filter((entry) => entry.author === 'patient');
  const caregiverEntries = entries.filter((entry) => entry.author === 'caregiver');

  const loadEntries = useCallback(async () => {
    const [{ data: journal }, { data: profile }] = await Promise.all([
      readStore(journalStore),
      readStore(profileStore),
    ]);
    setEntries(journal);
    setModeLabel(profile.caregiverMode);
  }, []);

  useEffect(() => {
    loadEntries().catch((error) => {
      console.warn('Unable to load journal entries.', error);
      setErrorMessage('Unable to load journal entries.');
    });
  }, [loadEntries]);

  const handleSave = async () => {
    setErrorMessage(null);
    setAlertMessage(null);
    if (!text.trim()) {
      setErrorMessage('Please add a note before saving.');
      return;
    }

    setLoading(true);
    try {
      const saved = await addJournalEntry({
        id: createId(),
        createdAt: new Date().toISOString(),
        author: modeLabel === 'caregiver' ? 'caregiver' : 'patient',
        text: text.trim(),
      });
      if (saved.redFlags?.length) {
        setAlertMessage(
          'Red flag keywords detected. Seek emergency care immediately or call local emergency services.',
        );
      }
      setText('');
      await loadEntries();
    } catch (error) {
      console.warn('Unable to save journal entry.', error);
      setErrorMessage('Unable to save journal entry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Journal</Text>
      <Text style={styles.subtitle}>
        Capture notes, symptoms, and daily reflections about {getCaregiverPossessive(modeLabel)} day.
      </Text>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>
          {modeLabel === 'caregiver' ? 'New caregiver note' : 'New entry'}
        </Text>
        <Text style={styles.sectionSubtitle}>
          Logging as {getCaregiverLabel(modeLabel)}.
        </Text>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={`Share updates, concerns, or questions about ${getCaregiverPossessive(modeLabel)} health`}
          placeholderTextColor={colors.textSecondary}
          style={styles.input}
          multiline
        />
        <ActionButton
          label={loading ? 'Saving...' : 'Save entry'}
          onPress={handleSave}
          variant="primary"
        />
        {alertMessage ? <Text style={styles.alertText}>{alertMessage}</Text> : null}
        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      </View>

      {modeLabel === 'caregiver' ? (
        <>
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Patient history</Text>
            {patientEntries.length === 0 ? (
              <Text style={styles.emptyText}>No patient entries yet.</Text>
            ) : (
              patientEntries.map((entry) => (
                <View key={entry.id} style={styles.entryRow}>
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryMeta}>
                      Patient · {new Date(entry.createdAt).toLocaleDateString()}
                    </Text>
                    {entry.redFlags?.length ? (
                      <Text style={styles.flagTag}>Red flag</Text>
                    ) : null}
                  </View>
                  <Text style={styles.entryText}>{entry.text}</Text>
                  {entry.redFlags?.length ? (
                    <View style={styles.flagList}>
                      {entry.redFlags.map((flag) => (
                        <Text key={flag} style={styles.flagItem}>
                          • {flag}
                        </Text>
                      ))}
                    </View>
                  ) : null}
                </View>
              ))
            )}
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Caregiver notes</Text>
            {caregiverEntries.length === 0 ? (
              <Text style={styles.emptyText}>No caregiver notes yet.</Text>
            ) : (
              caregiverEntries.map((entry) => (
                <View key={entry.id} style={styles.entryRow}>
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryMeta}>
                      Caregiver · {new Date(entry.createdAt).toLocaleDateString()}
                    </Text>
                    {entry.redFlags?.length ? (
                      <Text style={styles.flagTag}>Red flag</Text>
                    ) : null}
                  </View>
                  <Text style={styles.entryText}>{entry.text}</Text>
                  {entry.redFlags?.length ? (
                    <View style={styles.flagList}>
                      {entry.redFlags.map((flag) => (
                        <Text key={flag} style={styles.flagItem}>
                          • {flag}
                        </Text>
                      ))}
                    </View>
                  ) : null}
                </View>
              ))
            )}
          </View>
        </>
      ) : (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Recent entries</Text>
          {entries.length === 0 ? (
            <Text style={styles.emptyText}>No journal entries yet.</Text>
          ) : (
            entries.map((entry) => (
              <View key={entry.id} style={styles.entryRow}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryMeta}>
                    {entry.author === 'caregiver' ? 'Caregiver' : 'Patient'} ·{' '}
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </Text>
                  {entry.redFlags?.length ? (
                    <Text style={styles.flagTag}>Red flag</Text>
                  ) : null}
                </View>
                <Text style={styles.entryText}>{entry.text}</Text>
                {entry.redFlags?.length ? (
                  <View style={styles.flagList}>
                    {entry.redFlags.map((flag) => (
                      <Text key={flag} style={styles.flagItem}>
                        • {flag}
                      </Text>
                    ))}
                  </View>
                ) : null}
              </View>
            ))
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  input: {
    minHeight: 110,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 13,
    color: '#B91C1C',
  },
  alertText: {
    fontSize: 13,
    color: '#991B1B',
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  entryRow: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 12,
    gap: 6,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entryMeta: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  entryText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  flagTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
    fontSize: 11,
    fontWeight: '700',
  },
  flagList: {
    paddingLeft: 6,
  },
  flagItem: {
    fontSize: 12,
    color: '#991B1B',
  },
});

export default JournalScreen;

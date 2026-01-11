import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import ActionButton from '../components/ActionButton';
import { addJournalEntry, getJournalEntriesForRange, saveJournalSummary } from '../logic/journal';
import { triggerEmergencyAlert } from '../logic/alertsService';
import { logAuditEvent } from '../logic/auditLog';
import { AI_PROMPT_VERSION_ID, getAiResponse } from '../logic/AiHelper';
import { readStore } from '../storage';
import { journalStore, profileStore } from '../storage/stores';
import type { CaregiverMode, JournalEntry } from '../storage/types';
import { colors } from '../theme/colors';
import { getCaregiverLabel, getCaregiverPossessive } from '../utils/caregiverPhrasing';

const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const TAG_OPTIONS = ['symptom', 'mood', 'diet', 'bowel movements', 'sleep', 'other'];

const JournalScreen = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [text, setText] = useState('');
  const [caregiverNotes, setCaregiverNotes] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [modeLabel, setModeLabel] = useState<CaregiverMode>('patient');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryStatus, setSummaryStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
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
    setSummaryStatus(null);
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
        caregiverNotes: caregiverNotes.trim() || undefined,
        tags: selectedTags,
      });
      if (saved.redFlags?.length) {
        setAlertMessage(
          'Red flag keywords detected. Seek emergency care immediately or call local emergency services.',
        );
        triggerEmergencyAlert({
          message: 'Critical symptoms detected in journal entry.',
          details: saved.redFlags,
          source: 'journal',
        });
      }
      await logAuditEvent({
        userRole: modeLabel,
        actionType: 'journal_saved',
        entity: 'journal-entry',
        entityId: saved.id,
      });
      setText('');
      setCaregiverNotes('');
      setSelectedTags([]);
      await loadEntries();
    } catch (error) {
      console.warn('Unable to save journal entry.', error);
      setErrorMessage('Unable to save journal entry.');
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag],
    );
  };

  const handleSummarize = async (days: number) => {
    setSummary(null);
    setSummaryStatus(null);
    setSummaryLoading(true);
    try {
      const rangeEntries = await getJournalEntriesForRange(days);
      if (rangeEntries.length === 0) {
        setSummaryStatus(`No journal entries in the last ${days} days.`);
        return;
      }
      const prompt = rangeEntries
        .map((entry) => {
          const date = new Date(entry.createdAt).toLocaleDateString();
          const tags = entry.tags?.length ? `Tags: ${entry.tags.join(', ')}.` : 'Tags: none.';
          const caregiver = entry.caregiverNotes ? `Caregiver notes: ${entry.caregiverNotes}` : '';
          return `${date} (${entry.author}) ${tags} ${entry.text} ${caregiver}`.trim();
        })
        .join('\n');
      const completion = await getAiResponse('journal-summary', prompt);
      const summaryEntry = {
        id: createId(),
        createdAt: new Date().toISOString(),
        rangeDays: days,
        promptVersion: AI_PROMPT_VERSION_ID,
        summary: completion,
      };
      await saveJournalSummary(summaryEntry);
      await logAuditEvent({
        userRole: modeLabel,
        actionType: 'ai_message_generated',
        entity: 'journal-summary',
        entityId: summaryEntry.id,
        metadata: { promptVersion: AI_PROMPT_VERSION_ID },
      });
      setSummary(completion);
      setSummaryStatus(`Summary saved for last ${days} days.`);
    } catch (error) {
      console.warn('Unable to summarize journal entries.', error);
      setSummaryStatus('Unable to summarize journal entries.');
    } finally {
      setSummaryLoading(false);
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
        <View style={styles.tagRow}>
          {TAG_OPTIONS.map((tag) => (
            <Text
              key={tag}
              onPress={() => toggleTag(tag)}
              style={[styles.tag, selectedTags.includes(tag) && styles.tagActive]}
            >
              {tag}
            </Text>
          ))}
        </View>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={`Share updates, concerns, or questions about ${getCaregiverPossessive(modeLabel)} health`}
          placeholderTextColor={colors.textSecondary}
          style={styles.input}
          multiline
        />
        {modeLabel === 'caregiver' ? (
          <TextInput
            value={caregiverNotes}
            onChangeText={setCaregiverNotes}
            placeholder="Caregiver notes (optional)"
            placeholderTextColor={colors.textSecondary}
            style={styles.input}
            multiline
          />
        ) : null}
        <ActionButton
          label={loading ? 'Saving...' : 'Save entry'}
          onPress={handleSave}
          variant="primary"
        />
        {alertMessage ? <Text style={styles.alertText}>{alertMessage}</Text> : null}
        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Summarize journal for clinician</Text>
        <Text style={styles.sectionSubtitle}>
          Use AI to summarize the last 7, 14, or 30 days. Education only.
        </Text>
        <View style={styles.summaryActions}>
          <ActionButton
            label={summaryLoading ? 'Summarizing...' : 'Last 7 days'}
            onPress={() => handleSummarize(7)}
            variant="secondary"
          />
          <ActionButton
            label="Last 14 days"
            onPress={() => handleSummarize(14)}
            variant="secondary"
          />
          <ActionButton
            label="Last 30 days"
            onPress={() => handleSummarize(30)}
            variant="secondary"
          />
        </View>
        {summaryStatus ? <Text style={styles.statusText}>{summaryStatus}</Text> : null}
        {summary ? <Text style={styles.summaryText}>{summary}</Text> : null}
        <Text style={styles.disclaimer}>Not medical advice. AI summaries only.</Text>
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
                  {entry.caregiverNotes ? (
                    <Text style={styles.entryText}>Caregiver notes: {entry.caregiverNotes}</Text>
                  ) : null}
                  {entry.tags?.length ? (
                    <Text style={styles.tagList}>Tags: {entry.tags.join(', ')}</Text>
                  ) : null}
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
                  {entry.caregiverNotes ? (
                    <Text style={styles.entryText}>Caregiver notes: {entry.caregiverNotes}</Text>
                  ) : null}
                  {entry.tags?.length ? (
                    <Text style={styles.tagList}>Tags: {entry.tags.join(', ')}</Text>
                  ) : null}
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
                {entry.caregiverNotes ? (
                  <Text style={styles.entryText}>Caregiver notes: {entry.caregiverNotes}</Text>
                ) : null}
                {entry.tags?.length ? (
                  <Text style={styles.tagList}>Tags: {entry.tags.join(', ')}</Text>
                ) : null}
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
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 12,
    color: colors.textPrimary,
  },
  tagActive: {
    backgroundColor: '#E0F2FE',
    borderColor: '#7DD3FC',
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
  statusText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  summaryText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  summaryActions: {
    gap: 8,
  },
  disclaimer: {
    fontSize: 12,
    color: colors.textSecondary,
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
  tagList: {
    fontSize: 12,
    color: colors.textSecondary,
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

import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import ActionButton from '../components/ActionButton';
import { buildExportSummary } from '../export/summaryGenerator';
import { readStore } from '../storage';
import {
  checkInStore,
  journalStore,
  medAdherenceStore,
  medConfigStore,
  moduleSelectionStore,
  profileStore,
  triageHistoryStore,
} from '../storage/stores';
import type { ExportSummary } from '../export/summaryGenerator';
import { colors } from '../theme/colors';

const ExportSummaryScreen = () => {
  const [summary, setSummary] = useState<ExportSummary | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    setStatus(null);
    try {
      const [profile, modules, checkIns, triageHistory, medConfig, medAdherence, journal] =
        await Promise.all([
          readStore(profileStore),
          readStore(moduleSelectionStore),
          readStore(checkInStore),
          readStore(triageHistoryStore),
          readStore(medConfigStore),
          readStore(medAdherenceStore),
          readStore(journalStore),
        ]);

      const nextSummary = buildExportSummary({
        profile: profile.data,
        moduleSelection: modules.data,
        checkIns: checkIns.data,
        triageHistory: triageHistory.data,
        medConfig: medConfig.data,
        medAdherence: medAdherence.data,
        journalEntries: journal.data,
      });

      setSummary(nextSummary);
      setStatus('Summary generated.');
    } catch (error) {
      console.warn('Unable to build export summary.', error);
      setStatus('Unable to build export summary.');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Export Summary</Text>
      <Text style={styles.subtitle}>
        Generate a shareable summary of recent check-ins, medications, and journal notes.
      </Text>

      <ActionButton
        label={loading ? 'Building summary...' : 'Build export summary'}
        onPress={handleGenerate}
        variant="primary"
      />
      {status ? <Text style={styles.statusText}>{status}</Text> : null}

      {summary ? (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <Text style={styles.sectionSubtitle}>
            {summary.header.patientName || 'Unnamed profile'} · {summary.header.modeLabel}
          </Text>
          <Text style={styles.narrative}>{summary.narrative}</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Triage history</Text>
          <Text style={styles.sectionSubtitle}>
            Latest level: {summary.triage.latestLevel ?? 'No recent triage results'}
          </Text>
          {summary.triage.recentEntries.length === 0 ? (
            <Text style={styles.emptyText}>No triage entries available.</Text>
          ) : (
            summary.triage.recentEntries.map((entry) => (
              <Text key={entry.id} style={styles.listText}>
                • {new Date(entry.createdAt).toLocaleDateString()} — {entry.level}
              </Text>
            ))
          )}

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Medications</Text>
          <Text style={styles.sectionSubtitle}>
            {summary.medications.meds.length} medication(s) ·{' '}
            {summary.medications.adherence.length} adherence entries
          </Text>
          {summary.medications.meds.length === 0 ? (
            <Text style={styles.emptyText}>No medications configured.</Text>
          ) : (
            summary.medications.meds.map((med) => (
              <Text key={med.id} style={styles.listText}>
                • {med.name} — {med.dose}
              </Text>
            ))
          )}

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Journal</Text>
          <Text style={styles.sectionSubtitle}>
            {summary.journal.redFlagCount} red-flag note(s) ·{' '}
            {summary.journal.recentEntries.length} recent entries
          </Text>
          {summary.journal.recentEntries.length === 0 ? (
            <Text style={styles.emptyText}>No journal entries available.</Text>
          ) : (
            summary.journal.recentEntries.map((entry) => (
              <Text key={entry.id} style={styles.listText}>
                • {new Date(entry.createdAt).toLocaleDateString()} — {entry.text}
              </Text>
            ))
          )}
        </View>
      ) : null}
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
  statusText: {
    fontSize: 13,
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
  narrative: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  listText: {
    fontSize: 13,
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});

export default ExportSummaryScreen;

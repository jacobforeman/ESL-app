import React, { useCallback, useState } from 'react';
import { ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';

import ActionButton from '../components/ActionButton';
import { buildExportSummary } from '../utils/exportSummary';
import { readStore } from '../storage';
import {
  checkInStore,
  journalStore,
  medAdherenceStore,
  profileStore,
  triageHistoryStore,
} from '../storage/stores';
import type { ExportSummaryResult } from '../types/exportSummary';
import { colors } from '../theme/colors';
import { getCaregiverLabel } from '../utils/caregiverPhrasing';

const ExportSummaryScreen = () => {
  const [summary, setSummary] = useState<ExportSummaryResult | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    setStatus(null);
    try {
      const [
        profileEnvelope,
        checkInsEnvelope,
        triageEnvelope,
        medAdherenceEnvelope,
        journalEnvelope,
      ] = await Promise.all([
        readStore(profileStore),
        readStore(checkInStore),
        readStore(triageHistoryStore),
        readStore(medAdherenceStore),
        readStore(journalStore),
      ]);

      const lastCheckIn = checkInsEnvelope.data[0];
      if (!lastCheckIn) {
        setSummary(null);
        setStatus('Add a check-in before generating an export summary.');
        return;
      }

      const triageResult =
        triageEnvelope.data.find((entry) => entry.checkInId === lastCheckIn.id) ??
        triageEnvelope.data[0];
      if (!triageResult) {
        setSummary(null);
        setStatus('Run a triage check-in before generating an export summary.');
        return;
      }

      const dateKey = lastCheckIn.createdAt.slice(0, 10);
      const adherenceEntries = medAdherenceEnvelope.data.filter((entry) => entry.date === dateKey);
      const takenCount = adherenceEntries.filter((entry) => entry.taken).length;
      const missedCount = adherenceEntries.filter((entry) => !entry.taken).length;
      const journalEntries = [...journalEnvelope.data]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 3);

      const nextSummary = buildExportSummary({
        profile: {
          id: profileEnvelope.data.id,
          name: profileEnvelope.data.name || 'Unnamed profile',
          caregiverMode: profileEnvelope.data.caregiverMode,
        },
        lastCheckIn,
        triageResult,
        medsAdherenceSnapshot: {
          date: dateKey,
          entries: adherenceEntries,
          takenCount,
          missedCount,
        },
        journalEntries,
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
          <Text style={styles.sectionTitle}>SBAR report</Text>
          <Text style={styles.sectionSubtitle}>
            {summary.summary.profile.name} · {getCaregiverLabel(summary.summary.profile.caregiverMode)}
          </Text>
          <Text style={styles.narrative} selectable>
            {summary.sbar}
          </Text>

          <View style={styles.divider} />

          <View style={styles.actionRow}>
            <ActionButton
              label="Copy SBAR"
              onPress={async () => {
                await Clipboard.setStringAsync(summary.sbar);
                setStatus('SBAR copied to clipboard.');
              }}
              variant="secondary"
              style={styles.actionButton}
            />
            <ActionButton
              label="Share SBAR"
              onPress={async () => {
                await Share.share({
                  message: summary.sbar,
                  title: 'SBAR Export Summary',
                });
              }}
              variant="primary"
              style={styles.actionButton}
            />
          </View>
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
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
});

export default ExportSummaryScreen;

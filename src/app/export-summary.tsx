import React, { useCallback, useState } from 'react';
import { ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';

import ActionButton from '../components/ActionButton';
import { buildExportSummary } from '../utils/exportSummary';
import { AI_PROMPT_VERSION_ID, getAiResponse } from '../logic/AiHelper';
import { logAuditEvent } from '../logic/auditLog';
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
  const [clinicianMessage, setClinicianMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);

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

      if (checkInsEnvelope.data.length === 0 || triageEnvelope.data.length === 0) {
        setSummary(null);
        setStatus('Add a check-in and triage result before generating an export summary.');
        return;
      }

      const nextSummary = buildExportSummary({
        profile: {
          id: profileEnvelope.data.id,
          name: profileEnvelope.data.name || 'Unnamed profile',
          caregiverMode: profileEnvelope.data.caregiverMode,
        },
        checkIns: checkInsEnvelope.data,
        triageHistory: triageEnvelope.data,
        medAdherence: medAdherenceEnvelope.data,
        journalEntries: journalEnvelope.data,
      });

      setSummary(nextSummary);
      setClinicianMessage(null);
      await logAuditEvent({
        userRole: profileEnvelope.data.caregiverMode,
        actionType: 'export_generated',
        entity: 'export-summary',
      });
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
          <Text style={styles.sectionTitle}>Export snapshot</Text>
          <Text style={styles.sectionSubtitle}>
            {summary.profile.name} · {getCaregiverLabel(summary.profile.caregiverMode)}
          </Text>
          <Text style={styles.narrative}>
            Latest triage levels: {summary.triageResults.map((entry) => entry.level).join(', ') || 'None'}
          </Text>
          <Text style={styles.narrative}>
            Symptom trends: {summary.symptomTrends.length ? summary.symptomTrends.map((trend) => `${trend.symptom} (${trend.count})`).join(', ') : 'No symptom trends.'}
          </Text>
          <Text style={styles.narrative}>
            Vitals trends: {summary.vitalsTrends.length ? summary.vitalsTrends.map((trend) => `${trend.metric} avg ${trend.average ?? 'n/a'}`).join(', ') : 'No vitals trends.'}
          </Text>
          <Text style={styles.narrative}>
            Medication adherence (7-day): {summary.medicationAdherence.percentage}% ({summary.medicationAdherence.taken} taken, {summary.medicationAdherence.missed} missed)
          </Text>
          <Text style={styles.narrative}>
            Journal highlights: {summary.journalHighlights.length ? summary.journalHighlights.map((entry) => entry.text).join(' | ') : 'No journal highlights.'}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Clinician message (AI drafted)</Text>
          {clinicianMessage ? <Text style={styles.narrative}>{clinicianMessage}</Text> : null}
          <Text style={styles.disclaimer}>Not medical advice. AI drafting only.</Text>
          <ActionButton
            label={messageLoading ? 'Drafting...' : 'Draft clinician message'}
            onPress={async () => {
              if (!summary) return;
              setMessageLoading(true);
              try {
                const prompt = summary.structuredJson;
                const completion = await getAiResponse('export-summary', prompt);
                setClinicianMessage(completion);
                await logAuditEvent({
                  userRole: summary.profile.caregiverMode,
                  actionType: 'ai_message_generated',
                  entity: 'export-summary-message',
                  metadata: { promptVersion: AI_PROMPT_VERSION_ID },
                });
              } catch (error) {
                console.warn('Unable to draft clinician message.', error);
                setStatus('Unable to draft clinician message.');
              } finally {
                setMessageLoading(false);
              }
            }}
            variant="primary"
          />

          <View style={styles.actionRow}>
            <ActionButton
              label="Copy message"
              onPress={async () => {
                if (clinicianMessage) {
                  await Clipboard.setStringAsync(clinicianMessage);
                  setStatus('Clinician message copied to clipboard.');
                }
              }}
              variant="secondary"
              style={styles.actionButton}
            />
            <ActionButton
              label="Share message"
              onPress={async () => {
                if (clinicianMessage) {
                  await Share.share({
                    message: clinicianMessage,
                    title: 'Clinician Message Draft',
                  });
                }
              }}
              variant="primary"
              style={styles.actionButton}
            />
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Structured JSON</Text>
          <Text style={styles.narrative} selectable>
            {summary.structuredJson}
          </Text>
          <View style={styles.actionRow}>
            <ActionButton
              label="Copy JSON"
              onPress={async () => {
                await Clipboard.setStringAsync(summary.structuredJson);
                setStatus('Structured JSON copied to clipboard.');
              }}
              variant="secondary"
              style={styles.actionButton}
            />
            <ActionButton
              label="Share JSON"
              onPress={async () => {
                await Share.share({
                  message: summary.structuredJson,
                  title: 'Structured JSON Export Summary',
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
  disclaimer: {
    fontSize: 12,
    color: colors.textSecondary,
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

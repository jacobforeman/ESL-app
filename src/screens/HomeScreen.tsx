import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { readStore } from '../storage';
import { journalStore, medAdherenceStore, profileStore } from '../storage/stores';
import type { CaregiverMode } from '../storage/types';
import { getCaregiverPossessive } from '../utils/caregiverPhrasing';
import type { TriageHistoryEntry } from '../storage/types';

type HomeScreenProps = {
  lastResult: TriageHistoryEntry | null;
};

type AdherenceSummary = {
  date: string;
  taken: number;
  missed: number;
};

type JournalSummary = {
  count: number;
  redFlags: number;
  lastEntryAt?: string;
};

const HomeScreen = ({ lastResult }: HomeScreenProps) => {
  const [caregiverMode, setCaregiverMode] = useState<CaregiverMode>('patient');
  const [adherenceSummary, setAdherenceSummary] = useState<AdherenceSummary | null>(null);
  const [journalSummary, setJournalSummary] = useState<JournalSummary | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const [{ data: profile }, { data: adherence }, { data: journal }] = await Promise.all([
        readStore(profileStore),
        readStore(medAdherenceStore),
        readStore(journalStore),
      ]);
      setCaregiverMode(profile.caregiverMode);

      const todayKey = new Date().toISOString().slice(0, 10);
      const todayEntries = adherence.filter((entry) => entry.date === todayKey);
      setAdherenceSummary({
        date: todayKey,
        taken: todayEntries.filter((entry) => entry.taken).length,
        missed: todayEntries.filter((entry) => !entry.taken).length,
      });

      const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const recentJournal = journal.filter((entry) => {
        const createdAt = new Date(entry.createdAt).getTime();
        return !Number.isNaN(createdAt) && createdAt >= cutoff;
      });
      const redFlags = recentJournal.reduce((count, entry) => {
        return count + (entry.redFlags?.length ?? 0);
      }, 0);
      const lastEntry = recentJournal[0];
      setJournalSummary({
        count: recentJournal.length,
        redFlags,
        lastEntryAt: lastEntry?.createdAt,
      });
    };

    loadProfile().catch((error) => {
      console.warn('Unable to load profile for home screen.', error);
    });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Latest Triage Result</Text>
      {lastResult ? (
        <View style={styles.card}>
          <Text style={styles.level}>{lastResult.level}</Text>
          <Text style={styles.summary}>
            {lastResult.rationale?.length ? lastResult.rationale.join(' ') : 'No triage notes saved yet.'}
          </Text>
          <Text style={styles.timestamp}>{new Date(lastResult.createdAt).toLocaleString()}</Text>
        </View>
      ) : (
        <Text style={styles.empty}>
          No triage results yet. Complete a check-in to get started for {getCaregiverPossessive(caregiverMode)} care.
        </Text>
      )}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Medication adherence</Text>
        {adherenceSummary ? (
          <Text style={styles.summary}>
            {adherenceSummary.taken + adherenceSummary.missed === 0
              ? `No doses recorded for ${adherenceSummary.date}.`
              : `${adherenceSummary.taken} taken, ${adherenceSummary.missed} missed today.`}
          </Text>
        ) : (
          <Text style={styles.empty}>No adherence data yet.</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Recent journal activity</Text>
        {journalSummary ? (
          <>
            <Text style={styles.summary}>
              {journalSummary.count === 0
                ? 'No journal entries in the last week.'
                : `${journalSummary.count} entries in the last week.`}
            </Text>
            {journalSummary.redFlags > 0 ? (
              <Text style={styles.summary}>
                {journalSummary.redFlags} red flag note{journalSummary.redFlags > 1 ? 's' : ''} logged.
              </Text>
            ) : null}
            {journalSummary.lastEntryAt ? (
              <Text style={styles.timestamp}>
                Last entry: {new Date(journalSummary.lastEntryAt).toLocaleDateString()}
              </Text>
            ) : null}
          </>
        ) : (
          <Text style={styles.empty}>No journal activity yet.</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#F6F7FB',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  level: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  summary: {
    fontSize: 16,
    marginBottom: 12,
  },
  timestamp: {
    fontSize: 12,
    color: '#6B7280',
  },
  empty: {
    fontSize: 16,
    color: '#6B7280',
  },
});

export default HomeScreen;

import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { readStore } from '../storage';
import { profileStore } from '../storage/stores';
import type { CaregiverMode } from '../storage/types';
import { getCaregiverPossessive } from '../utils/caregiverPhrasing';
import type { TriageHistoryEntry } from '../storage/types';

type HomeScreenProps = {
  lastResult: TriageHistoryEntry | null;
};

const HomeScreen = ({ lastResult }: HomeScreenProps) => {
  const [caregiverMode, setCaregiverMode] = useState<CaregiverMode>('patient');

  useEffect(() => {
    const loadProfile = async () => {
      const { data } = await readStore(profileStore);
      setCaregiverMode(data.caregiverMode);
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

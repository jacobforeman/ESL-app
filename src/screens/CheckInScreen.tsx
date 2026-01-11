import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { CheckInWizard } from '../components/CheckInWizard/CheckInWizard';
import { readStore } from '../storage';
import { profileStore, triageHistoryStore } from '../storage/stores';
import type { CaregiverMode } from '../storage/types';
import type { TriageHistoryEntry } from '../storage/types';
import type { TriageLevel } from '../types/checkIn';
import { getCaregiverPossessive } from '../utils/caregiverPhrasing';

type CheckInScreenProps = {
  onResultSaved: (result: TriageHistoryEntry) => void;
};

const CheckInScreen = ({ onResultSaved }: CheckInScreenProps) => {
  const [caregiverMode, setCaregiverMode] = useState<CaregiverMode>('patient');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const { data } = await readStore(profileStore);
      setCaregiverMode(data.caregiverMode);
    };

    loadProfile().catch((error) => {
      console.warn('Unable to load profile for check-in screen.', error);
    });
  }, []);

  const handleComplete = async (_result: TriageLevel, entryId: string) => {
    try {
      const { data } = await readStore(triageHistoryStore);
      const entry = data.find((item) => item.checkInId === entryId) ?? data[0];
      if (entry) {
        onResultSaved(entry);
      } else {
        setErrorMessage('Unable to locate the saved triage decision.');
      }
    } catch (error) {
      console.warn('Unable to load triage history.', error);
      setErrorMessage('Unable to load triage history.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Daily Check-In</Text>
      <Text style={styles.description}>
        Submit {getCaregiverPossessive(caregiverMode)} symptoms to receive a triage recommendation.
      </Text>
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      <CheckInWizard onComplete={handleComplete} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    marginBottom: 16,
    color: '#4B5563',
  },
  error: {
    color: '#b91c1c',
    marginBottom: 12,
  },
});

export default CheckInScreen;

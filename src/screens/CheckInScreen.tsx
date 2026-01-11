import React, { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { appendCheckInHistory } from '../state/checkInHistory';
import { CheckInAnswers } from '../types/checkIn';
import { TriageDecision } from '../logic/triageEngine';
import type { TriageHistoryEntry } from '../storage/types';

type CheckInScreenProps = {
  onResultSaved: (result: TriageHistoryEntry) => void;
};

const CheckInScreen = ({ onResultSaved }: CheckInScreenProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const answers: CheckInAnswers = {
      vomitingBlood: false,
      severeConfusion: false,
      fever: false,
      abdominalPain: 'mild',
      missedMeds: true,
      weightChange: 0,
      notes: 'Increased fatigue compared to yesterday.',
    };

    const triageResult: TriageDecision = {
      level: 'routine',
      rationale: ['Sample triage note saved from demo check-in.'],
      recommendedAction: 'Discuss this at your next appointment.',
    };
    const entry = await appendCheckInHistory(answers, triageResult);
    onResultSaved({
      ...entry.triage,
      rationale: triageResult.rationale,
    });

    setIsSubmitting(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daily Check-In</Text>
      <Text style={styles.description}>
        Submit your symptoms to receive a triage recommendation.
      </Text>
      <Button
        title={isSubmitting ? 'Submitting...' : 'Submit Check-In'}
        onPress={handleSubmit}
        disabled={isSubmitting}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
});

export default CheckInScreen;

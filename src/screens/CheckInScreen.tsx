import React, { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { saveCheckIn, saveTriageResult, type TriageResult, type TriageResultInput } from '../storage/storage';

type CheckInScreenProps = {
  onResultSaved: (result: TriageResult) => void;
};

const CheckInScreen = ({ onResultSaved }: CheckInScreenProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const checkIn = {
      symptoms: ['Fatigue', 'Swelling'],
      notes: 'Increased fatigue compared to yesterday.',
    };

    const triageResult: TriageResultInput = {
      level: 'Routine',
      summary: 'Symptoms are stable. Continue monitoring and discuss at next appointment.',
    };

    await saveCheckIn(checkIn);
    const savedResult = await saveTriageResult(triageResult);
    onResultSaved(savedResult);

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

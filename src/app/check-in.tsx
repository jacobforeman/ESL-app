import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { AiActionsPanel } from '../components/AiChat/AiActionsPanel';
import { CheckInWizard } from '../components/CheckInWizard/CheckInWizard';
import { TriageLevel } from '../types/checkIn';

const CheckInScreen = () => {
  const router = useRouter();

  const handleComplete = (result: TriageLevel, entryId: string) => {
    router.push({
      pathname: `/check-in/result/${result}`,
      params: { id: entryId },
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <CheckInWizard onComplete={handleComplete} />
      <AiActionsPanel heading="AI help during check-in" />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
});

export default CheckInScreen;

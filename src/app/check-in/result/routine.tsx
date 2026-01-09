import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

import { TriageResultScreen } from '../../../components/CheckInWizard/TriageResultScreen';

const RoutineResultScreen = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();

  return (
    <View style={styles.container}>
      <TriageResultScreen
        level="routine"
        title="Routine"
        description="No urgent red flags today. Keep tracking your symptoms."
        accentColor="#2563eb"
      />
      {id ? <Text style={styles.history}>Saved check-in ID: {id}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  history: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    fontSize: 12,
    color: '#6b7280',
  },
});

export default RoutineResultScreen;

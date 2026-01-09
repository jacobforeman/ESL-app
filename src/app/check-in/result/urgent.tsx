import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

import { ResultScreen } from '../../../components/CheckInWizard/ResultScreen';

const UrgentResultScreen = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();

  return (
    <View style={styles.container}>
      <ResultScreen
        level="urgent"
        title="Urgent"
        description="Your check-in shows symptoms that should be discussed soon."
        accentColor="#f97316"
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

export default UrgentResultScreen;

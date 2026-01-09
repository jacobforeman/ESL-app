import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

import { ResultScreen } from '../../../components/CheckInWizard/ResultScreen';

const SelfMonitorResultScreen = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();

  return (
    <View style={styles.container}>
      <ResultScreen
        level="self-monitor"
        title="Self-monitor"
        description="Keep an eye on your symptoms and log any changes."
        accentColor="#16a34a"
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

export default SelfMonitorResultScreen;

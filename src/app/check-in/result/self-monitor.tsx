import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

import { ResultScreen } from '../../../components/CheckInWizard/ResultScreen';
import { AiResponseDisclaimer } from '../../../components/AiChat/AiResponseDisclaimer';

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
      <View style={styles.disclaimer}>
        <AiResponseDisclaimer />
      </View>
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
    marginTop: 12,
    fontSize: 12,
    color: '#6b7280',
  },
  disclaimer: {
    paddingHorizontal: 20,
  },
});

export default SelfMonitorResultScreen;

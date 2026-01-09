import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

import { ResultScreen } from '../../../components/CheckInWizard/ResultScreen';

const EmergencyResultScreen = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();

  return (
    <View style={styles.container}>
      <ResultScreen
        level="emergency"
        title="Emergency"
        description="Your responses suggest a potentially life-threatening issue."
        accentColor="#dc2626"
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

export default EmergencyResultScreen;

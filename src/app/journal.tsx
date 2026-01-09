import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const JournalScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Journal</Text>
      <Text style={styles.subtitle}>Capture notes, symptoms, and daily reflections.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
});

export default JournalScreen;

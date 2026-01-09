import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { AiResponseDisclaimer } from '../components/AiChat/AiResponseDisclaimer';

const AiScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Companion</Text>
      <Text style={styles.subtitle}>Get guidance and explanations in plain language.</Text>
      <AiResponseDisclaimer />
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
    marginBottom: 16,
  },
});

export default AiScreen;

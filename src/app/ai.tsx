import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { AiActionsPanel } from '../components/AiChat/AiActionsPanel';

const AiScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Companion</Text>
      <Text style={styles.subtitle}>
        Get explanations and drafting help in plain language.
      </Text>
      <AiActionsPanel heading="How AI can help" />
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

export default AiScreen;

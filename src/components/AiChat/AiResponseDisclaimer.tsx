import React from 'react';
import { Text, StyleSheet } from 'react-native';

const DISCLAIMER_COPY =
  'AI guidance in this app does not provide diagnoses or treatment changes. Triage outcomes are rule-based and fixed.';

export const AiResponseDisclaimer = () => {
  return <Text style={styles.disclaimer}>{DISCLAIMER_COPY}</Text>;
};

const styles = StyleSheet.create({
  disclaimer: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 16,
  },
});

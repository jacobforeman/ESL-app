import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { isAiEnabled } from '../logic/AiHelper';

const AiScreen = () => {
  const aiEnabled = isAiEnabled();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Companion</Text>
      <Text style={styles.subtitle}>Get guidance and explanations in plain language.</Text>
      {!aiEnabled && (
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>AI features are unavailable.</Text>
          <Text style={styles.noticeBody}>
            Configure OPENAI_API_KEY to enable AI explanations and message drafts.
          </Text>
        </View>
      )}
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
  notice: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#991b1b',
    marginBottom: 4,
  },
  noticeBody: {
    fontSize: 13,
    color: '#7f1d1d',
  },
});

export default AiScreen;

import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import ActionButton from '../components/ActionButton';
import { getAiResponse } from '../logic/AiHelper';
import { readStore } from '../storage';
import { profileStore, triageHistoryStore } from '../storage/stores';
import type { CaregiverMode, TriageHistoryEntry } from '../storage/types';
import { colors } from '../theme/colors';
import { getCaregiverLabel, getCaregiverPossessive } from '../utils/caregiverPhrasing';

const ExplainResultScreen = () => {
  const [triageResult, setTriageResult] = useState<TriageHistoryEntry | null>(null);
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [caregiverMode, setCaregiverMode] = useState<CaregiverMode>('patient');

  useEffect(() => {
    const loadLatest = async () => {
      const [{ data: profile }, { data }] = await Promise.all([
        readStore(profileStore),
        readStore(triageHistoryStore),
      ]);
      setCaregiverMode(profile.caregiverMode);
      setTriageResult(data[0] ?? null);
    };

    loadLatest().catch((error) => {
      console.warn('Unable to load triage result.', error);
      setStatus('Unable to load the latest triage result.');
    });
  }, []);

  const handleExplain = async () => {
    setStatus(null);
    setResponse('');

    const basePrompt = triageResult
      ? `Explain the latest triage result. Level: ${triageResult.level}. Rationale: ${
          triageResult.rationale?.length ? triageResult.rationale.join(' ') : 'No rationale provided.'
        }`
      : 'Explain the latest triage result.';
    const userPrompt = prompt.trim()
      ? `${basePrompt}\nAdditional context: ${prompt.trim()}`
      : basePrompt;

    setLoading(true);
    try {
      const completion = await getAiResponse('triage-explanation', userPrompt);
      setResponse(completion || 'No response returned.');
    } catch (error) {
      console.warn('AI request failed.', error);
      setStatus('Unable to retrieve AI response.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Explain Result</Text>
      <Text style={styles.subtitle}>
        Ask the AI companion to explain {getCaregiverPossessive(caregiverMode)} latest triage result in plain language.
      </Text>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Latest triage</Text>
        {triageResult ? (
          <View style={styles.resultCard}>
            <Text style={styles.resultLevel}>{triageResult.level.toUpperCase()}</Text>
            <Text style={styles.resultMeta}>
              {new Date(triageResult.createdAt).toLocaleString()}
            </Text>
            <Text style={styles.resultText}>
              {triageResult.rationale?.length
                ? triageResult.rationale.join(' ')
                : 'No rationale recorded.'}
            </Text>
          </View>
        ) : (
          <Text style={styles.emptyText}>No triage results saved yet.</Text>
        )}
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>
          {getCaregiverLabel(caregiverMode)} question
        </Text>
        <TextInput
          value={prompt}
          onChangeText={setPrompt}
          placeholder="What should the AI focus on?"
          placeholderTextColor={colors.textSecondary}
          style={styles.input}
          multiline
        />
        <ActionButton
          label={loading ? 'Explaining...' : 'Explain with AI'}
          onPress={handleExplain}
          variant="primary"
        />
        {status ? <Text style={styles.statusText}>{status}</Text> : null}
      </View>

      {response ? (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>AI explanation</Text>
          <Text style={styles.responseText}>{response}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  resultCard: {
    gap: 6,
  },
  resultLevel: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  resultMeta: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  resultText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  input: {
    minHeight: 90,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
    textAlignVertical: 'top',
  },
  statusText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  responseText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});

export default ExplainResultScreen;

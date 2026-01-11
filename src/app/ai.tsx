import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import ActionButton from '../components/ActionButton';
import { AiTask, isAiEnabled, requestStrictAiCompletion } from '../logic/AiHelper';
import { colors } from '../theme/colors';

const TASK_OPTIONS: Array<{ label: string; value: AiTask }> = [
  { label: 'Explain a check-in question', value: 'check-in-question' },
  { label: 'Explain a triage result', value: 'triage-explanation' },
  { label: 'Draft a doctor message', value: 'doctor-message-draft' },
];

const AI_FALLBACK_RESPONSE =
  'AI features are unavailable because OPENAI_API_KEY is not configured. ' +
  'Add an API key to enable AI explanations and message drafts.';

const AiScreen = () => {
  const aiEnabled = isAiEnabled();
  const [task, setTask] = useState<AiTask>('check-in-question');
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setStatus(null);
    setResponse('');

    if (!prompt.trim()) {
      setStatus('Please enter a prompt.');
      return;
    }

    if (!aiEnabled) {
      setStatus('AI features are unavailable.');
      setResponse(AI_FALLBACK_RESPONSE);
      return;
    }

    setLoading(true);
    try {
      const completion = await requestStrictAiCompletion(
        task,
        prompt.trim(),
        {
          apiKey: process.env.OPENAI_API_KEY ?? '',
        },
      );
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
      <Text style={styles.title}>AI Companion</Text>
      <Text style={styles.subtitle}>Get guidance and explanations in plain language.</Text>

      {!aiEnabled ? (
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>AI features are unavailable.</Text>
          <Text style={styles.noticeBody}>
            Configure OPENAI_API_KEY to enable AI explanations and message drafts.
          </Text>
        </View>
      ) : null}

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Choose a task</Text>
        <View style={styles.taskRow}>
          {TASK_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => setTask(option.value)}
              style={[
                styles.taskButton,
                task === option.value && styles.taskButtonActive,
              ]}
            >
              <Text style={styles.taskButtonText}>{option.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Your prompt</Text>
        <Text style={styles.sectionSubtitle}>
          Add the question, triage result, or notes you want help with.
        </Text>
        <TextInput
          value={prompt}
          onChangeText={setPrompt}
          placeholder="Type your request for the AI assistant"
          placeholderTextColor={colors.textSecondary}
          style={styles.input}
          multiline
        />
        <ActionButton
          label={loading ? 'Sending...' : 'Ask AI'}
          onPress={handleSubmit}
          variant="primary"
        />
        {status ? <Text style={styles.statusText}>{status}</Text> : null}
      </View>

      {response ? (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Response</Text>
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
  notice: {
    marginTop: 4,
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
  sectionSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  taskRow: {
    gap: 10,
  },
  taskButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
  },
  taskButtonActive: {
    backgroundColor: '#E0F2FE',
    borderColor: '#7DD3FC',
  },
  taskButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  input: {
    minHeight: 110,
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
});

export default AiScreen;

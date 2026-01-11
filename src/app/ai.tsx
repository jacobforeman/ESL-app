import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import ActionButton from '../components/ActionButton';
import { AiTask, AI_PROMPT_VERSION_ID, getAiResponse } from '../logic/AiHelper';
import { triggerEmergencyAlert } from '../logic/alertsService';
import { logAuditEvent } from '../logic/auditLog';
import { scanTextForRedFlags } from '../logic/redFlags';
import { readStore } from '../storage';
import { profileStore } from '../storage/stores';
import type { CaregiverMode } from '../storage/types';
import { colors } from '../theme/colors';
import { getCaregiverLabel, getCaregiverPossessive } from '../utils/caregiverPhrasing';

const TASK_OPTIONS: Array<{ label: string; value: AiTask }> = [
  { label: 'Explain a check-in question', value: 'check-in-question' },
  { label: 'Explain a triage result', value: 'triage-explanation' },
  { label: 'Draft a doctor message', value: 'doctor-message-draft' },
];

const AiScreen = () => {
  const [task, setTask] = useState<AiTask>('check-in-question');
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [caregiverMode, setCaregiverMode] = useState<CaregiverMode>('patient');

  useEffect(() => {
    const loadProfile = async () => {
      const { data } = await readStore(profileStore);
      setCaregiverMode(data.caregiverMode);
    };

    loadProfile().catch((error) => {
      console.warn('Unable to load caregiver mode for AI screen.', error);
    });
  }, []);

  const handleSubmit = async () => {
    setStatus(null);
    setResponse('');

    if (!prompt.trim()) {
      setStatus('Please enter a prompt.');
      return;
    }

    setLoading(true);
    try {
      const redFlags = scanTextForRedFlags(prompt.trim());
      if (redFlags.length > 0) {
        triggerEmergencyAlert({
          message: 'Critical symptoms detected in AI prompt.',
          details: redFlags,
          source: 'ai',
        });
      }
      const completion = await getAiResponse(task, prompt.trim());
      setResponse(completion || 'No response returned.');
      await logAuditEvent({
        userRole: caregiverMode,
        actionType: 'ai_message_generated',
        entity: 'ai-response',
        metadata: { task, promptVersion: AI_PROMPT_VERSION_ID },
      });
    } catch (error) {
      console.warn('AI request failed.', error);
      setStatus('Unable to retrieve AI response.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>
        {caregiverMode === 'caregiver' ? 'Caregiver AI Companion' : 'AI Companion'}
      </Text>
      <Text style={styles.subtitle}>
        Get safe explanations for {getCaregiverPossessive(caregiverMode)} check-ins and messages.
      </Text>

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
        <Text style={styles.sectionTitle}>
          {getCaregiverLabel(caregiverMode)} prompt
        </Text>
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
        <Text style={styles.disclaimer}>Not medical advice. AI is for education and drafting only.</Text>
      </View>

      {response ? (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Response</Text>
          <Text style={styles.responseText}>{response}</Text>
          <Text style={styles.disclaimer}>Not medical advice.</Text>
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
  disclaimer: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});

export default AiScreen;

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AI_ACTIONS = [
  {
    title: 'Explain check-in questions',
    description: 'Clarify why each question is asked and how to answer.',
  },
  {
    title: 'Explain triage result',
    description: 'Summarize what your triage level means in plain language.',
  },
  {
    title: 'Draft message to doctor',
    description: 'Create a note you can review before contacting your care team.',
  },
];

type AiActionsPanelProps = {
  heading?: string;
};

export const AiActionsPanel = ({ heading = 'AI actions' }: AiActionsPanelProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{heading}</Text>
      <Text style={styles.subtitle}>
        AI support is limited to explanations and drafting messages. It does not diagnose, change
        medications, or alter triage results.
      </Text>
      <View style={styles.cards}>
        {AI_ACTIONS.map((action) => (
          <View key={action.title} style={styles.card}>
            <Text style={styles.cardTitle}>{action.title}</Text>
            <Text style={styles.cardDescription}>{action.description}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  heading: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 12,
  },
  cards: {
    gap: 10,
  },
  card: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: '#4b5563',
  },
});

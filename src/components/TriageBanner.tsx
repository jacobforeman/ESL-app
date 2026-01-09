import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { TriageLevel } from '../types/checkIn';
import { colors } from '../theme/colors';

type TriageBannerProps = {
  level: TriageLevel;
};

const LEVEL_LABELS: Record<TriageLevel, string> = {
  emergency: 'Emergency',
  urgent: 'Urgent',
  routine: 'Routine',
  'self-monitor': 'Self-monitor',
};

const TriageBanner = ({ level }: TriageBannerProps) => {
  return (
    <View style={[styles.banner, { backgroundColor: colors.triage[level] }]}>
      <Text style={styles.label}>{LEVEL_LABELS[level]}</Text>
      <Text style={styles.subtitle}>Triage result</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  label: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.surface,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: colors.surface,
    opacity: 0.9,
  },
});

export default TriageBanner;

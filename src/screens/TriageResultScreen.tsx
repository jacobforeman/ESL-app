import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import ActionButton from '../components/ActionButton';
import TriageBanner from '../components/TriageBanner';
import { colors } from '../theme/colors';
import { TriageLevel } from '../types/checkIn';

type TriageResultScreenProps = {
  level: TriageLevel;
  reasons: string[];
  nextSteps: string;
  onExportSummary?: () => void;
  onExplainResult?: () => void;
  onDone?: () => void;
};

const TriageResultScreen = ({
  level,
  reasons,
  nextSteps,
  onExportSummary,
  onExplainResult,
  onDone,
}: TriageResultScreenProps) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TriageBanner level={level} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Why you received this result</Text>
        {reasons.length > 0 ? (
          <View style={styles.list}>
            {reasons.map((reason, index) => (
              <View key={`${reason}-${index}`} style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>{reason}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>No reasons were recorded for this result.</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Next steps</Text>
        <Text style={styles.bodyText}>{nextSteps}</Text>
      </View>

      <View style={styles.actions}>
        <ActionButton label="Export summary" onPress={onExportSummary} />
        <ActionButton label="Explain result (AI placeholder)" onPress={onExplainResult} />
        <ActionButton label="Done" variant="primary" onPress={onDone} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    color: colors.textPrimary,
  },
  list: {
    gap: 10,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bullet: {
    marginRight: 8,
    fontSize: 18,
    color: colors.textPrimary,
  },
  listText: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  bodyText: {
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  actions: {
    gap: 12,
  },
});

export default TriageResultScreen;

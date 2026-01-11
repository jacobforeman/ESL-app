import React, { useEffect } from 'react';
import { Linking, View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { TriageLevel } from '../../types/checkIn';
import { readStore } from '../../storage';
import { profileStore } from '../../storage/stores';
import { logAuditEvent } from '../../logic/auditLog';
import { CLINIC_PHONE } from '../../config/contacts';

type ResultScreenProps = {
  level: TriageLevel;
  title: string;
  description: string;
  accentColor: string;
};

const ACTIONS_BY_LEVEL: Record<TriageLevel, string> = {
  emergency: 'Call 911 or go to the nearest emergency department now.',
  urgent: 'Contact your liver care team within 24 hours.',
  routine: 'Discuss this at your next appointment.',
  'self-monitor': 'Keep monitoring your symptoms today.',
};

export const ResultScreen = ({
  level,
  title,
  description,
  accentColor,
}: ResultScreenProps) => {
  const router = useRouter();

  const handleExportSummary = () => {
    router.push('/export-summary');
  };

  const handleExplainResult = () => {
    router.push('/explain-result');
  };

  const handleOpenJournal = () => {
    router.push('/journal');
  };

  const handleCallEmergency = () => {
    Linking.openURL('tel:911').catch((error) => {
      console.warn('Unable to open emergency dialer.', error);
    });
  };

  const handleCallClinic = () => {
    Linking.openURL(CLINIC_PHONE).catch((error) => {
      console.warn('Unable to open clinic dialer.', error);
    });
  };

  const handleDone = () => {
    router.push('/');
  };

  useEffect(() => {
    const loadProfile = async () => {
      const { data } = await readStore(profileStore);
      await logAuditEvent({
        userRole: data.caregiverMode,
        actionType: 'triage_viewed',
        entity: 'triage-result',
        metadata: { level },
      });
    };

    loadProfile().catch((error) => {
      console.warn('Unable to load caregiver mode for audit log.', error);
    });
  }, [level]);

  return (
    <View style={styles.container}>
      <View style={[styles.banner, { backgroundColor: accentColor }]}>
        <Text style={styles.bannerText}>{title}</Text>
      </View>
      <Text style={styles.description}>{description}</Text>
      <Text style={styles.actionTitle}>Recommended action</Text>
      <Text style={styles.actionText}>{ACTIONS_BY_LEVEL[level]}</Text>

      <View style={styles.actions}>
        {level === 'emergency' ? (
          <Pressable onPress={handleCallEmergency} style={styles.buttonPrimary}>
            <Text style={styles.buttonPrimaryText}>Call 911</Text>
          </Pressable>
        ) : null}
        {level === 'urgent' ? (
          <Pressable onPress={handleCallClinic} style={styles.buttonPrimary}>
            <Text style={styles.buttonPrimaryText}>Call clinic</Text>
          </Pressable>
        ) : null}
        <Pressable onPress={handleExportSummary} style={styles.buttonSecondary}>
          <Text style={styles.buttonSecondaryText}>Export summary</Text>
        </Pressable>
        <Pressable onPress={handleOpenJournal} style={styles.buttonSecondary}>
          <Text style={styles.buttonSecondaryText}>Open journal</Text>
        </Pressable>
        {level !== 'emergency' ? (
          <Pressable onPress={handleExplainResult} style={styles.buttonSecondary}>
            <Text style={styles.buttonSecondaryText}>Explain result</Text>
          </Pressable>
        ) : null}
        <Pressable onPress={handleDone} style={styles.buttonPrimary}>
          <Text style={styles.buttonPrimaryText}>Done</Text>
        </Pressable>
      </View>

      <Text style={styles.disclaimer}>
        This app does not replace medical care. If symptoms worsen, seek immediate help.
      </Text>
      {level === 'emergency' ? (
        <Text style={styles.disclaimer}>
          Emergency guidance only. AI explanations are disabled during emergency results.
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },
  banner: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  bannerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  description: {
    fontSize: 16,
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 6,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
  },
  actions: {
    gap: 12,
    marginBottom: 24,
  },
  buttonPrimary: {
    backgroundColor: '#111827',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonPrimaryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  buttonSecondary: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 12,
    color: '#6b7280',
  },
});

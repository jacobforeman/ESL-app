import React from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, ToastAndroid, View } from 'react-native';
import { Link } from 'expo-router';

import { TriageLevel } from '../../types/checkIn';
import { exportSummary } from '../../export/exportSummary';
import Clipboard from '@react-native-clipboard/clipboard';

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
  const handleCopySummary = async () => {
    try {
      const { combined } = await exportSummary();
      Clipboard.setString(combined);
      if (Platform.OS === 'android') {
        ToastAndroid.show('Summary copied to clipboard.', ToastAndroid.SHORT);
      } else {
        Alert.alert('Copied', 'Summary copied to clipboard.');
      }
    } catch (error) {
      if (Platform.OS === 'android') {
        ToastAndroid.show('Unable to copy summary.', ToastAndroid.SHORT);
      } else {
        Alert.alert('Copy failed', 'Unable to copy summary.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.banner, { backgroundColor: accentColor }]}>
        <Text style={styles.bannerText}>{title}</Text>
      </View>
      <Text style={styles.description}>{description}</Text>
      <Text style={styles.actionTitle}>Recommended action</Text>
      <Text style={styles.actionText}>{ACTIONS_BY_LEVEL[level]}</Text>

      <View style={styles.actions}>
        <Pressable onPress={handleCopySummary} style={styles.buttonSecondary}>
          <Text style={styles.buttonSecondaryText}>Copy summary</Text>
        </Pressable>
        <Link href="/" asChild>
          <Pressable style={styles.buttonPrimary}>
            <Text style={styles.buttonPrimaryText}>Back to Home</Text>
          </Pressable>
        </Link>
        <Link href="/check-in" asChild>
          <Pressable style={styles.buttonSecondary}>
            <Text style={styles.buttonSecondaryText}>New Check-In</Text>
          </Pressable>
        </Link>
      </View>

      <Text style={styles.disclaimer}>
        This app does not replace medical care. If symptoms worsen, seek immediate help.
      </Text>
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

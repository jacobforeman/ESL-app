import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { readStore } from '../storage';
import { profileStore } from '../storage/stores';
import type { CaregiverMode } from '../storage/types';
import { getCaregiverPossessive } from '../utils/caregiverPhrasing';

const HomeScreen = () => {
  const [caregiverMode, setCaregiverMode] = useState<CaregiverMode>('patient');

  useEffect(() => {
    const loadProfile = async () => {
      const { data } = await readStore(profileStore);
      setCaregiverMode(data.caregiverMode);
    };

    loadProfile().catch((error) => {
      console.warn('Unable to load profile for home screen.', error);
    });
  }, []);

  const possessive = getCaregiverPossessive(caregiverMode);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>
        Start today&apos;s check-in to track {possessive} symptoms and get guidance.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
});

export default HomeScreen;

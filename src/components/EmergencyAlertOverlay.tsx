import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { clearAlert } from '../logic/alertsService';
import { useAlerts } from '../state/alerts';
import { colors } from '../theme/colors';

const EmergencyAlertOverlay = () => {
  const alert = useAlerts();

  if (!alert) {
    return null;
  }

  const handleCallEmergency = () => {
    Linking.openURL('tel:911').catch((error) => {
      console.warn('Unable to open emergency dialer.', error);
    });
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Text style={styles.title}>Emergency alert</Text>
        <Text style={styles.message}>{alert.message}</Text>
        {alert.details?.length ? (
          <View style={styles.detailList}>
            {alert.details.map((detail) => (
              <Text key={detail} style={styles.detailItem}>
                • {detail}
              </Text>
            ))}
          </View>
        ) : null}
        <Text style={styles.guidance}>
          Seek immediate care or call emergency services now.
        </Text>
        <View style={styles.actions}>
          <Pressable onPress={handleCallEmergency} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Call 911</Text>
          </Pressable>
          <Pressable onPress={clearAlert} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>I understand</Text>
          </Pressable>
        </View>
        <Text style={styles.footer}>Not medical advice. Emergency guidance only.</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(17, 24, 39, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 999,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 420,
    gap: 12,
    borderWidth: 2,
    borderColor: '#DC2626',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#991B1B',
  },
  message: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  detailList: {
    gap: 4,
  },
  detailItem: {
    fontSize: 13,
    color: '#991B1B',
  },
  guidance: {
    fontSize: 14,
    fontWeight: '600',
    color: '#991B1B',
  },
  actions: {
    gap: 10,
  },
  primaryButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  footer: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});

export default EmergencyAlertOverlay;

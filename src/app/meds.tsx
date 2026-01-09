import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MedsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Medications</Text>
      <Text style={styles.subtitle}>Track your daily medication adherence.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
});

export default MedsScreen;

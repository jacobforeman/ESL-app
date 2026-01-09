import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ExportSummaryPlaceholder = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Export Summary</Text>
      <Text style={styles.subtitle}>
        The export flow will let you download or share a summary of this check-in.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
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

export default ExportSummaryPlaceholder;

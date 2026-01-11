import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ExplainResultPlaceholder = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Explain Result</Text>
      <Text style={styles.subtitle}>
        This feature is active in basic mode. More advanced tracking can be added later.
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

export default ExplainResultPlaceholder;

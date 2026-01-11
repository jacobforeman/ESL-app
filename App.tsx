import React, { useState } from 'react';
import { Button, SafeAreaView, StyleSheet, View } from 'react-native';
import CheckInScreen from './src/screens/CheckInScreen';
import HomeScreen from './src/screens/HomeScreen';
import type { TriageHistoryEntry } from './src/storage/types';

const App = () => {
  const [showCheckIn, setShowCheckIn] = useState(false);

  const handleResultSaved = (_result: TriageHistoryEntry) => {
    setShowCheckIn(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {showCheckIn ? (
        <CheckInScreen onResultSaved={handleResultSaved} />
      ) : (
        <View style={styles.container}>
          <HomeScreen />
          <View style={styles.footer}>
            <Button title="Start Check-In" onPress={() => setShowCheckIn(true)} />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7FB',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
});

export default App;

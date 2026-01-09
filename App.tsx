import React, { useEffect, useState } from 'react';
import { Button, SafeAreaView, StyleSheet, View } from 'react-native';
import CheckInScreen from './src/screens/CheckInScreen';
import HomeScreen from './src/screens/HomeScreen';
import { loadTriageHistory, type TriageResult } from './src/storage/storage';

const App = () => {
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [lastResult, setLastResult] = useState<TriageResult | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      const history = await loadTriageHistory();
      setLastResult(history[history.length - 1] ?? null);
    };

    loadHistory();
  }, []);

  const handleResultSaved = (result: TriageResult) => {
    setLastResult(result);
    setShowCheckIn(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {showCheckIn ? (
        <CheckInScreen onResultSaved={handleResultSaved} />
      ) : (
        <View style={styles.container}>
          <HomeScreen lastResult={lastResult} />
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

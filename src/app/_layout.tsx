import React from 'react';
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import EmergencyAlertOverlay from '../components/EmergencyAlertOverlay';
import { isAiEnabled } from '../logic/AiHelper';

const TabLayout = () => {
  const aiEnabled = isAiEnabled();

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: true,
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Home' }} />
        <Tabs.Screen name="check-in" options={{ title: 'Check-In' }} />
        <Tabs.Screen name="meds" options={{ title: 'Meds' }} />
        <Tabs.Screen name="journal" options={{ title: 'Journal' }} />
        <Tabs.Screen name="ai" options={{ title: 'AI', href: aiEnabled ? undefined : null }} />
        <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
      </Tabs>
      <EmergencyAlertOverlay />
    </View>
  );
};

export default TabLayout;

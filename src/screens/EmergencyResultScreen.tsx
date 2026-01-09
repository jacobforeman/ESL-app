import React, { useEffect } from "react";
import { Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { RootStackParamList } from "../types/navigation";

type EmergencyResultScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "EmergencyResult"
>;

const EmergencyResultScreen = ({ route, navigation }: EmergencyResultScreenProps) => {
  const { reasons } = route.params;

  useEffect(() => {
    navigation.setOptions({ headerShown: false, gestureEnabled: false });
    const unsubscribe = navigation.addListener("beforeRemove", (event) => {
      event.preventDefault();
    });

    return unsubscribe;
  }, [navigation]);

  const handleCall = () => {
    Linking.openURL("tel:911");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Call 911 or go to the ER now</Text>
      <View style={styles.reasonsContainer}>
        {reasons.slice(0, 3).map((reason, index) => (
          <Text key={`${reason}-${index}`} style={styles.reason}>
            • {reason}
          </Text>
        ))}
      </View>
      <TouchableOpacity style={styles.button} onPress={handleCall}>
        <Text style={styles.buttonText}>Call 911</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#c62828",
    padding: 24,
    justifyContent: "center",
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 24,
  },
  reasonsContainer: {
    marginBottom: 32,
  },
  reason: {
    color: "#fff",
    fontSize: 18,
    marginBottom: 8,
  },
  button: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    borderRadius: 12,
  },
  buttonText: {
    textAlign: "center",
    color: "#c62828",
    fontSize: 18,
    fontWeight: "700",
  },
});

export default EmergencyResultScreen;

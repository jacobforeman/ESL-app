import React, { useEffect } from "react";
import { View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import CheckInWizard from "../components/CheckInWizard/CheckInWizard";
import { RootStackParamList } from "../types/navigation";
import { useTriageStore } from "../state/useTriageStore";

const CheckInScreen = ({ navigation }: NativeStackScreenProps<RootStackParamList, "CheckIn">) => {
  const result = useTriageStore((state) => state.result);

  useEffect(() => {
    if (result?.level === "EMERGENCY") {
      navigation.replace("EmergencyResult", { reasons: result.reasons });
    }
  }, [navigation, result]);

  return (
    <View style={{ flex: 1 }}>
      <CheckInWizard />
    </View>
  );
};

export default CheckInScreen;

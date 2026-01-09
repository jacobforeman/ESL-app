import React from "react";
import { Button, Text, View } from "react-native";

import { runTriage } from "../../logic/TriageEngine";
import { useTriageStore } from "../../state/useTriageStore";

type CheckInWizardProps = {
  onComplete?: () => void;
};

const CheckInWizard = ({ onComplete }: CheckInWizardProps) => {
  const setResult = useTriageStore((state) => state.setResult);

  const handleRunTriage = () => {
    const result = runTriage({ emergency: true });
    setResult(result);
    onComplete?.();
  };

  return (
    <View style={{ padding: 24 }}>
      <Text style={{ fontSize: 20, marginBottom: 16 }}>
        Daily check-in
      </Text>
      <Button title="Run triage" onPress={handleRunTriage} />
    </View>
  );
};

export default CheckInWizard;

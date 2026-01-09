import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import CheckInScreen from "./src/screens/CheckInScreen";
import EmergencyResultScreen from "./src/screens/EmergencyResultScreen";
import { RootStackParamList } from "./src/types/navigation";

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="CheckIn">
        <Stack.Screen name="CheckIn" component={CheckInScreen} />
        <Stack.Screen
          name="EmergencyResult"
          component={EmergencyResultScreen}
          options={{ headerShown: false, gestureEnabled: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

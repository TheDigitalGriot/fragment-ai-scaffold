import { useEffect, useState } from "react";
import { Slot } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, ActivityIndicator } from "react-native";
import { AppStateProvider } from "{{PACKAGE_SCOPE}}/ui/context/AppStateContext.js";
import { bootstrapTransport } from "../src/bootstrap/transport-bootstrap.js";
import { tokens } from "../src/theme/tokens.js";

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    bootstrapTransport().finally(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: tokens.color.bgPrimary,
        }}
      >
        <ActivityIndicator color={tokens.color.accent} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AppStateProvider>
        <Slot />
      </AppStateProvider>
    </SafeAreaProvider>
  );
}

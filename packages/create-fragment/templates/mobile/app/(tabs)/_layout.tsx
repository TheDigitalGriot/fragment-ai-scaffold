import { Tabs } from "expo-router";
import { tokens } from "../../src/theme/tokens.js";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: tokens.color.bgSecondary },
        headerTintColor: tokens.color.textPrimary,
        tabBarStyle: {
          backgroundColor: tokens.color.bgSecondary,
          borderTopColor: tokens.color.border,
        },
        tabBarActiveTintColor: tokens.color.accent,
        tabBarInactiveTintColor: tokens.color.textSecondary,
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Chat" }} />
      <Tabs.Screen name="timeline" options={{ title: "Timeline" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
    </Tabs>
  );
}

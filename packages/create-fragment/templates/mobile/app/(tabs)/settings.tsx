import { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { loadHostUrl, saveHostUrl } from "../../src/transport/host-config.js";
import { bootstrapTransport, onStatus, type ConnStatus } from "../../src/bootstrap/transport-bootstrap.js";
import { tokens } from "../../src/theme/tokens.js";

const STATUS_COLOR: Record<ConnStatus, string> = {
  connecting: tokens.color.warning,
  connected: tokens.color.success,
  disconnected: tokens.color.textDim,
  error: tokens.color.error,
};

export default function SettingsScreen() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<ConnStatus>("connecting");

  useEffect(() => {
    loadHostUrl().then(setUrl);
    return onStatus(setStatus);
  }, []);

  const apply = async () => {
    await saveHostUrl(url);
    await bootstrapTransport(url);
  };

  return (
    <View style={{ flex: 1, backgroundColor: tokens.color.bgPrimary, padding: tokens.space.lg, gap: tokens.space.md }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: tokens.space.sm }}>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: STATUS_COLOR[status] }} />
        <Text style={{ color: tokens.color.textSecondary, fontSize: tokens.fontSize.sm }}>{status}</Text>
      </View>
      <Text style={{ color: tokens.color.textSecondary, fontSize: tokens.fontSize.xs }}>
        {"Host WebSocket URL — simulator: ws://localhost:6767 · device: ws://<LAN-IP>:6767 or a wss:// relay"}
      </Text>
      <TextInput
        value={url}
        onChangeText={setUrl}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="ws://localhost:6767"
        placeholderTextColor={tokens.color.textDim}
        style={{
          color: tokens.color.textPrimary,
          backgroundColor: tokens.color.bgTertiary,
          borderRadius: tokens.radius.md,
          paddingHorizontal: tokens.space.md,
          paddingVertical: tokens.space.sm,
          borderWidth: 1,
          borderColor: tokens.color.border,
        }}
      />
      <Pressable
        onPress={apply}
        style={{
          backgroundColor: tokens.color.accent,
          borderRadius: tokens.radius.md,
          paddingVertical: tokens.space.md,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#000", fontWeight: "600" }}>Connect</Text>
      </Pressable>
    </View>
  );
}

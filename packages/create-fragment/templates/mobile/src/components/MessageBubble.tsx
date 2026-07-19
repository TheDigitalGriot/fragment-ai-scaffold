import { View, Text } from "react-native";
import type { ChatMessage } from "{{PACKAGE_SCOPE}}/core/shared/types.js";
import { MODEL_COLORS, MODEL_LABELS } from "{{PACKAGE_SCOPE}}/core/shared/types.js";
import { tokens } from "../theme/tokens.js";

export function MessageBubble({
  message,
  showModelTag = false,
}: {
  message: ChatMessage;
  showModelTag?: boolean;
}) {
  const isUser = message.role === "user";
  return (
    <View style={{ marginBottom: tokens.space.md, alignItems: isUser ? "flex-end" : "flex-start" }}>
      {showModelTag && !isUser && (
        <Text
          style={{
            color: MODEL_COLORS[message.model],
            fontSize: tokens.fontSize.xs,
            marginBottom: 2,
            fontWeight: "600",
          }}
        >
          {MODEL_LABELS[message.model]}
        </Text>
      )}
      <View
        style={{
          maxWidth: "85%",
          padding: tokens.space.md,
          borderRadius: tokens.radius.lg,
          backgroundColor: isUser ? tokens.color.bgTertiary : tokens.color.bgSecondary,
          borderWidth: isUser ? 0 : 1,
          borderColor: tokens.color.border,
        }}
      >
        <Text style={{ color: tokens.color.textPrimary, fontSize: tokens.fontSize.md, lineHeight: 20 }}>
          {message.content}
        </Text>
      </View>
    </View>
  );
}

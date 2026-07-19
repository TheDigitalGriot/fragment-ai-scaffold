import { View, Text } from "react-native";
import type { ToolCall } from "{{PACKAGE_SCOPE}}/core/shared/types.js";
import { MODEL_COLORS } from "{{PACKAGE_SCOPE}}/core/shared/types.js";
import { tokens } from "../theme/tokens.js";

const STATUS_COLOR: Record<ToolCall["status"], string> = {
  running: tokens.color.warning,
  complete: tokens.color.success,
  error: tokens.color.error,
};

export function TimelineRow({ entry }: { entry: ToolCall }) {
  return (
    <View
      style={{
        flexDirection: "row",
        gap: tokens.space.sm,
        paddingVertical: tokens.space.sm,
        borderBottomWidth: 1,
        borderBottomColor: tokens.color.border,
      }}
    >
      <View style={{ width: 3, borderRadius: 2, backgroundColor: MODEL_COLORS[entry.model] }} />
      <View style={{ flex: 1 }}>
        <Text style={{ color: tokens.color.textPrimary, fontSize: tokens.fontSize.sm, fontWeight: "600" }}>
          {entry.tool}
        </Text>
        <Text style={{ color: tokens.color.textSecondary, fontSize: tokens.fontSize.xs }} numberOfLines={1}>
          {entry.target}
        </Text>
      </View>
      <Text style={{ color: STATUS_COLOR[entry.status], fontSize: tokens.fontSize.xs }}>{entry.status}</Text>
    </View>
  );
}

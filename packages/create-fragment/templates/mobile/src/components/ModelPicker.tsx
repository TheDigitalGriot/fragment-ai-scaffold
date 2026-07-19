import { Text, Pressable, ScrollView } from "react-native";
import type { ModelId } from "{{PACKAGE_SCOPE}}/core/shared/types.js";
import { MODEL_COLORS, MODEL_LABELS } from "{{PACKAGE_SCOPE}}/core/shared/types.js";
import { tokens } from "../theme/tokens.js";

const MODELS: ModelId[] = ["claude", "codex", "gemini"];

export function ModelPicker({
  active,
  onSelect,
}: {
  active: ModelId;
  onSelect: (m: ModelId) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ padding: tokens.space.sm, gap: tokens.space.sm }}
      style={{ flexGrow: 0, borderBottomWidth: 1, borderBottomColor: tokens.color.border }}
    >
      {MODELS.map((m) => {
        const on = m === active;
        return (
          <Pressable
            key={m}
            onPress={() => onSelect(m)}
            style={{
              paddingHorizontal: tokens.space.md,
              paddingVertical: tokens.space.sm,
              borderRadius: tokens.radius.md,
              borderWidth: 1,
              borderColor: on ? MODEL_COLORS[m] : tokens.color.border,
              backgroundColor: on ? tokens.color.bgTertiary : "transparent",
            }}
          >
            <Text
              style={{
                color: on ? MODEL_COLORS[m] : tokens.color.textSecondary,
                fontWeight: on ? "600" : "400",
                fontSize: tokens.fontSize.sm,
              }}
            >
              {MODEL_LABELS[m]}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

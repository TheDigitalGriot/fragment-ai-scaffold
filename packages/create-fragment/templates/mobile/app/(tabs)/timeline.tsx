import { View, Text, FlatList } from "react-native";
import { useAppState } from "{{PACKAGE_SCOPE}}/ui/context/AppStateContext.js";
import { TimelineRow } from "../../src/components/TimelineRow.js";
import { tokens } from "../../src/theme/tokens.js";

export default function TimelineScreen() {
  const { timeline } = useAppState();
  const entries = [...timeline.entries].reverse();

  return (
    <View style={{ flex: 1, backgroundColor: tokens.color.bgPrimary }}>
      {entries.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: tokens.color.textDim, fontSize: tokens.fontSize.sm }}>No tool activity yet</Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(e) => e.id}
          renderItem={({ item }) => <TimelineRow entry={item} />}
          contentContainerStyle={{ padding: tokens.space.md }}
        />
      )}
    </View>
  );
}

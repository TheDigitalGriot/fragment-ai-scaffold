import { useMemo, useState } from "react";
import { View, Text, TextInput, FlatList, Pressable, KeyboardAvoidingView, Platform } from "react-native";
import type { ChatMessage as ChatMsg } from "{{PACKAGE_SCOPE}}/core/shared/types.js";
import { useAppState } from "{{PACKAGE_SCOPE}}/ui/context/AppStateContext.js";
import { chatService } from "{{PACKAGE_SCOPE}}/ui/services/grpc-client.js";
import { MessageBubble } from "../../src/components/MessageBubble.js";
import { ModelPicker } from "../../src/components/ModelPicker.js";
import { tokens } from "../../src/theme/tokens.js";

export default function ChatScreen() {
  const state = useAppState();
  const [input, setInput] = useState("");
  const { activeModel, viewMode, messages } = state.chat;

  const visible: ChatMsg[] = useMemo(
    () =>
      viewMode === "focused"
        ? messages[activeModel] ?? []
        : Object.values(messages)
            .flat()
            .sort((a, b) => a.timestamp.localeCompare(b.timestamp)),
    [messages, activeModel, viewMode],
  );

  const send = () => {
    if (!input.trim()) return;
    chatService.sendMessage(activeModel, input.trim());
    setInput("");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: tokens.color.bgPrimary }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ModelPicker active={activeModel} onSelect={(m) => chatService.setActiveModel(m)} />
      <FlatList
        data={visible}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => <MessageBubble message={item} showModelTag={viewMode === "unified"} />}
        contentContainerStyle={{ padding: tokens.space.md }}
      />
      <View
        style={{
          padding: tokens.space.md,
          borderTopWidth: 1,
          borderTopColor: tokens.color.border,
          flexDirection: "row",
          gap: tokens.space.sm,
        }}
      >
        <TextInput
          value={input}
          onChangeText={setInput}
          onSubmitEditing={send}
          placeholder={`Message ${activeModel}…`}
          placeholderTextColor={tokens.color.textDim}
          style={{
            flex: 1,
            color: tokens.color.textPrimary,
            backgroundColor: tokens.color.bgTertiary,
            borderRadius: tokens.radius.md,
            paddingHorizontal: tokens.space.md,
            paddingVertical: tokens.space.sm,
          }}
        />
        <Pressable
          onPress={send}
          style={{
            backgroundColor: tokens.color.accent,
            borderRadius: tokens.radius.md,
            paddingHorizontal: tokens.space.md,
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#000", fontWeight: "600" }}>Send</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

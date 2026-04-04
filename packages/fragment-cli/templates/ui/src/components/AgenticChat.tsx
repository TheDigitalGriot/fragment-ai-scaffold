import { useState, useRef, useEffect } from 'react';
import type { ChatMessage as ChatMsg } from '{{PACKAGE_SCOPE}}/core/shared/types.js';
import { useAppState } from '../context/AppStateContext.js';
import { chatService } from '../services/grpc-client.js';
import { ModelSelector } from './ModelSelector.js';
import { ViewModeToggle } from './ViewModeToggle.js';
import { ChatMessage } from './ChatMessage.js';

export function AgenticChat() {
  const state = useAppState();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { activeModel, viewMode, messages } = state.chat;

  const visibleMessages: ChatMsg[] =
    viewMode === 'focused'
      ? messages[activeModel] || []
      : Object.values(messages).flat().sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [visibleMessages.length]);

  const handleSend = () => {
    if (!input.trim()) return;
    chatService.sendMessage(activeModel, input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--color-bg-secondary)', borderRight: '1px solid var(--color-border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-sm) var(--space-md)', borderBottom: '1px solid var(--color-border)' }}>
        <ModelSelector activeModel={activeModel} onSelect={(model) => chatService.setActiveModel(model)} />
        <ViewModeToggle mode={viewMode} onToggle={(mode) => chatService.setViewMode(mode)} />
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-md)' }}>
        {visibleMessages.length === 0 && (
          <div style={{ color: 'var(--color-text-dim)', textAlign: 'center', marginTop: 'var(--space-xl)', fontSize: 'var(--font-size-sm)' }}>
            Start a conversation...
          </div>
        )}
        {visibleMessages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} showModelTag={viewMode === 'unified'} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div style={{ padding: 'var(--space-md)', borderTop: '1px solid var(--color-border)' }}>
        <textarea
          value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
          placeholder={`Message ${activeModel}...`} rows={2}
          style={{
            width: '100%', background: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
            padding: 'var(--space-sm) var(--space-md)', fontFamily: 'var(--font-sans)',
            fontSize: 'var(--font-size-md)', resize: 'none', outline: 'none',
          }}
        />
      </div>
    </div>
  );
}

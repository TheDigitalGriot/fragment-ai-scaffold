import type { ChatMessage as ChatMsg } from '{{PACKAGE_SCOPE}}/core/shared/types.js';
import { MODEL_COLORS, MODEL_LABELS } from '{{PACKAGE_SCOPE}}/core/shared/types.js';

interface ChatMessageProps {
  message: ChatMsg;
  showModelTag?: boolean;
}

export function ChatMessage({ message, showModelTag = false }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const color = MODEL_COLORS[message.model];

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)',
      padding: 'var(--space-sm) var(--space-md)',
      background: isUser ? 'transparent' : 'var(--color-bg-secondary)',
      borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-sm)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
        fontSize: 'var(--font-size-xs)', color: 'var(--color-text-dim)',
      }}>
        {showModelTag && (
          <span style={{
            background: `${color}22`, color,
            padding: '1px 6px', borderRadius: 'var(--radius-sm)', fontWeight: 'bold',
          }}>
            {MODEL_LABELS[message.model]}
          </span>
        )}
        <span>{isUser ? 'You' : MODEL_LABELS[message.model]}</span>
        <span style={{ marginLeft: 'auto' }}>
          {new Date(message.timestamp).toLocaleTimeString()}
        </span>
      </div>
      <div style={{
        color: 'var(--color-text-primary)', fontSize: 'var(--font-size-md)',
        lineHeight: 1.6, whiteSpace: 'pre-wrap',
      }}>
        {message.content}
      </div>
    </div>
  );
}

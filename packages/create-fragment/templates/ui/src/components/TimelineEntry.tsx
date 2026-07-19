import { useState } from 'react';
import type { ToolCall } from '{{PACKAGE_SCOPE}}/core/shared/types.js';
import { MODEL_COLORS, MODEL_LABELS } from '{{PACKAGE_SCOPE}}/core/shared/types.js';

interface TimelineEntryProps {
  entry: ToolCall;
}

export function TimelineEntry({ entry }: TimelineEntryProps) {
  const [expanded, setExpanded] = useState(false);
  const color = MODEL_COLORS[entry.model];

  return (
    <div onClick={() => setExpanded(!expanded)} style={{
      padding: 'var(--space-sm)', cursor: 'pointer',
      borderBottom: '1px solid var(--color-bg-tertiary)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-dim)', minWidth: '40px' }}>
          {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
        <span style={{
          background: `${color}22`, color, padding: '1px 5px', borderRadius: '3px',
          fontSize: 'var(--font-size-xs)', minWidth: '52px', textAlign: 'center',
        }}>
          {MODEL_LABELS[entry.model]}
        </span>
        <span style={{
          background: `${color}22`, padding: '2px 6px', borderRadius: 'var(--radius-sm)',
          fontSize: 'var(--font-size-xs)', color,
        }}>
          {entry.tool}
        </span>
        <span style={{
          color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {entry.target}
        </span>
        {entry.status === 'running' && (
          <span style={{ color: 'var(--color-warning)', fontSize: 'var(--font-size-xs)' }}>...</span>
        )}
      </div>
      {expanded && (entry.input || entry.output) && (
        <div style={{
          marginTop: 'var(--space-sm)', padding: 'var(--space-sm)',
          background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-sm)',
          fontSize: 'var(--font-size-xs)', fontFamily: 'var(--font-mono)',
        }}>
          {entry.input && (
            <div style={{ marginBottom: 'var(--space-xs)' }}>
              <span style={{ color: 'var(--color-text-dim)' }}>Input: </span>
              <span style={{ color: 'var(--color-text-secondary)' }}>{entry.input}</span>
            </div>
          )}
          {entry.output && (
            <div>
              <span style={{ color: 'var(--color-text-dim)' }}>Output: </span>
              <span style={{ color: 'var(--color-text-secondary)' }}>{entry.output}</span>
            </div>
          )}
          {entry.duration !== undefined && (
            <div style={{ color: 'var(--color-text-dim)', marginTop: 'var(--space-xs)' }}>
              {entry.duration}ms
            </div>
          )}
        </div>
      )}
    </div>
  );
}

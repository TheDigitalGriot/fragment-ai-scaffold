import type { ChatViewMode } from '{{PACKAGE_SCOPE}}/core/shared/types.js';

interface ViewModeToggleProps {
  mode: ChatViewMode;
  onToggle: (mode: ChatViewMode) => void;
}

export function ViewModeToggle({ mode, onToggle }: ViewModeToggleProps) {
  const modes: { value: ChatViewMode; label: string }[] = [
    { value: 'focused', label: 'Focused' },
    { value: 'unified', label: 'Unified' },
  ];

  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {modes.map((m) => (
        <button
          key={m.value}
          onClick={() => onToggle(m.value)}
          style={{
            background: mode === m.value ? 'var(--color-accent-dim)' : 'transparent',
            color: mode === m.value ? 'var(--color-accent)' : 'var(--color-text-dim)',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            padding: 'var(--space-xs) var(--space-sm)',
            fontSize: 'var(--font-size-xs)',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
          }}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}

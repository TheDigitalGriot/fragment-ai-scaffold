import type { TimelineFilter as TFilter } from '{{PACKAGE_SCOPE}}/core/shared/types.js';
import { MODEL_COLORS } from '{{PACKAGE_SCOPE}}/core/shared/types.js';

interface TimelineFilterProps {
  active: TFilter;
  onSelect: (filter: TFilter) => void;
}

const FILTERS: { value: TFilter; label: string; color?: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'claude', label: 'Claude', color: MODEL_COLORS.claude },
  { value: 'codex', label: 'Codex', color: MODEL_COLORS.codex },
  { value: 'gemini', label: 'Gemini', color: MODEL_COLORS.gemini },
];

export function TimelineFilter({ active, onSelect }: TimelineFilterProps) {
  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {FILTERS.map((f) => {
        const isActive = active === f.value;
        const color = f.color || '#fff';
        return (
          <button
            key={f.value}
            onClick={() => onSelect(f.value)}
            style={{
              background: isActive ? `${color}22` : 'transparent',
              color: isActive ? color : 'var(--color-text-dim)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              padding: '2px 8px',
              fontSize: 'var(--font-size-xs)',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {f.label}
          </button>
        );
      })}
    </div>
  );
}

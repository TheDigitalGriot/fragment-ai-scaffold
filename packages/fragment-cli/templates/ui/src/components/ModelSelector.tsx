import type { ModelId } from '{{PACKAGE_SCOPE}}/core/shared/types.js';
import { MODEL_COLORS, MODEL_LABELS } from '{{PACKAGE_SCOPE}}/core/shared/types.js';

interface ModelSelectorProps {
  activeModel: ModelId;
  onSelect: (model: ModelId) => void;
}

const MODELS: ModelId[] = ['claude', 'codex', 'gemini'];

export function ModelSelector({ activeModel, onSelect }: ModelSelectorProps) {
  return (
    <select
      value={activeModel}
      onChange={(e) => onSelect(e.target.value as ModelId)}
      style={{
        background: 'var(--color-bg-tertiary)',
        color: 'var(--color-text-primary)',
        border: `1px solid ${MODEL_COLORS[activeModel]}`,
        borderRadius: 'var(--radius-sm)',
        padding: 'var(--space-xs) var(--space-sm)',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--font-size-sm)',
        cursor: 'pointer',
        outline: 'none',
      }}
    >
      {MODELS.map((model) => (
        <option key={model} value={model}>{MODEL_LABELS[model]}</option>
      ))}
    </select>
  );
}

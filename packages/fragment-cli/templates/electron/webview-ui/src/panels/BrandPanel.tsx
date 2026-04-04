import { useAppState } from '{{PACKAGE_SCOPE}}/ui/context/AppStateContext.js';
import { MODEL_COLORS, MODEL_LABELS, type ModelId } from '{{PACKAGE_SCOPE}}/core/shared/types.js';

export function BrandPanel() {
  const state = useAppState();

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      height: '100%', background: 'var(--color-bg-primary)',
      borderLeft: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)',
      gap: 'var(--space-lg)',
    }}>
      <div style={{
        fontSize: '48px', fontWeight: 'bold',
        background: 'linear-gradient(135deg, #ff8c32, #7c3aed)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        letterSpacing: '-2px',
      }}>
        Fragment
      </div>
      <div style={{
        color: 'var(--color-text-dim)', fontSize: 'var(--font-size-sm)',
        textAlign: 'center', maxWidth: '300px',
      }}>
        Taming the fragmented agentic ecosystem
      </div>
      <div style={{
        color: 'var(--color-text-dim)', fontSize: 'var(--font-size-xs)',
        fontFamily: 'var(--font-mono)',
      }}>
        v{state.version}
      </div>
      <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-lg)' }}>
        {(['claude', 'codex', 'gemini'] as ModelId[]).map((model) => {
          const conn = state.models[model];
          const color = MODEL_COLORS[model];
          const isConnected = conn.status === 'connected';
          return (
            <div key={model} style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-xs)',
              fontSize: 'var(--font-size-xs)',
              color: isConnected ? color : 'var(--color-text-dim)',
            }}>
              <span style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: isConnected ? color : 'transparent',
                border: `1px solid ${isConnected ? color : 'var(--color-text-dim)'}`,
                display: 'inline-block',
              }} />
              {MODEL_LABELS[model]}
            </div>
          );
        })}
      </div>
    </div>
  );
}

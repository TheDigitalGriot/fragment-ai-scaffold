import { useRef, useEffect } from 'react';
import type { TimelineFilter as TFilter, ToolCall } from '{{PACKAGE_SCOPE}}/core/shared/types.js';
import { useAppState } from '../context/AppStateContext.js';
import { timelineService } from '../services/grpc-client.js';
import { TimelineFilter } from './TimelineFilter.js';
import { TimelineEntry } from './TimelineEntry.js';

export function ToolTimeline() {
  const state = useAppState();
  const bottomRef = useRef<HTMLDivElement>(null);
  const { filter, entries } = state.timeline;
  const visibleEntries: ToolCall[] = filter === 'all' ? entries : entries.filter((e) => e.model === filter);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [visibleEntries.length]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--color-bg-secondary)', borderLeft: '1px solid var(--color-border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-sm) var(--space-md)', borderBottom: '1px solid var(--color-border)' }}>
        <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>Tool Timeline</span>
        <TimelineFilter active={filter} onSelect={(f) => timelineService.setFilter(f)} />
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {visibleEntries.length === 0 && (
          <div style={{ color: 'var(--color-text-dim)', textAlign: 'center', marginTop: 'var(--space-xl)', fontSize: 'var(--font-size-sm)' }}>
            No tool calls yet
          </div>
        )}
        {visibleEntries.map((entry) => (<TimelineEntry key={entry.id} entry={entry} />))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

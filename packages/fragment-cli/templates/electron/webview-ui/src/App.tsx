import { AppStateProvider } from '{{PACKAGE_SCOPE}}/ui/context/AppStateContext.js';
import { ChatPanel } from './panels/ChatPanel.js';
import { BrandPanel } from './panels/BrandPanel.js';
import { TimelinePanel } from './panels/TimelinePanel.js';

export function App() {
  return (
    <AppStateProvider>
      <div style={{
        display: 'flex', height: '100vh', width: '100vw',
        overflow: 'hidden', background: 'var(--color-bg-primary)',
      }}>
        <div style={{ width: '30%', minWidth: '280px' }}>
          <ChatPanel />
        </div>
        <div style={{ flex: 1 }}>
          <BrandPanel />
        </div>
        <div style={{ width: '30%', minWidth: '280px' }}>
          <TimelinePanel />
        </div>
      </div>
    </AppStateProvider>
  );
}

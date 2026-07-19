import { AppStateProvider } from '{{PACKAGE_SCOPE}}/ui/context/AppStateContext.js';
import { ToolTimeline } from '{{PACKAGE_SCOPE}}/ui/components/ToolTimeline.js';

export function App() {
  return (
    <AppStateProvider>
      <div style={{ height: '100vh' }}>
        <ToolTimeline />
      </div>
    </AppStateProvider>
  );
}

import { AppStateProvider } from '{{PACKAGE_SCOPE}}/ui/context/AppStateContext.js';
import { AgenticChat } from '{{PACKAGE_SCOPE}}/ui/components/AgenticChat.js';

export function App() {
  return (
    <AppStateProvider>
      <div style={{ height: '100vh' }}>
        <AgenticChat />
      </div>
    </AppStateProvider>
  );
}

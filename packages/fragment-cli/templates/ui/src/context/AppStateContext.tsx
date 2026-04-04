import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { AppState } from '{{PACKAGE_SCOPE}}/core/shared/types.js';
import { createDefaultState } from '{{PACKAGE_SCOPE}}/core/shared/state.js';
import { stateService } from '../services/grpc-client.js';
import { getTransport } from '../transport/types.js';

const AppStateContext = createContext<AppState>(createDefaultState('{{PROJECT_NAME}}'));

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(createDefaultState('{{PROJECT_NAME}}'));

  useEffect(() => {
    stateService.getState().then((res) => {
      try { setState(JSON.parse(res.state)); } catch {}
    });

    const transport = getTransport();
    const cleanup = transport.onMessage((raw: unknown) => {
      const msg = raw as { type?: string; state?: string };
      if (msg.type === 'state-update' && msg.state) {
        try { setState(JSON.parse(msg.state)); } catch {}
      }
    });

    return cleanup;
  }, []);

  return (
    <AppStateContext.Provider value={state}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState(): AppState {
  return useContext(AppStateContext);
}

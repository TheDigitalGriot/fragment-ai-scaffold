import type { AppState, ModelId } from './types.js';

export function createDefaultState(projectName: string): AppState {
  const makeConnection = (model: ModelId) => ({
    model,
    status: 'disconnected' as const,
  });

  return {
    projectName,
    version: '0.0.1',
    models: {
      claude: makeConnection('claude'),
      codex: makeConnection('codex'),
      gemini: makeConnection('gemini'),
    },
    chat: {
      activeModel: 'claude',
      viewMode: 'focused',
      messages: {
        claude: [],
        codex: [],
        gemini: [],
      },
    },
    timeline: {
      filter: 'all',
      entries: [],
    },
  };
}

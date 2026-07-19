import { createRoot } from 'react-dom/client';
import { setTransport } from '{{PACKAGE_SCOPE}}/ui/transport/types.js';
import { vsCodeTransport } from './transport/vscode-transport.js';
import { App } from './App.js';
import '{{PACKAGE_SCOPE}}/ui/styles/bridge.css';

setTransport(vsCodeTransport);
const root = createRoot(document.getElementById('root')!);
root.render(<App />);

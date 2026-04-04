import { createRoot } from 'react-dom/client';
import { setTransport } from '{{PACKAGE_SCOPE}}/ui/transport/types.js';
import { electronTransport } from './transport/electron-transport.js';
import { App } from './App.js';
import '{{PACKAGE_SCOPE}}/ui/styles/bridge.css';

setTransport(electronTransport);

const root = createRoot(document.getElementById('root')!);
root.render(<App />);

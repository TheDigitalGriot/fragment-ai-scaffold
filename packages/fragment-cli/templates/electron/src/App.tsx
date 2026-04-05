import { useState, useEffect, useRef } from 'react';

const MODEL_COLORS: Record<string, string> = { claude: '#ff8c32', codex: '#10b981', gemini: '#3b82f6' };
const MODEL_LABELS: Record<string, string> = { claude: 'Claude', codex: 'Codex', gemini: 'Gemini' };

interface ChatMessage { role: 'user' | 'assistant'; model: string; content: string; timestamp: string; }
interface ToolCall { tool: string; target: string; model: string; timestamp: string; status: string; }
interface AppState {
  activeModel: string;
  models: Record<string, { connected: boolean }>;
  chatMessages: Record<string, ChatMessage[]>;
  toolTimeline: ToolCall[];
}

export default function App() {
  const [state, setState] = useState<AppState | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<Record<string, unknown> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const refreshState = async () => { setState(await window.api.getState() as AppState); };
  useEffect(() => { refreshState(); }, []);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [state?.chatMessages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    setInput(''); setIsLoading(true);
    await window.api.sendMessage(input.trim());
    await refreshState(); setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };
  const handleModelChange = async (model: string) => { await window.api.setModel(model); await refreshState(); };
  const handleDebug = async () => { setDebugInfo(await window.api.debugInfo() as Record<string, unknown>); };

  if (!state) return <div style={s.loading}>Loading...</div>;

  const messages = state.chatMessages[state.activeModel] || [];
  const color = MODEL_COLORS[state.activeModel] || '#888';

  return (
    <div style={s.container}>
      {/* Left: Chat */}
      <div style={s.chatPanel}>
        <div style={s.chatHeader}>
          <select value={state.activeModel} onChange={(e) => handleModelChange(e.target.value)} style={{ ...s.select, borderColor: color }}>
            {Object.entries(MODEL_LABELS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
          </select>
          <span style={{ color: state.models[state.activeModel]?.connected ? '#10b981' : '#555', fontSize: '12px' }}>
            {state.models[state.activeModel]?.connected ? '● connected' : '○ disconnected'}
          </span>
        </div>
        <div style={s.messages}>
          {messages.length === 0 && <div style={s.empty}>Start a conversation...</div>}
          {messages.map((msg, i) => (
            <div key={i} style={{ ...s.message, background: msg.role === 'user' ? 'transparent' : '#12121e' }}>
              <div style={s.msgHead}>
                <span style={{ color: '#555' }}>{msg.role === 'user' ? 'You' : MODEL_LABELS[msg.model]}</span>
                <span style={{ color: '#333', fontSize: '11px' }}>{new Date(msg.timestamp).toLocaleTimeString()}</span>
              </div>
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{msg.content}</div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div style={s.inputArea}>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
            placeholder={`Message ${MODEL_LABELS[state.activeModel]}...`} rows={2} style={s.textarea} disabled={isLoading} />
          {isLoading && <div style={{ color, fontSize: '12px', marginTop: '4px' }}>Thinking...</div>}
        </div>
      </div>

      {/* Center: Branding */}
      <div style={s.brand}>
        <div style={s.logo}>Fragment</div>
        <div style={s.tagline}>Taming the fragmented agentic ecosystem</div>
        <div style={s.version}>v0.1.0</div>
        <div style={s.connections}>
          {(['claude','codex','gemini'] as const).map((m) => (
            <div key={m} style={{ display:'flex', alignItems:'center', gap:'6px', fontSize:'12px', color: state.models[m]?.connected ? MODEL_COLORS[m] : '#555' }}>
              <span style={{ width:'8px', height:'8px', borderRadius:'50%', display:'inline-block', background: state.models[m]?.connected ? MODEL_COLORS[m] : 'transparent', border: `1px solid ${state.models[m]?.connected ? MODEL_COLORS[m] : '#555'}` }} />
              {MODEL_LABELS[m]}
            </div>
          ))}
        </div>
        <button onClick={handleDebug} style={s.debugBtn}>Debug Info</button>
        {debugInfo && <pre style={s.debugPre}>{JSON.stringify(debugInfo, null, 2)}</pre>}
      </div>

      {/* Right: Timeline */}
      <div style={s.timeline}>
        <div style={s.timeHead}>Tool Timeline</div>
        <div style={s.entries}>
          {state.toolTimeline.length === 0 && <div style={s.empty}>No tool calls yet</div>}
          {state.toolTimeline.map((entry, i) => (
            <div key={i} style={s.entry}>
              <span style={{ color:'#555', fontSize:'11px', minWidth:'50px' }}>{new Date(entry.timestamp).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}</span>
              <span style={{ background:`${MODEL_COLORS[entry.model]}22`, color: MODEL_COLORS[entry.model], padding:'1px 6px', borderRadius:'3px', fontSize:'11px' }}>{MODEL_LABELS[entry.model]}</span>
              <span style={{ color: MODEL_COLORS[entry.model], fontSize:'12px' }}>{entry.tool}</span>
              <span style={{ color:'#888', fontSize:'12px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{entry.target}</span>
              {entry.status === 'running' && <span style={{ color:'#f59e0b', fontSize:'11px' }}>...</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  loading: { display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', color:'#555', background:'#0a0a12' },
  container: { display:'flex', height:'100vh', width:'100vw', overflow:'hidden', background:'#0a0a12', color:'#e0e0e0', fontFamily:'-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize:'14px' },
  chatPanel: { width:'30%', minWidth:'280px', display:'flex', flexDirection:'column', borderRight:'1px solid #222' },
  chatHeader: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 16px', borderBottom:'1px solid #222' },
  select: { background:'#1a1a2e', color:'#e0e0e0', border:'1px solid #555', borderRadius:'4px', padding:'4px 8px', fontSize:'13px', cursor:'pointer', outline:'none' },
  messages: { flex:1, overflowY:'auto' as const, padding:'16px' },
  empty: { color:'#555', textAlign:'center' as const, marginTop:'32px', fontSize:'13px' },
  message: { padding:'8px 16px', borderRadius:'8px', marginBottom:'8px' },
  msgHead: { display:'flex', justifyContent:'space-between', fontSize:'12px', marginBottom:'4px' },
  inputArea: { padding:'16px', borderTop:'1px solid #222' },
  textarea: { width:'100%', background:'#1a1a2e', color:'#e0e0e0', border:'1px solid #222', borderRadius:'8px', padding:'8px 16px', fontFamily:'inherit', fontSize:'14px', resize:'none' as const, outline:'none' },
  brand: { flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', borderRight:'1px solid #222', gap:'16px' },
  logo: { fontSize:'48px', fontWeight:'bold', background:'linear-gradient(135deg, #ff8c32, #7c3aed)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', letterSpacing:'-2px' },
  tagline: { color:'#555', fontSize:'13px', textAlign:'center' as const },
  version: { color:'#555', fontSize:'12px', fontFamily:'"SF Mono", "Cascadia Code", monospace' },
  connections: { display:'flex', gap:'16px', marginTop:'24px' },
  debugBtn: { marginTop:'16px', background:'#1a1a2e', color:'#555', border:'1px solid #222', borderRadius:'4px', padding:'4px 12px', fontSize:'11px', cursor:'pointer' },
  debugPre: { background:'#12121e', padding:'8px', borderRadius:'4px', fontSize:'10px', color:'#888', maxWidth:'300px', overflow:'auto', maxHeight:'150px' },
  timeline: { width:'30%', minWidth:'280px', display:'flex', flexDirection:'column' },
  timeHead: { padding:'8px 16px', borderBottom:'1px solid #222', fontWeight:'bold', fontSize:'13px', color:'#888' },
  entries: { flex:1, overflowY:'auto' as const },
  entry: { display:'flex', alignItems:'center', gap:'8px', padding:'8px 16px', borderBottom:'1px solid #1a1a2e' },
};

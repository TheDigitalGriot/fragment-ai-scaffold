/**
 * Example local stdio MCP server for {{PROJECT_NAME}}, wired with no-orphan stdio hygiene by
 * default. Replace the example `run_command` tool with your real tools -- keep the hygiene helpers.
 *
 * StdioServerTransport owns stdout for JSON-RPC (rule 1). Never console.log() in this process;
 * use log() (stderr) from ./hygiene.js for diagnostics.
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { findBinary, log, runChild } from './hygiene.js';
import { installReaper } from './launcher.js';

// rule 5 (best-effort; see launcher.ts for the Windows Job Object caveat)
installReaper();

const server = new Server(
  { name: '{{PROJECT_NAME}}-mcp', version: '0.0.1' },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'run_command',
      description: 'Run a helper binary with full stdio hygiene and return its stdout.',
      inputSchema: {
        type: 'object',
        properties: { args: { type: 'array', items: { type: 'string' } } },
        required: ['args'],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  if (req.params.name !== 'run_command') throw new Error(`unknown tool: ${req.params.name}`);
  const args = (req.params.arguments as { args: string[] }).args;
  // rule 4: resolve the binary bundled-first (before PATH)
  const binary = findBinary(args[0]);
  // rules 1,2,3: stdin ignored, stdout captured (not leaked to the server's stdout), env sanitized
  const result = await runChild(binary, args.slice(1), { timeoutMs: 30_000 });
  if (result.code !== 0) {
    log(`run_command: ${args[0]} exited ${result.code}: ${result.stderr.slice(0, 200)}`);
  }
  // child stdout returned as a structured tool RESULT -- never written to stdout (rule 1)
  return { content: [{ type: 'text', text: result.stdout }] };
});

const transport = new StdioServerTransport();
await server.connect(transport);

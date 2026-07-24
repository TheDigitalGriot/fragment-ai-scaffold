"""Example local stdio MCP server for {{PROJECT_NAME}}, wired with no-orphan stdio hygiene by
default. Replace the example `run_command` tool with your real tools -- keep the hygiene helpers.

stdout is owned by the MCP stdio transport for JSON-RPC (rule 1). Do NOT print() to stdout
anywhere in this process; use `_hygiene.log()` (stderr) for diagnostics.
"""
from __future__ import annotations

import asyncio

from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import TextContent, Tool

from _hygiene import find_binary, log, run_child

server = Server("{{PROJECT_NAME}}-mcp")


@server.list_tools()
async def list_tools() -> list[Tool]:
    return [
        Tool(
            name="run_command",
            description="Run a helper binary with full stdio hygiene and return its stdout.",
            inputSchema={
                "type": "object",
                "properties": {
                    "args": {"type": "array", "items": {"type": "string"}}
                },
                "required": ["args"],
            },
        )
    ]


@server.call_tool()
async def call_tool(name: str, arguments: dict) -> list[TextContent]:
    if name != "run_command":
        raise ValueError(f"unknown tool: {name}")
    args = arguments["args"]
    # rule 4: resolve the binary interpreter-first (bundled/venv before PATH)
    binary = find_binary(args[0])
    # rules 1,2,3: stdin=DEVNULL, stdout captured (not leaked to the server's stdout), env sanitized
    proc = await asyncio.to_thread(run_child, [binary, *args[1:]], timeout=30)
    if proc.returncode != 0:
        log(f"run_command: {args[0]} exited {proc.returncode}: {proc.stderr[:200]}")
    # child stdout returned as a structured tool RESULT -- never printed to stdout (rule 1)
    return [TextContent(type="text", text=proc.stdout)]


async def main() -> None:
    async with stdio_server() as (read, write):
        await server.run(read, write, server.create_initialization_options())


if __name__ == "__main__":
    asyncio.run(main())

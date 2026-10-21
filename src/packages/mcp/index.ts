import * as readline from 'readline';
import {
  ZapTrailMcpServer,
  createMcpServer,
  MCP_TOOLS,
  McpServerOptions,
} from './server';

export {
  ZapTrailMcpServer,
  createMcpServer,
  MCP_TOOLS,
};
export type { McpServerOptions };

/**
 * Runs the ZapTrail MCP server using line-delimited JSON-RPC over stdio streams.
 *
 * @param server ZapTrailMcpServer instance to handle requests
 * @param input Readable stream (defaults to process.stdin)
 * @param output Writable stream (defaults to process.stdout)
 * @returns A teardown function to close the readline interface and stop processing
 */
export function runMcpStdio(
  server: ZapTrailMcpServer,
  input: NodeJS.ReadableStream = process.stdin,
  output: NodeJS.WritableStream = process.stdout
): () => void {
  const rl = readline.createInterface({
    input,
    output: undefined,
    terminal: false,
    crlfDelay: Infinity,
  });

  const onLine = async (line: string): Promise<void> => {
    const trimmed = line.trim();
    if (!trimmed) {
      return;
    }

    try {
      const response = await server.handleMessage(trimmed);
      if (response !== null && response !== undefined) {
        output.write(JSON.stringify(response) + '\n');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      const internalError = {
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32603,
          message: `Internal error: ${errorMessage}`,
        },
      };
      output.write(JSON.stringify(internalError) + '\n');
    }
  };

  rl.on('line', onLine);

  return () => {
    rl.removeListener('line', onLine);
    rl.close();
  };
}

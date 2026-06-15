// E2E channel check: teina sends → balla reads → balla marks read.
// Usage: MCP_URL=... SMOKE_TEINA=... SMOKE_BALLA=... bun run scripts/mcp-channel-check.ts
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const MCP_URL = process.env.MCP_URL!;
async function conn(token: string) {
  const tr = new StreamableHTTPClientTransport(new URL(MCP_URL), { requestInit: { headers: { Authorization: `Bearer ${token}` } } });
  const c = new Client({ name: "chan", version: "1.0.0" });
  await c.connect(tr);
  return c;
}
const txt = (r: { content: unknown }) => ((r.content as Array<{ text?: string }>)[0]?.text ?? "");

const teina = await conn(process.env.SMOKE_TEINA!);
const sent = await teina.callTool({ name: "message_send", arguments: { to: "balla", text: "Canal MCP opérationnel — test E2E" } });
console.log("SENT:", txt(sent));
const mid = JSON.parse(txt(sent)).id;
await teina.close();

const balla = await conn(process.env.SMOKE_BALLA!);
const ib = await balla.callTool({ name: "inbox", arguments: { unread_only: true } });
console.log("BALLA INBOX has msg:", txt(ib).includes("Canal MCP opérationnel"));
const mr = await balla.callTool({ name: "message_mark_read", arguments: { id: mid } });
console.log("MARK_READ:", txt(mr));
await balla.close();
console.log("CHANNEL OK");
process.exit(0);

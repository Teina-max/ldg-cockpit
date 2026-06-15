// Calls email_report on the MCP to verify the email path.
// Usage: MCP_URL=... SMOKE_TEINA=... bun run scripts/mcp-email-check.ts [to]
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const MCP_URL = process.env.MCP_URL!;
const to = process.argv[2] ?? "teina";
const tr = new StreamableHTTPClientTransport(new URL(MCP_URL), { requestInit: { headers: { Authorization: `Bearer ${process.env.SMOKE_TEINA}` } } });
const c = new Client({ name: "email-check", version: "1.0.0" });
await c.connect(tr);
const r = await c.callTool({ name: "email_report", arguments: { to } });
console.log("EMAIL_REPORT:", JSON.stringify((r.content as Array<{ text?: string }>)[0]?.text));
console.log("isError:", r.isError === true);
await c.close();
process.exit(0);

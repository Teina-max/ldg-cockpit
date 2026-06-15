// Local E2E smoke for the MCP server using a real MCP client.
// Usage: MCP_URL=http://localhost:3001/mcp bun run scripts/mcp-smoke.ts
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const MCP_URL = process.env.MCP_URL ?? "http://localhost:3001/mcp";

async function connect(token: string) {
  const transport = new StreamableHTTPClientTransport(new URL(MCP_URL), {
    requestInit: { headers: { Authorization: `Bearer ${token}` } },
  });
  const client = new Client({ name: "smoke", version: "1.0.0" });
  await client.connect(transport);
  return client;
}

async function main() {
  const teina = await connect("tk-teina");
  const tools = await teina.listTools();
  console.log("TOOLS:", tools.tools.map((t) => t.name).join(", "));
  const who = await teina.callTool({ name: "whoami", arguments: {} });
  console.log("WHOAMI:", JSON.stringify(who.content));
  const list = await teina.callTool({ name: "projects_list", arguments: {} });
  const txt = (list.content as Array<{ text?: string }>)[0]?.text ?? "";
  console.log("PROJECTS_LIST has ILLIG:", txt.includes("ILLIG France"));
  await teina.close();

  const balla = await connect("tk-balla");
  const upd = await balla.callTool({ name: "project_update", arguments: { slug: "illig-france", bloquant: "x" } });
  console.log("BALLA project_update isError:", upd.isError === true, "|", JSON.stringify(upd.content).slice(0, 140));
  await balla.close();

  console.log("SMOKE DONE");
  process.exit(0);
}
main().catch((e) => {
  console.error("SMOKE FAIL", e);
  process.exit(1);
});

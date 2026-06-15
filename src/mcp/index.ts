import { createApp } from "./http";

const port = Number(process.env.PORT ?? 3000);
createApp().listen(port, "0.0.0.0", () => {
  console.log(`LDG Cockpit MCP listening on :${port}`);
});

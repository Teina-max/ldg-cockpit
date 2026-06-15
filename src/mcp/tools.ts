import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { Identity } from "./auth";
import { assertRole } from "./guards";
import * as data from "./data";

const ok = (obj: unknown) => ({ content: [{ type: "text" as const, text: JSON.stringify(obj, null, 2) }] });

export function registerTools(server: McpServer, id: Identity) {
  server.registerTool("whoami", { description: "Qui suis-je (identité + rôle)" },
    async () => ok(id));

  server.registerTool("projects_list", { description: "Liste tous les projets LDG (statut, bloquant, avancement)" },
    async () => ok(await data.listProjects()));

  server.registerTool("project_get", { description: "Détail d'un projet + ses tâches", inputSchema: { slug: z.string() } },
    async ({ slug }) => ok(await data.getProject(slug)));

  server.registerTool("inputs_pending", { description: "Inputs/tâches en attente (optionnel: un projet)", inputSchema: { project: z.string().optional() } },
    async ({ project }) => ok(await data.pendingInputs(project)));

  server.registerTool("search", { description: "Recherche texte sur projets et tâches", inputSchema: { query: z.string() } },
    async ({ query }) => ok(await data.search(query)));

  server.registerTool("project_update", {
    description: "Met à jour un projet (réservé à Teina)",
    inputSchema: { slug: z.string(), phase: z.string().optional(), avancement: z.string().optional(), bloquant: z.string().optional(), statutDetail: z.string().optional(), nextActionTeina: z.string().optional() },
  }, async ({ slug, ...patch }) => { assertRole(id.role, "teina"); return ok(await data.updateProject(slug, patch)); });

  server.registerTool("task_add", {
    description: "Ajoute une tâche pour Balla (réservé à Teina)",
    inputSchema: { project: z.string(), title: z.string(), detail: z.string().optional(), leveBloquant: z.boolean().optional() },
  }, async ({ project, title, detail, leveBloquant }) => { assertRole(id.role, "teina"); return ok({ taskId: await data.addTask(project, title, detail ?? "", leveBloquant ?? false) }); });

  server.registerTool("task_complete", {
    description: "Marque une tâche comme faite (réservé à Balla)",
    inputSchema: { task_id: z.number() },
  }, async ({ task_id }) => { assertRole(id.role, "balla"); return ok({ done: await data.completeTask(task_id) }); });

  server.registerTool("message_send", {
    description: "Envoie un message à l'autre agent (teina|balla)",
    inputSchema: { to: z.enum(["teina", "balla"]), text: z.string(), project: z.string().optional() },
  }, async ({ to, text, project }) => ok({ id: await data.sendMessage(id.user, to, text, project) }));

  server.registerTool("inbox", { description: "Mes messages reçus", inputSchema: { unread_only: z.boolean().optional() } },
    async ({ unread_only }) => ok(await data.inbox(id.user, unread_only ?? false)));

  server.registerTool("message_mark_read", { description: "Marque un message comme lu", inputSchema: { id: z.number() } },
    async ({ id: mid }) => { await data.markRead(mid, id.user); return ok({ marked: mid }); });
}

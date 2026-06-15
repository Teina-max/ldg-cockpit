import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { Identity } from "./auth";
import { assertRole } from "./guards";
import * as data from "./data";

const ok = (obj: unknown) => ({ content: [{ type: "text" as const, text: JSON.stringify(obj, null, 2) }] });
const slug = z.string().max(120);
const shortText = z.string().max(2000);

export function registerTools(server: McpServer, id: Identity) {
  server.registerTool("whoami", { description: "Qui suis-je (identité + rôle)" },
    async () => ok(id));

  server.registerTool("projects_list", { description: "Liste tous les projets LDG (statut, bloquant, avancement)" },
    async () => ok(await data.listProjects()));

  server.registerTool("project_get", { description: "Détail d'un projet + ses tâches", inputSchema: { slug } },
    async ({ slug }) => ok(await data.getProject(slug)));

  server.registerTool("inputs_pending", { description: "Inputs/tâches en attente (optionnel: un projet)", inputSchema: { project: slug.optional() } },
    async ({ project }) => ok(await data.pendingInputs(project)));

  server.registerTool("search", { description: "Recherche texte sur projets et tâches", inputSchema: { query: z.string().max(200) } },
    async ({ query }) => ok(await data.search(query)));

  server.registerTool("project_update", {
    description: "Met à jour un projet (réservé à Teina)",
    inputSchema: { slug, phase: shortText.optional(), avancement: shortText.optional(), bloquant: shortText.optional(), statutDetail: z.string().max(8000).optional(), nextActionTeina: shortText.optional() },
  }, async ({ slug, ...patch }) => { assertRole(id.role, "teina"); return ok(await data.updateProject(slug, patch)); });

  server.registerTool("task_add", {
    description: "Ajoute une tâche pour Balla (réservé à Teina)",
    inputSchema: { project: slug, title: z.string().max(300), detail: z.string().max(4000).optional(), leveBloquant: z.boolean().optional() },
  }, async ({ project, title, detail, leveBloquant }) => { assertRole(id.role, "teina"); return ok({ taskId: await data.addTask(project, title, detail ?? "", leveBloquant ?? false) }); });

  server.registerTool("task_complete", {
    description: "Marque une tâche comme faite (réservé à Balla)",
    inputSchema: { task_id: z.number().int().positive() },
  }, async ({ task_id }) => { assertRole(id.role, "balla"); return ok({ done: await data.completeTask(task_id) }); });

  server.registerTool("message_send", {
    description: "Envoie un message à l'autre agent (teina|balla)",
    inputSchema: { to: z.enum(["teina", "balla"]), text: z.string().max(4000), project: slug.optional() },
  }, async ({ to, text, project }) => ok({ id: await data.sendMessage(id.user, to, text, project) }));

  server.registerTool("inbox", { description: "Mes messages reçus", inputSchema: { unread_only: z.boolean().optional() } },
    async ({ unread_only }) => ok(await data.inbox(id.user, unread_only ?? false)));

  server.registerTool("message_mark_read", { description: "Marque un message comme lu", inputSchema: { id: z.number().int().positive() } },
    async ({ id: mid }) => ok({ marked: await data.markRead(mid, id.user) }));
}

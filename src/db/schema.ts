import { pgTable, text, timestamp, boolean, serial, integer, pgEnum } from "drizzle-orm/pg-core";

export const groupEnum = pgEnum("group", ["prod", "build", "cadrage"]);
export const ownerEnum = pgEnum("owner", ["teina", "balla"]);
export const originEnum = pgEnum("origin", ["input_client", "ad_hoc"]);
export const taskStatusEnum = pgEnum("task_status", ["todo", "done"]);

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  nom: text("nom").notNull(),
  client: text("client").notNull().default(""),
  via: text("via").notNull().default("LDG / La Dinguerie"),
  group: groupEnum("group").notNull().default("build"),
  phase: text("phase").notNull().default(""),
  avancement: text("avancement").notNull().default(""),
  bloquant: text("bloquant").notNull().default(""),
  statutDetail: text("statut_detail").notNull().default(""),
  nextActionTeina: text("next_action_teina").notNull().default(""),
  lastUpdate: timestamp("last_update").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  owner: ownerEnum("owner").notNull().default("balla"),
  title: text("title").notNull(),
  detail: text("detail").notNull().default(""),
  origin: originEnum("origin").notNull().default("ad_hoc"),
  status: taskStatusEnum("status").notNull().default("todo"),
  quiFournit: text("qui_fournit").notNull().default(""),
  depuis: text("depuis").notNull().default(""),
  relanceLe: text("relance_le").notNull().default(""),
  leveBloquant: boolean("leve_bloquant").notNull().default(false),
  doneAt: timestamp("done_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }),
  taskId: integer("task_id").references(() => tasks.id, { onDelete: "set null" }),
  type: text("type").notNull(),
  actor: ownerEnum("actor").notNull(),
  summary: text("summary").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// --- Better Auth tables ---
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  password: text("password"),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

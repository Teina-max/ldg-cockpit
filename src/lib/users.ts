// Cockpit identities (the "who") and their MCP permission level (the "what").
// Identity is stored in DB (tasks.owner, events.actor, messages.from/toUser) via the `owner` enum.
// Role is derived, not stored: Teina edits, every collaborator is a member.
export type User = "teina" | "balla" | "younes";
export type Role = "editor" | "member";

export const USERS: readonly User[] = ["teina", "balla", "younes"];

export function roleForUser(u: User): Role {
  return u === "teina" ? "editor" : "member";
}

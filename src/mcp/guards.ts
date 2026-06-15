import type { Role } from "../lib/users";

export class RoleError extends Error {
  constructor(required: string) {
    super(`Action réservée au rôle « ${required} »`);
    this.name = "RoleError";
  }
}

export function assertRole(actual: Role, required: Role): void {
  if (actual !== required) throw new RoleError(required);
}

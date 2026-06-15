export class RoleError extends Error {
  constructor(required: string) {
    super(`Action réservée au rôle « ${required} »`);
    this.name = "RoleError";
  }
}

export function assertRole(actual: "teina" | "balla", required: "teina" | "balla"): void {
  if (actual !== required) throw new RoleError(required);
}

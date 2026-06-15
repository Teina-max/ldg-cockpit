// Teina is the editor; everyone else is read + own-tasks PM (Balla).
export function roleFor(email: string | undefined | null): "teina" | "balla" {
  const teinaEmail = process.env.TEINA_EMAIL ?? "teinateinauri@gmail.com";
  return email && email.toLowerCase() === teinaEmail.toLowerCase() ? "teina" : "balla";
}

// Only the two known users may access the app (defense-in-depth alongside disableSignUp).
export function isAllowed(email: string | undefined | null): boolean {
  if (!email) return false;
  const e = email.toLowerCase();
  const teina = (process.env.TEINA_EMAIL ?? "teinateinauri@gmail.com").toLowerCase();
  const balla = (process.env.BALLA_EMAIL ?? "").toLowerCase();
  return e === teina || (balla.length > 0 && e === balla);
}

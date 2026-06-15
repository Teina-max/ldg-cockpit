// Teina is the editor; everyone else is read + own-tasks PM (Balla).
export function roleFor(email: string | undefined | null): "teina" | "balla" {
  const teinaEmail = process.env.TEINA_EMAIL ?? "teinateinauri@gmail.com";
  return email && email.toLowerCase() === teinaEmail.toLowerCase() ? "teina" : "balla";
}

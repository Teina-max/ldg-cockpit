// One-off user creation (signup is disabled on the main auth instance).
// Usage: bun run scripts/create-user.ts <email> <password> [name]
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../src/db";
import { user, session, account, verification } from "../src/db/schema";

const [email, password, name] = process.argv.slice(2);
if (!email || !password) {
  console.error("usage: bun run scripts/create-user.ts <email> <password> [name]");
  process.exit(1);
}

const seedAuth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema: { user, session, account, verification } }),
  emailAndPassword: { enabled: true }, // signup enabled here for seeding only
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
});

await seedAuth.api.signUpEmail({ body: { email, password, name: name ?? email } });
console.log("user created:", email);
process.exit(0);

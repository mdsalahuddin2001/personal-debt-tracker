import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { admin } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";

// Origins allowed to make auth requests. The app's own base URL is trusted by
// default; we add the production domain and localhost explicitly so the CSRF
// origin check passes in every environment. Extra origins can be supplied via
// the comma-separated BETTER_AUTH_TRUSTED_ORIGINS env var.
const trustedOrigins = [
  "http://localhost:3000",
  "https://ledger.mdsalahuddin.dev",
  ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",")
    .map((o) => o.trim())
    .filter(Boolean) ?? []),
];

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins,
  database: mongodbAdapter(db),
  emailAndPassword: {
    enabled: true,
    // Public self-service signup is disabled. Admins are provisioned via the
    // seed script (`npm run seed`).
    disableSignUp: true,
  },
  plugins: [
    admin({
      // Only the admin role exists for now.
      defaultRole: "admin",
      adminRoles: ["admin"],
    }),
    // nextCookies must be the last plugin in the array.
    nextCookies(),
  ],
});

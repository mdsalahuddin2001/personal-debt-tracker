import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { admin } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";

export const auth = betterAuth({
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

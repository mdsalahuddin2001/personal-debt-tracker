import "dotenv/config";
import { auth } from "@/lib/auth";
import { client } from "@/lib/db";

async function seed() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME || "Admin";

  if (!email || !password) {
    throw new Error(
      "Missing SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD environment variables."
    );
  }

  // Access the internal Better Auth context for low-level adapter operations.
  const ctx = await auth.$context;
  const hashedPassword = await ctx.password.hash(password);

  const existing = await ctx.internalAdapter.findUserByEmail(email);

  if (existing) {
    // Update the existing admin's password (idempotent re-seed).
    await ctx.internalAdapter.updatePassword(existing.user.id, hashedPassword);
    console.log(`✓ Admin already exists — password reset for ${email}`);
  } else {
    const user = await ctx.internalAdapter.createUser({
      email: email.toLowerCase(),
      name,
      role: "admin",
      emailVerified: true,
    });

    await ctx.internalAdapter.linkAccount({
      accountId: user.id,
      providerId: "credential",
      userId: user.id,
      password: hashedPassword,
    });

    console.log(`✓ Created admin user: ${email}`);
  }
}

seed()
  .catch((err) => {
    console.error("✗ Seed failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await client.close();
  });

/**
 * Creates (or resets) an admin user.
 *
 * There is no signup path that can grant ADMIN — `role` is only ever read, in
 * require-auth.ts — so the first admin in a new market's database has to be
 * seeded. This script is that step, kept repeatable because every new market
 * needs it and because it doubles as a password reset.
 *
 *   DATABASE_URL="postgres://…" npm run create-admin -w apps/api -- \
 *     --email admin@example.com --password 'secret' [--first Admin] [--last User]
 *
 * Re-running against an existing email updates that user's password and
 * promotes them to ADMIN rather than failing, so a forgotten admin password is
 * recoverable without hand-written SQL.
 *
 * Deliberately talks to Prisma directly rather than importing src/config/env,
 * which would demand MARKET and every other deployment variable just to hash a
 * password.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

/** Must match PASSWORD_HASH_ROUNDS in src/modules/auth/router.ts. */
const PASSWORD_HASH_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 8;

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? undefined : process.argv[i + 1];
}

function fail(message: string): never {
  console.error(`\n  ✗ ${message}\n`);
  process.exit(1);
}

async function main(): Promise<void> {
  const email = arg("email");
  const password = arg("password");
  const firstName = arg("first") ?? "Admin";
  const lastName = arg("last") ?? "User";

  if (!process.env.DATABASE_URL) fail("DATABASE_URL is not set.");
  if (!email || !password) {
    fail("Usage: --email <address> --password <password> [--first X] [--last Y]");
  }
  // The login route looks the email up with an exact match, so a stray capital
  // here becomes an account nobody can sign in to.
  if (email !== email.trim().toLowerCase()) {
    fail(`Use the email exactly as it will be typed at login: ${email.trim().toLowerCase()}`);
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    fail(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }

  const prisma = new PrismaClient();
  try {
    const host = new URL(process.env.DATABASE_URL).host;
    const passwordHash = await bcrypt.hash(password, PASSWORD_HASH_ROUNDS);
    const existing = await prisma.user.findUnique({ where: { email } });

    const user = await prisma.user.upsert({
      where: { email },
      update: { passwordHash, role: "ADMIN" },
      create: { email, passwordHash, firstName, lastName, role: "ADMIN" },
    });

    console.log(`\n  ✓ ${existing ? "Updated" : "Created"} admin ${user.email}`);
    console.log(`    id    ${user.id}`);
    console.log(`    role  ${user.role}`);
    console.log(`    db    ${host}\n`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => fail(err instanceof Error ? err.message : String(err)));

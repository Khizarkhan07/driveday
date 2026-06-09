import crypto from "crypto";
import { prisma } from "../../db/client";

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days
export const SESSION_COOKIE_NAME = "motorcover_session";

export async function createSession(userId: string): Promise<{ token: string; expiresAt: Date }> {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  // We store a hash of the token, not the token itself — mirrors how a real
  // system would avoid persisting bearer credentials in plaintext.
  const tokenHash = hashToken(token);

  await prisma.session.create({
    data: { id: tokenHash, userId, expiresAt },
  });

  return { token, expiresAt };
}

export async function getUserIdForSessionToken(token: string): Promise<string | null> {
  const tokenHash = hashToken(token);
  const session = await prisma.session.findUnique({ where: { id: tokenHash } });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }
  return session.userId;
}

export async function destroySessionByToken(token: string): Promise<void> {
  const tokenHash = hashToken(token);
  await prisma.session.deleteMany({ where: { id: tokenHash } });
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

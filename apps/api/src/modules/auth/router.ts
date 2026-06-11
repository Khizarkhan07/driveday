import bcrypt from "bcryptjs";
import { Router } from "express";
import { loginRequestSchema, signupRequestSchema } from "@motorcover/shared-types";
import { prisma, logEvent } from "../../db/client";
import { env } from "../../config/env";
import { requireAuth } from "../../middleware/require-auth";
import { createSession, destroySessionByToken, SESSION_COOKIE_NAME } from "./sessions";
import { getEmailProvider } from "../../providers/email/factory";
import { renderSignupConfirmationEmail } from "../email/templates";

export const authRouter = Router();

const PASSWORD_HASH_ROUNDS = 10;
const isProduction = env.nodeEnv === "production";

function setSessionCookie(res: import("express").Response, token: string, expiresAt: Date) {
  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    expires: expiresAt,
    path: "/",
  });
}

authRouter.post("/signup", async (req, res) => {
  const parsed = signupRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
  }
  const { email, password, firstName, lastName } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: "An account with that email already exists" });
  }

  const passwordHash = await bcrypt.hash(password, PASSWORD_HASH_ROUNDS);
  const user = await prisma.user.create({
    data: { email, passwordHash, firstName, lastName },
  });
  await logEvent("User", user.id, "user.signed_up");

  const { token, expiresAt } = await createSession(user.id);
  setSessionCookie(res, token, expiresAt);

  // Best-effort welcome email — failure here must never block account creation.
  try {
    await getEmailProvider().send({
      to: user.email,
      subject: "Welcome to Day Drive",
      html: renderSignupConfirmationEmail({ firstName: user.firstName }),
    });
    await logEvent("User", user.id, "email.sent", { template: "signup_confirmation" });
  } catch (err) {
    await logEvent("User", user.id, "email.failed", {
      template: "signup_confirmation",
      error: err instanceof Error ? err.message : String(err),
    });
  }

  return res.status(201).json({
    token,
    user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
  });
});

authRouter.post("/login", async (req, res) => {
  const parsed = loginRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input" });
  }
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const { token, expiresAt } = await createSession(user.id);
  setSessionCookie(res, token, expiresAt);
  await logEvent("User", user.id, "user.logged_in");

  return res.json({
    token,
    user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
  });
});

authRouter.post("/logout", async (req, res) => {
  const token = req.cookies?.[SESSION_COOKIE_NAME];
  if (token) {
    await destroySessionByToken(token);
  }
  res.clearCookie(SESSION_COOKIE_NAME, { path: "/" });
  return res.status(204).send();
});

authRouter.get("/me", requireAuth, (req, res) => {
  return res.json({ user: req.user });
});

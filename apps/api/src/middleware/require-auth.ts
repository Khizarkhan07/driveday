import type { NextFunction, Request, Response } from "express";
import { prisma } from "../db/client";
import { getUserIdForSessionToken, SESSION_COOKIE_NAME } from "../modules/auth/sessions";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: { id: string; email: string; firstName: string | null; lastName: string | null; role: string };
    }
  }
}

/** Populates req.user if a valid session cookie is present, but does not block the request. */
export async function attachUser(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = (authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null)
    ?? req.cookies?.[SESSION_COOKIE_NAME];
  if (!token) return next();

  const userId = await getUserIdForSessionToken(token);
  if (!userId) return next();

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user) {
    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };
  }
  next();
}

/** Blocks the request with 401 unless attachUser has already populated req.user. */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

/** Blocks the request with 403 unless the authenticated user has the ADMIN role. */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
}

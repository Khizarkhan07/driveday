// MUST be imported before any router is defined: it patches Express 4 so a
// rejected promise in an async route handler is forwarded to the error
// middleware via `next(err)` instead of becoming an unhandled rejection that
// crashes the whole process (Express 4 does not do this natively — Express 5
// does, but we're not on it yet).
import "express-async-errors";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import pinoHttp from "pino-http";
import { env } from "./config/env";
import { attachUser } from "./middleware/require-auth";
import { authRouter } from "./modules/auth/router";
import { vehicleLookupRouter } from "./modules/vehicle-lookup/router";
import { quoteRouter } from "./modules/quote/router";
import { checkoutRouter } from "./modules/checkout/router";
import { checkoutWebhookRouter } from "./modules/checkout/webhook";
import { portalRouter } from "./modules/portal/router";

export function createApp() {
  const app = express();

  app.use(pinoHttp({ autoLogging: { ignore: (req) => req.url === "/health" } }));
  app.use(
    cors({
      origin: env.appBaseUrl,
      credentials: true,
    })
  );

  // IMPORTANT: the Stripe webhook needs the *raw* request body to verify the
  // signature. It is mounted as its own router, with express.raw() applied
  // ONLY to this path, BEFORE the global express.json() body parser below —
  // once a body parser consumes the request stream, no other parser can read
  // it, so ordering here is load-bearing. Keeping the webhook in its own
  // router (rather than nested inside the main /checkout router, which needs
  // JSON bodies for its other routes) is what makes this ordering simple and
  // hard to break by accident later.
  app.use("/checkout/webhook", express.raw({ type: "application/json" }), checkoutWebhookRouter);

  app.use(express.json());
  app.use(cookieParser());
  app.use(attachUser);

  app.get("/health", (_req, res) => res.json({ ok: true }));

  app.use("/auth", authRouter);
  app.use("/vehicle-lookup", vehicleLookupRouter);
  app.use("/quote", quoteRouter);
  app.use("/checkout", checkoutRouter);
  app.use("/portal", portalRouter);

  app.use((err: unknown, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    req.log?.error({ err }, "Unhandled error");
    res.status(500).json({ error: "Something went wrong" });
  });

  return app;
}

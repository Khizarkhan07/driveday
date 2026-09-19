import type { IncomingMessage, ServerResponse } from "http";
import { createApp } from "../src/app";
import { originalPathFrom } from "../src/vercel-path";

const app = createApp();

/**
 * Vercel routes every request through the catch-all rewrite in vercel.json,
 * which delivers it to this function under this function's own path. Express
 * routes on req.url, so without restoring the caller's path first every
 * endpoint matches nothing and 404s.
 */
export default function handler(req: IncomingMessage, res: ServerResponse) {
  req.url = originalPathFrom(req.url);
  return app(req, res);
}

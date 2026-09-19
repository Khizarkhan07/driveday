/**
 * The path Vercel rewrites every request onto — this function's own route,
 * derived from its file location at api/index.ts.
 */
const FUNCTION_PATH = "/api/index";

/**
 * Recovers the path the caller actually asked for.
 *
 * Vercel's catch-all rewrite sends every request to this function, and the
 * function sees its own path rather than the caller's: a GET of /health
 * arrives as /api/index, which matches no Express route, so every endpoint
 * 404s. The rewrite forwards the original path as a suffix
 * (/api/index/health) and this strips the prefix back off.
 *
 * Left alone when the prefix is absent, so the same handler still works when
 * invoked directly rather than through the rewrite.
 */
export function originalPathFrom(url: string | undefined): string {
  if (!url) return "/";
  if (url !== FUNCTION_PATH && !url.startsWith(`${FUNCTION_PATH}/`) && !url.startsWith(`${FUNCTION_PATH}?`)) {
    return url;
  }

  const rest = url.slice(FUNCTION_PATH.length);
  // "/api/index" and "/api/index/" both mean the root; "?foo=bar" must keep
  // its leading slash or Express reads the query as the path.
  if (rest === "" || rest === "/") return "/";
  if (rest.startsWith("?")) return `/${rest}`;
  return rest;
}

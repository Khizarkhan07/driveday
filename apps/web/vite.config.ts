import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { MARKET_CODES } from "../../packages/shared-types/src/market";

/**
 * Fails the build when VITE_MARKET is missing or unrecognised.
 *
 * The app also validates it at module load, but that happens in the browser:
 * a misconfigured deployment would otherwise build cleanly and serve a blank
 * page. Checking here turns that into a failed deploy, which is what we want.
 */
function requireMarket(mode: string): void {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const market = env.VITE_MARKET?.trim().toLowerCase();
  if (!market || !(MARKET_CODES as readonly string[]).includes(market)) {
    throw new Error(
      `VITE_MARKET must be one of ${MARKET_CODES.join(", ")} — received ${
        env.VITE_MARKET === undefined ? "nothing" : JSON.stringify(env.VITE_MARKET)
      }. Set it on this deployment before building.`
    );
  }
}

export default defineConfig(({ mode }) => {
  requireMarket(mode);
  return {
    plugins: [react()],
    server: {
      port: 5173,
    },
    resolve: {
      alias: {
        "@motorcover/shared-types": path.resolve(__dirname, "../../packages/shared-types/src/index.ts"),
      },
    },
  };
});

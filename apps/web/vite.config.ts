import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";
import { MARKET_CODES } from "../../packages/shared-types/src/market";

/**
 * Fails the build when VITE_MARKET is missing or unrecognised.
 *
 * The app also validates it at module load, but that happens in the browser:
 * a misconfigured deployment would otherwise build cleanly and serve a blank
 * page. Checking here turns that into a failed deploy, which is what we want.
 */
function requireMarket(mode: string): string {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const market = env.VITE_MARKET?.trim().toLowerCase();
  if (!market || !(MARKET_CODES as readonly string[]).includes(market)) {
    throw new Error(
      `VITE_MARKET must be one of ${MARKET_CODES.join(", ")} — received ${
        env.VITE_MARKET === undefined ? "nothing" : JSON.stringify(env.VITE_MARKET)
      }. Set it on this deployment before building.`
    );
  }
  return market;
}

/**
 * Overlays market-specific static files onto the build output.
 *
 * Vite copies `public/` verbatim, so nothing in the app can reach those files
 * — they are plain HTML served as-is. Anything in `market/<code>/` replaces
 * the file of the same name in the output, which is how the Irish legal pages
 * carry an Irish address. Keeping them as whole files rather than substituting
 * tokens means the two markets' pages can diverge later, as they will once the
 * Irish regulator and governing-law wording is supplied.
 */
function marketStaticOverlay(market: string) {
  return {
    name: "market-static-overlay",
    closeBundle() {
      const from = path.resolve(__dirname, "market", market);
      if (!fs.existsSync(from)) return;
      const to = path.resolve(__dirname, "dist");
      for (const entry of fs.readdirSync(from)) {
        fs.copyFileSync(path.join(from, entry), path.join(to, entry));
        console.log(`  market overlay: ${market}/${entry}`);
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  const market = requireMarket(mode);
  return {
    plugins: [react(), marketStaticOverlay(market)],
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

import { createApp } from "./app";
import { env } from "./config/env";

const app = createApp();

app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(
    `[Day Drive API] listening on http://localhost:${env.port} ` +
      `(vehicle lookup provider: ${env.vehicleLookupProvider}, document storage: ${env.documentStorage})`
  );
});

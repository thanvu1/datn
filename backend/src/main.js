import { config } from "./config/index.js";

await app.listen({ port: config.port, host: "0.0.0.0" });

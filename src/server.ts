import { buildApp } from "./app.js";

const app = await buildApp();

const port = Number(process.env.PORT ?? 3333);
const host = process.env.HOST ?? "0.0.0.0";

await app.listen({ port, host });
console.log(`TripSync API http://${host}:${port} — docs at /docs`);

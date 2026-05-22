import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import Fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { AppError, sendError } from "./lib/errors.js";
import { bookingRoutes } from "./routes/bookings.js";
import { healthRoutes } from "./routes/health.js";
import { providerRoutes } from "./routes/providers.js";
import { syncJobRoutes } from "./routes/sync-jobs.js";
import { webhookRoutes } from "./routes/webhooks.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const openApiPath = join(
  __dirname,
  "../../trip-sync-contracts/docs/openapi/openapi.json",
);
const openApiSpec = JSON.parse(readFileSync(openApiPath, "utf-8"));

const app = Fastify({
  logger: true,
  requestIdHeader: "x-correlation-id",
  genReqId: () => crypto.randomUUID(),
}).withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

await app.register(cors, { origin: true });

await app.register(swagger, { openapi: openApiSpec });
await app.register(swaggerUi, {
  routePrefix: "/docs",
  staticCSP: true,
});

await app.register(healthRoutes);
await app.register(bookingRoutes);
await app.register(providerRoutes);
await app.register(syncJobRoutes);
await app.register(webhookRoutes);

app.setErrorHandler((error, req, reply) => {
  if (error instanceof AppError) {
    return sendError(
      reply,
      error.statusCode,
      error.code,
      error.message,
      req.id,
    );
  }
  req.log.error(error);
  return sendError(reply, 500, "INTERNAL_ERROR", "Internal server error", req.id);
});

const port = Number(process.env.PORT ?? 3333);
const host = process.env.HOST ?? "0.0.0.0";

await app.listen({ port, host });
console.log(`TripSync API http://${host}:${port} — docs at /docs`);

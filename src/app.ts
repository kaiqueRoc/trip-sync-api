import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
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

const require = createRequire(import.meta.url);
const openApiPath = require.resolve("@trip-sync/contracts/openapi.json");
const openApiSpec = JSON.parse(readFileSync(openApiPath, "utf-8"));

export async function buildApp() {
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

  return app;
}

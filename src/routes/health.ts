import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { HealthResponseSchema } from "@trip-sync/contracts";

const startTime = Date.now();

export const healthRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/health",
    {
      schema: {
        tags: ["System"],
        response: { 200: HealthResponseSchema },
      },
    },
    async () => ({
      status: "ok" as const,
      version: "1.0.0",
      uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
      checks: {
        database: "up" as const,
        redis: "skipped" as const,
      },
    }),
  );
};

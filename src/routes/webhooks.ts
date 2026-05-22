import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import {
  ApiErrorSchema,
  ProviderWebhookPayloadSchema,
} from "@trip-sync/contracts";
import { AppError, sendError } from "../lib/errors.js";
import * as webhookService from "../services/webhook.service.js";

export const webhookRoutes: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/webhooks/provider",
    {
      schema: {
        tags: ["Webhooks"],
        body: ProviderWebhookPayloadSchema,
        response: {
          200: z.object({ ok: z.boolean() }),
          409: ApiErrorSchema,
        },
      },
    },
    async (req, reply) => {
      const idempotencyKey = req.headers["x-idempotency-key"];
      if (typeof idempotencyKey !== "string" || !idempotencyKey) {
        throw new AppError(
          400,
          "VALIDATION_ERROR",
          "Header x-idempotency-key is required",
        );
      }
      const result = await webhookService.handleProviderWebhook(
        req.body,
        idempotencyKey,
      );
      return reply.send(result);
    },
  );
};

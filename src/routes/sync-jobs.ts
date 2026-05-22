import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import {
  ApiErrorSchema,
  CreateSyncJobInputSchema,
  SyncJobListQuerySchema,
  SyncJobResponseSchema,
} from "@trip-sync/contracts";
import * as syncService from "../services/sync.service.js";

export const syncJobRoutes: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/sync-jobs",
    {
      schema: {
        tags: ["Sync"],
        body: CreateSyncJobInputSchema,
        response: { 202: SyncJobResponseSchema, 404: ApiErrorSchema },
      },
    },
    async (req, reply) => {
      const job = await syncService.createSyncJob(req.body);
      return reply.status(202).send(job);
    },
  );

  app.get(
    "/sync-jobs",
    {
      schema: {
        tags: ["Sync"],
        querystring: SyncJobListQuerySchema,
        response: {
          200: z.array(SyncJobResponseSchema),
        },
      },
    },
    async (req) => syncService.listSyncJobs(req.query),
  );
};

import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import {
  ApiErrorSchema,
  CreateProviderInputSchema,
  ProviderIdParamSchema,
  ProviderListResponseSchema,
  ProviderResponseSchema,
} from "@trip-sync/contracts";
import * as providerService from "../services/provider.service.js";

export const providerRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/providers",
    {
      schema: {
        tags: ["Providers"],
        response: { 200: ProviderListResponseSchema },
      },
    },
    async () => providerService.listProviders(),
  );

  app.post(
    "/providers",
    {
      schema: {
        tags: ["Providers"],
        body: CreateProviderInputSchema,
        response: { 201: ProviderResponseSchema, 409: ApiErrorSchema },
      },
    },
    async (req, reply) => {
      const provider = await providerService.createProvider(req.body);
      return reply.status(201).send(provider);
    },
  );

  app.get(
    "/providers/:id",
    {
      schema: {
        tags: ["Providers"],
        params: ProviderIdParamSchema,
        response: { 200: ProviderResponseSchema, 404: ApiErrorSchema },
      },
    },
    async (req) => providerService.getProviderById(req.params.id),
  );
};

import type { CreateProviderInput } from "@trip-sync/contracts";
import { AppError } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";
import { toProviderResponse } from "../lib/mappers.js";

export async function listProviders() {
  const rows = await prisma.provider.findMany({ orderBy: { name: "asc" } });
  return { data: rows.map(toProviderResponse) };
}

export async function getProviderById(id: string) {
  const provider = await prisma.provider.findUnique({ where: { id } });
  if (!provider) {
    throw new AppError(404, "NOT_FOUND", `Provider ${id} not found`);
  }
  return toProviderResponse(provider);
}

export async function createProvider(input: CreateProviderInput) {
  try {
    const provider = await prisma.provider.create({
      data: {
        name: input.name,
        slug: input.slug,
        integrationType: input.integrationType,
        baseUrl: input.baseUrl ?? null,
        active: input.active ?? true,
        lastHealthStatus: "UNKNOWN",
      },
    });
    return toProviderResponse(provider);
  } catch {
    throw new AppError(409, "CONFLICT", "Provider slug already exists");
  }
}

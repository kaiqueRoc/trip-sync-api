import type { CreateSyncJobInput, SyncJobListQuery } from "@trip-sync/contracts";
import { AppError } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";
import { toSyncJobResponse } from "../lib/mappers.js";

export async function createSyncJob(input: CreateSyncJobInput) {
  const [booking, provider] = await Promise.all([
    prisma.booking.findUnique({ where: { id: input.bookingId } }),
    prisma.provider.findUnique({ where: { id: input.providerId } }),
  ]);

  if (!booking) {
    throw new AppError(404, "NOT_FOUND", "Booking not found");
  }
  if (!provider) {
    throw new AppError(404, "NOT_FOUND", "Provider not found");
  }
  if (!provider.active) {
    throw new AppError(409, "CONFLICT", "Provider is inactive");
  }

  const job = await prisma.syncJob.create({
    data: {
      bookingId: input.bookingId,
      providerId: input.providerId,
      status: "QUEUED",
    },
  });

  // Simulate async completion (portfolio demo)
  void processSyncJob(job.id);

  return toSyncJobResponse(job);
}

async function processSyncJob(jobId: string) {
  await prisma.syncJob.update({
    where: { id: jobId },
    data: { status: "RUNNING", attempts: { increment: 1 } },
  });

  await new Promise((r) => setTimeout(r, 800));

  await prisma.syncJob.update({
    where: { id: jobId },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
      lastError: null,
    },
  });
}

export async function listSyncJobs(query: SyncJobListQuery) {
  const rows = await prisma.syncJob.findMany({
    where: {
      ...(query.status ? { status: query.status } : {}),
      ...(query.bookingId ? { bookingId: query.bookingId } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: query.pageSize,
    skip: (query.page - 1) * query.pageSize,
  });
  return rows.map(toSyncJobResponse);
}

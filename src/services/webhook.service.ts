import type { ProviderWebhookPayload } from "@trip-sync/contracts";
import { AppError } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";

export async function handleProviderWebhook(
  payload: ProviderWebhookPayload,
  idempotencyKey: string,
) {
  const existing = await prisma.webhookEvent.findUnique({
    where: { idempotencyKey },
  });
  if (existing) {
    throw new AppError(409, "IDEMPOTENCY_REPLAY", "Webhook already processed");
  }

  const booking = await prisma.booking.findUnique({
    where: { reference: payload.reference },
  });
  if (!booking) {
    throw new AppError(404, "NOT_FOUND", "Booking reference not found");
  }

  await prisma.$transaction([
    prisma.booking.update({
      where: { id: booking.id },
      data: { status: payload.status },
    }),
    prisma.webhookEvent.create({ data: { idempotencyKey } }),
  ]);

  return { ok: true };
}

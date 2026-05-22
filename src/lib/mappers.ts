import type { Booking, Provider, SyncJob } from "@prisma/client";
import type {
  BookingResponse,
  ProviderResponse,
  SyncJobResponse,
} from "@trip-sync/contracts";

export function toBookingResponse(booking: Booking): BookingResponse {
  return {
    id: booking.id,
    reference: booking.reference,
    travelerName: booking.travelerName,
    destination: booking.destination,
    checkIn: booking.checkIn.toISOString(),
    checkOut: booking.checkOut.toISOString(),
    amountCents: booking.amountCents,
    currency: booking.currency,
    status: booking.status,
    providerId: booking.providerId,
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
  };
}

export function toProviderResponse(provider: Provider): ProviderResponse {
  return {
    id: provider.id,
    name: provider.name,
    slug: provider.slug,
    integrationType: provider.integrationType,
    baseUrl: provider.baseUrl,
    active: provider.active,
    lastHealthAt: provider.lastHealthAt?.toISOString() ?? null,
    lastHealthStatus: provider.lastHealthStatus,
    createdAt: provider.createdAt.toISOString(),
  };
}

export function toSyncJobResponse(job: SyncJob): SyncJobResponse {
  return {
    id: job.id,
    bookingId: job.bookingId,
    providerId: job.providerId,
    status: job.status,
    attempts: job.attempts,
    lastError: job.lastError,
    createdAt: job.createdAt.toISOString(),
    completedAt: job.completedAt?.toISOString() ?? null,
  };
}

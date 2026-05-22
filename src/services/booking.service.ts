import type {
  BookingListQuery,
  CreateBookingInput,
  UpdateBookingStatusInput,
} from "@trip-sync/contracts";
import { AppError } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";
import { generateBookingReference } from "../lib/reference.js";
import { toBookingResponse } from "../lib/mappers.js";

export async function listBookings(query: BookingListQuery) {
  const { page, pageSize, status, destination, providerId } = query;
  const where = {
    ...(status ? { status } : {}),
    ...(providerId ? { providerId } : {}),
    ...(destination
      ? { destination: { contains: destination } }
      : {}),
  };

  const [totalItems, rows] = await Promise.all([
    prisma.booking.count({ where }),
    prisma.booking.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  const totalPages = Math.ceil(totalItems / pageSize) || 0;

  return {
    data: rows.map(toBookingResponse),
    meta: {
      page,
      pageSize,
      totalItems,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

export async function getBookingById(id: string) {
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) {
    throw new AppError(404, "NOT_FOUND", `Booking ${id} not found`);
  }
  return toBookingResponse(booking);
}

export async function createBooking(
  input: CreateBookingInput,
  idempotencyKey?: string,
) {
  if (idempotencyKey) {
    const cached = await prisma.idempotencyKey.findUnique({
      where: { key: idempotencyKey },
    });
    if (cached) {
      return JSON.parse(cached.response) as ReturnType<typeof toBookingResponse>;
    }
  }

  if (input.providerId) {
    const provider = await prisma.provider.findUnique({
      where: { id: input.providerId },
    });
    if (!provider) {
      throw new AppError(404, "NOT_FOUND", "Provider not found");
    }
  }

  const booking = await prisma.booking.create({
    data: {
      reference: generateBookingReference(),
      travelerName: input.travelerName,
      destination: input.destination,
      checkIn: new Date(input.checkIn),
      checkOut: new Date(input.checkOut),
      amountCents: input.amountCents,
      currency: input.currency ?? "BRL",
      providerId: input.providerId,
    },
  });

  const response = toBookingResponse(booking);

  if (idempotencyKey) {
    await prisma.idempotencyKey.create({
      data: {
        key: idempotencyKey,
        response: JSON.stringify(response),
      },
    });
  }

  return response;
}

export async function updateBookingStatus(
  id: string,
  input: UpdateBookingStatusInput,
) {
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) {
    throw new AppError(404, "NOT_FOUND", `Booking ${id} not found`);
  }

  const allowed: Record<string, string[]> = {
    PENDING: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["CANCELLED"],
    CANCELLED: [],
  };

  if (!allowed[booking.status]?.includes(input.status)) {
    throw new AppError(
      409,
      "CONFLICT",
      `Cannot transition from ${booking.status} to ${input.status}`,
    );
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: { status: input.status },
  });

  return toBookingResponse(updated);
}

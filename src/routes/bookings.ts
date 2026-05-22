import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import {
  ApiErrorSchema,
  BookingIdParamSchema,
  BookingListQuerySchema,
  BookingListResponseSchema,
  BookingResponseSchema,
  CreateBookingInputSchema,
  UpdateBookingStatusInputSchema,
} from "@trip-sync/contracts";
import * as bookingService from "../services/booking.service.js";

export const bookingRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/bookings",
    {
      schema: {
        tags: ["Bookings"],
        querystring: BookingListQuerySchema,
        response: { 200: BookingListResponseSchema, 500: ApiErrorSchema },
      },
    },
    async (req) => bookingService.listBookings(req.query),
  );

  app.post(
    "/bookings",
    {
      schema: {
        tags: ["Bookings"],
        body: CreateBookingInputSchema,
        response: {
          201: BookingResponseSchema,
          409: ApiErrorSchema,
        },
      },
    },
    async (req, reply) => {
      const key = req.headers["idempotency-key"] as string | undefined;
      const booking = await bookingService.createBooking(req.body, key);
      return reply.status(201).send(booking);
    },
  );

  app.get(
    "/bookings/:id",
    {
      schema: {
        tags: ["Bookings"],
        params: BookingIdParamSchema,
        response: { 200: BookingResponseSchema, 404: ApiErrorSchema },
      },
    },
    async (req) => bookingService.getBookingById(req.params.id),
  );

  app.patch(
    "/bookings/:id/status",
    {
      schema: {
        tags: ["Bookings"],
        params: BookingIdParamSchema,
        body: UpdateBookingStatusInputSchema,
        response: { 200: BookingResponseSchema, 409: ApiErrorSchema },
      },
    },
    async (req) =>
      bookingService.updateBookingStatus(req.params.id, req.body),
  );
};

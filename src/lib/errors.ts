import type { FastifyReply } from "fastify";
import { ApiErrorSchema, type ErrorCode } from "@trip-sync/contracts";

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: ErrorCode,
    message: string,
    public readonly details?: { path?: string; message: string }[],
  ) {
    super(message);
  }
}

export function sendError(
  reply: FastifyReply,
  statusCode: number,
  code: ErrorCode,
  message: string,
  correlationId?: string,
) {
  const body = ApiErrorSchema.parse({
    code,
    message,
    correlationId,
  });
  return reply.status(statusCode).send(body);
}

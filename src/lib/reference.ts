import { randomBytes } from "node:crypto";

export function generateBookingReference(): string {
  const suffix = randomBytes(4).toString("hex").toUpperCase().slice(0, 8);
  return `BK-${suffix}`;
}

import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export async function logEvent(
  entityType: string,
  entityId: string,
  eventType: string,
  payload?: unknown
) {
  await prisma.eventLog.create({
    data: {
      entityType,
      entityId,
      eventType,
      payload: payload === undefined ? undefined : (payload as object),
    },
  });
}

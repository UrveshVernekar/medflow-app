import { db } from "@/lib/db";
import { auditLogs } from "@/lib/db/schema";

export interface LogAuditParams {
  userId?: string | null;
  action: string;
  resource: string;
  resourceId?: string | null;
  details?: string | null;
  ipAddress?: string | null;
}

export async function logAuditAction(params: LogAuditParams) {
  try {
    await db.insert(auditLogs).values({
      userId: params.userId ?? null,
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId ?? null,
      details: params.details ?? null,
      ipAddress: params.ipAddress ?? null,
    });
  } catch (error) {
    console.error("⚠️ Failed to write audit log:", error);
  }
}

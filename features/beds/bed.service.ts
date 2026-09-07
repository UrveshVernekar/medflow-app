import { db } from "@/lib/db";
import { beds } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getAllWardsWithBeds() {
  const wardList = await db.query.wards.findMany({
    with: {
      beds: {
        orderBy: [beds.bedNumber],
        with: {
          assignedPatient: {
            with: {
              user: true,
            },
          },
        },
      },
    },
  });

  return wardList.map((w) => ({
    id: w.id,
    name: w.name,
    wardType: w.wardType,
    totalBeds: w.totalBeds,
    beds: w.beds.map((b) => ({
      id: b.id,
      bedNumber: b.bedNumber,
      status: b.status as "available" | "occupied" | "sanitizing" | "maintenance",
      assignedPatientId: b.assignedPatientId,
      assignedPatientName: b.assignedPatient
        ? `${b.assignedPatient.firstName || ""} ${b.assignedPatient.lastName || ""}`.trim()
        : null,
      assignedAt: b.assignedAt,
      updatedAt: b.updatedAt,
    })),
  }));
}

export async function updateBedStatus(
  bedId: string,
  status: "available" | "occupied" | "sanitizing" | "maintenance",
  assignedPatientId?: string | null
) {
  const isOccupied = status === "occupied";

  const [updated] = await db
    .update(beds)
    .set({
      status,
      assignedPatientId: isOccupied ? (assignedPatientId || null) : null,
      assignedAt: isOccupied ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(beds.id, bedId))
    .returning();

  return updated;
}

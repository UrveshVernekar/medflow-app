import { db } from "@/lib/db";
import { vitalSigns } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import type { RecordVitalSignsInput } from "./vital.schema";

export async function recordVitalSigns(
  userId: string,
  input: RecordVitalSignsInput
) {
  let bmi: string | null = null;
  if (input.weightKg && input.heightCm && input.heightCm > 0) {
    const hMeters = input.heightCm / 100;
    bmi = (input.weightKg / (hMeters * hMeters)).toFixed(1);
  }

  const [vitals] = await db
    .insert(vitalSigns)
    .values({
      patientId: input.patientId,
      recordedByUserId: userId,
      bloodPressureSystolic: input.bloodPressureSystolic,
      bloodPressureDiastolic: input.bloodPressureDiastolic,
      heartRate: input.heartRate,
      spO2: input.spO2,
      temperatureCelsius: input.temperatureCelsius.toFixed(1),
      respiratoryRate: input.respiratoryRate || null,
      weightKg: input.weightKg ? input.weightKg.toFixed(2) : null,
      heightCm: input.heightCm ? input.heightCm.toFixed(2) : null,
      bmi,
    })
    .returning();

  return vitals;
}

export async function getPatientVitalsHistory(patientId: string) {
  const history = await db.query.vitalSigns.findMany({
    where: eq(vitalSigns.patientId, patientId),
    orderBy: [desc(vitalSigns.recordedAt)],
    limit: 20,
  });

  return history.map((v) => ({
    id: v.id,
    bloodPressureSystolic: v.bloodPressureSystolic,
    bloodPressureDiastolic: v.bloodPressureDiastolic,
    bpString: `${v.bloodPressureSystolic}/${v.bloodPressureDiastolic}`,
    heartRate: v.heartRate,
    spO2: v.spO2,
    temperatureCelsius: Number(v.temperatureCelsius),
    respiratoryRate: v.respiratoryRate,
    weightKg: v.weightKg ? Number(v.weightKg) : null,
    heightCm: v.heightCm ? Number(v.heightCm) : null,
    bmi: v.bmi ? Number(v.bmi) : null,
    recordedAt: v.recordedAt,
    isAbnormalBP: v.bloodPressureSystolic >= 140 || v.bloodPressureDiastolic >= 90,
    isAbnormalSpO2: v.spO2 < 95,
    isFever: Number(v.temperatureCelsius) >= 38.0,
  }));
}

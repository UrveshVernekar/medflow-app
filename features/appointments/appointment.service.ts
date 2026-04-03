// features/appointments/appointment.service.ts
import { db } from "@/lib/db";

export async function getDoctorsForBooking() {
  return db`
    SELECT 
      d.id,
      CONCAT(u.first_name, ' ', u.last_name) AS name,
      u.email,
      d.specialization,
      dep.name AS department,
      d.years_of_experience AS "yearsOfExperience"
    FROM medflow.doctors d
    LEFT JOIN medflow.users u ON d.user_id = u.id
    LEFT JOIN medflow.departments dep ON d.department_id = dep.id
    WHERE d.deleted_at IS NULL
    ORDER BY d.specialization ASC
  `;
}

export async function getAvailableSlotsForDoctor(
  doctorId: string,
  dateStr: string,
) {
  const availabilityResult = await db`
    SELECT start_time, end_time
    FROM medflow.doctor_availability
    WHERE doctor_id = ${doctorId}
      AND day_of_week = EXTRACT(DOW FROM ${dateStr}::date)
  `;

  if (availabilityResult.length === 0) return [];

  const { start_time, end_time } = availabilityResult[0];

  const slots: string[] = [];
  let current = new Date(`${dateStr}T${start_time}`);
  const end = new Date(`${dateStr}T${end_time}`);

  while (current < end) {
    slots.push(current.toTimeString().slice(0, 5));
    current.setMinutes(current.getMinutes() + 30);
  }

  const bookedResult = await db`
    SELECT appointment_datetime
    FROM medflow.appointments
    WHERE doctor_id = ${doctorId}
      AND appointment_datetime::date = ${dateStr}::date
      AND deleted_at IS NULL
  `;

  const bookedTimes = new Set(
    bookedResult.map((b: any) => {
      const d = new Date(b.appointment_datetime);
      return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
    }),
  );

  return slots.filter((slot) => !bookedTimes.has(slot));
}

async function getPatientIdByUserId(userId: string) {
  const result = await db`
    SELECT id 
    FROM medflow.patients 
    WHERE user_id = ${userId} 
    AND deleted_at IS NULL
    LIMIT 1
  `;
  if (result.length === 0) {
    throw new Error(
      "Patient profile not found. Please complete your profile first.",
    );
  }
  return result[0].id;
}

export async function createAppointment(data: {
  userId: string;
  doctorId: string;
  appointmentDatetime: string;
  notes?: string;
}) {
  const patientId = await getPatientIdByUserId(data.userId);

  return db`
    INSERT INTO medflow.appointments (
      patient_id, 
      doctor_id, 
      appointment_datetime, 
      notes, 
      status
    )
    VALUES (
      ${patientId},
      ${data.doctorId},
      ${data.appointmentDatetime}::timestamptz,
      ${data.notes ?? null},
      'pending'
    )
    RETURNING *
  `;
}

export async function getUpcomingAppointmentsForPatient(userId: string) {
  return db`
    SELECT 
      a.id,
      to_char(a.appointment_datetime, 'YYYY-MM-DD HH24:MI:SS') AS appointment_datetime,
      a.status,
      a.notes,
      CONCAT(u_doctor.first_name, ' ', u_doctor.last_name) AS "doctorName",
      u_doctor.email
    FROM medflow.appointments a
    JOIN medflow.patients p ON a.patient_id = p.id
    JOIN medflow.doctors d ON a.doctor_id = d.id
    LEFT JOIN medflow.users u_doctor ON d.user_id = u_doctor.id
    WHERE p.user_id = ${userId}
      AND a.appointment_datetime > NOW()
      AND a.deleted_at IS NULL
      AND p.deleted_at IS NULL
    ORDER BY a.appointment_datetime ASC
  `;
}

export async function getPastAppointmentsForPatient(userId: string) {
  return db`
    SELECT 
      a.id,
      to_char(a.appointment_datetime, 'YYYY-MM-DD HH24:MI:SS') AS appointment_datetime,
      a.status,
      a.notes,
      CONCAT(u_doctor.first_name, ' ', u_doctor.last_name) AS "doctorName",
      u_doctor.email
    FROM medflow.appointments a
    JOIN medflow.patients p ON a.patient_id = p.id
    JOIN medflow.doctors d ON a.doctor_id = d.id
    LEFT JOIN medflow.users u_doctor ON d.user_id = u_doctor.id
    WHERE p.user_id = ${userId}
      AND a.appointment_datetime < NOW()
      AND a.deleted_at IS NULL
      AND p.deleted_at IS NULL
    ORDER BY a.appointment_datetime DESC
    LIMIT 10
  `;
}

export async function getAllDepartments() {
  return db`
    SELECT id, name
    FROM medflow.departments
    ORDER BY name ASC
  `;
}

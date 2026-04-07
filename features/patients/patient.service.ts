import { db } from "@/lib/db";

export async function createPatientProfile(userId: string) {
  const result = await db`
    INSERT INTO medflow.patients (user_id, first_name, last_name)
    VALUES (${userId}, '', '')
    RETURNING *
  `;

  return result[0];
}

export async function getPatientsForDoctor(userId: string) {
  return db`
    SELECT 
      p.id as patient_id,
      p.first_name,
      p.last_name,
      u.email,
      p.gender,
      p.contact_number,
      COUNT(a.id)::int as total_visits,
      MAX(a.appointment_datetime) as last_visit
    FROM medflow.appointments a
    JOIN medflow.patients p ON a.patient_id = p.id
    JOIN medflow.users u ON p.user_id = u.id
    JOIN medflow.doctors d ON a.doctor_id = d.id
    WHERE d.user_id = ${userId}
      AND a.deleted_at IS NULL
    GROUP BY p.id, p.first_name, p.last_name, u.email, p.gender, p.contact_number
    ORDER BY last_visit DESC
  `;
}

export async function getAllPatientsAdmin() {
  return db`
    SELECT 
      p.id as patient_id,
      p.first_name,
      p.last_name,
      u.email,
      p.gender,
      p.contact_number,
      u.created_at,
      COUNT(a.id)::int as total_visits
    FROM medflow.patients p
    JOIN medflow.users u ON p.user_id = u.id
    LEFT JOIN medflow.appointments a ON a.patient_id = p.id AND a.deleted_at IS NULL
    WHERE p.deleted_at IS NULL
    GROUP BY p.id, p.first_name, p.last_name, u.email, p.gender, p.contact_number, u.created_at
    ORDER BY u.created_at DESC
  `;
}

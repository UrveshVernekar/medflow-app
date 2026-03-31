import { db } from "@/lib/db";

export async function createDoctorProfile(
  userId: string,
  data: {
    specialization: string;
    license_number: string;
    years_of_experience: number;
    department_id: string;
  },
) {
  const result = await db`
    INSERT INTO medflow.doctors (
      user_id,
      specialization,
      license_number,
      years_of_experience,
      department_id
    )
    VALUES (
      ${userId},
      ${data.specialization},
      ${data.license_number},
      ${data.years_of_experience},
      ${data.department_id}
    )
    RETURNING *
  `;

  return result[0];
}

export async function getDoctors(departmentId?: string) {
  if (departmentId) {
    return db`
      SELECT d.*, u.email, dep.name as department_name
      FROM medflow.doctors d
      JOIN medflow.users u ON d.user_id = u.id
      LEFT JOIN medflow.departments dep ON d.department_id = dep.id
      WHERE d.department_id = ${departmentId}
      AND d.deleted_at IS NULL
      ORDER BY d.created_at DESC
    `;
  }

  return db`
    SELECT d.*, u.email, dep.name as department_name
    FROM medflow.doctors d
    JOIN medflow.users u ON d.user_id = u.id
    LEFT JOIN medflow.departments dep ON d.department_id = dep.id
    WHERE d.deleted_at IS NULL
    ORDER BY d.created_at DESC
  `;
}

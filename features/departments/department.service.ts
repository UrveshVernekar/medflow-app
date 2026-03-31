import { db } from "@/lib/db";

export async function getDepartments() {
  return db`
    SELECT * FROM medflow.departments
    ORDER BY name ASC
  `;
}

export async function createDepartment(name: string, description?: string) {
  return db`
    INSERT INTO medflow.departments (name, description)
    VALUES (${name}, ${description ?? null})
    RETURNING *
  `;
}

export async function updateDepartment(
  id: string,
  name: string,
  description?: string,
) {
  return db`
    UPDATE medflow.departments
    SET name = ${name}, description = ${description ?? null}, updated_at = now()
    WHERE id = ${id}
  `;
}

export async function deleteDepartment(id: string) {
  return db`
    DELETE FROM medflow.departments
    WHERE id = ${id}
  `;
}

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

export async function getUpcomingAppointmentsForDoctor(userId: string) {
  return db`
    SELECT 
      a.id,
      to_char(a.appointment_datetime, 'YYYY-MM-DD HH24:MI:SS') AS appointment_datetime,
      a.status,
      a.notes,
      CONCAT(u_patient.first_name, ' ', u_patient.last_name) AS "patientName",
      u_patient.email
    FROM medflow.appointments a
    JOIN medflow.patients p ON a.patient_id = p.id
    JOIN medflow.users u_patient ON p.user_id = u_patient.id
    JOIN medflow.doctors d ON a.doctor_id = d.id
    WHERE d.user_id = ${userId}
      AND a.appointment_datetime > NOW()
      AND a.deleted_at IS NULL
      AND p.deleted_at IS NULL
    ORDER BY a.appointment_datetime ASC
  `;
}

export async function getPastAppointmentsForDoctor(userId: string) {
  return db`
    SELECT 
      a.id,
      to_char(a.appointment_datetime, 'YYYY-MM-DD HH24:MI:SS') AS appointment_datetime,
      a.status,
      a.notes,
      CONCAT(u_patient.first_name, ' ', u_patient.last_name) AS "patientName",
      u_patient.email
    FROM medflow.appointments a
    JOIN medflow.patients p ON a.patient_id = p.id
    JOIN medflow.users u_patient ON p.user_id = u_patient.id
    JOIN medflow.doctors d ON a.doctor_id = d.id
    WHERE d.user_id = ${userId}
      AND a.appointment_datetime < NOW()
      AND a.deleted_at IS NULL
      AND p.deleted_at IS NULL
    ORDER BY a.appointment_datetime DESC
    LIMIT 10
  `;
}

export async function updateAppointmentStatus(appointmentId: string, status: string) {
  return db`
    UPDATE medflow.appointments
    SET status = ${status}
    WHERE id = ${appointmentId}
    RETURNING id, status
  `;
}

export async function getDoctorAnalytics(userId: string) {
  const doctorResult = await db`SELECT id FROM medflow.doctors WHERE user_id = ${userId} LIMIT 1`;
  if (doctorResult.length === 0) return null;
  const doctorId = doctorResult[0].id;

  const totalUpcomingResult = await db`
    SELECT COUNT(*) as count 
    FROM medflow.appointments 
    WHERE doctor_id = ${doctorId} AND appointment_datetime > NOW() AND deleted_at IS NULL
  `;
  const totalUpcoming = Number(totalUpcomingResult[0]?.count || 0);

  const totalPastResult = await db`
    SELECT COUNT(*) as count 
    FROM medflow.appointments 
    WHERE doctor_id = ${doctorId} AND appointment_datetime <= NOW() AND deleted_at IS NULL
  `;
  const totalPast = Number(totalPastResult[0]?.count || 0);

  const uniquePatientsResult = await db`
    SELECT COUNT(DISTINCT patient_id) as count 
    FROM medflow.appointments 
    WHERE doctor_id = ${doctorId} AND deleted_at IS NULL
  `;
  const uniquePatients = Number(uniquePatientsResult[0]?.count || 0);

  const statusDistributionResult = await db`
    SELECT status, COUNT(*) as count 
    FROM medflow.appointments 
    WHERE doctor_id = ${doctorId} AND deleted_at IS NULL
    GROUP BY status
  `;
  const statusDistribution = statusDistributionResult.map((r: any) => ({
    name: r.status.charAt(0).toUpperCase() + r.status.slice(1),
    value: Number(r.count)
  }));

  const appointmentsByDayResult = await db`
    SELECT 
      DATE(appointment_datetime) as date,
      COUNT(*) as count
    FROM medflow.appointments
    WHERE doctor_id = ${doctorId} 
      AND appointment_datetime >= CURRENT_DATE
      AND appointment_datetime < CURRENT_DATE + INTERVAL '7 days'
      AND deleted_at IS NULL
    GROUP BY DATE(appointment_datetime)
    ORDER BY DATE(appointment_datetime) ASC
  `;

  // process by day for the next 7 days using UTC dates mapped down
  const appointmentsByDay = appointmentsByDayResult.map((r: any) => ({
    date: new Date(r.date).toLocaleDateString("en-US", { weekday: 'short' }),
    appointments: Number(r.count)
  }));

  // if the doctor has zero appointments for the week, we still want the graph to render a default structure
  if (appointmentsByDay.length === 0) {
    const defaultDays = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        defaultDays.push({
            date: d.toLocaleDateString("en-US", { weekday: 'short' }),
            appointments: 0
        });
    }
    return { totalUpcoming, totalPast, uniquePatients, statusDistribution, appointmentsByDay: defaultDays };
  }

  return {
    totalUpcoming,
    totalPast,
    uniquePatients,
    statusDistribution,
    appointmentsByDay
  };
}

export async function getPatientAnalytics(userId: string) {
  let patientId;
  try {
    // defined earlier in the file!
    const result = await db`SELECT id FROM medflow.patients WHERE user_id = ${userId} AND deleted_at IS NULL LIMIT 1`;
    if (result.length === 0) return null;
    patientId = result[0].id;
  } catch (error) {
    return null; 
  }

  const totalVisitsResult = await db`
    SELECT COUNT(*) as count 
    FROM medflow.appointments 
    WHERE patient_id = ${patientId} AND deleted_at IS NULL
  `;
  const totalVisits = Number(totalVisitsResult[0]?.count || 0);

  const uniqueDoctorsResult = await db`
    SELECT COUNT(DISTINCT doctor_id) as count 
    FROM medflow.appointments 
    WHERE patient_id = ${patientId} AND deleted_at IS NULL
  `;
  const uniqueDoctors = Number(uniqueDoctorsResult[0]?.count || 0);

  const departmentDistributionResult = await db`
    SELECT dep.name as department, COUNT(a.id) as count
    FROM medflow.appointments a
    JOIN medflow.doctors d ON a.doctor_id = d.id
    JOIN medflow.departments dep ON d.department_id = dep.id
    WHERE a.patient_id = ${patientId} AND a.deleted_at IS NULL
    GROUP BY dep.name
  `;
  
  const departmentDistribution = departmentDistributionResult.map((r: any) => ({
    name: r.department,
    value: Number(r.count)
  }));

  return {
    totalVisits,
    uniqueDoctors,
    departmentDistribution
  };
}

export async function getAdminAnalytics() {
  const totalDoctorsResult = await db`SELECT COUNT(*) as count FROM medflow.doctors WHERE deleted_at IS NULL`;
  const totalDoctors = Number(totalDoctorsResult[0]?.count || 0);

  const totalPatientsResult = await db`SELECT COUNT(*) as count FROM medflow.patients WHERE deleted_at IS NULL`;
  const totalPatients = Number(totalPatientsResult[0]?.count || 0);

  const totalAppointmentsResult = await db`SELECT COUNT(*) as count FROM medflow.appointments WHERE deleted_at IS NULL`;
  const totalAppointments = Number(totalAppointmentsResult[0]?.count || 0);

  const totalDepartmentsResult = await db`SELECT COUNT(*) as count FROM medflow.departments`;
  const totalDepartments = Number(totalDepartmentsResult[0]?.count || 0);

  const appointmentsByDayResult = await db`
    SELECT 
      DATE(appointment_datetime) as date,
      COUNT(*) as count
    FROM medflow.appointments
    WHERE appointment_datetime >= CURRENT_DATE
      AND appointment_datetime < CURRENT_DATE + INTERVAL '7 days'
      AND deleted_at IS NULL
    GROUP BY DATE(appointment_datetime)
    ORDER BY DATE(appointment_datetime) ASC
  `;
  
  const appointmentsByDay = appointmentsByDayResult.map((r: any) => ({
    date: new Date(r.date).toLocaleDateString("en-US", { weekday: 'short' }),
    appointments: Number(r.count)
  }));
  
  if (appointmentsByDay.length === 0) {
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        appointmentsByDay.push({
            date: d.toLocaleDateString("en-US", { weekday: 'short' }),
            appointments: 0
        });
    }
  }

  const departmentDistributionResult = await db`
    SELECT dep.name as department, COUNT(a.id) as count
    FROM medflow.appointments a
    JOIN medflow.doctors d ON a.doctor_id = d.id
    JOIN medflow.departments dep ON d.department_id = dep.id
    WHERE a.deleted_at IS NULL
    GROUP BY dep.name
  `;
  
  const departmentDistribution = departmentDistributionResult.map((r: any) => ({
    name: r.department,
    value: Number(r.count)
  }));

  return {
    totalDoctors,
    totalPatients,
    totalAppointments,
    totalDepartments,
    appointmentsByDay,
    departmentDistribution
  };
}

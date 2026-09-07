import { db } from "@/lib/db";
import {
  doctors,
  users,
  departments,
  doctorAvailability,
  appointments,
  patients,
} from "@/lib/db/schema";
import { eq, isNull, and, sql, gte, lt, desc, asc } from "drizzle-orm";

export async function getDoctorsForBooking() {
  const result = await db
    .select({
      id: doctors.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      specialization: doctors.specialization,
      department: departments.name,
      yearsOfExperience: doctors.yearsOfExperience,
    })
    .from(doctors)
    .leftJoin(users, eq(doctors.userId, users.id))
    .leftJoin(departments, eq(doctors.departmentId, departments.id))
    .where(isNull(doctors.deletedAt))
    .orderBy(asc(doctors.specialization));

  return result.map((d) => ({
    id: d.id,
    name: [d.firstName, d.lastName].filter(Boolean).join(" ") || "Doctor",
    email: d.email,
    specialization: d.specialization,
    department: d.department,
    yearsOfExperience: d.yearsOfExperience,
  }));
}

export async function getAvailableSlotsForDoctor(
  doctorId: string,
  dateStr: string,
) {
  const dateObj = new Date(dateStr);
  const dayOfWeek = dateObj.getDay();

  const availabilityResult = await db
    .select({
      startTime: doctorAvailability.startTime,
      endTime: doctorAvailability.endTime,
    })
    .from(doctorAvailability)
    .where(
      and(
        eq(doctorAvailability.doctorId, doctorId),
        eq(doctorAvailability.dayOfWeek, dayOfWeek),
      ),
    );

  if (availabilityResult.length === 0) return [];

  const { startTime: start_time, endTime: end_time } = availabilityResult[0];

  const slots: string[] = [];
  const current = new Date(`${dateStr}T${start_time}`);
  const end = new Date(`${dateStr}T${end_time}`);

  while (current < end) {
    slots.push(current.toTimeString().slice(0, 5));
    current.setMinutes(current.getMinutes() + 30);
  }

  const bookedResult = await db
    .select({
      appointmentDatetime: appointments.appointmentDatetime,
    })
    .from(appointments)
    .where(
      and(
        eq(appointments.doctorId, doctorId),
        sql`DATE(${appointments.appointmentDatetime}) = ${dateStr}::date`,
        isNull(appointments.deletedAt),
      ),
    );

  const bookedTimes = new Set(
    bookedResult.map((b) => {
      const d = new Date(b.appointmentDatetime);
      return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
    }),
  );

  return slots.filter((slot) => !bookedTimes.has(slot));
}

async function getPatientIdByUserId(userId: string) {
  const result = await db
    .select({ id: patients.id })
    .from(patients)
    .where(and(eq(patients.userId, userId), isNull(patients.deletedAt)))
    .limit(1);

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

  const result = await db
    .insert(appointments)
    .values({
      patientId,
      doctorId: data.doctorId,
      appointmentDatetime: new Date(data.appointmentDatetime),
      notes: data.notes ?? null,
      status: "pending",
    })
    .returning();

  return result[0];
}

export async function getUpcomingAppointmentsForPatient(userId: string) {
  const result = await db
    .select({
      id: appointments.id,
      appointment_datetime: sql<string>`to_char(${appointments.appointmentDatetime}, 'YYYY-MM-DD HH24:MI:SS')`,
      status: appointments.status,
      notes: appointments.notes,
      doctorFirstName: users.firstName,
      doctorLastName: users.lastName,
      email: users.email,
    })
    .from(appointments)
    .innerJoin(patients, eq(appointments.patientId, patients.id))
    .innerJoin(doctors, eq(appointments.doctorId, doctors.id))
    .leftJoin(users, eq(doctors.userId, users.id))
    .where(
      and(
        eq(patients.userId, userId),
        gte(appointments.appointmentDatetime, new Date()),
        isNull(appointments.deletedAt),
        isNull(patients.deletedAt),
      ),
    )
    .orderBy(asc(appointments.appointmentDatetime));

  return result.map((r) => ({
    id: r.id,
    appointment_datetime: r.appointment_datetime,
    status: r.status,
    notes: r.notes,
    doctorName:
      [r.doctorFirstName, r.doctorLastName].filter(Boolean).join(" ") ||
      "Doctor",
    email: r.email,
  }));
}

export async function getPastAppointmentsForPatient(userId: string) {
  const result = await db
    .select({
      id: appointments.id,
      appointment_datetime: sql<string>`to_char(${appointments.appointmentDatetime}, 'YYYY-MM-DD HH24:MI:SS')`,
      status: appointments.status,
      notes: appointments.notes,
      doctorFirstName: users.firstName,
      doctorLastName: users.lastName,
      email: users.email,
    })
    .from(appointments)
    .innerJoin(patients, eq(appointments.patientId, patients.id))
    .innerJoin(doctors, eq(appointments.doctorId, doctors.id))
    .leftJoin(users, eq(doctors.userId, users.id))
    .where(
      and(
        eq(patients.userId, userId),
        lt(appointments.appointmentDatetime, new Date()),
        isNull(appointments.deletedAt),
        isNull(patients.deletedAt),
      ),
    )
    .orderBy(desc(appointments.appointmentDatetime))
    .limit(10);

  return result.map((r) => ({
    id: r.id,
    appointment_datetime: r.appointment_datetime,
    status: r.status,
    notes: r.notes,
    doctorName:
      [r.doctorFirstName, r.doctorLastName].filter(Boolean).join(" ") ||
      "Doctor",
    email: r.email,
  }));
}

export async function getAllDepartments() {
  return db
    .select({
      id: departments.id,
      name: departments.name,
    })
    .from(departments)
    .orderBy(asc(departments.name));
}

export async function getUpcomingAppointmentsForDoctor(userId: string) {
  const result = await db
    .select({
      id: appointments.id,
      patientId: patients.id,
      appointment_datetime: sql<string>`to_char(${appointments.appointmentDatetime}, 'YYYY-MM-DD HH24:MI:SS')`,
      status: appointments.status,
      notes: appointments.notes,
      patientFirstName: users.firstName,
      patientLastName: users.lastName,
      email: users.email,
    })
    .from(appointments)
    .innerJoin(patients, eq(appointments.patientId, patients.id))
    .innerJoin(users, eq(patients.userId, users.id))
    .innerJoin(doctors, eq(appointments.doctorId, doctors.id))
    .where(
      and(
        eq(doctors.userId, userId),
        gte(appointments.appointmentDatetime, new Date()),
        isNull(appointments.deletedAt),
        isNull(patients.deletedAt),
      ),
    )
    .orderBy(asc(appointments.appointmentDatetime));

  return result.map((r) => ({
    id: r.id,
    patientId: r.patientId,
    appointment_datetime: r.appointment_datetime,
    status: r.status,
    notes: r.notes,
    patientName:
      [r.patientFirstName, r.patientLastName].filter(Boolean).join(" ") ||
      "Patient",
    email: r.email,
  }));
}

export async function getPastAppointmentsForDoctor(userId: string) {
  const result = await db
    .select({
      id: appointments.id,
      patientId: patients.id,
      appointment_datetime: sql<string>`to_char(${appointments.appointmentDatetime}, 'YYYY-MM-DD HH24:MI:SS')`,
      status: appointments.status,
      notes: appointments.notes,
      patientFirstName: users.firstName,
      patientLastName: users.lastName,
      email: users.email,
    })
    .from(appointments)
    .innerJoin(patients, eq(appointments.patientId, patients.id))
    .innerJoin(users, eq(patients.userId, users.id))
    .innerJoin(doctors, eq(appointments.doctorId, doctors.id))
    .where(
      and(
        eq(doctors.userId, userId),
        lt(appointments.appointmentDatetime, new Date()),
        isNull(appointments.deletedAt),
        isNull(patients.deletedAt),
      ),
    )
    .orderBy(desc(appointments.appointmentDatetime))
    .limit(10);

  return result.map((r) => ({
    id: r.id,
    patientId: r.patientId,
    appointment_datetime: r.appointment_datetime,
    status: r.status,
    notes: r.notes,
    patientName:
      [r.patientFirstName, r.patientLastName].filter(Boolean).join(" ") ||
      "Patient",
    email: r.email,
  }));
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: string,
) {
  const result = await db
    .update(appointments)
    .set({ status })
    .where(eq(appointments.id, appointmentId))
    .returning({
      id: appointments.id,
      status: appointments.status,
    });

  return result[0];
}

export async function getDoctorAnalytics(userId: string) {
  const doctorResult = await db
    .select({ id: doctors.id })
    .from(doctors)
    .where(eq(doctors.userId, userId))
    .limit(1);

  if (doctorResult.length === 0) return null;
  const doctorId = doctorResult[0].id;

  const totalUpcomingResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(appointments)
    .where(
      and(
        eq(appointments.doctorId, doctorId),
        gte(appointments.appointmentDatetime, new Date()),
        isNull(appointments.deletedAt),
      ),
    );
  const totalUpcoming = Number(totalUpcomingResult[0]?.count || 0);

  const totalPastResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(appointments)
    .where(
      and(
        eq(appointments.doctorId, doctorId),
        lt(appointments.appointmentDatetime, new Date()),
        isNull(appointments.deletedAt),
      ),
    );
  const totalPast = Number(totalPastResult[0]?.count || 0);

  const uniquePatientsResult = await db
    .select({ count: sql<number>`count(distinct ${appointments.patientId})::int` })
    .from(appointments)
    .where(
      and(eq(appointments.doctorId, doctorId), isNull(appointments.deletedAt)),
    );
  const uniquePatients = Number(uniquePatientsResult[0]?.count || 0);

  const statusDistributionResult = await db
    .select({
      status: appointments.status,
      count: sql<number>`count(*)::int`,
    })
    .from(appointments)
    .where(
      and(eq(appointments.doctorId, doctorId), isNull(appointments.deletedAt)),
    )
    .groupBy(appointments.status);

  const statusDistribution = statusDistributionResult.map((r) => {
    const s = r.status || "pending";
    return {
      name: s.charAt(0).toUpperCase() + s.slice(1),
      value: Number(r.count),
    };
  });

  const appointmentsByDayResult = await db
    .select({
      date: sql<string>`DATE(${appointments.appointmentDatetime})`,
      count: sql<number>`count(*)::int`,
    })
    .from(appointments)
    .where(
      and(
        eq(appointments.doctorId, doctorId),
        gte(appointments.appointmentDatetime, sql`CURRENT_DATE`),
        lt(appointments.appointmentDatetime, sql`CURRENT_DATE + INTERVAL '7 days'`),
        isNull(appointments.deletedAt),
      ),
    )
    .groupBy(sql`DATE(${appointments.appointmentDatetime})`)
    .orderBy(asc(sql`DATE(${appointments.appointmentDatetime})`));

  const appointmentsByDay = appointmentsByDayResult.map((r) => ({
    date: new Date(r.date).toLocaleDateString("en-US", { weekday: "short" }),
    appointments: Number(r.count),
  }));

  if (appointmentsByDay.length === 0) {
    const defaultDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      defaultDays.push({
        date: d.toLocaleDateString("en-US", { weekday: "short" }),
        appointments: 0,
      });
    }
    return {
      totalUpcoming,
      totalPast,
      uniquePatients,
      statusDistribution,
      appointmentsByDay: defaultDays,
    };
  }

  return {
    totalUpcoming,
    totalPast,
    uniquePatients,
    statusDistribution,
    appointmentsByDay,
  };
}

export async function getPatientAnalytics(userId: string) {
  let patientId: string;
  try {
    const result = await db
      .select({ id: patients.id })
      .from(patients)
      .where(and(eq(patients.userId, userId), isNull(patients.deletedAt)))
      .limit(1);

    if (result.length === 0) return null;
    patientId = result[0].id;
  } catch {
    return null;
  }

  const totalVisitsResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(appointments)
    .where(
      and(
        eq(appointments.patientId, patientId),
        isNull(appointments.deletedAt),
      ),
    );
  const totalVisits = Number(totalVisitsResult[0]?.count || 0);

  const uniqueDoctorsResult = await db
    .select({ count: sql<number>`count(distinct ${appointments.doctorId})::int` })
    .from(appointments)
    .where(
      and(
        eq(appointments.patientId, patientId),
        isNull(appointments.deletedAt),
      ),
    );
  const uniqueDoctors = Number(uniqueDoctorsResult[0]?.count || 0);

  const departmentDistributionResult = await db
    .select({
      department: departments.name,
      count: sql<number>`count(${appointments.id})::int`,
    })
    .from(appointments)
    .innerJoin(doctors, eq(appointments.doctorId, doctors.id))
    .innerJoin(departments, eq(doctors.departmentId, departments.id))
    .where(
      and(
        eq(appointments.patientId, patientId),
        isNull(appointments.deletedAt),
      ),
    )
    .groupBy(departments.name);

  const departmentDistribution = departmentDistributionResult.map((r) => ({
    name: r.department,
    value: Number(r.count),
  }));

  return {
    totalVisits,
    uniqueDoctors,
    departmentDistribution,
  };
}

export async function getAdminAnalytics() {
  const totalDoctorsResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(doctors)
    .where(isNull(doctors.deletedAt));
  const totalDoctors = Number(totalDoctorsResult[0]?.count || 0);

  const totalPatientsResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(patients)
    .where(isNull(patients.deletedAt));
  const totalPatients = Number(totalPatientsResult[0]?.count || 0);

  const totalAppointmentsResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(appointments)
    .where(isNull(appointments.deletedAt));
  const totalAppointments = Number(totalAppointmentsResult[0]?.count || 0);

  const totalDepartmentsResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(departments);
  const totalDepartments = Number(totalDepartmentsResult[0]?.count || 0);

  const appointmentsByDayResult = await db
    .select({
      date: sql<string>`DATE(${appointments.appointmentDatetime})`,
      count: sql<number>`count(*)::int`,
    })
    .from(appointments)
    .where(
      and(
        gte(appointments.appointmentDatetime, sql`CURRENT_DATE`),
        lt(appointments.appointmentDatetime, sql`CURRENT_DATE + INTERVAL '7 days'`),
        isNull(appointments.deletedAt),
      ),
    )
    .groupBy(sql`DATE(${appointments.appointmentDatetime})`)
    .orderBy(asc(sql`DATE(${appointments.appointmentDatetime})`));

  const appointmentsByDay = appointmentsByDayResult.map((r) => ({
    date: new Date(r.date).toLocaleDateString("en-US", { weekday: "short" }),
    appointments: Number(r.count),
  }));

  if (appointmentsByDay.length === 0) {
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      appointmentsByDay.push({
        date: d.toLocaleDateString("en-US", { weekday: "short" }),
        appointments: 0,
      });
    }
  }

  const departmentDistributionResult = await db
    .select({
      department: departments.name,
      count: sql<number>`count(${appointments.id})::int`,
    })
    .from(appointments)
    .innerJoin(doctors, eq(appointments.doctorId, doctors.id))
    .innerJoin(departments, eq(doctors.departmentId, departments.id))
    .where(isNull(appointments.deletedAt))
    .groupBy(departments.name);

  const departmentDistribution = departmentDistributionResult.map((r) => ({
    name: r.department,
    value: Number(r.count),
  }));

  return {
    totalDoctors,
    totalPatients,
    totalAppointments,
    totalDepartments,
    appointmentsByDay,
    departmentDistribution,
  };
}

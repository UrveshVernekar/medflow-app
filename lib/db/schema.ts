import {
  pgSchema,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  time,
  numeric,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const medflowSchema = pgSchema("medflow");

// 1. Users Table
export const users = medflowSchema.table("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 50 }).notNull(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// 2. Departments Table
export const departments = medflowSchema.table("departments", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// 3. Doctors Table
export const doctors = medflowSchema.table("doctors", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  specialization: varchar("specialization", { length: 255 }).notNull(),
  licenseNumber: varchar("license_number", { length: 100 }),
  yearsOfExperience: integer("years_of_experience").default(0),
  departmentId: uuid("department_id").references(() => departments.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// 4. Doctor Availability Table
export const doctorAvailability = medflowSchema.table("doctor_availability", {
  id: uuid("id").defaultRandom().primaryKey(),
  doctorId: uuid("doctor_id")
    .notNull()
    .references(() => doctors.id, { onDelete: "cascade" }),
  dayOfWeek: integer("day_of_week").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
});

// 5. Patients Table
export const patients = medflowSchema.table("patients", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  gender: varchar("gender", { length: 20 }),
  contactNumber: varchar("contact_number", { length: 50 }),
  address: text("address"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// 6. Appointments Table
export const appointments = medflowSchema.table("appointments", {
  id: uuid("id").defaultRandom().primaryKey(),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }),
  doctorId: uuid("doctor_id")
    .notNull()
    .references(() => doctors.id, { onDelete: "cascade" }),
  appointmentDatetime: timestamp("appointment_datetime", {
    withTimezone: true,
  }).notNull(),
  notes: text("notes"),
  status: varchar("status", { length: 50 }).default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// 7. PHI Audit Logs Table
export const auditLogs = medflowSchema.table("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id"),
  action: varchar("action", { length: 100 }).notNull(),
  resource: varchar("resource", { length: 100 }).notNull(),
  resourceId: varchar("resource_id", { length: 255 }),
  details: text("details"),
  ipAddress: varchar("ip_address", { length: 45 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// 8. Patient Allergies Table
export const patientAllergies = medflowSchema.table("patient_allergies", {
  id: uuid("id").defaultRandom().primaryKey(),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }),
  allergen: varchar("allergen", { length: 255 }).notNull(),
  severity: varchar("severity", { length: 50 }).notNull().default("moderate"),
  reaction: text("reaction"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// 9. Prescriptions Table
export const prescriptions = medflowSchema.table("prescriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  appointmentId: uuid("appointment_id").references(() => appointments.id, {
    onDelete: "set null",
  }),
  doctorId: uuid("doctor_id")
    .notNull()
    .references(() => doctors.id, { onDelete: "cascade" }),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }),
  diagnosis: text("diagnosis").notNull(),
  notes: text("notes"),
  status: varchar("status", { length: 50 }).notNull().default("active"),
  issuedAt: timestamp("issued_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// 10. Prescription Items Table
export const prescriptionItems = medflowSchema.table("prescription_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  prescriptionId: uuid("prescription_id")
    .notNull()
    .references(() => prescriptions.id, { onDelete: "cascade" }),
  medicationName: varchar("medication_name", { length: 255 }).notNull(),
  dosage: varchar("dosage", { length: 100 }).notNull(),
  frequency: varchar("frequency", { length: 100 }).notNull(),
  duration: varchar("duration", { length: 100 }).notNull(),
  instructions: text("instructions"),
});

// 11. Hospital Wards Table
export const wards = medflowSchema.table("wards", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  wardType: varchar("ward_type", { length: 100 }).notNull(),
  totalBeds: integer("total_beds").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// 12. Hospital Beds Table
export const beds = medflowSchema.table("beds", {
  id: uuid("id").defaultRandom().primaryKey(),
  wardId: uuid("ward_id")
    .notNull()
    .references(() => wards.id, { onDelete: "cascade" }),
  bedNumber: varchar("bed_number", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("available"),
  assignedPatientId: uuid("assigned_patient_id").references(() => patients.id, {
    onDelete: "set null",
  }),
  assignedAt: timestamp("assigned_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// 13. Patient Vital Signs Table
export const vitalSigns = medflowSchema.table("vital_signs", {
  id: uuid("id").defaultRandom().primaryKey(),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }),
  recordedByUserId: uuid("recorded_by_user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  bloodPressureSystolic: integer("blood_pressure_systolic").notNull(),
  bloodPressureDiastolic: integer("blood_pressure_diastolic").notNull(),
  heartRate: integer("heart_rate").notNull(),
  spO2: integer("spo2").notNull(),
  temperatureCelsius: numeric("temperature_celsius", { precision: 4, scale: 1 }).notNull(),
  respiratoryRate: integer("respiratory_rate"),
  weightKg: numeric("weight_kg", { precision: 5, scale: 2 }),
  heightCm: numeric("height_cm", { precision: 5, scale: 2 }),
  bmi: numeric("bmi", { precision: 4, scale: 1 }),
  recordedAt: timestamp("recorded_at", { withTimezone: true }).defaultNow(),
});

// --- RELATIONS ---

export const usersRelations = relations(users, ({ one }) => ({
  doctor: one(doctors, {
    fields: [users.id],
    references: [doctors.userId],
  }),
  patient: one(patients, {
    fields: [users.id],
    references: [patients.userId],
  }),
}));

export const departmentsRelations = relations(departments, ({ many }) => ({
  doctors: many(doctors),
}));

export const doctorsRelations = relations(doctors, ({ one, many }) => ({
  user: one(users, {
    fields: [doctors.userId],
    references: [users.id],
  }),
  department: one(departments, {
    fields: [doctors.departmentId],
    references: [departments.id],
  }),
  availability: many(doctorAvailability),
  appointments: many(appointments),
  prescriptions: many(prescriptions),
}));

export const doctorAvailabilityRelations = relations(
  doctorAvailability,
  ({ one }) => ({
    doctor: one(doctors, {
      fields: [doctorAvailability.doctorId],
      references: [doctors.id],
    }),
  }),
);

export const patientsRelations = relations(patients, ({ one, many }) => ({
  user: one(users, {
    fields: [patients.userId],
    references: [users.id],
  }),
  appointments: many(appointments),
  allergies: many(patientAllergies),
  prescriptions: many(prescriptions),
  vitalSigns: many(vitalSigns),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  patient: one(patients, {
    fields: [appointments.patientId],
    references: [patients.id],
  }),
  doctor: one(doctors, {
    fields: [appointments.doctorId],
    references: [doctors.id],
  }),
}));

export const patientAllergiesRelations = relations(
  patientAllergies,
  ({ one }) => ({
    patient: one(patients, {
      fields: [patientAllergies.patientId],
      references: [patients.id],
    }),
  }),
);

export const prescriptionsRelations = relations(
  prescriptions,
  ({ one, many }) => ({
    doctor: one(doctors, {
      fields: [prescriptions.doctorId],
      references: [doctors.id],
    }),
    patient: one(patients, {
      fields: [prescriptions.patientId],
      references: [patients.id],
    }),
    appointment: one(appointments, {
      fields: [prescriptions.appointmentId],
      references: [appointments.id],
    }),
    items: many(prescriptionItems),
  }),
);

export const prescriptionItemsRelations = relations(
  prescriptionItems,
  ({ one }) => ({
    prescription: one(prescriptions, {
      fields: [prescriptionItems.prescriptionId],
      references: [prescriptions.id],
    }),
  }),
);

export const wardsRelations = relations(wards, ({ many }) => ({
  beds: many(beds),
}));

export const bedsRelations = relations(beds, ({ one }) => ({
  ward: one(wards, {
    fields: [beds.wardId],
    references: [wards.id],
  }),
  assignedPatient: one(patients, {
    fields: [beds.assignedPatientId],
    references: [patients.id],
  }),
}));

export const vitalSignsRelations = relations(vitalSigns, ({ one }) => ({
  patient: one(patients, {
    fields: [vitalSigns.patientId],
    references: [patients.id],
  }),
  recordedBy: one(users, {
    fields: [vitalSigns.recordedByUserId],
    references: [users.id],
  }),
}));

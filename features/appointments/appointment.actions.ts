// features/appointments/appointment.actions.ts
"use server";
import { revalidatePath } from "next/cache";

import {
  getDoctorsForBooking,
  getAvailableSlotsForDoctor,
  createAppointment,
  getUpcomingAppointmentsForPatient,
  getPastAppointmentsForPatient,
  getAllDepartments,
  getUpcomingAppointmentsForDoctor,
  getPastAppointmentsForDoctor,
  updateAppointmentStatus,
  getDoctorAnalytics,
  getPatientAnalytics,
  getAdminAnalytics,
} from "./appointment.service";

export async function getPatientAppointments(
  userId: string,
  type: "upcoming" | "past",
) {
  if (type === "upcoming") {
    return await getUpcomingAppointmentsForPatient(userId);
  }
  return await getPastAppointmentsForPatient(userId);
}

export { getDoctorsForBooking, getAvailableSlotsForDoctor, getAllDepartments };

export async function bookAppointment(data: {
  userId: string;
  doctorId: string;
  appointmentDatetime: string;
  notes?: string;
}) {
  const result = await createAppointment(data);
  revalidatePath("/patient/appointments");
  revalidatePath("/patient");
  return result;
}

export async function getDoctorAppointments(
  userId: string,
  type: "upcoming" | "past",
) {
  if (type === "upcoming") {
    return await getUpcomingAppointmentsForDoctor(userId);
  }
  return await getPastAppointmentsForDoctor(userId);
}

export async function confirmAppointmentAction(appointmentId: string) {
  const result = await updateAppointmentStatus(appointmentId, "confirmed");
  revalidatePath("/doctor/appointments");
  revalidatePath("/doctor");
  return result;
}

export async function cancelAppointmentAction(appointmentId: string) {
  const result = await updateAppointmentStatus(appointmentId, "cancelled");
  revalidatePath("/patient/appointments");
  revalidatePath("/patient");
  return result;
}


export async function getDoctorDashboardStats(userId: string) {
  return await getDoctorAnalytics(userId);
}

export async function getPatientDashboardStats(userId: string) {
  return await getPatientAnalytics(userId);
}

export async function getAdminDashboardStats() {
  return await getAdminAnalytics();
}

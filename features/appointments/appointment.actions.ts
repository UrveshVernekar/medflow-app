// features/appointments/appointment.actions.ts
"use server";

import {
  getDoctorsForBooking,
  getAvailableSlotsForDoctor,
  createAppointment,
  getUpcomingAppointmentsForPatient,
  getPastAppointmentsForPatient,
  getAllDepartments,
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
  return await createAppointment(data);
}

export type UserRole = "patient" | "doctor" | "admin";

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";

export type Gender = "male" | "female" | "other";

export type FileType = "lab_report" | "xray" | "mri" | "prescription" | "other";

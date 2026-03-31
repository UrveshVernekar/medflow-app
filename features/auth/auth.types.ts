export type AuthUser = {
  id: string;
  email: string;
  role: "patient" | "doctor" | "admin";
};

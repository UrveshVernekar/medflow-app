import { z } from "zod";

export const patientProfileSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  gender: z.enum(["male", "female", "other"]),
  contact_number: z.string().min(10),
  address: z.string().optional(),
});

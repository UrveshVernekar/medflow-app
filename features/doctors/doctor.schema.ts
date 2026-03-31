import { z } from "zod";

export const createDoctorSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),

  specialization: z.string().min(1),
  license_number: z.string().min(1),
  years_of_experience: z.number().min(0),

  department_id: z.string().uuid(),
});

export type CreateDoctorInput = z.infer<typeof createDoctorSchema>;

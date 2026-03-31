import { z } from "zod";

export const departmentSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
});

export type DepartmentInput = z.infer<typeof departmentSchema>;

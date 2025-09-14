import { z } from "zod";

export const createCompanySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  address: z.string().min(1, "Address is required"),
  industry: z.string().min(1, "Industry is required"),
  desc: z.string().optional(),
});

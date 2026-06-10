import { z } from "zod";

export const databaseResetBodySchema = z.object({
  confirm: z
    .boolean()
    .refine((value) => value === true, { message: "Bestätigung erforderlich" }),
});

export type DatabaseResetBody = z.infer<typeof databaseResetBodySchema>;

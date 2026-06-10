import { z } from "zod";

export const settingUpdateBodySchema = z.object({
  value: z.string({ message: "Value fehlt" }),
});

export type SettingUpdateBody = z.infer<typeof settingUpdateBodySchema>;

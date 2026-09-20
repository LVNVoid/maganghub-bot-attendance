import { z } from "zod";

export const updateAutomationPreferencesSchema = z.object({
  scheduleTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format waktu harus HH:MM (contoh: 13:50)"),
});

export type UpdateAutomationPreferencesPayload = z.infer<
  typeof updateAutomationPreferencesSchema
>;

export const toggleAutomationSchema = z.object({
  isEnabled: z.boolean(),
});

export type ToggleAutomationPayload = z.infer<typeof toggleAutomationSchema>;

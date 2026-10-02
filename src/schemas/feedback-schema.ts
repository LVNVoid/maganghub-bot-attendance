import { z } from "zod";

export const feedbackCategorySchema = z.enum(["BUG", "FEATURE", "GENERAL"]);
export type FeedbackCategory = z.infer<typeof feedbackCategorySchema>;

export const feedbackStatusSchema = z.enum(["OPEN", "IN_PROGRESS", "RESOLVED"]);
export type FeedbackStatus = z.infer<typeof feedbackStatusSchema>;

export const createFeedbackSchema = z.object({
  category: feedbackCategorySchema.default("BUG"),
  subject: z
    .string()
    .trim()
    .min(3, "Subjek/judul minimal 3 karakter")
    .max(120, "Subjek maksimal 120 karakter"),
  message: z
    .string()
    .trim()
    .min(10, "Pesan kendala/feedback minimal 10 karakter")
    .max(3000, "Pesan maksimal 3000 karakter"),
});

export type CreateFeedbackInput = z.infer<typeof createFeedbackSchema>;

export const updateFeedbackStatusSchema = z.object({
  id: z.string().min(1, "ID feedback wajib diisi"),
  status: feedbackStatusSchema,
  adminNote: z.string().max(2000, "Catatan maksimal 2000 karakter").optional().nullable(),
});

export type UpdateFeedbackStatusInput = z.infer<typeof updateFeedbackStatusSchema>;

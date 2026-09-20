import { z } from "zod";

export const reportStatusSchema = z.enum(["DRAFT", "SUBMITTED", "FAILED"]);
export type ReportStatus = z.infer<typeof reportStatusSchema>;

export const reportItemSchema = z.object({
  id: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
  activity: z.string().min(100, "Uraian aktivitas minimal 100 karakter"),
  learning: z.string().min(100, "Pembelajaran minimal 100 karakter"),
  obstacles: z.string().min(100, "Kendala minimal 100 karakter"),
  sourceType: z.string().optional(),
  status: reportStatusSchema,
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type ReportItem = z.infer<typeof reportItemSchema>;

export const saveReportSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
  activity: z.string().min(100, "Uraian aktivitas minimal 100 karakter"),
  learning: z.string().min(100, "Pembelajaran minimal 100 karakter"),
  obstacles: z.string().min(100, "Kendala minimal 100 karakter"),
});

export type SaveReportPayload = z.infer<typeof saveReportSchema>;

export const generateReportSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD").optional(),
});

export type GenerateReportPayload = z.infer<typeof generateReportSchema>;

export const deleteReportSchema = z.object({
  id: z.string().min(1, "ID laporan wajib diisi"),
});

export type DeleteReportPayload = z.infer<typeof deleteReportSchema>;

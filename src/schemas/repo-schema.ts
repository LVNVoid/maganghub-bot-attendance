import { z } from "zod";

export const addRepoSchema = z.object({
  repo: z.string().min(1, "Nama atau URL repository GitHub wajib diisi"),
  branch: z.string().min(1, "Branch wajib diisi").default("main"),
});

export type AddRepoPayload = z.infer<typeof addRepoSchema>;

export const toggleTrackRepoSchema = z.object({
  repoId: z.string().min(1, "ID repository wajib diisi"),
  isActive: z.boolean(),
});

export type ToggleTrackRepoPayload = z.infer<typeof toggleTrackRepoSchema>;

export const deleteRepoSchema = z.object({
  repoId: z.string().min(1, "ID repository wajib diisi"),
});

export type DeleteRepoPayload = z.infer<typeof deleteRepoSchema>;

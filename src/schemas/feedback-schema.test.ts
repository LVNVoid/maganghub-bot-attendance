import { describe, it, expect } from "vitest";
import {
  createFeedbackSchema,
  updateFeedbackStatusSchema,
} from "./feedback-schema";

describe("Feedback Schema Validation", () => {
  it("should accept valid feedback input", () => {
    const valid = {
      category: "BUG",
      subject: "Kendala submit absensi",
      message: "Saat menekan tombol submit muncul pesan error 500 dari server.",
    };
    const res = createFeedbackSchema.safeParse(valid);
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.category).toBe("BUG");
      expect(res.data.subject).toBe("Kendala submit absensi");
    }
  });

  it("should default category to BUG if omitted", () => {
    const withoutCat = {
      subject: "Ada saran fitur baru",
      message: "Bisa ditambahkan ekspor PDF untuk rekap kehadiran bulanan?",
    };
    const res = createFeedbackSchema.safeParse(withoutCat);
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.category).toBe("BUG");
    }
  });

  it("should reject subject shorter than 3 characters", () => {
    const invalid = {
      category: "BUG",
      subject: "Hi",
      message: "Deskripsi kendala yang cukup panjang lebih dari sepuluh karakter.",
    };
    const res = createFeedbackSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });

  it("should reject message shorter than 10 characters", () => {
    const invalid = {
      category: "FEATURE",
      subject: "Saran fitur",
      message: "Pendek",
    };
    const res = createFeedbackSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });

  it("should reject invalid category", () => {
    const invalid = {
      category: "INVALID_CAT",
      subject: "Kendala login",
      message: "Pesan kendala yang valid dan cukup panjang.",
    };
    const res = createFeedbackSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });

  it("should validate updateFeedbackStatusSchema correctly", () => {
    const valid = {
      id: "feedback-123",
      status: "RESOLVED",
      adminNote: "Kendala telah diperbaiki pada release terbaru.",
    };
    const res = updateFeedbackStatusSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it("should reject invalid status in updateFeedbackStatusSchema", () => {
    const invalid = {
      id: "feedback-123",
      status: "UNKNOWN_STATUS",
    };
    const res = updateFeedbackStatusSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });
});

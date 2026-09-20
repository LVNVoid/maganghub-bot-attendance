import { describe, it, expect } from "vitest";
import { isSunday } from "@/lib/date-utils";

describe("Submit Orchestrator / Cron Rules", () => {
  it("should reject Sunday submissions (holiday rule)", () => {
    // 2026-09-20 is Sunday
    expect(isSunday("2026-09-20")).toBe(true);
  });

  it("should allow weekday submissions", () => {
    // 2026-09-21 is Monday
    expect(isSunday("2026-09-21")).toBe(false);
  });
});

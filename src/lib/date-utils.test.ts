import { describe, it, expect } from "vitest";
import { isSunday, getDayNameId, getTodayJakartaStr } from "./date-utils";

describe("date-utils", () => {
  it("should correctly identify Sunday in WIB timezone", () => {
    // 2026-09-20 is Sunday
    expect(isSunday("2026-09-20")).toBe(true);
    expect(getDayNameId("2026-09-20")).toBe("Minggu");

    // 2026-09-21 is Monday
    expect(isSunday("2026-09-21")).toBe(false);
    expect(getDayNameId("2026-09-21")).toBe("Senin");

    // 2026-09-19 is Saturday
    expect(isSunday("2026-09-19")).toBe(false);
    expect(getDayNameId("2026-09-19")).toBe("Sabtu");
  });

  it("should return valid YYYY-MM-DD format for getTodayJakartaStr", () => {
    const todayStr = getTodayJakartaStr();
    expect(todayStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

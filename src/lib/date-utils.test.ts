import { describe, it, expect } from "vitest";
import { isSunday, getDayNameId, getTodayJakartaStr, isScheduledDay, formatScheduleDays } from "./date-utils";

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

  it("should correctly check if a date is within custom scheduled days", () => {
    // 2026-09-20 is Sunday (0)
    // 2026-09-21 is Monday (1)
    // 2026-09-26 is Saturday (6)
    const monToFri = "1,2,3,4,5";
    const monToSat = "1,2,3,4,5,6";

    expect(isScheduledDay(monToFri, "2026-09-21")).toBe(true);
    expect(isScheduledDay(monToFri, "2026-09-26")).toBe(false);
    expect(isScheduledDay(monToFri, "2026-09-20")).toBe(false);

    expect(isScheduledDay(monToSat, "2026-09-26")).toBe(true);
    expect(isScheduledDay(monToSat, "2026-09-20")).toBe(false);
  });

  it("should correctly format schedule days for cron and label", () => {
    expect(formatScheduleDays("1,2,3,4,5")).toEqual({
      cronDays: "1-5",
      label: "Senin - Jumat",
    });

    expect(formatScheduleDays("1,2,3,4,5,6")).toEqual({
      cronDays: "1-6",
      label: "Senin - Sabtu",
    });

    expect(formatScheduleDays("0,1,2,3,4,5,6")).toEqual({
      cronDays: "*",
      label: "Setiap Hari",
    });

    expect(formatScheduleDays("1,3,5")).toEqual({
      cronDays: "1,3,5",
      label: "Senin, Rabu, Jumat",
    });
  });
});

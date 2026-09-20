import { describe, it, expect } from "vitest";
import { MagangHubApiClient } from "./maganghub-api";

describe("MagangHub API Client", () => {
  it("should have login and submitDailyLog static methods", () => {
    expect(typeof MagangHubApiClient.login).toBe("function");
    expect(typeof MagangHubApiClient.submitDailyLog).toBe("function");
  });

  it("should handle error gracefully on bad submit token", async () => {
    const result = await MagangHubApiClient.submitDailyLog("invalid_token", {
      date: "2026-09-20",
      status: "PRESENT",
      activity_log: "Pengerjaan sistem informasi dan pengujian fungsi aplikasi.",
      lesson_learned: "Mempelajari integrasi protokol komunikasi HTTP direct API.",
      obstacles: "Tidak ada kendala kritis yang menghambat pelaksanaan tugas.",
    });

    expect(result.success).toBe(false);
    expect(result.httpCode).toBeDefined();
  });
});

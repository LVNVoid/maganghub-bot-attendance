import { describe, it, expect } from "vitest";
import { ensureMinLength, generateFallbackReport, generateReportFromActivity } from "./ai";

describe("AI Report Generator Module", () => {
  it("ensureMinLength should keep text >= 100 chars untouched", () => {
    const longText = "a".repeat(120);
    expect(ensureMinLength(longText, "padding")).toBe(longText);
  });

  it("ensureMinLength should append padding when text is < 100 chars", () => {
    const shortText = "Teks pendek aktivitas.";
    const result = ensureMinLength(shortText, "Penjelasan tambahan untuk memenuhi batas karakter.");
    expect(result.length).toBeGreaterThanOrEqual(100);
    expect(result.startsWith("Teks pendek aktivitas.")).toBe(true);
  });

  it("generateFallbackReport should produce 3 sections, each >= 100 chars", () => {
    const report = generateFallbackReport("feat: user authentication; fix: css bug");
    expect(report.activity_log.length).toBeGreaterThanOrEqual(100);
    expect(report.lesson_learned.length).toBeGreaterThanOrEqual(100);
    expect(report.obstacles.length).toBeGreaterThanOrEqual(100);
  });

  it("generateReportFromActivity should work even without API key using fallback", async () => {
    delete process.env.OPENAI_API_KEY;
    delete process.env.GROQ_API_KEY;

    const report = await generateReportFromActivity("- [repo]: initial commit");
    expect(report.activity_log.length).toBeGreaterThanOrEqual(100);
    expect(report.lesson_learned.length).toBeGreaterThanOrEqual(100);
    expect(report.obstacles.length).toBeGreaterThanOrEqual(100);
  });
});

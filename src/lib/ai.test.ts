import { describe, it, expect } from "vitest";
import {
  ensureMinLength,
  generateFallbackReport,
  generateReportFromActivity,
  cleanReportText,
  clampReportLength,
  extractJsonFromAiResponse,
} from "./ai";

describe("AI Report Generator Module", () => {
  it("extractJsonFromAiResponse should correctly extract JSON wrapped in thinking tags and markdown", () => {
    const aiOutput = `<thinking>
Some detailed chain of thought reasoning here...
</thinking>

\`\`\`json
{
  "activity_log": "Melakukan penyesuaian alur kerja operasional.",
  "lesson_learned": "Memahami validasi data medis.",
  "obstacles": "Menyesuaikan integrasi tampilan."
}
\`\`\``;

    const parsed = extractJsonFromAiResponse(aiOutput);
    expect(parsed.activity_log).toBe("Melakukan penyesuaian alur kerja operasional.");
    expect(parsed.lesson_learned).toBe("Memahami validasi data medis.");
  });

  it("extractJsonFromAiResponse should extract raw JSON object with leading whitespace", () => {
    const raw = '\n\n{"activity_log":"Teks satu","lesson_learned":"Teks dua","obstacles":"Teks tiga"}\n';
    const parsed = extractJsonFromAiResponse(raw);
    expect(parsed.activity_log).toBe("Teks satu");
  });

  it("generateFallbackReport should parse semicolon-separated commits without dumping raw syntax", () => {
    const summary = "- [repo]: fix(gitignore): uncomment env; feat(klaim): integrasi dializer; refactor(klaim): gunakan sql";
    const report = generateFallbackReport(summary);
    expect(report.activity_log).not.toContain("feat(klaim):");
    expect(report.activity_log).not.toContain("refactor(klaim):");
  });
  it("cleanReportText should strip em dashes, double hyphens, and markdown syntax", () => {
    const raw = "Menambahkan fitur — sangat penting -- untuk `sistem` **pengguna**.";
    expect(cleanReportText(raw)).toBe("Menambahkan fitur , sangat penting , untuk sistem pengguna.");
  });

  it("clampReportLength should cap text to max 500 characters and end on sentence boundary", () => {
    const sentence = "Kalimat uji coba validasi laporan magang harian yang padat dan informatif. ";
    const longText = sentence.repeat(10); // ~750 chars
    const clamped = clampReportLength(longText, 500);
    expect(clamped.length).toBeLessThanOrEqual(500);
    expect(clamped.length).toBeGreaterThanOrEqual(100);
    expect(clamped.endsWith(".")).toBe(true);
  });

  it("ensureMinLength should keep text >= 100 chars untouched when within 500 chars", () => {
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

import axios from "axios";

export interface GeneratedReport {
  activity_log: string;
  lesson_learned: string;
  obstacles: string;
}

const MIN_CHAR_LENGTH = 100;

export function ensureMinLength(text: string, fallbackAddition: string): string {
  let cleaned = text.trim();
  if (cleaned.length >= MIN_CHAR_LENGTH) {
    return cleaned;
  }

  // Append professional contextual sentence to meet >= 100 chars
  while (cleaned.length < MIN_CHAR_LENGTH) {
    cleaned += ` ${fallbackAddition}`;
  }
  return cleaned;
}

export function generateFallbackReport(activitySummary: string): GeneratedReport {
  // Extract clean lines from activitySummary
  const lines = activitySummary
    .split("\n")
    .map((l) => l.trim().replace(/^-\s*(\[[^\]]+\]:\s*)?/, "").replace(/\s*\([a-f0-9]{7,}\)/gi, ""))
    .filter(Boolean);

  const cleanDescription = lines.join("; ") || "Melakukan penyesuaian kode, perbaikan bug, dan pengujian fungsionalitas fitur aplikasi.";

  const activity_log = ensureMinLength(
    `Melaksanakan pengerjaan tugas pengembangan perangkat lunak sesuai target sprint, dengan fokus aktivitas: ${cleanDescription}.`,
    "Seluruh implementasi telah diuji secara menyeluruh untuk memastikan stabilitas dan kesiapan fungsionalitas sistem berjalan dengan optimal."
  );

  const lesson_learned = ensureMinLength(
    `Memperoleh pemahaman mendalam terkait implementasi dan pemeliharaan komponen perangkat lunak, pentingnya validasi alur data secara konsisten, serta penguatan teknik debugging yang efektif dalam siklus pengembangan aplikasi modern.`,
    "Pembelajaran ini memperkuat kemampuan analisis teknis dan penerapan standar rekayasa perangkat lunak yang terstruktur pada skala produksi."
  );

  const obstacles = ensureMinLength(
    `Menghadapi penyesuaian konfigurasi dan sinkronisasi parameter teknis pada alur kerja aplikasi, yang berhasil diatasi melalui penelusuran log secara cermat serta pengujian berulang hingga seluruh fungsi berjalan sesuai spesifikasi.`,
    "Tidak ada kendala kritis lain yang menghambat pelaksanaan tugas pengerjaan hari ini."
  );

  return {
    activity_log,
    lesson_learned,
    obstacles,
  };
}

export async function generateReportFromActivity(
  activitySummary: string
): Promise<GeneratedReport> {
  const apiKey = process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY;
  const isGroq = !process.env.OPENAI_API_KEY && !!process.env.GROQ_API_KEY;

  if (!apiKey) {
    return generateFallbackReport(activitySummary);
  }

  const endpoint = isGroq
    ? "https://api.groq.com/openai/v1/chat/completions"
    : "https://api.openai.com/v1/chat/completions";

  const model = isGroq ? "llama-3.3-70b-versatile" : "gpt-4o-mini";

  const systemPrompt = `Anda adalah asisten cerdas untuk peserta magang Kemnaker.
Tugas Anda adalah membuat laporan harian magang berdasarkan ringkasan aktivitas/commit pengerjaan software.
Format laporan WAJIB terdiri dari 3 bagian:
1. activity_log: Uraian aktivitas pengerjaan harian yang berfokus pada hasil dan fungsi nyata dalam bahasa Indonesia semi-formal tanpa jargon kode/nama fungsi mentah (MINIMAL 100 KARAKTER).
2. lesson_learned: Pembelajaran teknis dan profesional yang diperoleh (MINIMAL 100 KARAKTER).
3. obstacles: Kendala teknis atau tantangan yang dihadapi serta solusinya (MINIMAL 100 KARAKTER).

Kembalikan respon HANYA dalam format JSON:
{
  "activity_log": "...",
  "lesson_learned": "...",
  "obstacles": "..."
}`;

  try {
    const response = await axios.post(
      endpoint,
      {
        model,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Berikut adalah ringkasan aktivitas/commit hari ini:\n${activitySummary}\n\nBuat laporan magang harian 3 bagian (masing-masing minimal 100 karakter).`,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    const content = response.data?.choices?.[0]?.message?.content;
    if (!content) {
      return generateFallbackReport(activitySummary);
    }

    const parsed = JSON.parse(content);

    return {
      activity_log: ensureMinLength(
        parsed.activity_log || "",
        "Seluruh tahapan pengerjaan telah diselesaikan dan diverifikasi dengan baik sesuai target yang ditentukan."
      ),
      lesson_learned: ensureMinLength(
        parsed.lesson_learned || "",
        "Hal ini memberikan pemahaman mendalam tentang praktik terbaik dalam pengembangan perangkat lunak modern."
      ),
      obstacles: ensureMinLength(
        parsed.obstacles || "",
        "Tantangan teknis berhasil diatasi secara mandiri melalui analisis dokumentasi resmi dan pengujian berulang."
      ),
    };
  } catch (error) {
    console.warn("AI generation error, falling back to template:", error);
    return generateFallbackReport(activitySummary);
  }
}

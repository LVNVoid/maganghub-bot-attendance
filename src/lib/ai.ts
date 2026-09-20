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

function translateCommit(rawMsg: string): {
  text: string;
  category: "feat" | "fix" | "refactor" | "docs" | "config" | "general";
} {
  let msg = rawMsg.trim().replace(/\s*\([a-f0-9]{7,}\)/gi, "").trim();

  // Parse conventional commit format
  const match = msg.match(/^([a-z]+)(?:\(([^)]+)\))?\s*:\s*(.+)$/i);
  let type = "";
  let scope = "";
  let desc = msg;

  if (match) {
    type = match[1].toLowerCase();
    scope = match[2] ? match[2].trim() : "";
    desc = match[3].trim();
  }

  let category: "feat" | "fix" | "refactor" | "docs" | "config" | "general" = "general";
  let actionText = "";

  if (type === "fix" || type === "bugfix") {
    category = "fix";
    actionText = scope
      ? `Melakukan perbaikan dan penyesuaian kendala pada modul ${scope}`
      : "Melakukan perbaikan kendala teknis pada sistem";
  } else if (type === "feat" || type === "feature") {
    category = "feat";
    actionText = scope
      ? `Mengembangkan dan menambahkan fungsionalitas baru pada modul ${scope}`
      : "Mengembangkan fungsionalitas baru pada sistem";
  } else if (type === "refactor") {
    category = "refactor";
    actionText = scope
      ? `Melakukan restrukturisasi dan optimasi kode pada komponen ${scope}`
      : "Melakukan restrukturisasi dan perapian arsitektur kode aplikasi";
  } else if (type === "docs") {
    category = "docs";
    actionText = scope
      ? `Menyusun dan memperbarui dokumentasi teknis terkait ${scope}`
      : "Menyusun dan memperbarui dokumentasi teknis proyek";
  } else if (type === "chore" || type === "build" || type === "ci" || type === "config") {
    category = "config";
    actionText = scope
      ? `Melakukan konfigurasi lingkungan dan build sistem pada ${scope}`
      : "Melakukan konfigurasi lingkungan dan pemeliharaan dependensi sistem";
  } else {
    actionText = scope
      ? `Melakukan penyesuaian teknis pada bagian ${scope}`
      : "Melakukan penyesuaian teknis pada alur kerja aplikasi";
  }

  let translatedDesc = desc
    .replace(/\bupdate live demo url for\b/gi, "pembaruan tautan demo langsung untuk")
    .replace(/\bupdate\b/gi, "pembaruan")
    .replace(/\badd\b/gi, "penambahan")
    .replace(/\bcreate\b/gi, "pembuatan")
    .replace(/\bfix\b/gi, "perbaikan")
    .replace(/\bremove\b/gi, "penghapusan")
    .replace(/\bdelete\b/gi, "penghapusan")
    .replace(/\bchange\b/gi, "pengubahan")
    .replace(/\bimplement\b/gi, "implementasi")
    .replace(/\bsupport\b/gi, "dukungan")
    .replace(/\bto match\b/gi, "agar sesuai dengan")
    .replace(/\bfor\b/gi, "pada")
    .replace(/\bto\b/gi, "ke")
    .replace(/\band\b/gi, "serta")
    .replace(/\bwith\b/gi, "dengan");

  translatedDesc = translatedDesc.charAt(0).toLowerCase() + translatedDesc.slice(1);

  return {
    text: `${actionText}, yaitu ${translatedDesc}.`,
    category,
  };
}

export function generateFallbackReport(activitySummary: string): GeneratedReport {
  // Extract individual commit lines
  const rawLines = activitySummary
    .split("\n")
    .map((l) => l.trim().replace(/^-\s*(\[[^\]]+\]:\s*)?/, ""))
    .filter(Boolean);

  const parsedCommits = rawLines.map(translateCommit);
  const primaryCategory = parsedCommits[0]?.category || "general";

  // Build activity log directly from parsed commits
  let activity_log = "";
  if (parsedCommits.length > 0) {
    const descriptions = parsedCommits.map((c) => c.text).join(" Selain itu, ");
    activity_log = ensureMinLength(
      descriptions,
      "Seluruh tahapan implementasi telah diuji dan diverifikasi secara lokal untuk memastikan stabilitas serta kesiapan fungsionalitas sistem berjalan lancar."
    );
  } else {
    activity_log = ensureMinLength(
      "Melakukan penyesuaian logika sistem, refactoring komponen kode, dan pengujian berkala pada antarmuka aplikasi secara lokal.",
      "Aktivitas ini dilakukan untuk memastikan seluruh alur interaksi pengguna berjalan dengan stabil tanpa hambatan teknis."
    );
  }

  // Generate contextual learning based on primary category
  let lesson_learned = "";
  switch (primaryCategory) {
    case "fix":
      lesson_learned = ensureMinLength(
        "Memahami pentingnya ketelitian dalam validasi tautan eksternal, penelusuran alur integrasi data, serta teknik verifikasi endpoint produksi agar layanan yang diakses pengguna tetap stabil dan akurat.",
        "Pembelajaran ini memperkuat kemampuan analisis akar masalah dan pemecahan bug secara sistematis pada sistem operasional."
      );
      break;
    case "feat":
      lesson_learned = ensureMinLength(
        "Mempelajari perancangan antarmuka responsif dan penyelarasan logika bisnis baru, penanganan validasi masukan data, serta alur pengujian fungsional sebelum fitur digabungkan ke cabang utama sistem.",
        "Hal ini memperdalam wawasan tentang standar rekayasa perangkat lunak yang terukur dan ramah pengguna."
      );
      break;
    case "refactor":
      lesson_learned = ensureMinLength(
        "Memperdalam prinsip Clean Code dan pemisahan tanggung jawab komponen modul, efisiensi pembacaan kode, serta teknik perapian struktur direktori agar aplikasi lebih mudah dikembangkan dan dirawat dalam jangka panjang.",
        "Penerapan refactoring ini penting guna meminimalkan akumulasi technical debt pada basis kode aplikasi."
      );
      break;
    case "config":
      lesson_learned = ensureMinLength(
        "Memahami standarisasi alur otomatisasi build sistem, pengelolaan dependensi aplikasi, serta pentingnya konfigurasi variabel lingkungan yang aman dan konsisten antar tahap pengembangan.",
        "Pengetahuan ini menunjang kesiapan pipeline integrasi dan perilisan aplikasi secara berkelanjutan."
      );
      break;
    default:
      lesson_learned = ensureMinLength(
        "Memperoleh pemahaman komprehensif mengenai siklus pemeliharaan kode sumber, pentingnya dokumentasi riwayat perubahan yang terstruktur, serta koordinasi teknis dalam memastikan kualitas perangkat lunak.",
        "Pembelajaran ini meningkatkan kedisiplinan rekayasa perangkat lunak dalam alur kerja profesional."
      );
  }

  // Generate contextual obstacles based on primary category
  let obstacles = "";
  switch (primaryCategory) {
    case "fix":
      obstacles = ensureMinLength(
        "Menemukan ketidaksesuaian alamat tautan atau respons server saat pengujian awal, yang berhasil diselesaikan dengan memeriksa konfigurasi domain serta memperbarui URL tujuan secara tepat.",
        "Tidak ada kendala kritis lain yang menghambat penyelesaian tugas pemeliharaan sistem hari ini."
      );
      break;
    case "feat":
      obstacles = ensureMinLength(
        "Menghadapi tantangan dalam menyelaraskan format data antar komponen antarmuka, yang berhasil diatasi melalui penyesuaian tipe data dan pengujian alur interaksi secara menyeluruh.",
        "Seluruh fungsionalitas baru kini telah terintegrasi dengan baik dan siap digunakan."
      );
      break;
    case "refactor":
      obstacles = ensureMinLength(
        "Perlu memastikan proses refactoring tidak mengubah alur kerja fungsi yang sudah berjalan sebelumnya, yang diselesaikan dengan melakukan pengetesan regresi secara bertahap pada setiap modul terkait.",
        "Seluruh pengujian menunjukkan hasil yang konsisten tanpa menimbulkan efek samping pada fungsi lain."
      );
      break;
    case "config":
      obstacles = ensureMinLength(
        "Menyesuaikan perbedaan konfigurasi antara lingkungan pengembangan lokal dan server tujuan, yang diatasi dengan standarisasi parameter konfigurasi dan analisis log secara teliti.",
        "Kendala konfigurasi telah teratasi sepenuhnya dan build sistem berjalan tanpa hambatan."
      );
      break;
    default:
      obstacles = ensureMinLength(
        "Menghadapi penyesuaian minor pada sinkronisasi alur kerja antarmuka dan data, yang berhasil diatasi secara mandiri melalui pengecekan ulang kode dan pengujian berkala.",
        "Pengerjaan tugas harian dapat diselesaikan sesuai target yang telah direncanakan."
      );
  }

  return {
    activity_log,
    lesson_learned,
    obstacles,
  };
}

export async function generateReportFromActivity(
  activitySummary: string
): Promise<GeneratedReport> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return generateFallbackReport(activitySummary);
  }

  const endpoint = "https://api.openai.com/v1/chat/completions";
  const model = "gpt-4o-mini";

  const systemPrompt = `Anda adalah asisten khusus penulisan laporan harian magang kerja Kemnaker RI.
Tugas Anda adalah mengubah ringkasan commit/aktivitas teknis pengguna menjadi laporan harian resmi, terstruktur, kontekstual, dan mudah dipahami oleh pembimbing maupun manajemen.

ATURAN UTAMA:
1. Format Wajib 3 Bagian (JSON):
   - activity_log: Uraian aktivitas pengerjaan nyata yang dikerjakan hari ini berdasarkan commit yang ada. Tulis secara aktif, deskriptif, dan jelaskan tujuannya tanpa mencantumkan teks pembuka klise/generik. Minimal 100 karakter.
   - lesson_learned: Pembelajaran teknis atau profesional yang diperoleh dari pengerjaan aktivitas tersebut (pemahaman arsitektur, teknik penanganan error, validasi data, dll.). Minimal 100 karakter.
   - obstacles: Tantangan logis yang dihadapi selama pengerjaan dan solusi konkret yang dilakukan untuk mengatasinya. Minimal 100 karakter.
2. Gaya Bahasa:
   - Bahasa Indonesia baku, formal, profesional.
   - DILARANG menggunakan kalimat pembuka klise atau boilerplate berulang (seperti "Melaksanakan pengerjaan tugas pengembangan perangkat lunak sesuai target sprint, dengan fokus aktivitas:").
   - Langsung jelaskan pekerjaan nyata yang dilakukan dan dampaknya bagi sistem.
3. Output HANYA format JSON murni:
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

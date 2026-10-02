import axios from "axios";

export interface GeneratedReport {
  activity_log: string;
  lesson_learned: string;
  obstacles: string;
}

const MIN_CHAR_LENGTH = 100;

export function cleanReportText(text: string): string {
  if (!text) return "";
  return text
    .replace(/[—–]/g, ", ")
    .replace(/--+/g, ", ")
    .replace(/[`*#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function ensureMinLength(text: string, fallbackAddition: string): string {
  let cleaned = cleanReportText(text);
  if (cleaned.length >= MIN_CHAR_LENGTH) {
    return cleaned;
  }

  // Append professional contextual sentence to meet >= 100 chars
  while (cleaned.length < MIN_CHAR_LENGTH) {
    cleaned += ` ${fallbackAddition}`;
  }
  return cleaned;
}

function cleanScope(scope: string): string {
  if (!scope) return "";
  const cleaned = scope.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]/g, " ").trim();
  if (
    /^(ts|tsx|js|jsx|json|css|sql|db|repo|lib|action|actions|service|services|component|components|util|utils)$/i.test(
      cleaned
    )
  ) {
    return "";
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

  const humanScope = cleanScope(scope);

  let category: "feat" | "fix" | "refactor" | "docs" | "config" | "general" = "general";
  let actionText = "";

  if (type === "fix" || type === "bugfix") {
    category = "fix";
    actionText = humanScope
      ? `Melakukan perbaikan kendala pada bagian ${humanScope}`
      : "Melakukan perbaikan kendala operasional pada sistem";
  } else if (type === "feat" || type === "feature") {
    category = "feat";
    actionText = humanScope
      ? `Menambahkan fungsi baru pada bagian ${humanScope}`
      : "Menambahkan fungsi baru untuk mendukung alur kerja pengguna";
  } else if (type === "refactor") {
    category = "refactor";
    actionText = humanScope
      ? `Merapikan dan menata ulang alur kerja ${humanScope}`
      : "Merapikan dan menyederhanakan alur kerja sistem";
  } else if (type === "docs") {
    category = "docs";
    actionText = humanScope
      ? `Memperbarui panduan alur kerja ${humanScope}`
      : "Memperbarui catatan dan panduan alur kerja sistem";
  } else if (type === "chore" || type === "build" || type === "ci" || type === "config") {
    category = "config";
    actionText = humanScope
      ? `Menyesuaikan pengaturan konfigurasi pada ${humanScope}`
      : "Menyesuaikan pengaturan konfigurasi dan lingkungan kerja sistem";
  } else {
    actionText = humanScope
      ? `Melakukan penyesuaian pada bagian ${humanScope}`
      : "Melakukan penyesuaian pada alur kerja sistem";
  }

  let translatedDesc = desc
    .replace(/\b[a-f0-9]{7,40}\b/gi, "")
    .replace(/[a-zA-Z0-9_\-\/]+\.(ts|tsx|js|jsx|json|prisma|sql|css|md)\b/gi, "modul terkait")
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
    .replace(/\bwith\b/gi, "dengan")
    .replace(/\s+/g, " ")
    .trim();

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
      cleanReportText(descriptions),
      "Seluruh pengujian dilakukan secara lokal guna memastikan fungsionalitas aplikasi berjalan sesuai target."
    );
  } else {
    activity_log = ensureMinLength(
      "Melakukan penyesuaian alur kerja sistem, perapian komponen antarmuka, dan pengujian fitur aplikasi secara lokal.",
      "Langkah ini memastikan setiap alur interaksi pengguna dapat digunakan dengan stabil dan mudah."
    );
  }

  // Generate contextual learning based on primary category
  let lesson_learned = "";
  switch (primaryCategory) {
    case "fix":
      lesson_learned = ensureMinLength(
        "Memahami alur pemeriksaan kendala teknis secara terstruktur dan langkah verifikasi perbaikan pada sistem.",
        "Hal ini melatih ketelitian dalam menganalisis akar masalah agar layanan aplikasi tetap berjalan lancar."
      );
      break;
    case "feat":
      lesson_learned = ensureMinLength(
        "Mempelajari perancangan antarmuka yang ramah pengguna serta penyesuaian validasi masukan data pada aplikasi.",
        "Wawasan ini membantu memahami kebutuhan pengguna dan alur kerja fungsional yang mudah dipahami."
      );
      break;
    case "refactor":
      lesson_learned = ensureMinLength(
        "Memahami teknik perapian alur modul dan penataan struktur logika aplikasi agar lebih mudah dipelihara.",
        "Penerapan ini penting agar pemeliharaan sistem ke depan dapat dilakukan secara efektif."
      );
      break;
    case "config":
      lesson_learned = ensureMinLength(
        "Memahami pengelolaan parameter konfigurasi dan keselarasan lingkungan kerja aplikasi agar berjalan konsisten.",
        "Pengetahuan ini mendukung kelancaran pemeliharaan sistem pada setiap tahap pengembangan."
      );
      break;
    default:
      lesson_learned = ensureMinLength(
        "Memahami pentingnya ketelitian dalam penataan alur kerja aplikasi dan dokumentasi catatan perubahan berkala.",
        "Pembelajaran ini meningkatkan kedisiplinan serta kualitas kerja dalam menyelesaikan target tugas."
      );
  }

  // Generate contextual obstacles based on primary category
  let obstacles = "";
  switch (primaryCategory) {
    case "fix":
      obstacles = ensureMinLength(
        "Menemukan kendala saat proses pengujian awal, yang berhasil diselesaikan dengan pemeriksaan alur dan penyesuaian data.",
        "Pengujian lanjutan memastikan fungsi yang diperbaiki telah berjalan sesuai harapan."
      );
      break;
    case "feat":
      obstacles = ensureMinLength(
        "Memerlukan penyesuaian tampilan agar nyaman di berbagai perangkat, yang diatasi dengan uji responsif berkala.",
        "Seluruh fungsionalitas baru kini dapat diakses dengan baik oleh pengguna."
      );
      break;
    case "refactor":
      obstacles = ensureMinLength(
        "Perlu memastikan perapian alur tidak mengganggu fungsi yang sudah ada, yang diselesaikan dengan uji coba bertahap.",
        "Hasil pengujian menunjukkan alur sistem tetap bekerja konsisten tanpa kendala."
      );
      break;
    case "config":
      obstacles = ensureMinLength(
        "Menyesuaikan parameter konfigurasi lingkungan aplikasi, yang diselesaikan dengan pemeriksaan panduan teknis.",
        "Pengaturan sistem berhasil diselaraskan tanpa kendala lanjutan."
      );
      break;
    default:
      obstacles = ensureMinLength(
        "Menghadapi penyesuaian minor pada sinkronisasi alur kerja, yang diselesaikan melalui pengecekan ulang secara teliti.",
        "Pekerjaan harian dapat diselesaikan dengan baik sesuai target yang ditentukan."
      );
  }

  return {
    activity_log: cleanReportText(activity_log),
    lesson_learned: cleanReportText(lesson_learned),
    obstacles: cleanReportText(obstacles),
  };
}

export interface UserAiCredentials {
  baseUrl?: string;
  modelName?: string;
  apiKey?: string;
}

export async function generateReportFromActivity(
  activitySummary: string,
  userConfig?: UserAiCredentials | null
): Promise<GeneratedReport> {
  const apiKey = userConfig?.apiKey || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return generateFallbackReport(activitySummary);
  }

  const baseUrl =
    userConfig?.baseUrl ||
    process.env.OPENAI_BASE_URL ||
    "http://43.157.204.138:20128/v1";
  const model =
    userConfig?.modelName || process.env.OPENAI_MODEL || "combo-flash";
  const endpoint = `${baseUrl.replace(/\/+$/, "")}/chat/completions`;

  const systemPrompt = `Anda adalah asisten khusus penulisan laporan harian magang kerja Kemnaker RI untuk dibaca oleh pembimbing lapangan dan HRD non-teknis.
Tugas Anda: Mengubah catatan pengerjaan/commit teknis pengguna menjadi laporan harian resmi 3 bagian yang berorientasi hasil, bahasa Indonesia baku, padat, dan bebas dari jargon kode tingkat rendah serta AI slop.

ATURAN STRICT:
1. ZERO LOW-LEVEL CODE JARGON:
   - DILARANG menyebutkan nama file (*.ts, *.tsx, *.json, *.prisma, *.css, *.md), path direktori (src/...), nama fungsi/metode (generateReportDraft, fetchCommits), nama hook (useState, useEffect), variabel, tipe data, SQL query, branch git, atau hash commit.
   - Terjemahkan aktivitas teknis menjadi istilah alur kerja fungsional dan manfaat operasional bagi pengguna atau sistem.
   - Contoh DILARANG: "Mengubah file report-actions.ts dan fungsi fetchRepoCommits dengan menambahkan parameter fallbackToPrevious."
   - Contoh BENAR: "Menambahkan fitur konfirmasi otomatis saat data commit hari ini belum ada, sehingga sistem dapat menggunakan riwayat pengerjaan sebelumnya untuk menyusun laporan."

2. ZERO AI SLOP & ANTI-KLISE:
   - DILARANG menggunakan tanda em dash (—) atau tanda hubung ganda (--). Gunakan titik, koma, atau tanda kurung biasa.
   - DILARANG menggunakan kata-kata klise AI: "mulus", "seamless", "fondasi yang kokoh", "krusial", "perjalanan transformatif", "tapestry", "lanskap", "tidak hanya ... tetapi juga", "membuka potensi", "langkah signifikan", "revolusioner".
   - DILARANG menggunakan kalimat pembuka klise ("Pada hari ini...", "Melaksanakan tugas pengembangan..."). Langsung jelaskan pekerjaan inti.
   - DILARANG menggunakan kalimat penutup optimisme palsu ("Hal ini membuktikan dedikasi...", "Masa depan sistem terlihat cerah...").

3. TARGET PANJANG (100 - 180 KARAKTER PER BAGIAN):
   - Setiap bagian WAJIB memenuhi syarat minimal 100 karakter.
   - Jaga tetap ringkas dan padat: 100 hingga 180 karakter (1 sampai 2 kalimat substantif). Hindari narasi bertele-tele atau esai panjang (> 220 karakter).

4. KONTEN 3 BAGIAN:
   - activity_log: Tindakan nyata apa yang dikerjakan, fitur/alur apa yang diperbaiki/ditambahkan, dan manfaatnya bagi sistem atau pengguna.
   - lesson_learned: Konsep pemecahan masalah, alur kerja sistem, atau wawasan ketelitian data yang dipelajari.
   - obstacles: Satu tantangan praktis yang dihadapi (seperti ketelitian format tanggal, penyesuaian tata letak tampilan, atau validasi input) dan solusi konkret yang langsung diambil untuk mengatasinya.

5. OUTPUT HANYA JSON MURNI:
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
            content: `Berikut adalah ringkasan aktivitas/commit pengerjaan:\n${activitySummary}\n\nBuat laporan harian 3 bagian (activity_log, lesson_learned, obstacles). Bahasa Indonesia baku, tanpa menyebutkan nama file teknis atau kode, tanpa AI slop atau em dash, target panjang 100-180 karakter per bagian. Format JSON murni.`,
          },
        ],
        stream: false,
        response_format: { type: "json_object" },
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 25000,
      }
    );

    let content = response.data?.choices?.[0]?.message?.content;
    if (!content) {
      return generateFallbackReport(activitySummary);
    }

    // Clean any markdown wrapper if present
    content = content.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
    const parsed = JSON.parse(content);

    const rawActivity = cleanReportText(parsed.activity_log || "");
    const rawLearning = cleanReportText(parsed.lesson_learned || "");
    const rawObstacles = cleanReportText(parsed.obstacles || "");

    return {
      activity_log: ensureMinLength(
        rawActivity,
        "Pekerjaan telah diuji secara menyeluruh untuk memastikan seluruh alur fungsionalitas sistem berjalan dengan baik."
      ),
      lesson_learned: ensureMinLength(
        rawLearning,
        "Pembelajaran ini memperkuat pemahaman mengenai alur kerja aplikasi dan pentingnya ketelitian dalam pengujian."
      ),
      obstacles: ensureMinLength(
        rawObstacles,
        "Kendala teknis berhasil diselesaikan dengan baik melalui penyesuaian alur kerja serta pengujian ulang."
      ),
    };
  } catch (error) {
    console.warn("AI generation error, falling back to template:", error);
    return generateFallbackReport(activitySummary);
  }
}

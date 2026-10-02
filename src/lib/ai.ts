import axios from "axios";

export interface GeneratedReport {
  activity_log: string;
  lesson_learned: string;
  obstacles: string;
}

const MIN_CHAR_LENGTH = 100;
const MAX_CHAR_LENGTH = 500;

export function cleanReportText(text: string): string {
  if (!text) return "";
  return text
    .replace(/[—–]/g, ", ")
    .replace(/--+/g, ", ")
    .replace(/[`*#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function clampReportLength(text: string, maxLen = MAX_CHAR_LENGTH): string {
  const cleaned = cleanReportText(text);
  if (cleaned.length <= maxLen) return cleaned;

  const truncated = cleaned.slice(0, maxLen);
  const lastPeriod = Math.max(truncated.lastIndexOf(". "), truncated.lastIndexOf("."));
  if (lastPeriod >= MIN_CHAR_LENGTH) {
    return truncated.slice(0, lastPeriod + 1).trim();
  }
  return truncated.trim();
}

export function ensureMinLength(text: string, fallbackAddition: string): string {
  let cleaned = cleanReportText(text);
  if (cleaned.length >= MIN_CHAR_LENGTH) {
    return clampReportLength(cleaned);
  }

  // Append professional contextual sentence to meet >= 100 chars
  while (cleaned.length < MIN_CHAR_LENGTH) {
    cleaned += ` ${fallbackAddition}`;
  }
  return clampReportLength(cleaned);
}

export function extractJsonFromAiResponse(content: string): any {
  if (!content) throw new Error("Empty AI response");

  // 1. Strip reasoning/thinking tags (Claude, DeepSeek, etc.)
  let sanitized = content
    .replace(/<thinking>[\s\S]*?<\/thinking>/gi, "")
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .trim();

  // 2. Try direct parse
  try {
    return JSON.parse(sanitized);
  } catch {
    // continue to extract
  }

  // 3. Extract JSON markdown block ```json ... ``` or ``` ... ```
  const codeBlockMatch = sanitized.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch {
      // continue to brace match
    }
  }

  // 4. Find outermost object braces
  const firstBrace = sanitized.indexOf("{");
  const lastBrace = sanitized.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const candidate = sanitized.substring(firstBrace, lastBrace + 1).trim();
    try {
      return JSON.parse(candidate);
    } catch {
      // fallback error
    }
  }

  throw new Error("Unable to parse JSON from AI response: " + sanitized.slice(0, 80));
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
  // Extract individual commit lines, splitting both by newlines and semicolons
  const rawLines: string[] = [];
  const lines = activitySummary.split("\n");
  for (const line of lines) {
    const cleanLine = line.trim().replace(/^-\s*(\[[^\]]+\]:\s*)?/, "");
    if (!cleanLine) continue;
    // Split multiple commits joined by semicolon
    const parts = cleanLine.split(/;\s+/);
    for (const part of parts) {
      if (part.trim()) rawLines.push(part.trim());
    }
  }

  const parsedCommits = rawLines.map(translateCommit);
  const primaryCategory = parsedCommits[0]?.category || "general";

  // Build activity log directly from parsed commits
  let activity_log = "";
  if (parsedCommits.length > 0) {
    const descriptions = parsedCommits.map((c) => c.text).join(" Selain itu, ");
    activity_log = ensureMinLength(
      cleanReportText(descriptions),
      "Seluruh tahapan pengerjaan telah melalui proses pengujian lokal secara berkala guna memastikan alur kerja aplikasi berjalan lancar dan fungsionalitas fitur siap digunakan dengan baik."
    );
  } else {
    activity_log = ensureMinLength(
      "Melakukan penyesuaian alur kerja sistem, perapian komponen antarmuka, dan pengujian fitur aplikasi secara lokal.",
      "Langkah pengujian ini dilakukan untuk memastikan setiap alur interaksi pengguna dapat digunakan dengan stabil, mudah dipahami, serta bebas dari kendala tampilan pada berbagai perangkat."
    );
  }

  // Generate contextual learning based on primary category
  let lesson_learned = "";
  switch (primaryCategory) {
    case "fix":
      lesson_learned = ensureMinLength(
        "Memahami alur pemeriksaan kendala teknis secara terstruktur dan langkah verifikasi perbaikan pada sistem.",
        "Pembelajaran ini melatih ketelitian dalam menelusuri sumber masalah serta memahami pentingnya validasi menyeluruh agar layanan operasional tetap berjalan stabil dan dapat diandalkan oleh pengguna."
      );
      break;
    case "feat":
      lesson_learned = ensureMinLength(
        "Mempelajari perancangan antarmuka yang ramah pengguna serta penyesuaian validasi masukan data pada aplikasi.",
        "Hal ini memperdalam wawasan mengenai penyelarasan kebutuhan pengguna dengan kesiapan alur kerja sistem agar setiap fungsi baru mudah digunakan dan terintegrasi dengan baik."
      );
      break;
    case "refactor":
      lesson_learned = ensureMinLength(
        "Memahami teknik perapian alur modul dan penataan struktur logika aplikasi agar lebih mudah dipelihara.",
        "Penerapan ini penting guna mempermudah proses pemeliharaan berkelanjutan serta menjaga kejelasan alur logika kerja sistem dalam jangka panjang."
      );
      break;
    case "config":
      lesson_learned = ensureMinLength(
        "Memahami pengelolaan parameter konfigurasi dan keselarasan lingkungan kerja aplikasi agar berjalan konsisten.",
        "Pengetahuan ini menunjang kesiapan alur pemeliharaan sistem serta meminimalkan potensi ketidaksesuaian pengaturan antar lingkungan kerja pengembangan."
      );
      break;
    default:
      lesson_learned = ensureMinLength(
        "Memahami pentingnya ketelitian dalam penataan alur kerja aplikasi dan dokumentasi catatan perubahan berkala.",
        "Pembelajaran ini meningkatkan kedisiplinan kerja serta pemahaman terhadap alur pengembangan sistem yang terstruktur untuk mendukung penyelesaian target tugas dengan baik."
      );
  }

  // Generate contextual obstacles based on primary category
  let obstacles = "";
  switch (primaryCategory) {
    case "fix":
      obstacles = ensureMinLength(
        "Menemukan ketidaksesuaian perilaku sistem saat proses pengujian awal terhadap alur yang diperbaiki.",
        "Kendala ini berhasil diselesaikan dengan menelusuri kembali aliran data serta melakukan pengujian bertahap hingga seluruh fungsi yang diperbaiki berjalan normal tanpa efek samping."
      );
      break;
    case "feat":
      obstacles = ensureMinLength(
        "Menghadapi kebutuhan penyesuaian tata letak tampilan agar tetap proporsional dan nyaman diakses di berbagai ukuran layar.",
        "Tantangan ini diatasi melalui pengujian responsif berkala dan penataan ulang elemen antarmuka sehingga fungsionalitas baru dapat digunakan secara nyaman oleh pengguna."
      );
      break;
    case "refactor":
      obstacles = ensureMinLength(
        "Perlu memastikan proses perapian alur kerja tidak mengubah perilaku fungsi yang sudah berjalan sebelumnya.",
        "Hal ini diselesaikan dengan melakukan uji coba regresi fungsional secara bertahap pada setiap bagian terkait untuk memastikan konsistensi hasil keluaran sistem."
      );
      break;
    case "config":
      obstacles = ensureMinLength(
        "Menyesuaikan parameter konfigurasi lingkungan aplikasi agar selaras dengan kebutuhan alur kerja sistem.",
        "Kendala diselesaikan dengan memeriksa panduan teknis serta melakukan validasi parameter secara teliti hingga pengaturan sistem berjalan tanpa hambatan."
      );
      break;
    default:
      obstacles = ensureMinLength(
        "Menghadapi penyesuaian minor pada sinkronisasi alur kerja antar bagian aplikasi saat pengujian integrasi.",
        "Tantangan ini diselesaikan melalui pemeriksaan ulang alur data secara mandiri sehingga tugas pengerjaan harian dapat diselesaikan sesuai target yang direncanakan."
      );
  }

  return {
    activity_log: clampReportLength(activity_log),
    lesson_learned: clampReportLength(lesson_learned),
    obstacles: clampReportLength(obstacles),
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
Tugas Anda: Mengubah catatan pengerjaan/commit teknis pengguna menjadi laporan harian resmi 3 bagian yang terdengar wajar, natural, mengalir lancar, dan berorientasi hasil.

ATURAN STRICT:
1. ZERO LOW-LEVEL CODE JARGON:
   - DILARANG menyebutkan nama file (*.ts, *.tsx, *.json, *.prisma, *.css, *.md), path direktori (src/...), nama fungsi/metode (generateReportDraft, fetchCommits), nama hook (useState, useEffect), variabel, tipe data, SQL query, branch git, atau hash commit.
   - Terjemahkan aktivitas teknis menjadi istilah fungsional, fitur aplikasi, dan manfaat operasional bagi pengguna atau sistem.
   - Contoh DILARANG: "Mengubah file report-actions.ts dan fungsi fetchRepoCommits dengan menambahkan parameter fallbackToPrevious."
   - Contoh BENAR: "Menambahkan fitur konfirmasi otomatis saat data commit hari ini belum ada, sehingga sistem dapat menggunakan riwayat pengerjaan sebelumnya untuk menyusun laporan."

2. GAYA BAHASA NATURAL & ZERO AI SLOP:
   - Gunakan gaya bahasa Indonesia yang wajar dan mengalir alami, seperti ditulis oleh staf magang yang memahami pekerjaannya secara langsung.
   - DILARANG menggunakan tanda em dash (—) atau tanda hubung ganda (--). Gunakan titik, koma, atau tanda kurung biasa.
   - DILARANG menggunakan kata-kata klise AI: "mulus", "seamless", "fondasi yang kokoh", "krusial", "perjalanan transformatif", "tapestry", "lanskap", "tidak hanya ... tetapi juga", "membuka potensi", "langkah signifikan", "revolusioner".
   - DILARANG menggunakan kalimat pembuka klise ("Pada hari ini...", "Melaksanakan tugas pengembangan sesuai target sprint..."). Langsung jelaskan pekerjaan inti.
   - DILARANG menggunakan kalimat penutup optimisme palsu ("Hal ini membuktikan dedikasi...", "Masa depan sistem terlihat cerah...").

3. BATASAN PANJANG (MINIMAL 100 KARAKTER, MAKSIMAL 500 KARAKTER PER BAGIAN):
   - Setiap bagian WAJIB memenuhi syarat minimal 100 karakter.
   - BATASI MAKSIMAL 500 KARAKTER per bagian. Jangan melebihi 500 karakter.
   - Target panjang ideal yang natural: antara 200 hingga 450 karakter (2 sampai 4 kalimat padat yang mengalir wajar, jangan terlalu pendek atau kerdil).

4. KONTEN 3 BAGIAN:
   - activity_log: Ceritakan pekerjaan nyata yang dilakukan, tujuan fitur/alur yang ditambahkan atau diperbaiki, serta dampaknya pada kemudahan operasional sistem.
   - lesson_learned: Uraikan pemahaman alur sistem, kehati-hatian dalam validasi data, atau teknik analisis pemecahan masalah yang diperoleh dari pekerjaan tersebut.
   - obstacles: Jelaskan 1 tantangan praktis yang dihadapi selama pengerjaan (misal: penyesuaian logika validasi, sinkronisasi tampilan di layar pengguna, atau penanganan kondisi data kosong) beserta langkah solusi konkret yang diambil untuk menyelesaikannya.

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
            content: `Berikut adalah ringkasan aktivitas/commit pengerjaan:\n${activitySummary}\n\nBuat laporan harian 3 bagian (activity_log, lesson_learned, obstacles). Bahasa Indonesia formal dan natural, tanpa nama file/kode teknis, tanpa AI slop atau em dash. Panjang setiap bagian: 200-450 karakter (minimal 100 karakter, MAKSIMAL 500 KARAKTER). Format JSON murni.`,
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
        timeout: 90000,
      }
    );

    let content = response.data?.choices?.[0]?.message?.content;
    if (!content) {
      return generateFallbackReport(activitySummary);
    }

    const parsed = extractJsonFromAiResponse(content);

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

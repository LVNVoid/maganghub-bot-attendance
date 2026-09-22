/**
 * Utility modul tanggal dan validasi hari kerja magang Kemnaker RI.
 * Seluruh kalkulasi menggunakan basis zona waktu WIB (Asia/Jakarta / UTC+7).
 */

/**
 * Mendapatkan tanggal hari ini dalam zona waktu Asia/Jakarta (WIB) dengan format YYYY-MM-DD.
 */
export function getTodayJakartaStr(): string {
  const now = new Date();
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/**
 * Memeriksa apakah tanggal yang diberikan adalah hari Minggu dalam zona waktu WIB.
 * @param dateStr Format string YYYY-MM-DD
 */
export function isSunday(dateStr: string): boolean {
  // Gunakan jam 12:00 siang WIB untuk menghindari pergeseran tanggal akibat daylight/offset
  const date = new Date(`${dateStr}T12:00:00+07:00`);
  return date.getDay() === 0;
}

/**
 * Mendapatkan nama hari dalam bahasa Indonesia untuk suatu tanggal (WIB).
 * @param dateStr Format string YYYY-MM-DD
 */
export function getDayNameId(dateStr: string): string {
  const days = [
    "Minggu",
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu",
  ];
  const date = new Date(`${dateStr}T12:00:00+07:00`);
  return days[date.getDay()] || "";
}

/**
 * Memeriksa apakah hari suatu tanggal (WIB) termasuk dalam daftar hari yang dijadwalkan.
 * @param scheduleDays String berisi angka hari dipisah koma (contoh: "1,2,3,4,5,6")
 * @param dateStr Format string YYYY-MM-DD (opsional, default hari ini WIB)
 */
export function isScheduledDay(scheduleDays: string, dateStr?: string): boolean {
  const target = dateStr || getTodayJakartaStr();
  const date = new Date(`${target}T12:00:00+07:00`);
  const dayOfWeek = date.getDay().toString();
  const allowed = scheduleDays.split(",").map((d) => d.trim());
  return allowed.includes(dayOfWeek);
}

/**
 * Format string daftar hari menjadi ekspresi crontab dan label teks bahasa Indonesia.
 * @param scheduleDays String angka hari (contoh: "1,2,3,4,5,6")
 */
export function formatScheduleDays(scheduleDays: string): { cronDays: string; label: string } {
  const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const days = Array.from(
    new Set(
      scheduleDays
        .split(",")
        .map((d) => parseInt(d.trim(), 10))
        .filter((n) => !isNaN(n) && n >= 0 && n <= 6)
    )
  ).sort((a, b) => a - b);

  if (days.length === 0) {
    return { cronDays: "1-6", label: "Senin - Sabtu" };
  }

  if (days.length === 7) {
    return { cronDays: "*", label: "Setiap Hari" };
  }

  const isConsecutive = (arr: number[]) => {
    for (let i = 1; i < arr.length; i++) {
      if (arr[i] !== arr[i - 1] + 1) return false;
    }
    return true;
  };

  let cronDays = days.join(",");
  let label = days.map((d) => dayNames[d]).join(", ");

  if (days.length > 2 && isConsecutive(days)) {
    cronDays = `${days[0]}-${days[days.length - 1]}`;
    label = `${dayNames[days[0]]} - ${dayNames[days[days.length - 1]]}`;
  }

  return { cronDays, label };
}

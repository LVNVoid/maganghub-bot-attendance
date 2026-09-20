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

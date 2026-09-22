export function isSafeUrl(urlString: string): boolean {
  try {
    const parsed = new URL(urlString);

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }

    const host = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, "");

    // Loopback / Localhost
    if (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "0.0.0.0" ||
      host === "::1" ||
      host.endsWith(".local") ||
      host.endsWith(".internal") ||
      host.endsWith(".lan")
    ) {
      return false;
    }

    // Link-local / Cloud metadata (169.254.0.0/16)
    if (/^169\.254\./.test(host)) {
      return false;
    }

    // Private IPv4 ranges
    // 10.0.0.0/8
    if (/^10\./.test(host)) {
      return false;
    }
    // 172.16.0.0/12
    if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host)) {
      return false;
    }
    // 192.168.0.0/16
    if (/^192\.168\./.test(host)) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

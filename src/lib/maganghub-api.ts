import axios from "axios";

export interface MonevAuthToken {
  accessToken: string;
  tokenType: string;
}

export interface SubmitPayload {
  date: string; // YYYY-MM-DD
  status?: "PRESENT" | "SICK" | "LEAVE";
  activity_log: string;
  lesson_learned: string;
  obstacles: string;
}

export interface SubmitResult {
  success: boolean;
  httpCode: number;
  message: string;
  data?: unknown;
}

const MONEV_API_BASE = "https://monev-api.maganghub.kemnaker.go.id/api/v1";
const FRONTEND_BUILD_ID = "5554ff014eccd220f80524df263ae513d8ce1e25-production";
const DEFAULT_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const BROWSER_HEADERS = {
  "User-Agent": DEFAULT_USER_AGENT,
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
  "sec-ch-ua":
    '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"Windows"',
  "sec-fetch-dest": "document",
  "sec-fetch-mode": "navigate",
  "sec-fetch-site": "cross-site",
  "sec-fetch-user": "?1",
  "upgrade-insecure-requests": "1",
};

function mergeCookies(currentCookie: string, setCookieHeader: unknown): string {
  const cookieMap = new Map<string, string>();

  if (currentCookie) {
    currentCookie.split(";").forEach((part) => {
      const [k, ...v] = part.trim().split("=");
      if (k) cookieMap.set(k.trim(), v.join("="));
    });
  }

  const rawList: string[] = Array.isArray(setCookieHeader)
    ? setCookieHeader
    : typeof setCookieHeader === "string"
    ? [setCookieHeader]
    : [];

  for (const item of rawList) {
    const main = item.split(";")[0]?.trim();
    if (main) {
      const [k, ...v] = main.split("=");
      if (k) cookieMap.set(k.trim(), v.join("="));
    }
  }

  return Array.from(cookieMap.entries())
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}

function formatStepError(stepName: string, error: unknown): Error {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data as { message?: string; error?: string } | string | undefined;
    let detail = "";
    if (typeof data === "string") {
      detail = data.includes("<!DOCTYPE") ? "Halaman proteksi WAF/HTML terdeteksi" : data;
    } else if (data && typeof data === "object") {
      detail = data.message || data.error || JSON.stringify(data);
    } else {
      detail = error.message;
    }

    if (status === 403) {
      return new Error(
        `[${stepName}] Akses ditolak (403 Forbidden) oleh server/WAF Kemnaker (${detail}).`
      );
    }
    return new Error(`[${stepName}] HTTP ${status || "ERR"}: ${detail}`);
  }
  return error instanceof Error ? error : new Error(String(error));
}

export class MagangHubApiClient {
  /**
   * Login ke Monev MagangHub via SSO Kemnaker Direct REST API
   */
  static async login(username: string, password: string): Promise<MonevAuthToken> {
    // Step 1: Inisiasi SSO login
    let ssoUrl = "";
    let monevCookie = "";
    try {
      const initRes = await axios.get(`${MONEV_API_BASE}/auth/login`, {
        maxRedirects: 0,
        validateStatus: (status) => status >= 200 && status < 400,
        timeout: 10000,
        headers: {
          ...BROWSER_HEADERS,
          "X-Frontend-Build-ID": FRONTEND_BUILD_ID,
          Referer: "https://monev.maganghub.kemnaker.go.id/",
          Origin: "https://monev.maganghub.kemnaker.go.id",
        },
      });

      monevCookie = mergeCookies(monevCookie, initRes.headers["set-cookie"]);

      if (initRes.status === 302 || initRes.status === 301) {
        ssoUrl = initRes.headers.location || "";
      } else if (typeof initRes.data === "string" && initRes.data.startsWith("http")) {
        ssoUrl = initRes.data.trim();
      } else if (initRes.data?.data?.url) {
        ssoUrl = initRes.data.data.url;
      } else if (initRes.data?.url) {
        ssoUrl = initRes.data.url;
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 302 && err.response?.headers?.location) {
        ssoUrl = err.response.headers.location;
        monevCookie = mergeCookies(monevCookie, err.response.headers["set-cookie"]);
      } else {
        throw formatStepError("Step 1 - Inisiasi SSO Monev", err);
      }
    }

    if (!ssoUrl) {
      throw new Error("[Step 1 - Inisiasi SSO Monev] Redirect URL tidak ditemukan.");
    }

    // Step 2: Ambil CSRF Token dan Session Cookie dari SSO Kemnaker
    let csrfToken: string | null = null;
    let sessionCookie = "";
    try {
      let ssoPageHtml = "";
      let currentUrl = ssoUrl;
      let referer = "https://monev.maganghub.kemnaker.go.id/";

      // Ikuti redirect manual agar Set-Cookie 302 tidak hilang
      for (let redirectCount = 0; redirectCount < 3; redirectCount++) {
        const res = await axios.get(currentUrl, {
          maxRedirects: 0,
          validateStatus: (status) => status >= 200 && status < 400,
          timeout: 10000,
          headers: {
            ...BROWSER_HEADERS,
            Referer: referer,
            Cookie: sessionCookie,
          },
        });

        sessionCookie = mergeCookies(sessionCookie, res.headers["set-cookie"]);

        if (res.status === 302 || res.status === 301) {
          referer = currentUrl;
          const location = res.headers.location;
          if (!location) break;
          currentUrl = location.startsWith("http")
            ? location
            : new URL(location, currentUrl).toString();
        } else {
          ssoPageHtml = typeof res.data === "string" ? res.data : "";
          break;
        }
      }

      const csrfMatch = ssoPageHtml.match(/<meta\s+name=["']csrf-token["']\s+content=["']([^"']+)["']/i);
      csrfToken = csrfMatch ? csrfMatch[1] : null;

      if (!csrfToken) {
        throw new Error("[Step 2 - Halaman SSO Kemnaker] CSRF token tidak ditemukan pada respons.");
      }
    } catch (err) {
      throw formatStepError("Step 2 - Halaman SSO Kemnaker", err);
    }

    // Step 3: Kirim kredensial ke endpoint login SSO
    let redirectUri = "";
    try {
      const loginPayload = { username, password };
      const loginRes = await axios.post(
        "https://account.kemnaker.go.id/auth/login",
        loginPayload,
        {
          headers: {
            ...BROWSER_HEADERS,
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-CSRF-TOKEN": csrfToken,
            "X-Requested-With": "XMLHttpRequest",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            Cookie: sessionCookie,
            Referer: "https://account.kemnaker.go.id/auth/login",
            Origin: "https://account.kemnaker.go.id",
          },
          timeout: 12000,
          validateStatus: (status) => status >= 200 && status < 500,
        }
      );

      if (loginRes.status >= 400) {
        const errDetail =
          loginRes.data?.errors?.username?.[0] ||
          loginRes.data?.errors?.password?.[0] ||
          loginRes.data?.message ||
          "Email atau kata sandi akun Kemnaker tidak sesuai.";
        throw new Error(`[Step 3 - Login SSO Kemnaker] ${errDetail}`);
      }

      redirectUri =
        loginRes.data?.data?.redirect_uri || loginRes.data?.redirect_uri || "";
      sessionCookie = mergeCookies(sessionCookie, loginRes.headers["set-cookie"]);
    } catch (err) {
      throw formatStepError("Step 3 - Login SSO Kemnaker", err);
    }

    // Step 3b / 3c: Dapatkan callbackUrl berisi code dan state
    let callbackUrl = "";
    if (redirectUri && redirectUri.includes("code=")) {
      callbackUrl = redirectUri;
    } else {
      try {
        const ssoAuthRes = await axios.get(ssoUrl, {
          headers: {
            ...BROWSER_HEADERS,
            Cookie: sessionCookie,
            Referer: "https://account.kemnaker.go.id/auth/login",
            Origin: "https://account.kemnaker.go.id",
          },
          maxRedirects: 0,
          validateStatus: (status) => status >= 200 && status < 400,
          timeout: 10000,
        });

        sessionCookie = mergeCookies(sessionCookie, ssoAuthRes.headers["set-cookie"]);

        if (ssoAuthRes.status === 302 || ssoAuthRes.status === 301) {
          callbackUrl = ssoAuthRes.headers.location || "";
        } else if (
          typeof ssoAuthRes.data === "string" &&
          ssoAuthRes.data.includes("auth-authorize")
        ) {
          const authRes = await axios.post(
            "https://account.kemnaker.go.id/auth",
            {},
            {
              headers: {
                ...BROWSER_HEADERS,
                "Content-Type": "application/json",
                Accept: "application/json",
                "X-CSRF-TOKEN": csrfToken,
                "X-Requested-With": "XMLHttpRequest",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                Cookie: sessionCookie,
                Referer: ssoUrl,
                Origin: "https://account.kemnaker.go.id",
              },
              timeout: 10000,
            }
          );
          sessionCookie = mergeCookies(sessionCookie, authRes.headers["set-cookie"]);
          callbackUrl =
            authRes.data?.data?.redirect_uri || authRes.data?.redirect_uri || "";
        }
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 302 && err.response?.headers?.location) {
          callbackUrl = err.response.headers.location;
          sessionCookie = mergeCookies(sessionCookie, err.response.headers["set-cookie"]);
        } else {
          throw formatStepError("Step 3b - Otorisasi Sesi Kemnaker", err);
        }
      }
    }

    if (!callbackUrl || !callbackUrl.includes("code=")) {
      throw new Error(
        `[Step 3b - Otorisasi Sesi Kemnaker] Code atau state tidak ditemukan pada ${callbackUrl || redirectUri}`
      );
    }

    // Step 4: Callback ke Monev API untuk tukar auth code dengan access token
    try {
      const redirectUrlObj = new URL(callbackUrl);
      const code = redirectUrlObj.searchParams.get("code");
      const state = redirectUrlObj.searchParams.get("state");

      if (!code || !state) {
        throw new Error(
          `[Step 4 - Callback Monev] Code atau state kosong pada URL: ${callbackUrl}`
        );
      }

      const callbackRes = await axios.get(
        `${MONEV_API_BASE}/auth/login/callback`,
        {
          params: { code, state },
          headers: {
            ...BROWSER_HEADERS,
            Cookie: monevCookie,
            "X-Frontend-Build-ID": FRONTEND_BUILD_ID,
            Referer: "https://monev.maganghub.kemnaker.go.id/",
            Origin: "https://monev.maganghub.kemnaker.go.id",
          },
          timeout: 10000,
        }
      );

      const tokenData = callbackRes.data?.data || callbackRes.data;
      const accessToken = tokenData?.access_token || tokenData?.token;

      if (!accessToken) {
        throw new Error("[Step 4 - Callback Monev] Access token tidak ditemukan pada respons callback.");
      }

      return {
        accessToken,
        tokenType: tokenData?.token_type || "Bearer",
      };
    } catch (err) {
      throw formatStepError("Step 4 - Callback Monev", err);
    }
  }

  /**
   * Submit laporan harian & absensi ke Monev MagangHub
   */
  static async submitDailyLog(
    token: string,
    payload: SubmitPayload
  ): Promise<SubmitResult> {
    try {
      const body = {
        date: payload.date,
        status: payload.status || "PRESENT",
        activity_log: payload.activity_log,
        lesson_learned: payload.lesson_learned,
        obstacles: payload.obstacles,
      };

      const response = await axios.post(
        `${MONEV_API_BASE}/attendances/with-daily-log`,
        body,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "X-Frontend-Build-ID": FRONTEND_BUILD_ID,
            Referer: "https://monev.maganghub.kemnaker.go.id/",
            Origin: "https://monev.maganghub.kemnaker.go.id",
            ...BROWSER_HEADERS,
          },
          timeout: 15000,
        }
      );

      return {
        success: true,
        httpCode: response.status,
        message: response.data?.message || "Laporan harian berhasil disubmit ke Monev MagangHub!",
        data: response.data,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const httpCode = error.response?.status || 500;
        const errorData = error.response?.data as { message?: string } | undefined;
        const errorMsg =
          errorData?.message ||
          error.message ||
          "Gagal submit laporan ke portal Monev.";

        return {
          success: false,
          httpCode,
          message: errorMsg,
          data: error.response?.data,
        };
      }

      const msg = error instanceof Error ? error.message : "Gagal submit laporan ke portal Monev.";
      return {
        success: false,
        httpCode: 500,
        message: msg,
      };
    }
  }
}

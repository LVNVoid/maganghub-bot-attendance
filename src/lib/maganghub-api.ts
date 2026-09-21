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
const COMMON_BROWSER_HEADERS = {
  "User-Agent": DEFAULT_USER_AGENT,
  "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
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

export class MagangHubApiClient {
  /**
   * Login ke Monev MagangHub via SSO Kemnaker Direct REST API
   */
  static async login(username: string, password: string): Promise<MonevAuthToken> {
    try {
      // Step 1: Inisiasi SSO login
      let ssoUrl = "";
      let monevCookie = "";
      try {
        const initRes = await axios.get(`${MONEV_API_BASE}/auth/login`, {
          maxRedirects: 0,
          validateStatus: (status) => status >= 200 && status < 400,
          timeout: 10000,
          headers: {
            ...COMMON_BROWSER_HEADERS,
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
          throw err;
        }
      }

      if (!ssoUrl) {
        throw new Error("Gagal menginisiasi SSO Monev: redirect URL tidak ditemukan.");
      }

      // Step 2: Ambil CSRF Token dan Session Cookie dari SSO Kemnaker
      const ssoPageRes = await axios.get(ssoUrl, {
        headers: {
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          ...COMMON_BROWSER_HEADERS,
        },
        timeout: 10000,
      });

      const html = ssoPageRes.data || "";
      const csrfMatch = html.match(/<meta\s+name=["']csrf-token["']\s+content=["']([^"']+)["']/i);
      const csrfToken = csrfMatch ? csrfMatch[1] : null;

      if (!csrfToken) {
        throw new Error("Gagal mengambil CSRF token dari halaman SSO Kemnaker.");
      }

      let sessionCookie = mergeCookies("", ssoPageRes.headers["set-cookie"]);

      // Step 3: Kirim kredensial ke endpoint login SSO
      const loginPayload = { username, password };
      const loginRes = await axios.post(
        "https://account.kemnaker.go.id/auth/login",
        loginPayload,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-CSRF-TOKEN": csrfToken,
            "X-Requested-With": "XMLHttpRequest",
            Cookie: sessionCookie,
            Referer: ssoUrl,
            Origin: "https://account.kemnaker.go.id",
            ...COMMON_BROWSER_HEADERS,
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
        throw new Error(`Login SSO Kemnaker gagal: ${errDetail}`);
      }

      let redirectUri =
        loginRes.data?.data?.redirect_uri || loginRes.data?.redirect_uri;

      // Update cookie preserving acw_tc & kemnaker_ri_session
      sessionCookie = mergeCookies(sessionCookie, loginRes.headers["set-cookie"]);

      let callbackUrl = "";
      if (redirectUri && redirectUri.includes("code=")) {
        callbackUrl = redirectUri;
      } else {
        // Setelah login di account.kemnaker.go.id, request ssoUrl kembali dengan session cookie terautentikasi
        try {
          const ssoAuthRes = await axios.get(ssoUrl, {
            headers: {
              Accept:
                "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
              Cookie: sessionCookie,
              ...COMMON_BROWSER_HEADERS,
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
            // Butuh persetujuan OAuth client, kirim POST /auth
            const authRes = await axios.post(
              "https://account.kemnaker.go.id/auth",
              {},
              {
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                  "X-CSRF-TOKEN": csrfToken,
                  "X-Requested-With": "XMLHttpRequest",
                  Cookie: sessionCookie,
                  Referer: ssoUrl,
                  Origin: "https://account.kemnaker.go.id",
                  ...COMMON_BROWSER_HEADERS,
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
          }
        }
      }

      if (!callbackUrl || !callbackUrl.includes("code=")) {
        throw new Error(
          `SSO callback tidak valid: code atau state tidak ditemukan pada ${callbackUrl || redirectUri}`
        );
      }

      // Step 4: Callback ke Monev API untuk tukar auth code dengan access token
      const redirectUrlObj = new URL(callbackUrl);
      const code = redirectUrlObj.searchParams.get("code");
      const state = redirectUrlObj.searchParams.get("state");

      if (!code || !state) {
        throw new Error(
          `SSO callback tidak valid: code atau state tidak ditemukan pada ${redirectUri}`
        );
      }

      const callbackRes = await axios.get(
        `${MONEV_API_BASE}/auth/login/callback`,
        {
          params: { code, state },
          headers: {
            Cookie: monevCookie,
            "X-Frontend-Build-ID": FRONTEND_BUILD_ID,
            Referer: "https://monev.maganghub.kemnaker.go.id/",
            Origin: "https://monev.maganghub.kemnaker.go.id",
            ...COMMON_BROWSER_HEADERS,
          },
          timeout: 10000,
        }
      );

      const tokenData = callbackRes.data?.data || callbackRes.data;
      const accessToken = tokenData?.access_token || tokenData?.token;

      if (!accessToken) {
        throw new Error("Gagal mendapatkan access token dari callback Monev.");
      }

      return {
        accessToken,
        tokenType: tokenData?.token_type || "Bearer",
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const data = error.response?.data as { message?: string; error?: string } | undefined;
        if (status === 403) {
          throw new Error(
            data?.message ||
              "Akses ditolak (403 Forbidden) oleh server/WAF Kemnaker. Periksa IP atau coba beberapa saat lagi."
          );
        }
        if (data?.message) {
          throw new Error(`SSO Error: ${data.message}`);
        }
        if (data?.error) {
          throw new Error(`SSO Error: ${data.error}`);
        }
      }
      throw error;
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
            ...COMMON_BROWSER_HEADERS,
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

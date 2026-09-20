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
  data?: any;
}

const MONEV_API_BASE = "https://monev-api.maganghub.kemnaker.go.id/api/v1";
const FRONTEND_BUILD_ID = "5554ff014eccd220f80524df263ae513d8ce1e25-production";

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
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
        });

        // Extract monev cookies (especially monev_oauth_state)
        const setCookie: unknown = initRes.headers["set-cookie"];
        if (Array.isArray(setCookie)) {
          monevCookie = setCookie.map((c) => String(c).split(";")[0]).join("; ");
        } else if (typeof setCookie === "string") {
          monevCookie = (setCookie as string).split(";")[0];
        }

        if (initRes.status === 302 || initRes.status === 301) {
          ssoUrl = initRes.headers.location || "";
        } else if (typeof initRes.data === "string" && initRes.data.startsWith("http")) {
          ssoUrl = initRes.data.trim();
        } else if (initRes.data?.data?.url) {
          ssoUrl = initRes.data.data.url;
        } else if (initRes.data?.url) {
          ssoUrl = initRes.data.url;
        }
      } catch (err: any) {
        if (err.response?.status === 302 && err.response?.headers?.location) {
          ssoUrl = err.response.headers.location;
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
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        timeout: 10000,
      });

      const html = ssoPageRes.data || "";
      const csrfMatch = html.match(/<meta\s+name=["']csrf-token["']\s+content=["']([^"']+)["']/i);
      const csrfToken = csrfMatch ? csrfMatch[1] : null;

      if (!csrfToken) {
        throw new Error("Gagal mengambil CSRF token dari halaman SSO Kemnaker.");
      }

      const ssoSetCookie: unknown = ssoPageRes.headers["set-cookie"];
      let sessionCookie = "";
      if (Array.isArray(ssoSetCookie)) {
        sessionCookie = ssoSetCookie.map((c) => String(c).split(";")[0]).join("; ");
      } else if (typeof ssoSetCookie === "string") {
        sessionCookie = (ssoSetCookie as string).split(";")[0];
      }

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
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
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

      // Ambil updated session cookie dari login response jika ada
      const loginSetCookie: unknown = loginRes.headers["set-cookie"];
      let authedSessionCookie = sessionCookie;
      if (Array.isArray(loginSetCookie)) {
        authedSessionCookie = loginSetCookie.map((c) => String(c).split(";")[0]).join("; ");
      } else if (typeof loginSetCookie === "string") {
        authedSessionCookie = (loginSetCookie as string).split(";")[0];
      }

      if (!redirectUri) {
        // Jika belum ada redirect_uri, kirim POST /auth untuk authorize OAuth client
        const authRes = await axios.post(
          "https://account.kemnaker.go.id/auth",
          {},
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              "X-CSRF-TOKEN": csrfToken,
              "X-Requested-With": "XMLHttpRequest",
              Cookie: authedSessionCookie,
              Referer: ssoUrl,
              Origin: "https://account.kemnaker.go.id",
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
            timeout: 10000,
          }
        );

        redirectUri = authRes.data?.data?.redirect_uri || authRes.data?.redirect_uri;
      }

      if (!redirectUri) {
        throw new Error(
          loginRes.data?.message ||
            "Login SSO Kemnaker berhasil namun redirect URI tidak ditemukan."
        );
      }

      // Step 4: Callback ke Monev API untuk tukar auth code dengan access token
      const redirectUrlObj = new URL(redirectUri);
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
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
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
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(`SSO Error: ${error.response.data.message}`);
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
    } catch (error: any) {
      const httpCode = error.response?.status || 500;
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Gagal submit laporan ke portal Monev.";

      return {
        success: false,
        httpCode,
        message: errorMsg,
        data: error.response?.data,
      };
    }
  }
}

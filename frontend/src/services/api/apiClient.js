import axios from "axios";

export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
  backendURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:8000",
  useMockApi: import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_API === "true",
  turnstileSiteKey: import.meta.env.VITE_TURNSTILE_SITE_KEY || "",
};

const apiClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  withCredentials: true,
  withXSRFToken: true,
  headers: { Accept: "application/json" },
  timeout: 20000,
});

let csrfRequest;
let renewCsrf = false;

async function initSanctumCsrf() {
  if (API_CONFIG.useMockApi) return;

  if (!renewCsrf && document.cookie.split("; ").some((cookie) => cookie.startsWith("XSRF-TOKEN=") && cookie.length > 11)) return;
  csrfRequest ??= axios.get(`${API_CONFIG.backendURL}/sanctum/csrf-cookie`, {
    withCredentials: true,
    withXSRFToken: true,
    headers: { Accept: "application/json" },
    timeout: 20000,
  }).finally(() => { csrfRequest = null; });
  await csrfRequest;
  renewCsrf = false;
}

apiClient.interceptors.request.use(async (config) => {
  if (!["get", "head", "options"].includes(config.method)) await initSanctumCsrf();
  return config;
});

export function unwrapData(responseData) {
  if (responseData && typeof responseData === "object" && "data" in responseData) {
    return responseData.data;
  }
  return responseData;
}

export function unwrapCollection(responseData) {
  const data = unwrapData(responseData);
  return Array.isArray(data) ? data : data?.data || [];
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status || 0;
    if (status === 419) renewCsrf = true;
    const serverData = error.response?.data || {};
    const message = status === 503 && serverData.message === "Penyimpanan foto profil belum diaktifkan."
      ? "Penyimpanan foto belum aktif. Anda dapat mendaftar tanpa foto." : status >= 500 ? "Server GaneSpace mengalami gangguan. Silakan coba lagi." : serverData.message || ({
      404: "Data tidak ditemukan.", 409: "Data telah berubah. Muat ulang lalu coba lagi.",
      429: "Terlalu banyak permintaan. Coba lagi nanti.",
    }[status]) || (
      status === 401
        ? "Sesi Anda tidak valid atau telah berakhir. Silakan login kembali."
        : status === 403
          ? "Anda tidak memiliki izin untuk mengakses tindakan ini."
          : status === 419
            ? "Sesi keamanan kedaluwarsa. Muat ulang halaman lalu coba lagi."
            : status === 422
              ? "Periksa kembali data formulir yang Anda masukkan."
              : status === 0
                ? "Tidak dapat terhubung ke server. Periksa Laravel dan konfigurasi CORS."
                : "Terjadi kendala saat menghubungkan ke server. Silakan coba lagi."
    );

    if (status === 401 && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("ganespace:unauthorized"));
    }

    const normalizedError = new Error(message);
    normalizedError.status = status;
    normalizedError.errors = serverData.errors || null;
    normalizedError.response = error.response;
    return Promise.reject(normalizedError);
  }
);

export default apiClient;

export async function allPages(path, params = {}) {
  const rows = [];
  let page = 1;
  let lastPage;
  do {
    const { data } = await apiClient.get(path, { params: { ...params, page } });
    rows.push(...unwrapCollection(data));
    lastPage = data.meta?.last_page ?? data.last_page ?? data.data?.last_page ?? 1;
    page += 1;
  } while (page <= lastPage);
  return rows;
}


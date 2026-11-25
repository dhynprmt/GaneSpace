import { useEffect, useRef, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { API_CONFIG } from "../../services/api/apiClient";

const SCRIPT_ID = "cloudflare-turnstile-script";
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile);

  return new Promise((resolve, reject) => {
    let script = document.getElementById(SCRIPT_ID);
    if (!script) {
      script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
    script.addEventListener("load", () => window.turnstile ? resolve(window.turnstile) : reject(new Error("Turnstile failed to initialize.")), { once: true });
    script.addEventListener("error", () => reject(new Error("Turnstile script could not be loaded.")), { once: true });
  });
}

export default function TurnstileCaptcha({ onVerify }) {
  const { t } = useLanguage();
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const [loadError, setLoadError] = useState("");
  const [mockChecked, setMockChecked] = useState(false);

  useEffect(() => {
    if (API_CONFIG.useMockApi) return undefined;
    if (!API_CONFIG.turnstileSiteKey) {
      onVerify("");
      return undefined;
    }

    let cancelled = false;
    loadTurnstile()
      .then((turnstile) => {
        if (cancelled || !containerRef.current) return;
        widgetIdRef.current = turnstile.render(containerRef.current, {
          sitekey: API_CONFIG.turnstileSiteKey,
          callback: (token) => { setLoadError(""); onVerify(token); },
          "expired-callback": () => onVerify(""),
          "error-callback": () => { onVerify(""); setLoadError("Verifikasi Turnstile gagal. Silakan coba lagi."); },
          theme: document.documentElement.classList.contains("dark") ? "dark" : "light",
        });
      })
      .catch((error) => setLoadError(error.message));

    return () => {
      cancelled = true;
      if (widgetIdRef.current !== null && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [onVerify]);

  if (API_CONFIG.useMockApi) {
    return (
      <label className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-[#F5F7FC] dark:bg-[#090F1E] border-2 border-[#102B69]/25 dark:border-slate-700 cursor-pointer select-none">
        <span className="flex items-center gap-2.5 text-xs font-bold text-[#102B69] dark:text-slate-200">
          <input type="checkbox" checked={mockChecked} onChange={(event) => {
            const checked = event.target.checked;
            setMockChecked(checked);
            onVerify(checked ? "mock-mode-only" : "");
          }} />
          {t("auth.turnstileLabel")} (mock mode only)
        </span>
        <ShieldCheck className="w-4 h-4 text-[#1649B8] dark:text-[#D6F45A]" />
      </label>
    );
  }

  const configError = !API_CONFIG.useMockApi && !API_CONFIG.turnstileSiteKey
    ? "VITE_TURNSTILE_SITE_KEY belum diatur pada frontend .env.local."
    : "";
  const visibleError = configError || loadError;

  return (
    <div className="space-y-2">
      <div ref={containerRef} className="min-h-[65px]" />
      {visibleError && <p role="alert" className="text-xs font-semibold text-red-600 dark:text-red-400">{visibleError}</p>}
    </div>
  );
}

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { LOCALES, resolveTranslation } from "../locales";

const LanguageContext = createContext(null);

const LANG_STORAGE_KEY = "ganespace_lang";
const CACHE_STORAGE_KEY = "ganespace_tx_cache_v1";

function loadCache() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(CACHE_STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveCache(cacheObj) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(cacheObj));
  } catch {
    // Abaikan bila kuota penyimpanan penuh
  }
}

const pendingRequests = new Map();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    if (typeof window === "undefined") return "id";
    return localStorage.getItem(LANG_STORAGE_KEY) || "id";
  });

  const [cache, setCache] = useState(() => loadCache());

  useEffect(() => {
    document.documentElement.lang = lang;
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  }, [lang]);

  const toggleLang = () => setLang((prev) => (prev === "id" ? "en" : "id"));

  // Mendukung dot-notation t("student.greeting", { name: "Wahyu" }) & key lama t("nav_home")
  const t = useCallback(
    (key, params = null) => resolveTranslation(lang, key, params),
    [lang]
  );

  // Terjemahan otomatis untuk teks dinamis dari input Admin + simpan ke localStorage cache
  const translateDynamic = useCallback(
    async (text, targetLang = lang) => {
      if (!text || typeof text !== "string" || text.trim().length < 2) return text;
      const cacheKey = `${targetLang}::${text}`;

      const currentCache = loadCache();
      if (currentCache[cacheKey]) return currentCache[cacheKey];

      if (pendingRequests.has(cacheKey)) {
        return pendingRequests.get(cacheKey);
      }

      const promise = (async () => {
        try {
          const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(
            text
          )}`;
          const res = await fetch(url);
          if (!res.ok) return text;
          const data = await res.json();
          const translated = Array.isArray(data?.[0])
            ? data[0].map((part) => part[0]).join("")
            : text;

          const nextCache = { ...loadCache(), [cacheKey]: translated };
          saveCache(nextCache);
          setCache(nextCache);
          return translated;
        } catch {
          return text;
        } finally {
          pendingRequests.delete(cacheKey);
        }
      })();

      pendingRequests.set(cacheKey, promise);
      return promise;
    },
    [lang]
  );

  const localizeEvent = useCallback(
    (event) => {
      if (!event) return event;
      const preset = event.translations?.[lang];
      const titleBase = preset?.title || event.title;
      const shortBase = preset?.short_description || event.short_description;
      const descBase = preset?.description || event.description;
      const dict = LOCALES[lang] || LOCALES.id;

      return {
        ...event,
        display_title: preset?.title || cache[`${lang}::${titleBase}`] || titleBase,
        display_short_description:
          preset?.short_description || cache[`${lang}::${shortBase}`] || shortBase,
        display_description: preset?.description || cache[`${lang}::${descBase}`] || descBase,
        display_category: dict.categories?.[event.category] || event.category,
        display_status: dict.status?.[event.status] || event.status,
      };
    },
    [lang, cache]
  );

  return (
    <LanguageContext.Provider
      value={{ lang, setLang, toggleLang, t, localizeEvent, translateDynamic, cache }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage harus digunakan di dalam LanguageProvider");
  return ctx;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTranslatedText(text, presetByLang = null) {
  const { lang, translateDynamic, cache } = useLanguage();
  const preset = presetByLang?.[lang];
  const cachedValue = text ? cache[`${lang}::${text}`] : null;
  useEffect(() => {
    if (text && !preset && !cachedValue) translateDynamic(text, lang);
  }, [text, lang, preset, cachedValue, translateDynamic]);
  return preset || cachedValue || text || "";
}

import { Globe } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

export default function LanguageToggle() {
  const { lang, toggleLang } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleLang}
      aria-label="Ganti bahasa"
      title={lang === "id" ? "Switch to English" : "Ubah ke Bahasa Indonesia"}
      className="inline-flex items-center gap-1.5 h-10 px-3 rounded-full bg-white dark:bg-[#090F1E] border-2 border-[#102B69] dark:border-[#D6F45A] text-xs font-extrabold text-[#102B69] dark:text-[#D6F45A] hover:scale-105 transition shrink-0"
    >
      <Globe className="w-3.5 h-3.5" />
      <span>{lang.toUpperCase()}</span>
    </button>
  );
}
import { Link } from "react-router-dom";
import { RotatingShape } from "../ui/MotionPrimitives";
import { useLanguage } from "../../contexts/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="px-3 sm:px-6 pb-6 pt-4 bg-white dark:bg-[#090F1E] transition-colors">
      <div className="max-w-7xl mx-auto rounded-[2.5rem] bg-[#102B69] dark:bg-[#111A2E] text-white border-2 border-[#102B69] dark:border-[#D6F45A] p-8 sm:p-10 relative overflow-hidden">
        <div className="pointer-events-none absolute -right-8 -top-8 opacity-15">
          <RotatingShape variant="flower" className="w-36 h-36 text-[#D6F45A]" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8 pb-8 border-b border-white/15">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-white p-1.5">
              <img
                src="/assets/logo-ganespace.png"
                alt="Logo GANESPACE"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="font-display font-extrabold text-xl block leading-none">
                GANESPACE
              </span>
              <span className="text-xs font-bold text-[#D6F45A]">
                Discover. Connect. Experience.
              </span>
            </div>
          </div>

          <nav className="flex flex-wrap gap-2.5 text-xs font-bold">
            <Link to="/" className="px-4 py-2 rounded-full bg-white/10 hover:bg-[#D6F45A] hover:text-[#102B69] transition">
              {t("nav_home")}
            </Link>
            <Link to="/events" className="px-4 py-2 rounded-full bg-white/10 hover:bg-[#D6F45A] hover:text-[#102B69] transition">
              {t("nav_explore")}
            </Link>
            <Link to="/events/academic" className="px-4 py-2 rounded-full bg-white/10 hover:bg-[#D6F45A] hover:text-[#102B69] transition">
              {t("nav_academic")}
            </Link>
            <Link to="/events/non-academic" className="px-4 py-2 rounded-full bg-white/10 hover:bg-[#D6F45A] hover:text-[#102B69] transition">
              {t("nav_non_academic")}
            </Link>
            <Link to="/student/ai" className="px-4 py-2 rounded-full bg-[#D6F45A] text-[#102B69] hover:brightness-95 transition">
              GANEAI
            </Link>
          </nav>
        </div>

        <div className="relative z-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-[#EAF1FF]/75">
          <p>© {new Date().getFullYear()} GANESPACE | Universitas Pendidikan Ganesha.</p>
          <p className="font-semibold text-[#D6F45A]">Timezone: Asia/Makassar (WITA)</p>
        </div>
      </div>
    </footer>
  );
}
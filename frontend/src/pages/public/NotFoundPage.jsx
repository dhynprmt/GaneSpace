import { Link } from "react-router-dom";
import SEO from "../../seo/SEO";
import { useLanguage } from "../../contexts/LanguageContext";

export default function NotFoundPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-[75vh] bg-white dark:bg-[#090F1E] bg-subtle-dots flex items-center justify-center p-6 transition-colors">
      <SEO title="404 | GANESPACE" noIndex />
      <div className="max-w-md w-full rounded-[2rem] bg-white dark:bg-[#111A2E] border-2 border-[#102B69] dark:border-[#D6F45A] bento-shadow p-8 text-center space-y-4">
        <span className="inline-block px-4 py-1 rounded-full bg-[#D6F45A] border-2 border-[#102B69] text-[#102B69] font-display font-extrabold text-sm">
          ERROR 404
        </span>
        <h1 className="font-display text-2xl font-extrabold text-[#102B69] dark:text-white">
          {t("notFound.title")}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {t("notFound.desc")}
        </p>
        <div className="pt-2 flex flex-wrap justify-center gap-2.5">
          <Link
            to="/"
            className="px-5 py-2.5 rounded-full bg-[#102B69] dark:bg-[#D6F45A] text-[#D6F45A] dark:text-[#102B69] text-xs font-extrabold"
          >
            {t("notFound.backHome")}
          </Link>
          <Link
            to="/events"
            className="px-5 py-2.5 rounded-full border-2 border-[#102B69] dark:border-[#D6F45A] text-[#102B69] dark:text-[#D6F45A] text-xs font-extrabold"
          >
            {t("nav.explore")}
          </Link>
        </div>
      </div>
    </div>
  );
}
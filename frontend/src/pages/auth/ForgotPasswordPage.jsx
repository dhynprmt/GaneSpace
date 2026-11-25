import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import SEO from "../../seo/SEO";
import ThemeToggle from "../../components/ui/ThemeToggle";
import LanguageToggle from "../../components/ui/LanguageToggle";
import { useLanguage } from "../../contexts/LanguageContext";
import { authService } from "../../services/authService";
import TurnstileCaptcha from "../../components/auth/TurnstileCaptcha";
import { bentoToast } from "../../utils/bentoToast";

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [captchaAttempt, setCaptchaAttempt] = useState(0);
  const [turnstileToken, setTurnstileToken] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!turnstileToken) {
      bentoToast.error(t("auth.verifyReqTitle"), t("auth.verifyReqDesc"));
      return;
    }
    setSubmitting(true);
    try {
      await authService.forgotPassword({ email, turnstileToken });
      setSent(true);
      bentoToast.success(t("auth.reqSentTitle"), t("auth.reqSentDesc"));
    } catch (err) {
      bentoToast.error(t("auth.sendFailedTitle"), err.message || t("auth.sendFailedDesc"));
    } finally {
      setSubmitting(false);
      setTurnstileToken("");
      setCaptchaAttempt((attempt) => attempt + 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FC] dark:bg-[#090F1E] bg-subtle-dots flex items-center justify-center px-4 py-12 transition-colors">
      <SEO title={t("auth.forgotSeo")} noIndex />

      <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md rounded-[2rem] bg-white dark:bg-[#111A2E] border-2 border-[#102B69] dark:border-[#D6F45A] bento-shadow p-8 space-y-5">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#1649B8] dark:text-[#D6F45A] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> {t("auth.backToLogin")}
        </Link>

        <div>
          <h1 className="font-display font-extrabold text-2xl text-[#102B69] dark:text-white">
            {t("auth.forgotTitle")}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t("auth.forgotSub")}
          </p>
        </div>

        {sent ? (
          <div className="p-4 rounded-2xl bg-[#EAF1FF] dark:bg-[#090F1E] border-2 border-[#102B69]/20 dark:border-[#D6F45A]/40 text-xs font-semibold text-[#102B69] dark:text-slate-200 leading-relaxed">
            {t("auth.forgotSent", { email })}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@undiksha.ac.id"
              className="w-full px-4 py-2.5 rounded-2xl bg-[#F5F7FC] dark:bg-[#090F1E] border-2 border-[#102B69]/25 dark:border-slate-700 text-sm focus:border-[#102B69] dark:focus:border-[#D6F45A] focus:outline-none"
            />
            <TurnstileCaptcha key={captchaAttempt} onVerify={setTurnstileToken} />
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-full bg-[#102B69] dark:bg-[#D6F45A] text-[#D6F45A] dark:text-[#102B69] border-2 border-[#102B69] font-display font-extrabold text-sm hover:opacity-95 disabled:opacity-50 transition"
            >
              {submitting ? t("auth.sending") : t("auth.forgotBtn")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
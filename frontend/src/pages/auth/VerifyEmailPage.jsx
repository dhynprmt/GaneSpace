import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { MailCheck } from "lucide-react";
import SEO from "../../seo/SEO";
import ThemeToggle from "../../components/ui/ThemeToggle";
import LanguageToggle from "../../components/ui/LanguageToggle";
import TurnstileCaptcha from "../../components/auth/TurnstileCaptcha";
import { useLanguage } from "../../contexts/LanguageContext";
import { authService } from "../../services/authService";
import { bentoToast } from "../../utils/bentoToast";

export default function VerifyEmailPage() {
  const { t } = useLanguage();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");
  const [captchaAttempt, setCaptchaAttempt] = useState(0);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const completed = location.pathname === "/auth/email-verified" && new URLSearchParams(location.search).get("status") === "success";

  const handleResend = async () => {
    if (!email.trim()) {
      bentoToast.error("Email diperlukan", "Masukkan email akun yang ingin diverifikasi.");
      return;
    }
    if (!turnstileToken) {
      bentoToast.error(t("auth.verifyReqTitle"), t("auth.verifyReqDesc"));
      return;
    }
    setSubmitting(true);
    try {
      await authService.resendVerification({ email: email.trim(), turnstileToken });
      bentoToast.success(t("auth.resendSuccessTitle"), t("auth.resendSuccessDesc"));
      setTurnstileToken("");
    } catch (error) {
      bentoToast.error("Gagal mengirim ulang", error.message || t("common.tryAgain"));
    } finally {
      setSubmitting(false);
      setTurnstileToken("");
      setCaptchaAttempt((attempt) => attempt + 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FC] dark:bg-[#090F1E] bg-subtle-dots flex items-center justify-center px-4 py-12 transition-colors">
      <SEO title={t("auth.verifySeo")} noIndex />
      <div className="fixed top-4 right-4 z-40 flex items-center gap-2"><LanguageToggle /><ThemeToggle /></div>
      <div className="w-full max-w-md rounded-[2rem] bg-white dark:bg-[#111A2E] border-2 border-[#102B69] dark:border-[#D6F45A] bento-shadow p-8 text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-[#D6F45A] border-2 border-[#102B69] text-[#102B69] flex items-center justify-center mx-auto shadow-[3px_3px_0_0_#102B69]"><MailCheck className="w-7 h-7" /></div>
        <div className="space-y-2">
          <h1 className="font-display font-extrabold text-2xl text-[#102B69] dark:text-white">{completed ? "Verifikasi email selesai" : t("auth.verifyTitle")}</h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{completed ? "Silakan masuk ke akun GaneSpace Anda." : t("auth.verifyDesc")}</p>
        </div>
        <div className="space-y-3 pt-2 text-left">
          {!completed && <>
          <label className="block text-xs font-extrabold text-[#102B69] dark:text-slate-200">Email akun</label>
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="nama@undiksha.ac.id" className="w-full px-4 py-2.5 rounded-2xl bg-[#F5F7FC] dark:bg-[#090F1E] border-2 border-[#102B69]/25 dark:border-slate-700 text-sm" />
          <TurnstileCaptcha key={captchaAttempt} onVerify={setTurnstileToken} />
          <button type="button" disabled={submitting} onClick={handleResend} className="w-full py-3 rounded-full bg-[#102B69] dark:bg-[#D6F45A] text-[#D6F45A] dark:text-[#102B69] border-2 border-[#102B69] font-display font-extrabold text-xs sm:text-sm hover:opacity-95 disabled:opacity-50 transition">
            {submitting ? "Mengirim..." : t("auth.resendBtn")}
          </button>
          </>}
          <Link to="/login" className="block w-full py-2.5 rounded-full border-2 border-[#102B69] dark:border-[#D6F45A] text-[#102B69] dark:text-[#D6F45A] text-xs font-extrabold text-center hover:bg-[#EAF1FF] dark:hover:bg-slate-800 transition">{t("auth.goToLogin")}</Link>
        </div>
      </div>
    </div>
  );
}

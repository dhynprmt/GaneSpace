import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import SEO from "../../seo/SEO";
import TurnstileCaptcha from "../../components/auth/TurnstileCaptcha";
import ThemeToggle from "../../components/ui/ThemeToggle";
import LanguageToggle from "../../components/ui/LanguageToggle";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { DEMO_ACCOUNTS, IS_DEV_MOCK_ENABLED } from "../../mocks/demoAuth";
import { bentoToast } from "../../utils/bentoToast";

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [captchaAttempt, setCaptchaAttempt] = useState(0);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const redirectByRole = (user) => {
    const roles = new Set([user?.role, ...(Array.isArray(user?.roles) ? user.roles : [])].filter(Boolean));
    if (roles.has("super_admin")) navigate("/master/dashboard");
    else if (roles.has("event_admin")) navigate("/admin/dashboard");
    else navigate("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!turnstileToken) {
      setError(t("auth.captchaRequired"));
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const user = await login({ email, password, turnstileToken });
      bentoToast.success(t("auth.welcomeTitle"), t("auth.welcomeDesc", { name: user.name }));
      redirectByRole(user);
    } catch (err) {
      setError(err.message || t("auth.loginFailed"));
    } finally {
      setSubmitting(false);
      setTurnstileToken("");
      setCaptchaAttempt((attempt) => attempt + 1);
    }
  };

  const fillQuickAccount = (roleKey, label) => {
    const account = DEMO_ACCOUNTS[roleKey];
    if (!account) return;
    setEmail(account.email);
    setPassword(account.passcode);
    setError(null);
    bentoToast.updated(t("auth.accountFilledTitle"), t("auth.accountFilledDesc", { label }));
  };

  return (
    <div className="min-h-screen bg-[#F5F7FC] dark:bg-[#090F1E] bg-subtle-dots flex items-center justify-center px-4 py-12 transition-colors">
      <SEO title={t("auth.loginSeo")} noIndex />

      <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md rounded-[2rem] bg-white dark:bg-[#111A2E] border-2 border-[#102B69] dark:border-[#D6F45A] bento-shadow p-7 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-full bg-white border-2 border-[#102B69] p-1">
              <img src="/assets/logo-ganespace.png" alt="Logo GANESPACE" className="w-full h-full object-contain" />
            </div>
            <span className="font-display font-extrabold text-2xl text-[#102B69] dark:text-white">
              GANESPACE
            </span>
          </Link>
          <h1 className="font-display font-extrabold text-xl text-[#102B69] dark:text-white">
            {t("auth.loginTitle")}
          </h1>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Discover. Connect. Experience.
          </p>
        </div>

        {IS_DEV_MOCK_ENABLED && (
          <div className="rounded-2xl bg-[#EAF1FF] dark:bg-[#090F1E] border-2 border-[#102B69]/20 dark:border-slate-700 p-4 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#102B69] dark:text-[#D6F45A]">
              <KeyRound className="w-3.5 h-3.5" />
              <span>{t("auth.quickAccess")}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillQuickAccount("student", t("auth.studentLabel"))}
                className="py-1.5 px-2 rounded-full bg-white dark:bg-[#111A2E] border-2 border-[#102B69] dark:border-[#D6F45A]/60 text-[11px] font-extrabold text-[#102B69] dark:text-white hover:bg-[#D6F45A] hover:text-[#102B69] transition"
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => fillQuickAccount("event_admin", "Ormawa")}
                className="py-1.5 px-2 rounded-full bg-white dark:bg-[#111A2E] border-2 border-[#102B69] dark:border-[#D6F45A]/60 text-[11px] font-extrabold text-[#102B69] dark:text-white hover:bg-[#D6F45A] hover:text-[#102B69] transition"
              >
                Ormawa
              </button>
              <button
                type="button"
                onClick={() => fillQuickAccount("super_admin", "UPA TIK")}
                className="py-1.5 px-2 rounded-full bg-[#102B69] dark:bg-[#D6F45A] border-2 border-[#102B69] text-[11px] font-extrabold text-[#D6F45A] dark:text-[#102B69] hover:opacity-90 transition"
              >
                UPA TIK
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border-2 border-red-300 dark:border-red-800 text-xs font-bold text-red-700 dark:text-red-300 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-extrabold text-[#102B69] dark:text-slate-200 mb-1">
              {t("auth.emailLabel")}
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@undiksha.ac.id"
              className="w-full px-4 py-2.5 rounded-2xl bg-[#F5F7FC] dark:bg-[#090F1E] border-2 border-[#102B69]/25 dark:border-slate-700 text-sm focus:border-[#102B69] dark:focus:border-[#D6F45A] focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="text-xs font-extrabold text-[#102B69] dark:text-slate-200">
                {t("auth.passwordLabel")}
              </label>
              <Link to="/forgot-password" className="text-xs font-bold text-[#1649B8] dark:text-[#D6F45A] hover:underline">
                {t("auth.forgotPassword")}
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("auth.passwordPlaceholder")}
                className="w-full px-4 py-2.5 pr-11 rounded-2xl bg-[#F5F7FC] dark:bg-[#090F1E] border-2 border-[#102B69]/25 dark:border-slate-700 text-sm focus:border-[#102B69] dark:focus:border-[#D6F45A] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={t("auth.togglePasswordAria")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#102B69] dark:hover:text-[#D6F45A]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <TurnstileCaptcha key={captchaAttempt} onVerify={setTurnstileToken} />

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-full bg-[#102B69] dark:bg-[#D6F45A] text-[#D6F45A] dark:text-[#102B69] border-2 border-[#102B69] font-display font-extrabold text-sm hover:opacity-95 disabled:opacity-50 transition"
          >
            {submitting ? t("auth.signingIn") : t("auth.signInBtn")}
          </button>
        </form>

        <p className="text-center text-xs text-slate-600 dark:text-slate-400">
          {t("auth.noAccount")}{" "}
          <Link to="/register" className="font-extrabold text-[#1649B8] dark:text-[#D6F45A] hover:underline">
            {t("auth.registerBtn")}
          </Link>
        </p>
      </div>
    </div>
  );
}
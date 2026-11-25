import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import SEO from "../../seo/SEO";
import BentoIcon from "../../components/ui/BentoIcons";
import { adminService } from "../../services/adminService";
import { API_CONFIG } from "../../services/api/apiClient";
import { useLanguage } from "../../contexts/LanguageContext";

export default function MasterDashboardPage() {
  const { t } = useLanguage();
  const [loadError, setLoadError] = useState("");
  const [stats, setStats] = useState(null);

  useEffect(() => {
    adminService.getMasterOverview().then(setStats).catch((err) => setLoadError(err.message));
  }, []);

  const cards = [
    ...(!API_CONFIG.useMockApi ? [] : [
      { label: t("master.totalUsers"), value: stats?.total_users ?? "-", icon: "users", tone: "royal", to: "/master/users" },
      { label: t("master.totalStudents"), value: stats?.total_students ?? "-", icon: "student", tone: "blue", to: "/master/users" },
    ]),
    { label: t("master.totalOrgs"), value: stats?.total_organizations ?? "-", icon: "org", tone: "royal", to: "/master/organizations" },
    { label: t("master.totalEvents"), value: stats?.total_events ?? "-", icon: "calendar", tone: "blue", to: "/master/events" },
    { label: t("master.pendingNim"), value: stats?.pending_verifications ?? "-", icon: "verify", tone: "lime", to: "/master/student-verifications", highlight: true },
    ...(API_CONFIG.useMockApi ? [{ label: t("master.pendingModeration"), value: stats?.pending_moderation ?? "-", icon: "moderation", tone: "amber", to: "/master/moderation", highlight: true }] : []),
  ];

  return (
    <div className="space-y-6">
      {loadError && <p role="alert">{loadError}</p>}
      <SEO title={`${t("master.dashboard")} | UPA TIK`} noIndex />

      <div className="rounded-[2rem] bg-[#1649B8] dark:bg-[#132B66] text-white border-2 border-[#102B69] dark:border-[#D6F45A] p-6 sm:p-8 bento-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#102B69] text-[#D6F45A] text-[11px] font-extrabold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" /> UPA TIK Master Control
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold mt-2">
            {t("master.overviewTitle")}
          </h1>
          <p className="text-xs sm:text-sm text-[#EAF1FF]/90 mt-1">
            {t("master.overviewSub")}
          </p>
        </div>

        {API_CONFIG.useMockApi && (
          <Link
            to="/master/activity-security"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#D6F45A] text-[#102B69] border-2 border-[#102B69] font-display font-extrabold text-xs hover:brightness-95 transition shrink-0"
          >
            {t("master.security")} <ArrowUpRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map(({ label, value, icon, tone, to, highlight }) => (
          <Link
            key={label}
            to={to}
            className={`group rounded-3xl p-5 border-2 border-[#102B69] dark:border-[#D6F45A]/80 bento-shadow-hover flex flex-col justify-between ${
              highlight
                ? "bg-[#EAF1FF] dark:bg-[#132B66]/45"
                : "bg-white dark:bg-[#111A2E]"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-extrabold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                {label}
              </span>
              <BentoIcon name={icon} tone={tone} size="sm" />
            </div>
            <div className="mt-5 flex items-end justify-between">
              <p className="font-display text-3xl sm:text-4xl font-extrabold text-[#102B69] dark:text-white">
                {value}
              </p>
              <span className="w-8 h-8 rounded-full bg-[#102B69] dark:bg-[#D6F45A] text-[#D6F45A] dark:text-[#102B69] flex items-center justify-center group-hover:translate-x-0.5 transition">
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Plus } from "lucide-react";
import SEO from "../../seo/SEO";
import StatusBadge from "../../components/ui/StatusBadge";
import BentoIcon from "../../components/ui/BentoIcons";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { adminService } from "../../services/adminService";
import { formatDateTimeWITA } from "../../utils/dateFormatter";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const list = await adminService.getAdminEvents(user?.organization);
        setEvents(list);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.organization]);

  const totalParticipants = events.reduce((acc, e) => acc + (e.active_registrations || 0), 0);
  const upcomingCount = events.filter((event) =>
    event.publication_status === "published" &&
    !event.cancelled &&
    ["open", "upcoming"].includes(event.registration_status)
  ).length;

  return (
    <div className="space-y-6">
      <SEO title={`${t("admin.dashboardTitle")} | GANESPACE`} noIndex />

      <div className="rounded-[2rem] bg-[#1649B8] dark:bg-[#132B66] text-white border-2 border-[#102B69] dark:border-[#D6F45A] p-6 sm:p-8 bento-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-[#102B69] text-[#D6F45A] text-[11px] font-extrabold uppercase tracking-wider">
            {user?.organization || t("admin.orgLabel")}
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold mt-2">
            {t("admin.dashboardTitle")}
          </h1>
          <p className="text-xs sm:text-sm text-[#EAF1FF]/90 mt-1">
            {t("admin.dashboardSub")}
          </p>
        </div>
        <Link
          to="/admin/events/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#D6F45A] text-[#102B69] border-2 border-[#102B69] font-display font-extrabold text-xs hover:brightness-95 transition shrink-0"
        >
          <Plus className="w-4 h-4" /> {t("admin.createEventFull")}
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          { label: t("admin.totalEvents"), value: events.length, icon: "calendar", tone: "royal" },
          { label: t("admin.openActive"), value: upcomingCount, icon: "verify", tone: "lime" },
          { label: t("admin.totalParticipants"), value: totalParticipants, icon: "users", tone: "blue" },
        ].map(({ label, value, icon, tone }) => (
          <div
            key={label}
            className="rounded-3xl bg-white dark:bg-[#111A2E] border-2 border-[#102B69] dark:border-[#D6F45A]/80 p-5 bento-shadow flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-xs font-extrabold text-slate-500 dark:text-slate-300 uppercase">
              <span>{label}</span>
              <BentoIcon name={icon} tone={tone} size="sm" />
            </div>
            <p className="font-display text-3xl font-extrabold text-[#102B69] dark:text-white mt-3">
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-[2rem] bg-white dark:bg-[#111A2E] border-2 border-[#102B69] dark:border-[#D6F45A] p-6 bento-shadow space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-extrabold text-lg text-[#102B69] dark:text-white">
            {t("admin.recentEvents")}
          </h2>
          <Link
            to="/admin/events"
            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full border-2 border-[#102B69] dark:border-[#D6F45A] text-xs font-extrabold text-[#102B69] dark:text-[#D6F45A] hover:bg-[#D6F45A] hover:text-[#102B69] transition"
          >
            {t("admin.manageAll")} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">{t("admin.loadingEvents")}</p>
        ) : (
          <div className="space-y-3">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="rounded-2xl bg-[#F5F7FC] dark:bg-[#090F1E] border-2 border-[#102B69]/15 dark:border-slate-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge status={ev.status} />
                    <span className="text-xs font-bold text-[#1649B8] dark:text-[#D6F45A]">
                      {t(`categories.${ev.category}`)}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-sm text-[#102B69] dark:text-white">
                    {ev.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {formatDateTimeWITA(ev.start_datetime)} | {ev.location}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {ev.domain === "academic" && (
                    <Link
                      to={`/admin/events/${ev.id}/participants`}
                      className="px-3.5 py-2 rounded-full bg-white dark:bg-[#111A2E] border-2 border-[#102B69] dark:border-[#D6F45A] text-xs font-extrabold text-[#102B69] dark:text-[#D6F45A] hover:bg-[#EAF1FF]"
                    >
                      {t("admin.participantsCount")} ({ev.active_registrations ?? 0})
                    </Link>
                  )}
                  <Link
                    to={`/admin/events/${ev.id}/edit`}
                    className="px-4 py-2 rounded-full bg-[#102B69] dark:bg-[#D6F45A] text-[#D6F45A] dark:text-[#102B69] text-xs font-extrabold hover:opacity-90"
                  >
                    {t("common.edit")}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
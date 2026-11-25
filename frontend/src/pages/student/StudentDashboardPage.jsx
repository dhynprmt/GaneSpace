import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Award,
  Bell,
  Calendar,
  CheckCircle2,
  MapPin,
  ShieldAlert,
  Sparkles,
  Ticket,
} from "lucide-react";
import { API_CONFIG } from "../../services/api/apiClient";
import SEO from "../../seo/SEO";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { registrationService } from "../../services/registrationService";
import { notificationService } from "../../services/notificationService";
import { formatDateTimeWITA } from "../../utils/dateFormatter";
import { EventCardSkeleton } from "../../components/ui/StateViews";

export default function StudentDashboardPage() {
  const { user, setUnreadNotifications } = useAuth();
  const { t } = useLanguage();

  const [registrations, setRegistrations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const load = async () => {
      setLoading(true);
      try {
        const [regs, notifs] = await Promise.all([
          registrationService.getMyRegistrations("all"),
          notificationService.getNotifications(),
        ]);
        setRegistrations(regs);
        setNotifications(notifs);
        setUnreadNotifications(notifs.filter((n) => !n.is_read).length);
      } catch (failure) {
        setError(failure.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [setUnreadNotifications]);

  const activeRegs = registrations.filter((r) => r.status === "registered");
  const isVerified = user?.verification_status === "verified";
  const attended = user?.seminar_attendance_count ?? 0;
  const target = user?.seminar_attendance_target ?? 10;
  const pct = Math.min(100, Math.round((attended / target) * 100));

  return (
    <div className="space-y-6">
      <SEO title="Student Dashboard | GANESPACE" noIndex />

      <section className="rounded-[2rem] bg-[#1649B8] dark:bg-[#132B66] text-white border-2 border-[#102B69] dark:border-[#D6F45A] p-6 sm:p-8 bento-shadow flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#102B69] text-[#D6F45A] text-xs font-extrabold">
            {isVerified ? <CheckCircle2 className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
            NIM: {t(`status.${user?.verification_status || "pending"}`)}
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold">
            {t("student.greeting", { name: user?.name || t("student.defaultName") })}
          </h1>
          <p className="text-xs sm:text-sm text-[#EAF1FF]/90">
            {user?.study_program || t("student.defaultProdi")} | {user?.faculty || "Undiksha"}
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            to="/events/academic?tab=seminar-proposal"
            className="px-5 py-2.5 rounded-full bg-[#102B69] border border-white/20 text-xs font-extrabold hover:opacity-90 transition"
          >
            {t("student.findSempro")}
          </Link>
          <Link
            to="/student/ai"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#D6F45A] text-[#102B69] border-2 border-[#102B69] text-xs font-extrabold hover:brightness-95 transition"
          >
            <Sparkles className="w-4 h-4" /> {t("student.openGaneai")}
          </Link>
        </div>
      </section>

      {error && <p role="alert">{error}</p>}
      {!error && <>
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="rounded-3xl bg-white dark:bg-[#111A2E] border-2 border-[#102B69] dark:border-[#D6F45A]/80 p-5 bento-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase">
            <span>{t("student.activeBookings")}</span>
            <Ticket className="w-4 h-4 text-[#1649B8] dark:text-[#D6F45A]" />
          </div>
          <p className="font-display text-3xl font-extrabold text-[#102B69] dark:text-white mt-3">
            {activeRegs.length}
          </p>
          <Link to="/student/registrations" className="text-xs font-extrabold text-[#1649B8] dark:text-[#D6F45A] hover:underline mt-2 inline-flex items-center gap-1">
            {t("student.manageBookings")} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {API_CONFIG.useMockApi && (
        <div className="rounded-3xl bg-white dark:bg-[#111A2E] border-2 border-[#102B69] dark:border-[#D6F45A]/80 p-5 bento-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase">
            <span>{t("student.seminarTarget")}</span>
            <Award className="w-4 h-4 text-[#1649B8] dark:text-[#D6F45A]" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <span className="font-display text-2xl font-extrabold text-[#102B69] dark:text-white">
                {attended} / {target}
              </span>
              <span className="text-xs font-extrabold text-[#1649B8] dark:text-[#D6F45A]">{pct}%</span>
            </div>
            <div className="w-full h-3 rounded-full bg-[#EAF1FF] dark:bg-slate-800 border border-[#102B69]/20 overflow-hidden mt-2">
              <div className="h-full bg-[#1649B8] dark:bg-[#D6F45A] rounded-full" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
        )}

        <div className="rounded-3xl bg-[#D6F45A] text-[#102B69] border-2 border-[#102B69] p-5 bento-shadow flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/assets/ganeai-mascot.jpeg"
              alt="GANEAI"
              className="w-11 h-11 rounded-2xl object-cover border-2 border-[#102B69]"
            />
            <div>
              <p className="font-display font-extrabold text-sm">GANEAI Companion</p>
              <p className="text-[11px] font-semibold opacity-80">{t("student.ganeaiSub")}</p>
            </div>
          </div>
          <Link
            to="/student/ai"
            className="mt-4 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-full bg-[#102B69] text-[#D6F45A] text-xs font-extrabold hover:bg-[#1649B8] hover:text-white transition"
          >
            {t("student.startChat")} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 rounded-[2rem] bg-white dark:bg-[#111A2E] border-2 border-[#102B69] dark:border-[#D6F45A]/80 p-6 bento-shadow space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-extrabold text-lg text-[#102B69] dark:text-white">
              {t("student.registeredEvents")}
            </h2>
            <Link to="/student/registrations" className="text-xs font-extrabold text-[#1649B8] dark:text-[#D6F45A] hover:underline">
              {t("common.seeAll")}
            </Link>
          </div>

          {loading ? (
            <EventCardSkeleton />
          ) : activeRegs.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">
              {t("student.noActiveBookings")}
            </p>
          ) : (
            <div className="space-y-3">
              {activeRegs.map((reg) => (
                <div
                  key={reg.id}
                  className="rounded-2xl bg-[#F5F7FC] dark:bg-[#090F1E] border-2 border-[#102B69]/15 dark:border-slate-700 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <span className="text-[11px] font-extrabold text-[#1649B8] dark:text-[#D6F45A]">
                      {reg.event_category}
                    </span>
                    <h3 className="font-display font-bold text-sm text-[#102B69] dark:text-white">
                      {reg.event_title}
                    </h3>
                    <div className="flex flex-wrap gap-3 text-xs text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#1649B8] dark:text-[#D6F45A]" />
                        {formatDateTimeWITA(reg.start_datetime)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#1649B8] dark:text-[#D6F45A]" />
                        {reg.location}
                      </span>
                    </div>
                  </div>
                  <Link
                    to={`/student/registrations/${reg.id}`}
                    className="shrink-0 px-4 py-2 rounded-full bg-[#102B69] dark:bg-[#D6F45A] text-[#D6F45A] dark:text-[#102B69] text-xs font-extrabold text-center"
                  >
                    Receipt
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-5 rounded-[2rem] bg-white dark:bg-[#111A2E] border-2 border-[#102B69] dark:border-[#D6F45A]/80 p-6 bento-shadow space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-extrabold text-lg text-[#102B69] dark:text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#1649B8] dark:text-[#D6F45A]" />{" "}
              {t("student.notifications")}
            </h2>
            <Link to="/student/notifications" className="text-xs font-extrabold text-[#1649B8] dark:text-[#D6F45A] hover:underline">
              {t("common.all")}
            </Link>
          </div>

          <div className="space-y-3">
            {notifications.slice(0, 3).map((n) => (
              <Link
                key={n.id}
                to={n.link || "/student/notifications"}
                className={`block rounded-2xl p-3.5 border-2 transition ${
                  n.is_read
                    ? "bg-[#F5F7FC] dark:bg-[#090F1E] border-transparent"
                    : "bg-[#EAF1FF] dark:bg-[#132B66]/40 border-[#102B69]/25 dark:border-[#D6F45A]/50"
                }`}
              >
                <p className="text-xs font-extrabold text-[#102B69] dark:text-white">{n.title}</p>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">{n.message}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
      </>}
    </div>
  );
}
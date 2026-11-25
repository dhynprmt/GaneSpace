import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCheck, Circle } from "lucide-react";
import SEO from "../../seo/SEO";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { notificationService } from "../../services/notificationService";
import { formatDateTimeWITA } from "../../utils/dateFormatter";
import { EmptyState } from "../../components/ui/StateViews";
import { bentoToast } from "../../utils/bentoToast";

export default function NotificationsPage() {
  const { setUnreadNotifications } = useAuth();
  const { t } = useLanguage();

  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const syncList = useCallback((list) => {
    setItems(list);
    setUnreadNotifications(list.filter((n) => !n.is_read).length);
  }, [setUnreadNotifications]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await notificationService.getNotifications();
        syncList(data);
      } catch (failure) {
        setError(failure.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [syncList]);

  const handleRead = async (id) => {
    const updated = await notificationService.markAsRead(id);
    syncList(updated);
  };

  const handleReadAll = async () => {
    const updated = await notificationService.markAllAsRead();
    syncList(updated);
    bentoToast.success(t("student.allCaughtUpTitle"), t("student.allCaughtUpDesc"));
  };

  return (
    <div className="space-y-6">
      <SEO title={t("student.notificationsSeo")} noIndex />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#102B69] dark:text-white">
            {t("student.notifications")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            {t("student.notifSub")}
          </p>
        </div>

        <button
          onClick={() => handleReadAll().catch((failure) => setError(failure.message))}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white dark:bg-[#111A2E] border-2 border-[#102B69] dark:border-[#D6F45A] text-xs font-extrabold text-[#102B69] dark:text-[#D6F45A] shadow-[0_3px_0_0_#102B69]"
        >
          <CheckCheck className="w-4 h-4" /> {t("student.markAllRead")}
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">{t("student.loadingNotif")}</p>
      ) : error ? <p role="alert">{error}</p> : items.length === 0 ? (
        <EmptyState title={t("student.noNotifTitle")} description={t("student.noNotifDesc")} />
      ) : (
        <div className="space-y-3">
          {items.map((n) => (
            <div
              key={n.id}
              className={`rounded-3xl p-5 border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
                n.is_read
                  ? "bg-white dark:bg-[#111A2E] border-[#102B69]/25 dark:border-slate-800"
                  : "bg-[#EAF1FF] dark:bg-[#132B66]/45 border-[#102B69] dark:border-[#D6F45A] bento-shadow"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {!n.is_read && <Circle className="w-2.5 h-2.5 fill-[#1649B8] text-[#1649B8] dark:fill-[#D6F45A] dark:text-[#D6F45A]" />}
                  <h2 className="font-display font-extrabold text-sm text-[#102B69] dark:text-white">{n.title}</h2>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{n.message}</p>
                <p className="text-[11px] text-slate-400">{formatDateTimeWITA(n.created_at)}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {n.link && (
                  <Link
                    to={n.link}
                    className="px-4 py-2 rounded-full bg-[#102B69] dark:bg-[#D6F45A] text-[#D6F45A] dark:text-[#102B69] text-xs font-extrabold"
                  >
                    {t("student.viewBtn")}
                  </Link>
                )}
                {!n.is_read && (
                  <button
                    onClick={() => handleRead(n.id).catch((failure) => setError(failure.message))}
                    className="px-4 py-2 rounded-full bg-white dark:bg-[#090F1E] border-2 border-[#102B69] dark:border-slate-600 text-xs font-extrabold text-[#102B69] dark:text-white"
                  >
                    {t("student.readBtn")}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, MapPin, QrCode, XCircle } from "lucide-react";
import { useRemoteList } from "../../hooks/useRemoteList";
import SEO from "../../seo/SEO";
import { registrationService } from "../../services/registrationService";
import { formatDateTimeWITA } from "../../utils/dateFormatter";
import { EmptyState, ErrorState, EventCardSkeleton } from "../../components/ui/StateViews";
import { useLanguage } from "../../contexts/LanguageContext";
import { bentoToast } from "../../utils/bentoToast";

export default function MyRegistrationsPage() {
  const { t } = useLanguage();

  const [filter, setFilter] = useState("all");
  const [confirmCancel, setConfirmCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const load = useCallback(() => registrationService.getMyRegistrations(filter), [filter]);
  const { items, error, loading, refresh } = useRemoteList(load);

  const executeCancel = async () => {
    if (!confirmCancel) return;
    setCancelling(true);
    try {
      await registrationService.cancelRegistration(confirmCancel.id);
      bentoToast.deleted(
        t("student.bookingCancelledTitle"),
        t("student.bookingCancelledDesc", { title: confirmCancel.event_title })
      );
      setConfirmCancel(null);
      refresh();
    } catch (err) {
      bentoToast.error(t("student.cancelFailedTitle"), err.message || t("common.tryAgain"));
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="space-y-6">
      <SEO title={t("student.bookingsSeo")} noIndex />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#102B69] dark:text-white">
            {t("student.bookings")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            {t("student.bookingsSub")}
          </p>
        </div>

        <div className="flex gap-2">
          {[
            { key: "all", label: t("common.all") },
            { key: "registered", label: t("student.filterActive") },
            { key: "cancelled", label: t("student.filterCancelled") },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-full text-xs font-extrabold border-2 border-[#102B69] dark:border-[#D6F45A] transition ${
                filter === tab.key
                  ? "bg-[#D6F45A] text-[#102B69] shadow-[0_3px_0_0_#102B69]"
                  : "bg-white dark:bg-[#111A2E] text-[#102B69] dark:text-slate-200 hover:bg-[#EAF1FF]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2].map((n) => <EventCardSkeleton key={n} />)}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => refresh()} />
      ) : items.length === 0 ? (
        <EmptyState
          title={t("student.noRegTitle")}
          description={t("student.noRegDesc")}
          action={
            <Link to="/events/academic" className="px-5 py-2.5 rounded-full bg-[#102B69] text-[#D6F45A] text-xs font-extrabold">
              {t("student.browseAcademic")}
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {items.map((reg) => (
            <article
              key={reg.id}
              className="rounded-[2rem] bg-white dark:bg-[#111A2E] border-2 border-[#102B69] dark:border-[#D6F45A]/80 p-5 sm:p-6 bento-shadow flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-0.5 rounded-full bg-[#EAF1FF] dark:bg-slate-800 text-[#1649B8] dark:text-[#D6F45A] text-xs font-extrabold">
                    {reg.event_category}
                  </span>
                  <span
                    className={`px-3 py-0.5 rounded-full text-xs font-extrabold border border-[#102B69] ${
                      reg.status === "registered"
                        ? "bg-[#D6F45A] text-[#102B69]"
                        : "bg-[#FF5A5F] text-white"
                    }`}
                  >
                    {t(`status.${reg.status}`)}
                  </span>
                  <span className="text-xs font-mono text-slate-400">{reg.registration_code}</span>
                </div>

                <h2 className="font-display font-extrabold text-lg text-[#102B69] dark:text-white">
                  {reg.event_title}
                </h2>

                <div className="flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#1649B8] dark:text-[#D6F45A]" />
                    {formatDateTimeWITA(reg.start_datetime)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#1649B8] dark:text-[#D6F45A]" />
                    {reg.location}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <Link
                  to={`/student/registrations/${reg.id}`}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#102B69] dark:bg-[#D6F45A] text-[#D6F45A] dark:text-[#102B69] text-xs font-extrabold hover:opacity-90 transition"
                >
                  <QrCode className="w-4 h-4" /> {t("student.viewReceipt")}
                </Link>
                {reg.can_cancel && reg.status === "registered" && (
                  <button
                    onClick={() => setConfirmCancel(reg)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#FF5A5F] text-white border-2 border-[#102B69] text-xs font-extrabold hover:brightness-95 transition"
                  >
                    <XCircle className="w-4 h-4" /> {t("student.cancelBooking")}
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {confirmCancel && (
        <div className="fixed inset-0 z-50 bg-[#102B69]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111A2E] border-2 border-[#102B69] dark:border-[#D6F45A] bento-shadow rounded-3xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-display font-extrabold text-lg text-[#102B69] dark:text-white">
              {t("student.cancelConfirmTitle")}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {t("student.cancelConfirmDesc", { title: confirmCancel.event_title })}
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmCancel(null)}
                className="px-4 py-2 rounded-full border-2 border-[#102B69] dark:border-slate-600 text-xs font-extrabold"
              >
                {t("student.keepBooking")}
              </button>
              <button
                onClick={executeCancel}
                disabled={cancelling}
                className="px-5 py-2 rounded-full bg-[#FF5A5F] text-white border-2 border-[#102B69] text-xs font-extrabold disabled:opacity-50"
              >
                {cancelling ? t("student.cancelling") : t("student.yesCancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
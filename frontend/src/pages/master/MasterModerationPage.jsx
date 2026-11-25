import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Ban, EyeOff, History, RotateCcw, Flag, X } from "lucide-react";
import SEO from "../../seo/SEO";
import StatusBadge from "../../components/ui/StatusBadge";
import { adminService } from "../../services/adminService";
import { formatDateTimeWITA } from "../../utils/dateFormatter";
import { bentoToast } from "../../utils/bentoToast";
import { useLanguage } from "../../contexts/LanguageContext";

const ACTIONS = {
  flag: { label: "Flag", description: "Catat temuan moderasi tanpa mengubah visibilitas event.", Icon: Flag },
  unpublish: { label: "Unpublish", description: "Sembunyikan event dari daftar publik.", Icon: EyeOff },
  cancel: { label: "Cancel event", description: "Tandai event dibatalkan. Jika sudah dipublikasikan, halaman publik tetap menampilkan pemberitahuan pembatalan.", Icon: Ban },
  restore: { label: "Restore", description: "Pulihkan event yang dibatalkan atau publikasikan kembali event yang di-unpublish.", Icon: RotateCcw },
};

export default function MasterModerationPage() {
  const { t } = useLanguage();
  const [queue, setQueue] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [actionTarget, setActionTarget] = useState(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [logsTarget, setLogsTarget] = useState(null);
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setQueue(await adminService.getModerationQueue());
    } catch (error) {
      bentoToast.error(t("common.actionFailed"), error.message || t("common.tryAgain"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    adminService.getModerationQueue()
      .then((events) => { if (active) setQueue(events); })
      .catch((error) => { if (active) bentoToast.error(t("common.actionFailed"), error.message || t("common.tryAgain")); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [t]);

  const visible = useMemo(() => {
    if (filter === "all") return queue;
    if (filter === "cancelled") return queue.filter((event) => event.cancelled);
    return queue.filter((event) => event.publication_status === filter);
  }, [queue, filter]);

  const openAction = (event, action) => {
    setActionTarget({ event, action });
    setReason("");
  };

  const submitAction = async (event) => {
    event.preventDefault();
    if (!actionTarget || reason.trim().length < 5) return;
    setSubmitting(true);
    try {
      await adminService.moderateEvent(actionTarget.event.id, actionTarget.action, reason.trim());
      bentoToast.success("Moderasi berhasil", `${ACTIONS[actionTarget.action].label}: ${actionTarget.event.title}`);
      setActionTarget(null);
      await load();
    } catch (error) {
      bentoToast.error("Moderasi gagal", error.message || t("common.tryAgain"));
    } finally {
      setSubmitting(false);
    }
  };

  const openLogs = async (event) => {
    setLogsTarget(event);
    setLogs([]);
    setLogsLoading(true);
    try {
      setLogs(await adminService.getModerationLogs(event.id));
    } catch (error) {
      bentoToast.error("Riwayat moderasi gagal dimuat", error.message || t("common.tryAgain"));
    } finally {
      setLogsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <SEO title={`${t("master.moderationTitle")} | UPA TIK`} noIndex />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-[#102B69] dark:text-white">{t("master.moderationTitle")}</h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Moderasi menggunakan aksi flag, unpublish, restore, dan cancel.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {["all", "draft", "published", "unpublished", "cancelled"].map((status) => (
            <button key={status} onClick={() => setFilter(status)} className={`px-4 py-2 rounded-full text-xs font-extrabold border-2 border-[#102B69] dark:border-[#D6F45A] capitalize transition ${filter === status ? "bg-[#D6F45A] text-[#102B69] shadow-[0_3px_0_0_#102B69]" : "bg-white dark:bg-[#111A2E] text-[#102B69] dark:text-slate-200 hover:bg-[#EAF1FF]"}`}>
              {status === "all" ? t("common.all") : status}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Memuat daftar event...</p>
      ) : visible.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-8 text-center text-sm text-slate-500">Tidak ada event pada filter ini.</div>
      ) : (
        <div className="space-y-4">
          {visible.map((item) => (
            <article key={item.id} className="rounded-[2rem] bg-white dark:bg-[#111A2E] border-2 border-[#102B69] dark:border-[#D6F45A] p-5 sm:p-6 bento-shadow space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={item.status} />
                    {item.cancelled && <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">Cancelled</span>}
                    <span className="text-xs font-bold text-[#1649B8] dark:text-[#D6F45A]">{item.organizer || "Organisasi tidak tersedia"}</span>
                  </div>
                  <h2 className="font-display font-extrabold text-base text-[#102B69] dark:text-white">{item.title}</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{formatDateTimeWITA(item.start_datetime)} · {item.location || item.location_mode}</p>
                  {item.cancellation_reason && <p className="text-xs text-red-600">Alasan pembatalan: {item.cancellation_reason}</p>}
                </div>
                <button onClick={() => openLogs(item)} className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-full border-2 border-[#102B69] dark:border-[#D6F45A] text-xs font-extrabold text-[#102B69] dark:text-[#D6F45A] shrink-0">
                  <History className="w-4 h-4" /> Riwayat
                </button>
              </div>
              <div className="flex flex-wrap gap-2 border-t border-slate-200 dark:border-slate-700 pt-4">
                <button onClick={() => openAction(item, "flag")} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-extrabold"><Flag className="w-3.5 h-3.5" /> Flag</button>
                {item.publication_status === "published" && <button onClick={() => openAction(item, "unpublish")} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-100 text-slate-800 border border-slate-300 text-xs font-extrabold"><EyeOff className="w-3.5 h-3.5" /> Unpublish</button>}
                {!item.cancelled && <button onClick={() => openAction(item, "cancel")} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-red-100 text-red-700 border border-red-300 text-xs font-extrabold"><Ban className="w-3.5 h-3.5" /> Cancel event</button>}
                {(item.cancelled || item.publication_status === "unpublished") && <button onClick={() => openAction(item, "restore")} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#D6F45A] text-[#102B69] border border-[#102B69] text-xs font-extrabold"><RotateCcw className="w-3.5 h-3.5" /> Restore</button>}
              </div>
            </article>
          ))}
        </div>
      )}

      {actionTarget && (
        <div className="fixed inset-0 z-50 bg-[#102B69]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={submitAction} className="bg-white dark:bg-[#111A2E] border-2 border-[#102B69] dark:border-[#D6F45A] bento-shadow rounded-3xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display font-extrabold text-lg text-[#102B69] dark:text-white">{ACTIONS[actionTarget.action].label}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{actionTarget.event.title}</p>
              </div>
              <button type="button" onClick={() => setActionTarget(null)} aria-label="Close" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex gap-2 rounded-xl bg-[#EAF1FF] dark:bg-[#090F1E] p-3 text-xs text-[#102B69] dark:text-slate-200"><AlertTriangle className="w-4 h-4 shrink-0" />{ACTIONS[actionTarget.action].description}</div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">Alasan moderasi (minimal 5 karakter)
              <textarea required minLength={5} maxLength={5000} rows={4} value={reason} onChange={(event) => setReason(event.target.value)} className="mt-1 w-full px-4 py-3 rounded-2xl bg-[#F5F7FC] dark:bg-[#090F1E] border-2 border-[#102B69]/25 dark:border-slate-700 text-sm focus:outline-none" placeholder="Tuliskan alasan tindakan moderasi..." />
            </label>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setActionTarget(null)} className="px-4 py-2 rounded-full border-2 border-[#102B69] dark:border-slate-600 text-xs font-extrabold">Batal</button>
              <button type="submit" disabled={submitting || reason.trim().length < 5} className="px-5 py-2 rounded-full bg-[#102B69] dark:bg-[#D6F45A] text-[#D6F45A] dark:text-[#102B69] text-xs font-extrabold disabled:opacity-50">{submitting ? "Memproses..." : "Konfirmasi"}</button>
            </div>
          </form>
        </div>
      )}

      {logsTarget && (
        <div className="fixed inset-0 z-50 bg-[#102B69]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111A2E] border-2 border-[#102B69] dark:border-[#D6F45A] bento-shadow rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div><h2 className="font-display font-extrabold text-lg text-[#102B69] dark:text-white">Riwayat moderasi</h2><p className="text-xs text-slate-500">{logsTarget.title}</p></div>
              <button onClick={() => setLogsTarget(null)} aria-label="Close" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"><X className="w-4 h-4" /></button>
            </div>
            {logsLoading ? <p className="text-sm text-slate-500">Memuat riwayat...</p> : logs.length === 0 ? <p className="text-sm text-slate-500">Belum ada riwayat moderasi.</p> : logs.map((log) => (
              <div key={log.id} className="rounded-2xl bg-[#F5F7FC] dark:bg-[#090F1E] p-4 space-y-1">
                <div className="flex flex-wrap justify-between gap-2"><strong className="text-sm text-[#102B69] dark:text-white capitalize">{log.action}</strong><span className="text-xs text-slate-500">{formatDateTimeWITA(log.created_at)}</span></div>
                <p className="text-xs text-slate-600 dark:text-slate-300">Moderator: {log.moderator?.name || "—"}</p>
                <p className="text-sm text-slate-700 dark:text-slate-200">{log.reason}</p>
              </div>
            ))}
            <div className="flex justify-end"><button onClick={() => setLogsTarget(null)} className="px-5 py-2 rounded-full bg-[#102B69] dark:bg-[#D6F45A] text-[#D6F45A] dark:text-[#102B69] text-xs font-extrabold">Tutup</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

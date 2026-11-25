import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import SEO from "../../seo/SEO";
import BentoIcon from "../../components/ui/BentoIcons";
import { adminService } from "../../services/adminService";
import { formatDateTimeWITA } from "../../utils/dateFormatter";
import { bentoToast } from "../../utils/bentoToast";
import { useLanguage } from "../../contexts/LanguageContext";

export default function MasterSessionsPage() {
  const { t } = useLanguage();

  const [sessions, setSessions] = useState([]);
  const [confirmRevoke, setConfirmRevoke] = useState(null);

  useEffect(() => {
    adminService.getSessions().then(setSessions);
  }, []);

  const handleRevoke = async () => {
    const target = confirmRevoke;
    const updated = await adminService.revokeSession(target.id);
    setSessions(updated);
    setConfirmRevoke(null);
    bentoToast.deleted(
      t("master.sessionRevokedTitle"),
      t("master.sessionRevokedDesc", { device: target.device, ip: target.ip_address })
    );
  };

  return (
    <div className="space-y-6">
      <SEO title={`${t("master.sessions")} | UPA TIK`} noIndex />

      <div>
        <h1 className="font-display text-2xl font-extrabold text-[#102B69] dark:text-white">
          {t("master.sessionsTitle")}
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
          {t("master.sessionsSub")}
        </p>
      </div>

      <div className="space-y-4">
        {sessions.map((s) => (
          <div
            key={s.id}
            className={`rounded-[2rem] p-5 border-2 bento-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              s.is_suspicious
                ? "bg-[#FFF1F2] dark:bg-[#2A1219] border-[#FF5A5F]"
                : "bg-white dark:bg-[#111A2E] border-[#102B69] dark:border-[#D6F45A]"
            }`}
          >
            <div className="flex items-start gap-3.5">
              <BentoIcon
                name={s.is_suspicious ? "alert" : "device"}
                tone={s.is_suspicious ? "danger" : "royal"}
              />

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display font-extrabold text-sm text-[#102B69] dark:text-white">
                    {s.user_name}
                  </p>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#EAF1FF] dark:bg-[#090F1E] border border-[#102B69]/30 dark:border-slate-700 text-[10px] font-extrabold uppercase text-[#102B69] dark:text-[#D6F45A]">
                    {s.role}
                  </span>
                  {s.is_current && (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#D6F45A] border border-[#102B69] text-[#102B69] text-[10px] font-extrabold">
                      {t("master.currentBadge")}
                    </span>
                  )}
                  {s.is_suspicious && (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FF5A5F] border border-[#102B69] text-white text-[10px] font-extrabold">
                      {t("master.suspiciousBadge")}
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">
                  {s.device} | IP: <span className="font-mono">{s.ip_address}</span> ({s.location})
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {t("master.lastActive")} {formatDateTimeWITA(s.last_active)}
                </p>
              </div>
            </div>

            {!s.is_current && (
              <button
                onClick={() => setConfirmRevoke(s)}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-[#FF5A5F] text-white border-2 border-[#102B69] text-xs font-extrabold hover:brightness-95 transition shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" /> {t("master.revokeSessionBtn")}
              </button>
            )}
          </div>
        ))}
      </div>

      {confirmRevoke && (
        <div className="fixed inset-0 z-50 bg-[#102B69]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111A2E] border-2 border-[#102B69] dark:border-[#D6F45A] bento-shadow rounded-3xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-display font-extrabold text-lg text-[#102B69] dark:text-white">
              {t("master.revokeConfirmTitle")}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {t("master.revokeConfirmDesc", {
                device: confirmRevoke.device,
                ip: confirmRevoke.ip_address,
                user: confirmRevoke.user_name,
              })}
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmRevoke(null)}
                className="px-4 py-2 rounded-full border-2 border-[#102B69] dark:border-slate-600 text-xs font-extrabold"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleRevoke}
                className="px-5 py-2 rounded-full bg-[#FF5A5F] text-white border-2 border-[#102B69] text-xs font-extrabold"
              >
                {t("master.yesRevoke")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
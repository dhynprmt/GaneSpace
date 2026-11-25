import { useEffect, useState } from "react";
import { Check, RefreshCw, X } from "lucide-react";
import { API_CONFIG } from "../../services/api/apiClient";
import SEO from "../../seo/SEO";
import { adminService } from "../../services/adminService";
import { formatDateTimeWITA } from "../../utils/dateFormatter";
import { bentoToast } from "../../utils/bentoToast";
import { useLanguage } from "../../contexts/LanguageContext";

const BADGE_CLS = {
  pending: "bg-[#EAF1FF] text-[#102B69] border-[#102B69]",
  verified: "bg-[#D6F45A] text-[#102B69] border-[#102B69]",
  rejected: "bg-[#FF5A5F] text-white border-[#102B69]",
  manual_review: "bg-[#FFD166] text-[#102B69] border-[#102B69]",
};

export default function MasterVerificationsPage() {
  const { t } = useLanguage();

  const [list, setList] = useState([]);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    adminService.getStudentVerifications().then(setList).catch((err) => setError(err.message));
  }, []);

  const updateStatus = async (item, status) => {
    const reason = status === "verified" ? "" : window.prompt("Alasan keputusan verifikasi");
    if (reason === null) return;
    if (status !== "verified" && !reason.trim()) { setError("Masukkan alasan keputusan."); return; }
    let updated;
    try {
      updated = await adminService.updateStudentVerification(item.id, status, reason.trim());
      setError("");
    } catch (err) {
      setError(err.message);
      return;
    }
    setList(updated);
    if (status === "verified") {
      bentoToast.success(
        t("master.nimVerifiedTitle"),
        t("master.nimVerifiedDesc", { name: item.name, nim: item.nim })
      );
    } else if (status === "rejected") {
      bentoToast.deleted(
        t("master.nimRejectedTitle"),
        t("master.nimRejectedDesc", { nim: item.nim })
      );
    } else {
      bentoToast.updated(
        t("master.manualReviewTitle"),
        t("master.manualReviewDesc", { name: item.name })
      );
    }
  };

  const visible = filter === "all" ? list : list.filter((v) => v.status === filter);

  return (
    <div className="space-y-6">
      {error && <p role="alert">{error}</p>}
      <SEO title={`${t("master.nimVerifTitle")} | UPA TIK`} noIndex />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-extrabold text-[#102B69] dark:text-white">
          {t("master.nimVerifTitle")}
        </h1>
        <div className="flex flex-wrap gap-2">
          {["all", "pending", "manual_review", "verified", "rejected"].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-4 py-2 rounded-full text-xs font-extrabold border-2 border-[#102B69] dark:border-[#D6F45A] capitalize transition ${
                filter === st
                  ? "bg-[#D6F45A] text-[#102B69] shadow-[0_3px_0_0_#102B69]"
                  : "bg-white dark:bg-[#111A2E] text-[#102B69] dark:text-slate-200 hover:bg-[#EAF1FF]"
              }`}
            >
              {st === "all" ? t("common.all") : t(`status.${st}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-[2rem] bg-white dark:bg-[#111A2E] border-2 border-[#102B69] dark:border-[#D6F45A] bento-shadow overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#EAF1FF] dark:bg-[#0B1222] border-b-2 border-[#102B69] dark:border-[#D6F45A]/50 text-xs font-extrabold text-[#102B69] dark:text-[#D6F45A] uppercase">
            <tr>
              <th className="p-4">{t("master.colStudent")}</th>
              <th className="p-4">NIM & Prodi</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">{t("master.colDecision")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800">
            {visible.map((v) => (
              <tr key={v.id} className="hover:bg-[#F5F7FC] dark:hover:bg-slate-800/40">
                <td className="p-4">
                  <p className="font-extrabold text-[#102B69] dark:text-white">{v.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{v.email}</p>
                  {v.has_ktm && <a className="underline" href={`${API_CONFIG.baseURL}/master/student-verifications/${v.id}/ktm`}>Unduh KTM</a>}
                  <p className="text-[11px] text-slate-400">{formatDateTimeWITA(v.submitted_at)}</p>
                </td>
                <td className="p-4 text-xs">
                  <p className="font-mono font-extrabold text-[#1649B8] dark:text-[#D6F45A]">{v.nim}</p>
                  <p className="text-slate-600 dark:text-slate-300">{v.study_program} | {v.faculty}</p>
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold border capitalize ${BADGE_CLS[v.status]}`}>
                    {t(`status.${v.status}`)}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex justify-end gap-1.5">
                    <button
                      onClick={() => updateStatus(v, "verified")}
                      title={t("status.verified")}
                      className="p-2 rounded-xl bg-[#D6F45A] text-[#102B69] border-2 border-[#102B69] hover:brightness-95"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => updateStatus(v, "manual_review")}
                      title={t("status.manual_review")}
                      className="p-2 rounded-xl bg-[#FFD166] text-[#102B69] border-2 border-[#102B69] hover:brightness-95"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => updateStatus(v, "rejected")}
                      title={t("status.rejected")}
                      className="p-2 rounded-xl bg-[#FF5A5F] text-white border-2 border-[#102B69] hover:brightness-95"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
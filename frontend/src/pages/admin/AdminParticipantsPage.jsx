import { useCallback, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import { useRemoteList } from "../../hooks/useRemoteList";
import SEO from "../../seo/SEO";
import { adminService } from "../../services/adminService";
import { formatDateTimeWITA } from "../../utils/dateFormatter";
import { EmptyState } from "../../components/ui/StateViews";
import { useLanguage } from "../../contexts/LanguageContext";

export default function AdminParticipantsPage() {
  const { id } = useParams();
  const { t } = useLanguage();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const load = useCallback(() => adminService.getEventParticipants(id, { search, status: statusFilter, page }),
    [id, search, statusFilter, page]);
  const { data, loading, error: loadError } = useRemoteList(load);
  const filtered = data?.rows || [];

  return (
    <div className="space-y-6">
      <SEO title={`${t("admin.participantsTitle")} | GANESPACE`} noIndex />

      <Link
        to="/admin/events"
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white dark:bg-[#111A2E] border-2 border-[#102B69] dark:border-[#D6F45A] text-xs font-extrabold text-[#102B69] dark:text-[#D6F45A] hover:bg-[#D6F45A] hover:text-[#102B69] transition"
      >
        <ArrowLeft className="w-4 h-4" /> {t("admin.backToManage")}
      </Link>

      <div>
        <h1 className="font-display text-2xl font-extrabold text-[#102B69] dark:text-white">
          {t("admin.participantsTitle")}
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-400">ID: {id}</p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: "all", label: t("common.all") },
            { key: "registered", label: t("status.registered") },
            { key: "cancelled", label: t("status.cancelled") },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setPage(1); setStatusFilter(tab.key); }}
              className={`px-4 py-2 rounded-full text-xs font-extrabold border-2 border-[#102B69] dark:border-[#D6F45A] transition ${
                statusFilter === tab.key
                  ? "bg-[#D6F45A] text-[#102B69] shadow-[0_3px_0_0_#102B69]"
                  : "bg-white dark:bg-[#111A2E] text-[#102B69] dark:text-slate-200 hover:bg-[#EAF1FF]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#1649B8] dark:text-[#D6F45A] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t("admin.searchParticipantsPh")}
            value={search}
            maxLength={120}
            onChange={(e) => { setPage(1); setSearch(e.target.value); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white dark:bg-[#111A2E] border-2 border-[#102B69] dark:border-[#D6F45A] text-sm font-medium focus:outline-none shadow-[0_3px_0_0_#102B69] dark:shadow-[0_3px_0_0_#D6F45A]"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t("admin.loadingParticipants")}
        </p>
      ) : loadError ? (
        <div role="alert" className="rounded-2xl border-2 border-amber-300 bg-amber-50 dark:bg-amber-950/30 p-4 text-sm text-amber-800 dark:text-amber-200">{loadError}</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={t("admin.noParticipantsTitle")}
          description={t("admin.noParticipantsDesc")}
        />
      ) : (
        <div className="rounded-[2rem] bg-white dark:bg-[#111A2E] border-2 border-[#102B69] dark:border-[#D6F45A] bento-shadow overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#EAF1FF] dark:bg-[#0B1222] border-b-2 border-[#102B69] dark:border-[#D6F45A]/50 text-xs font-extrabold text-[#102B69] dark:text-[#D6F45A] uppercase">
              <tr>
                <th className="p-4">{t("admin.colParticipant")}</th>
                <th className="p-4">NIM & Prodi</th>
                <th className="p-4">{t("admin.colRegTime")}</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-[#F5F7FC] dark:hover:bg-slate-800/40">
                  <td className="p-4">
                    <p className="font-extrabold text-[#102B69] dark:text-white">{p.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{p.email}</p>
                  </td>
                  <td className="p-4 text-xs">
                    <p className="font-mono font-extrabold text-[#1649B8] dark:text-[#D6F45A]">{p.nim}</p>
                    <p className="text-slate-500 dark:text-slate-400">{p.study_program}</p>
                  </td>
                  <td className="p-4 text-xs text-slate-600 dark:text-slate-400">
                    {formatDateTimeWITA(p.registered_at)}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-extrabold border capitalize ${
                        p.status === "registered"
                          ? "bg-[#D6F45A] text-[#102B69] border-[#102B69]"
                          : "bg-[#FF5A5F] text-white border-[#102B69]"
                      }`}
                    >
                      {t(`status.${p.status}`)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {data?.lastPage > 1 && (
        <nav aria-label="Halaman peserta" className="flex gap-4 items-center">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Sebelumnya</button>
          <span>{page} / {data.lastPage}</span>
          <button disabled={page >= data.lastPage} onClick={() => setPage(page + 1)}>Berikutnya</button>
        </nav>
      )}
    </div>
  );
}
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Search } from "lucide-react";
import SEO from "../../seo/SEO";
import StatusBadge from "../../components/ui/StatusBadge";
import { adminService } from "../../services/adminService";
import { formatDateWITA } from "../../utils/dateFormatter";
import { useLanguage } from "../../contexts/LanguageContext";

export default function MasterEventsPage() {
  const { t } = useLanguage();

  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 6;

  useEffect(() => {
    adminService.getAllMasterEvents().then(setEvents);
  }, []);

  const filtered = events.filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      (e.organizer || "").toLowerCase().includes(search.toLowerCase())
  );
  const lastPage = Math.max(1, Math.ceil(filtered.length / perPage));
  const visible = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="space-y-6">
      <SEO title={`${t("master.allEventsTitle")} | UPA TIK`} noIndex />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-extrabold text-[#102B69] dark:text-white">
          {t("master.allEventsTitle")}
        </h1>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#1649B8] dark:text-[#D6F45A] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t("master.searchAllEventsPh")}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white dark:bg-[#111A2E] border-2 border-[#102B69] dark:border-[#D6F45A] text-sm font-medium focus:outline-none shadow-[0_3px_0_0_#102B69] dark:shadow-[0_3px_0_0_#D6F45A]"
          />
        </div>
      </div>

      <div className="rounded-[2rem] bg-white dark:bg-[#111A2E] border-2 border-[#102B69] dark:border-[#D6F45A] bento-shadow overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#EAF1FF] dark:bg-[#0B1222] border-b-2 border-[#102B69] dark:border-[#D6F45A]/50 text-xs font-extrabold text-[#102B69] dark:text-[#D6F45A] uppercase">
            <tr>
              <th className="p-4">{t("student.eventTitleLabel")}</th>
              <th className="p-4">{t("master.colOrganizer")}</th>
              <th className="p-4">{t("admin.colDate")}</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800">
            {visible.map((ev) => (
              <tr key={ev.id} className="hover:bg-[#F5F7FC] dark:hover:bg-slate-800/40">
                <td className="p-4">
                  <Link
                    to={`/events/${ev.slug}`}
                    className="font-extrabold text-[#102B69] dark:text-white hover:text-[#1649B8] dark:hover:text-[#D6F45A] inline-flex items-center gap-1"
                  >
                    {ev.title} <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                  </Link>
                </td>
                <td className="p-4 text-xs font-bold text-slate-600 dark:text-slate-300">{ev.organizer}</td>
                <td className="p-4 text-xs text-slate-500 dark:text-slate-400">{formatDateWITA(ev.start_datetime)}</td>
                <td className="p-4"><StatusBadge status={ev.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center items-center gap-3">
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-4 py-2 rounded-full border-2 border-[#102B69] dark:border-[#D6F45A] bg-white dark:bg-[#111A2E] text-xs font-extrabold disabled:opacity-40"
        >
          {t("common.prev")}
        </button>
        <span className="text-xs font-extrabold text-[#102B69] dark:text-[#D6F45A]">
          {page} / {lastPage}
        </span>
        <button
          disabled={page >= lastPage}
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 rounded-full bg-[#102B69] dark:bg-[#D6F45A] text-[#D6F45A] dark:text-[#102B69] text-xs font-extrabold disabled:opacity-40"
        >
          {t("common.next")}
        </button>
      </div>
    </div>
  );
}
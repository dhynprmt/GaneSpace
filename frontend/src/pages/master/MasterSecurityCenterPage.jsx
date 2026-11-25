import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import SEO from "../../seo/SEO";
import BentoIcon from "../../components/ui/BentoIcons";
import { adminService } from "../../services/adminService";
import { formatDateTimeWITA } from "../../utils/dateFormatter";
import { useLanguage } from "../../contexts/LanguageContext";

export default function MasterSecurityCenterPage() {
  const { t } = useLanguage();

  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    adminService.getAuditAndSecurity().then(setLogs);
  }, []);

  const filtered = logs.filter((l) => {
    const matchText =
      l.actor.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.target.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "all" || l.category === category;
    return matchText && matchCat;
  });

  return (
    <div className="space-y-6">
      <SEO title={`${t("master.security")} | UPA TIK`} noIndex />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: "all", label: t("master.allLogs") },
            { key: "security", label: "Security" },
            { key: "verification", label: t("master.verificationLog") },
            { key: "event", label: "Events" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setCategory(tab.key)}
              className={`px-4 py-2 rounded-full text-xs font-extrabold border-2 border-[#102B69] dark:border-[#D6F45A] transition ${
                category === tab.key
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
            placeholder={t("master.searchLogPh")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white dark:bg-[#111A2E] border-2 border-[#102B69] dark:border-[#D6F45A] text-sm font-medium focus:outline-none shadow-[0_3px_0_0_#102B69] dark:shadow-[0_3px_0_0_#D6F45A]"
          />
        </div>
      </div>

      <div className="rounded-[2rem] bg-white dark:bg-[#111A2E] border-2 border-[#102B69] dark:border-[#D6F45A] bento-shadow overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#EAF1FF] dark:bg-[#0B1222] border-b-2 border-[#102B69] dark:border-[#D6F45A]/50 text-xs font-extrabold text-[#102B69] dark:text-[#D6F45A] uppercase">
            <tr>
              <th className="p-4">{t("master.colTime")}</th>
              <th className="p-4">{t("master.colActor")}</th>
              <th className="p-4">{t("master.colActionTarget")}</th>
              <th className="p-4">{t("master.colDeviceIp")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800">
            {filtered.map((l) => (
              <tr key={l.id} className="hover:bg-[#F5F7FC] dark:hover:bg-slate-800/40">
                <td className="p-4 text-xs text-slate-500 dark:text-slate-400">
                  {formatDateTimeWITA(l.created_at)}
                </td>
                <td className="p-4 text-xs font-extrabold text-[#102B69] dark:text-white">{l.actor}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2.5">
                    <BentoIcon
                      name={l.category === "security" ? "alert" : "security"}
                      tone={l.category === "security" ? "danger" : "royal"}
                      size="sm"
                    />
                    <div>
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border border-[#102B69] ${
                          l.category === "security"
                            ? "bg-[#FF5A5F] text-white"
                            : "bg-[#D6F45A] text-[#102B69]"
                        }`}
                      >
                        {l.action}
                      </span>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{l.target}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-xs text-slate-500 dark:text-slate-400">
                  <p className="font-semibold">{l.device}</p>
                  <p className="font-mono text-[11px]">{l.ip_address}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Edit, Plus, Search, Send, Trash2, Users } from "lucide-react";
import SEO from "../../seo/SEO";
import StatusBadge from "../../components/ui/StatusBadge";
import { EmptyState } from "../../components/ui/StateViews";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { adminService } from "../../services/adminService";
import { formatDateWITA } from "../../utils/dateFormatter";
import { bentoToast } from "../../utils/bentoToast";

export default function AdminEventsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const list = await adminService.getAdminEvents(user?.organization);
      setEvents(list);
    } catch (err) {
      bentoToast.error(t("common.actionFailed"), err.message || t("common.tryAgain"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    adminService.getAdminEvents(user?.organization)
      .then((list) => { if (active) setEvents(list); })
      .catch((error) => { if (active) bentoToast.error(t("common.actionFailed"), error.message || t("common.tryAgain")); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user?.organization, t]);

  const handlePublish = async (ev) => {
    try {
      await adminService.togglePublishEvent(ev.id, Boolean(ev.is_published));
      bentoToast.updated(
        ev.is_published ? t("admin.movedToDraft") : t("admin.eventPublished"),
        ev.title
      );
      load();
    } catch (err) {
      bentoToast.error(t("common.actionFailed"), err.message || t("admin.publishFailed"));
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    const deletedTitle = confirmDelete.title;
    try {
      await adminService.deleteEvent(confirmDelete.id);
      bentoToast.deleted(
        t("admin.eventDeleted"),
        t("admin.eventDeletedDesc", { title: deletedTitle })
      );
      setConfirmDelete(null);
      load();
    } catch (err) {
      bentoToast.error(t("admin.deleteFailed"), err.message || t("common.tryAgain"));
    }
  };

  const filtered = events.filter((e) => {
    const matchText = e.title.toLowerCase().includes(search.toLowerCase());
    const matchDomain = domainFilter === "all" || e.domain === domainFilter;
    return matchText && matchDomain;
  });

  return (
    <div className="space-y-6">
      <SEO title={`${t("admin.manageEvents")} | GANESPACE`} noIndex />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-[#102B69] dark:text-white">
            {t("admin.manageEvents")}
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {t("admin.orgScope")}{" "}
            <strong className="text-[#102B69] dark:text-[#D6F45A]">{user?.organization}</strong>
          </p>
        </div>
        <Link
          to="/admin/events/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#D6F45A] text-[#102B69] border-2 border-[#102B69] text-xs font-extrabold shadow-[0_3px_0_0_#102B69] hover:brightness-95 transition"
        >
          <Plus className="w-4 h-4" /> {t("admin.createEvent")}
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: "all", label: t("tabs.all") },
            { key: "academic", label: t("tabs.academic") },
            { key: "non_academic", label: t("tabs.nonAcademic") },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setDomainFilter(tab.key)}
              className={`px-4 py-2 rounded-full text-xs font-extrabold border-2 border-[#102B69] dark:border-[#D6F45A] transition ${
                domainFilter === tab.key
                  ? "bg-[#D6F45A] text-[#102B69] shadow-[0_3px_0_0_#102B69]"
                  : "bg-white dark:bg-[#111A2E] text-[#102B69] dark:text-slate-200 hover:bg-[#EAF1FF] dark:hover:bg-slate-800"
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
            placeholder={t("admin.searchEventPh")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white dark:bg-[#111A2E] border-2 border-[#102B69] dark:border-[#D6F45A] text-sm font-medium focus:outline-none shadow-[0_3px_0_0_#102B69] dark:shadow-[0_3px_0_0_#D6F45A]"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">{t("admin.loadingEvents")}</p>
      ) : filtered.length === 0 ? (
        <EmptyState title={t("admin.noEventsTitle")} description={t("admin.noEventsDesc")} />
      ) : (
        <div className="rounded-[2rem] bg-white dark:bg-[#111A2E] border-2 border-[#102B69] dark:border-[#D6F45A] bento-shadow overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#EAF1FF] dark:bg-[#0B1222] border-b-2 border-[#102B69] dark:border-[#D6F45A]/50 text-xs font-extrabold text-[#102B69] dark:text-[#D6F45A] uppercase">
              <tr>
                <th className="p-4">{t("admin.colEvent")}</th>
                <th className="p-4">{t("admin.colType")}</th>
                <th className="p-4">{t("admin.colDate")}</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">{t("admin.colActions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800">
              {filtered.map((ev) => (
                <tr key={ev.id} className="hover:bg-[#F5F7FC] dark:hover:bg-slate-800/40">
                  <td className="p-4">
                    <p className="font-extrabold text-[#102B69] dark:text-white">{ev.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{ev.location}</p>
                  </td>
                  <td className="p-4 text-xs font-bold capitalize text-slate-700 dark:text-slate-300">
                    {ev.domain === "academic" ? t("tabs.academic") : t("tabs.nonAcademic")}
                  </td>
                  <td className="p-4 text-xs text-slate-600 dark:text-slate-400">
                    {formatDateWITA(ev.start_datetime)}
                  </td>
                  <td className="p-4">
                    <StatusBadge status={ev.status} />
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end items-center gap-2">
                      {!ev.cancelled && (
                        <button
                          onClick={() => handlePublish(ev)}
                          title={ev.is_published ? "Unpublish event" : "Publish event"}
                          className="p-2 rounded-xl border-2 border-[#102B69] dark:border-[#D6F45A] bg-[#EAF1FF] dark:bg-[#090F1E] text-[#1649B8] dark:text-[#D6F45A] hover:bg-[#1649B8] hover:text-white transition"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {ev.domain === "academic" && (
                        <Link
                          to={`/admin/events/${ev.id}/participants`}
                          title={t("admin.participants")}
                          className="p-2 rounded-xl border-2 border-[#102B69] dark:border-[#D6F45A] bg-white dark:bg-[#090F1E] text-[#102B69] dark:text-[#D6F45A] hover:bg-[#D6F45A] hover:text-[#102B69] transition"
                        >
                          <Users className="w-3.5 h-3.5" />
                        </Link>
                      )}
                      <Link
                        to={`/admin/events/${ev.id}/edit`}
                        title={t("common.edit")}
                        className="p-2 rounded-xl border-2 border-[#102B69] dark:border-[#D6F45A] bg-white dark:bg-[#090F1E] text-[#102B69] dark:text-[#D6F45A] hover:bg-[#D6F45A] hover:text-[#102B69] transition"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => setConfirmDelete(ev)}
                        title={t("common.delete")}
                        className="p-2 rounded-xl border-2 border-[#102B69] bg-[#FF5A5F] text-white hover:brightness-95 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-[#102B69]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111A2E] rounded-3xl border-2 border-[#102B69] dark:border-[#D6F45A] bento-shadow max-w-md w-full p-6 space-y-4">
            <h3 className="font-display font-extrabold text-lg text-[#102B69] dark:text-white">
              {t("admin.deleteEventTitle")}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {t("admin.deleteEventDesc", { title: confirmDelete.title })}
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-full border-2 border-[#102B69] dark:border-slate-600 text-xs font-extrabold text-[#102B69] dark:text-slate-200"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2 rounded-full bg-[#FF5A5F] text-white border-2 border-[#102B69] text-xs font-extrabold hover:brightness-95"
              >
                {t("common.yesDelete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
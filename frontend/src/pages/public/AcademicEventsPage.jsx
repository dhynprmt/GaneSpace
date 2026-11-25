import { useCallback, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Award, Search } from "lucide-react";
import { useRemoteList } from "../../hooks/useRemoteList";
import SEO from "../../seo/SEO";
import EventPagination from "../../components/events/EventPagination";
import EventCard from "../../components/events/EventCard";
import { EmptyState, ErrorState, EventCardSkeleton } from "../../components/ui/StateViews";
import { RotatingShape } from "../../components/ui/MotionPrimitives";
import { API_CONFIG } from "../../services/api/apiClient";
import { eventService } from "../../services/eventService";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";

export default function AcademicEventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab") || "all";
  const activeTab = !API_CONFIG.useMockApi && requestedTab === "seminar-proposal" ? "proposal-seminar" : requestedTab;

  const { user, role } = useAuth();
  const { t } = useLanguage();


  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const loadRows = useCallback(() => {
    return eventService.getEvents({ domain: "academic", category: activeTab, search: query, page, per_page: 24 });
  }, [page, query, activeTab]);
  const { data: result, error, loading, refresh } = useRemoteList(loadRows);
  const events = result?.data || [];

  const selectTab = (key) => {
    setPage(1);

    if (key === "all") setSearchParams({});
    else setSearchParams({ tab: key });
  };

  const loadTypes = useCallback(() => eventService.getEventTypes("academic"), []);
  const types = useRemoteList(loadTypes);
  const tabs = API_CONFIG.useMockApi ? [
    { key: "all", label: t("tabs.all") },
    { key: "seminar-proposal", label: t("tabs.sempro") },
    { key: "seminar-sharing", label: t("tabs.seminar") },
    { key: "workshop-bootcamp", label: t("tabs.workshop") },
  ] : [{ key: "all", label: t("tabs.all") }, ...types.items.map((type) => ({ key: type.slug, label: type.name }))];

  const attended = user?.seminar_attendance_count;
  const target = user?.seminar_attendance_target || 10;
  const showSemproTracker = ["seminar-proposal", "proposal-seminar"].includes(activeTab);

  return (
    <div className="bg-white dark:bg-[#090F1E] bg-subtle-dots min-h-screen pb-24 transition-colors">
      <SEO title="Academic Events | GANESPACE" canonical="/events/academic" />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <RotatingShape variant="star" className="w-7 h-7 text-[#1649B8] dark:text-[#D6F45A]" />
              <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#102B69] dark:text-white uppercase tracking-tight">
                {t("home.academicTitle")}
              </h1>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {t("home.academicSub")}
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setPage(1);
              if (query === search.trim()) refresh();
              else setQuery(search.trim());
            }}
            className="flex items-center gap-2 w-full lg:w-96 rounded-full bg-white dark:bg-[#111A2E] border-2 border-[#102B69] dark:border-[#D6F45A] p-1.5 shadow-[0_3px_0_0_#102B69] dark:shadow-[0_3px_0_0_#D6F45A]"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#1649B8] dark:text-[#D6F45A] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("common.searchPlaceholder")}
                className="w-full pl-10 pr-3 py-2 rounded-full bg-transparent text-sm font-medium focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2 rounded-full bg-[#102B69] dark:bg-[#D6F45A] text-[#D6F45A] dark:text-[#102B69] text-xs font-extrabold hover:opacity-90 transition shrink-0"
            >
              {t("common.searchBtn")}
            </button>
          </form>
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => selectTab(tab.key)}
              className={`px-4 py-2 rounded-full text-xs font-extrabold border-2 border-[#102B69] dark:border-[#D6F45A] shrink-0 transition ${
                activeTab === tab.key
                  ? "bg-[#D6F45A] text-[#102B69] shadow-[0_3px_0_0_#102B69] dark:shadow-[0_3px_0_0_#FFFFFF]"
                  : "bg-white dark:bg-[#111A2E] text-[#102B69] dark:text-slate-200 hover:bg-[#EAF1FF] dark:hover:bg-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {showSemproTracker && (
          <div className="rounded-3xl bg-[#EAF1FF] dark:bg-[#111A2E] border-2 border-[#102B69] dark:border-[#D6F45A] p-5 bento-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#102B69] text-[#D6F45A] flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-[#102B69] dark:text-white uppercase">
                  {t("home.semproProgress")}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  {role === "student" && typeof attended === "number"
                    ? t("home.semproVerifiedCount", { attended, target })
                    : t("home.semproLoginHint")}
                </p>
              </div>
            </div>
            {role === "student" && typeof attended === "number" && (
              <div className="w-full sm:w-52 h-3 rounded-full bg-white dark:bg-slate-800 border border-[#102B69]/30 overflow-hidden">
                <div
                  className="h-full bg-[#1649B8] dark:bg-[#D6F45A] rounded-full"
                  style={{ width: `${Math.min(100, (attended / target) * 100)}%` }}
                />
              </div>
            )}
          </div>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
        {types.error && <ErrorState message={types.error} onRetry={types.refresh} />}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => <EventCardSkeleton key={n} />)}
          </div>
        ) : error ? <ErrorState message={error} onRetry={refresh} /> : events.length === 0 ? (
          <EmptyState title={t("common.emptyTitle")} description={t("common.emptyDesc")} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {events.map((ev) => (
              <EventCard key={ev.id} event={ev} />
            ))}
          </div>
        )}
        <EventPagination meta={result?.meta} change={setPage} />
      </section>
    </div>
  );
}
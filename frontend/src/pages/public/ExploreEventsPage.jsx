import { useCallback, useState } from "react";
import { Search } from "lucide-react";
import { useRemoteList } from "../../hooks/useRemoteList";
import SEO from "../../seo/SEO";
import EventPagination from "../../components/events/EventPagination";
import EventCard from "../../components/events/EventCard";
import { EmptyState, ErrorState, EventCardSkeleton } from "../../components/ui/StateViews";
import { RotatingShape } from "../../components/ui/MotionPrimitives";
import { eventService } from "../../services/eventService";
import { useLanguage } from "../../contexts/LanguageContext";

export default function ExploreEventsPage() {
  const { t } = useLanguage();
  const [domain, setDomain] = useState("all");
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const loadRows = useCallback(() => {
    return eventService.getEvents({ domain, search: query, page, per_page: 30 });
  }, [page, query, domain]);
  const { data: result, error, loading, refresh } = useRemoteList(loadRows);
  const events = result?.data || [];

  return (
    <div className="bg-white dark:bg-[#090F1E] bg-subtle-dots min-h-screen pb-24 transition-colors">
      <SEO title="Explore Events | GANESPACE" canonical="/events" />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <RotatingShape variant="asterisk" className="w-7 h-7 text-[#1649B8] dark:text-[#D6F45A]" />
              <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#102B69] dark:text-white uppercase tracking-tight">
                {t("explore_title")}
              </h1>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {t("explore_sub")}
            </p>
          </div>

          {/* Search Bar Border Tegas Gaya Bento */}
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
                placeholder={t("search_placeholder")}
                className="w-full pl-10 pr-3 py-2 rounded-full bg-transparent text-sm font-medium focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2 rounded-full bg-[#102B69] dark:bg-[#D6F45A] text-[#D6F45A] dark:text-[#102B69] text-xs font-extrabold hover:opacity-90 transition shrink-0"
            >
              {t("search_btn")}
            </button>
          </form>
        </div>

        {/* Filter Pills Border Tegas Gaya Bento */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2">
          {[
            { key: "all", label: t("tab_all") },
            { key: "academic", label: t("tab_academic") },
            { key: "non_academic", label: t("tab_non_academic") },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setPage(1); setDomain(tab.key); }}
              className={`px-4 py-2 rounded-full text-xs font-extrabold border-2 border-[#102B69] dark:border-[#D6F45A] shrink-0 transition ${
                domain === tab.key
                  ? "bg-[#D6F45A] text-[#102B69] shadow-[0_3px_0_0_#102B69] dark:shadow-[0_3px_0_0_#FFFFFF]"
                  : "bg-white dark:bg-[#111A2E] text-[#102B69] dark:text-slate-200 hover:bg-[#EAF1FF] dark:hover:bg-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => <EventCardSkeleton key={i} />)}
          </div>
        ) : error ? <ErrorState message={error} onRetry={refresh} /> : events.length === 0 ? (
          <EmptyState
            title={t("empty_title")}
            description={t("empty_desc")}
            action={
              <button
                onClick={() => {
                  setSearch("");
                  setPage(1);
                  setDomain("all");
                  setQuery("");
                }}
                className="px-5 py-2 rounded-full bg-[#102B69] text-[#D6F45A] text-xs font-extrabold"
              >
                {t("reset_filter")}
              </button>
            }
          />
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
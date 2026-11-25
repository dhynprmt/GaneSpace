import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Compass,
  MapPin,
  QrCode,
  Search,
  Sparkles,
  Ticket,
} from "lucide-react";
import SEO from "../../seo/SEO";
import HeroSection from "../../components/home/HeroSection";
import EventCard from "../../components/events/EventCard";
import {
  EmptyState,
  ErrorState,
  EventCardSkeleton,
} from "../../components/ui/StateViews";
import {
  RevealOnScroll,
  RotatingShape,
  ScrollProgressBar,
} from "../../components/ui/MotionPrimitives";
import { eventService } from "../../services/eventService";
import { useLanguage } from "../../contexts/LanguageContext";

export default function HomePage() {
  const { t } = useLanguage();

  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [isFiltered, setIsFiltered] = useState(false);

  const loadInitial = async () => {
    setLoading(true);
    setError(null);
    try {
      const [evtRes, catRes] = await Promise.all([
        eventService.getEvents({ per_page: 20 }),
        eventService.getCategories(),
      ]);
      setEvents(evtRes.data);
      setCategories(catRes);
    } catch (err) {
      setError(err.message || t("common.tryAgain"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const fetchInitial = async () => {
      try {
        const [evtRes, catRes] = await Promise.all([
          eventService.getEvents({ per_page: 20 }),
          eventService.getCategories(),
        ]);
        if (active) {
          setEvents(evtRes.data);
          setCategories(catRes);
        }
      } catch (err) {
        if (active) setError(err.message || t("common.tryAgain"));
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchInitial();
    return () => { active = false; };
  }, [t]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setIsFiltered(true);
    try {
      const res = await eventService.getEvents({
        search,
        category,
        date,
        location,
        per_page: 12,
      });
      setEvents(res.data);
    } catch (err) {
      setError(err.message || t("common.tryAgain"));
    } finally {
      setLoading(false);
    }
  };

  const resetSearch = () => {
    setSearch("");
    setCategory("all");
    setDate("");
    setLocation("");
    setIsFiltered(false);
    loadInitial();
  };

  const featuredEvents = events.filter((e) => e.is_featured);
  // EventResource does not expose a featured flag yet; keep the hero populated
  // with the first upcoming events instead of rendering an empty featured section.
  const heroEvents = featuredEvents.length ? featuredEvents : events.slice(0, 4);
  const academicEvents = events.filter((e) => e.domain === "academic");
  const nonAcademicEvents = events.filter((e) => e.domain === "non_academic");

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#090F1E] bg-subtle-dots transition-colors">
      <SEO
        title="GANESPACE | Ganesha Campus Space"
        description="Discover academic and non-academic events at Universitas Pendidikan Ganesha through GANESPACE."
        canonical="/"
      />
      <ScrollProgressBar />

      <HeroSection />

      <section id="explore-events" className="max-w-7xl mx-auto px-3 sm:px-6 pb-12 sm:pb-14">
        <RevealOnScroll>
          <form
            onSubmit={handleSearch}
            className="rounded-[1.75rem] sm:rounded-[2rem] bg-white dark:bg-[#111A2E] border-2 border-[#102B69] dark:border-[#D6F45A] p-3.5 sm:p-4 bento-shadow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5"
          >
            <div className="sm:col-span-2 lg:col-span-4 relative">
              <Search className="w-4 h-4 text-[#1649B8] dark:text-[#D6F45A] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                aria-label={t("common.searchBtn")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("common.searchPlaceholder")}
                className="w-full pl-11 pr-4 py-2.5 sm:py-3 rounded-full bg-[#F5F7FC] dark:bg-[#090F1E] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1649B8]"
              />
            </div>

            <select
              aria-label={t("home.allCategories")}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="lg:col-span-3 px-4 py-2.5 sm:py-3 rounded-full bg-[#F5F7FC] dark:bg-[#090F1E] text-sm font-semibold text-[#102B69] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#1649B8]"
            >
              <option value="all">{t("home.allCategories")}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {t(`categories.${c.name}`)}
                </option>
              ))}
            </select>

            <div className="lg:col-span-2 relative">
              <Calendar className="w-4 h-4 text-[#1649B8] dark:text-[#D6F45A] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="date"
                aria-label={t("admin.dateLabel")}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 sm:py-3 rounded-full bg-[#F5F7FC] dark:bg-[#090F1E] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1649B8]"
              />
            </div>

            <div className="lg:col-span-2 relative">
              <MapPin className="w-4 h-4 text-[#1649B8] dark:text-[#D6F45A] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                aria-label={t("admin.locationLabel")}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t("home.locationPlaceholder")}
                className="w-full pl-10 pr-3 py-2.5 sm:py-3 rounded-full bg-[#F5F7FC] dark:bg-[#090F1E] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1649B8]"
              />
            </div>

            <button
              type="submit"
              className="sm:col-span-2 lg:col-span-1 py-2.5 sm:py-3 px-4 rounded-full bg-[#102B69] dark:bg-[#D6F45A] text-[#D6F45A] dark:text-[#102B69] font-display font-extrabold text-sm hover:opacity-90 transition"
            >
              {t("common.searchBtn")}
            </button>
          </form>
        </RevealOnScroll>
      </section>

      {isFiltered && (
        <section className="max-w-7xl mx-auto px-3 sm:px-6 pb-20">
          <div className="flex items-center justify-between gap-3 mb-6">
            <h2 className="font-display text-xl sm:text-3xl font-extrabold text-[#102B69] dark:text-white uppercase">
              {t("home.results")} ({events.length})
            </h2>
            <button
              onClick={resetSearch}
              className="px-4 py-1.5 rounded-full bg-[#EAF1FF] dark:bg-slate-800 text-xs font-extrabold text-[#1649B8] dark:text-[#D6F45A]"
            >
              {t("common.resetFilter")}
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map((i) => <EventCardSkeleton key={i} />)}
            </div>
          ) : error ? (
            <ErrorState message={error} onRetry={loadInitial} />
          ) : events.length === 0 ? (
            <EmptyState
              title={t("common.emptyTitle")}
              description={t("common.emptyDesc")}
              action={
                <button
                  onClick={resetSearch}
                  className="px-5 py-2 rounded-full bg-[#102B69] dark:bg-[#D6F45A] text-[#D6F45A] dark:text-[#102B69] text-xs font-extrabold"
                >
                  {t("common.resetFilter")}
                </button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {events.map((ev, idx) => (
                <RevealOnScroll key={ev.id} delay={idx * 60}>
                  <EventCard event={ev} />
                </RevealOnScroll>
              ))}
            </div>
          )}
        </section>
      )}

      {!isFiltered && (
        <section className="max-w-7xl mx-auto px-3 sm:px-6 pb-16 sm:pb-20">
          <div className="flex items-center justify-between gap-3 mb-6 sm:mb-7">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <RotatingShape variant="asterisk" className="w-7 h-7 sm:w-8 sm:h-8 text-[#1649B8] dark:text-[#D6F45A] shrink-0" />
              <h2 className="font-display text-xl sm:text-3xl font-extrabold text-[#102B69] dark:text-white uppercase tracking-tight">
                {t("home.featured")}
              </h2>
            </div>
            <Link
              to="/events"
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full border-2 border-[#102B69] dark:border-[#D6F45A] text-xs font-extrabold text-[#102B69] dark:text-[#D6F45A] hover:bg-[#D6F45A] hover:text-[#102B69] shrink-0 transition"
            >
              {t("common.seeAll")} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map((i) => <EventCardSkeleton key={i} />)}
            </div>
          ) : error ? (
            <ErrorState message={error} onRetry={loadInitial} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {heroEvents.slice(0, 4).map((ev, idx) => (
                <RevealOnScroll key={ev.id} delay={idx * 70}>
                  <EventCard event={ev} />
                </RevealOnScroll>
              ))}
            </div>
          )}
        </section>
      )}

      {!isFiltered && (
        <section id="how-it-works" className="max-w-7xl mx-auto px-3 sm:px-6 pb-16 sm:pb-20">
          <RevealOnScroll>
            <div className="flex items-center justify-between mb-8 sm:mb-10">
              <h2 className="font-display text-xl sm:text-3xl font-extrabold text-[#102B69] dark:text-white uppercase tracking-tight">
                {t("home.howItWorks")}
              </h2>
              <RotatingShape variant="flower" reverse className="hidden sm:block w-10 h-10 text-[#1685F5] dark:text-[#D6F45A]" />
            </div>
          </RevealOnScroll>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
            {[
              {
                num: "01",
                title: "Discover",
                desc: t("home.step1Desc"),
                Icon: Compass,
                style: "bg-[#1649B8] text-white",
              },
              {
                num: "02",
                title: "View Details",
                desc: t("home.step2Desc"),
                Icon: BookOpen,
                style: "bg-[#102B69] text-white lg:-rotate-3 hover:rotate-0 transition-transform",
                hasLimeBackdrop: true,
              },
              {
                num: "03",
                title: "Instant Book",
                desc: t("home.step3Desc"),
                Icon: Ticket,
                style: "bg-[#1649B8] text-white",
              },
              {
                num: "04",
                title: "Get Receipt",
                desc: t("home.step4Desc"),
                Icon: QrCode,
                style: "bg-[#EAF1FF] dark:bg-[#111A2E] text-[#102B69] dark:text-white",
                hasFloatingFlower: true,
              },
            ].map((item, idx) => {
              const Icon = item.Icon;
              return (
                <RevealOnScroll key={item.num} delay={idx * 80} className="relative">
                  {item.hasLimeBackdrop && (
                    <div
                      aria-hidden="true"
                      className="hidden lg:block absolute -inset-1 rounded-[2rem] bg-[#D6F45A] rotate-3 -z-0"
                    />
                  )}
                  {item.hasFloatingFlower && (
                    <div className="absolute -top-4 -right-2 z-20 pointer-events-none">
                      <RotatingShape variant="flower" className="w-10 h-10 text-[#D6F45A]" />
                    </div>
                  )}
                  <div
                    className={`relative z-10 h-full rounded-[1.75rem] border-2 border-[#102B69] dark:border-[#D6F45A]/70 p-5 sm:p-6 flex flex-col justify-between min-h-[180px] sm:min-h-[205px] ${item.style}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </span>
                      <span className="font-display font-extrabold text-sm opacity-75">
                        {item.num}
                      </span>
                    </div>
                    <div className="mt-6">
                      <h3 className="font-display font-extrabold text-lg sm:text-xl">{item.title}</h3>
                      <p className="text-xs opacity-85 mt-1 font-medium leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </RevealOnScroll>
              );
            })}
          </div>
        </section>
      )}

      {!isFiltered && (
        <section className="max-w-7xl mx-auto px-3 sm:px-6 pb-16 sm:pb-20 space-y-14 sm:space-y-16">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <h2 className="font-display text-xl sm:text-3xl font-extrabold text-[#102B69] dark:text-white uppercase">
                {t("home.academicSection")}
              </h2>
              <div className="flex gap-2">
                <Link
                  to="/events/academic?tab=seminar-proposal"
                  className="px-3.5 py-1.5 sm:py-2 rounded-full bg-[#D6F45A] border-2 border-[#102B69] text-xs font-extrabold text-[#102B69]"
                >
                  Sempro
                </Link>
                <Link
                  to="/events/academic"
                  className="px-3.5 py-1.5 sm:py-2 rounded-full bg-white dark:bg-[#111A2E] border-2 border-[#102B69] dark:border-[#D6F45A] text-xs font-extrabold text-[#102B69] dark:text-[#D6F45A] hover:bg-[#102B69] hover:text-white transition"
                >
                  {t("common.seeAll")}
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {academicEvents.slice(0, 4).map((ev, idx) => (
                <RevealOnScroll key={ev.id} delay={idx * 60}>
                  <EventCard event={ev} />
                </RevealOnScroll>
              ))}
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <h2 className="font-display text-xl sm:text-3xl font-extrabold text-[#102B69] dark:text-white uppercase">
                {t("home.nonAcademicSection")}
              </h2>
              <Link
                to="/events/non-academic"
                className="px-4 py-1.5 sm:py-2 rounded-full bg-[#102B69] dark:bg-[#D6F45A] text-[#D6F45A] dark:text-[#102B69] text-xs font-extrabold hover:opacity-90 transition"
              >
                {t("common.seeAll")} →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {nonAcademicEvents.slice(0, 4).map((ev, idx) => (
                <RevealOnScroll key={ev.id} delay={idx * 60}>
                  <EventCard event={ev} />
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-3 sm:px-6 pb-20">
        <RevealOnScroll>
          <div className="relative rounded-[2rem] sm:rounded-[2.5rem] bg-[#D6F45A] border-2 border-[#102B69] p-6 sm:p-12 bento-shadow overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="hidden md:block absolute top-6 right-8 pointer-events-none">
              <RotatingShape variant="plus" className="w-14 h-14 text-[#1649B8]" />
            </div>
            <div className="hidden md:block absolute bottom-6 left-8 pointer-events-none">
              <RotatingShape variant="star" reverse className="w-10 h-10 text-[#102B69]/30" />
            </div>

            <div className="lg:col-span-5 flex justify-center relative z-10">
              <div className="relative">
                <div className="w-36 h-36 sm:w-48 sm:h-48 rounded-[2rem] bg-white border-2 border-[#102B69] p-2.5 shadow-[0_6px_0_0_#102B69] -rotate-3 hover:rotate-0 transition duration-300">
                  <img
                    src="/assets/ganeai-mascot.jpeg"
                    alt="Maskot GANEAI"
                    className="w-full h-full rounded-[1.4rem] object-cover"
                  />
                </div>
                <div className="absolute -bottom-3 -right-4">
                  <RotatingShape variant="asterisk" className="w-11 h-11 text-[#1649B8]" />
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-4 sm:space-y-5 relative z-10 text-center lg:text-left">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#102B69] text-[#D6F45A] text-xs font-extrabold uppercase">
                <Sparkles className="w-3.5 h-3.5" /> GANEAI Companion
              </span>

              <h2 className="font-display font-extrabold text-2xl sm:text-4xl lg:text-5xl text-[#102B69] uppercase leading-[1.06]">
                {t("home.ganeaiHeading1")}{" "}
                <span className="text-[#1649B8]">{t("home.ganeaiHeading2")}</span>
              </h2>

              <p className="text-xs sm:text-sm font-semibold text-[#102B69]/80 max-w-lg mx-auto lg:mx-0">
                {t("home.ganeaiDesc")}
              </p>

              <div className="pt-1">
                <Link
                  to="/student/ai"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#102B69] text-white font-display font-extrabold text-xs sm:text-sm hover:bg-[#1649B8] transition"
                >
                  TRY GANEAI NOW <ArrowRight className="w-4 h-4 text-[#D6F45A]" />
                </Link>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </section>
    </div>
  );
}
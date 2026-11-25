import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  DoorOpen,
  ExternalLink,
  GraduationCap,
  MapPin,
  Phone,
  ShieldAlert,
  Sparkles,
  UserCheck,
  Users,
  X,
  ZoomIn,
} from "lucide-react";
import SEO from "../../seo/SEO";
import EventCard from "../../components/events/EventCard";
import { EmptyState, ErrorState, PageLoader } from "../../components/ui/StateViews";
import { RotatingShape } from "../../components/ui/MotionPrimitives";
import { API_CONFIG } from "../../services/api/apiClient";
import { eventService } from "../../services/eventService";
import { aiService } from "../../services/aiService";
import { registrationService } from "../../services/registrationService";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage, useTranslatedText } from "../../contexts/LanguageContext";
import { formatDateWITA, formatTimeWITA } from "../../utils/dateFormatter";
import { bentoToast } from "../../utils/bentoToast";

const STATUS_DOT = {
  open: "bg-emerald-500",
  upcoming: "bg-blue-500",
  full: "bg-amber-500",
  closed: "bg-slate-400",
  cancelled: "bg-red-500",
};

export default function EventDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const { t, localizeEvent } = useLanguage();

  const [event, setEvent] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);
  const [aiError, setAiError] = useState(null);

  useEffect(() => {
    let active = true;
    const loadDetail = async () => {
      setLoading(true);
      setError(null);
      setAiSummary(null);
      setLightboxOpen(false);
      try {
        const detail = await eventService.getEventBySlug(slug);
        if (!active) return;
        setEvent(detail);
        if (detail) {
          const relRes = await eventService.getEvents({ domain: detail.domain, per_page: 5 });
          if (active) {
            setRelated(relRes.data.filter((e) => e.slug !== detail.slug).slice(0, 4));
          }
        }
      } catch (err) {
        if (active) setError(err.message || t("detail.loadError"));
      } finally {
        if (active) setLoading(false);
      }
    };
    loadDetail();
    return () => {
      active = false;
    };
  }, [slug, t]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setLightboxOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxOpen]);

  const translatedTitle = useTranslatedText(event?.title || "", {
    id: event?.translations?.id?.title,
    en: event?.translations?.en?.title,
  });
  const translatedDescription = useTranslatedText(event?.description || "", {
    id: event?.translations?.id?.description,
    en: event?.translations?.en?.description,
  });

  const isVerifiedStudent =
    role === "student" && user?.verification_status === "verified";

  const handleAcademicRegister = async () => {
    if (role === "guest") {
      bentoToast.updated(t("detail.signInReqTitle"), t("detail.signInReqDesc"));
      navigate("/login");
      return;
    }
    if (!isVerifiedStudent) {
      bentoToast.error(t("detail.nimReqTitle"), t("detail.nimReqDesc"));
      return;
    }
    setRegistering(true);
    try {
      const res = await registrationService.registerAcademicEvent(event);
      bentoToast.success(t("detail.regConfirmedTitle"), res.message);
      if (!API_CONFIG.useMockApi) {
        navigate(`/student/registrations/${res.registration_id}`);
        return;
      }
      setEvent((prev) =>
        prev ? { ...prev, active_registrations: (prev.active_registrations || 0) + 1 } : prev
      );
    } catch (err) {
      bentoToast.error(t("detail.regFailedTitle"), err.message || t("detail.regFailedDesc"));
    } finally {
      setRegistering(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!isVerifiedStudent) {
      bentoToast.error(t("detail.verifiedOnlyTitle"), t("detail.verifiedOnlyDesc"));
      return;
    }
    setAiLoading(true);
    setAiError(null);
    try {
      const summary = await aiService.generateEventSummary(event);
      setAiSummary(summary);
    } catch (err) {
      setAiError(err.message || t("detail.aiError"));
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) return <PageLoader />;
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <ErrorState message={error} />
      </div>
    );
  }
  if (!event) {
    return (
      <div className="max-w-4xl mx-auto p-10">
        <EmptyState
          title={t("detail.notFoundTitle")}
          description={t("detail.notFoundDesc")}
          action={
            <Link
              to="/events"
              className="px-5 py-2 rounded-full bg-[#102B69] text-[#D6F45A] text-xs font-extrabold"
            >
              {t("detail.backToExplore")}
            </Link>
          }
        />
      </div>
    );
  }

  const item = localizeEvent(event);
  const isSempro = item.is_sempro || item.category_slug === "seminar-proposal";

  const eventJsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: translatedTitle,
    startDate: item.start_datetime,
    endDate: item.end_datetime,
    location: { "@type": "Place", name: item.location },
    organizer: { "@type": "Organization", name: item.organizer },
    description: translatedDescription.slice(0, 160),
  };

  return (
    <div className="bg-white dark:bg-[#090F1E] bg-subtle-dots min-h-screen pb-24 transition-colors">
      <SEO
        title={`${translatedTitle} | GANESPACE`}
        description={translatedDescription.slice(0, 155)}
        canonical={`/events/${item.slug}`}
        image={item.poster_url || "/assets/logo-ganespace.png"}
        jsonLd={eventJsonLd}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10">
        <Link
          to={
            isSempro
              ? "/events/academic?tab=seminar-proposal"
              : item.domain === "academic"
                ? "/events/academic"
                : "/events/non-academic"
          }
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white dark:bg-[#111A2E] border-2 border-[#102B69] dark:border-[#D6F45A] text-xs font-extrabold text-[#102B69] dark:text-[#D6F45A] hover:bg-[#D6F45A] hover:text-[#102B69] transition mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("detail.backToEvents")}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          <div className="lg:col-span-8 space-y-8">
            {item.poster_url ? (
              <div className="rounded-[2rem] bg-[#F5F7FC] dark:bg-[#111A2E] border-2 border-[#102B69] dark:border-[#D6F45A] p-3 sm:p-5 bento-shadow">
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  className="group relative block w-full overflow-hidden rounded-[1.4rem] bg-white dark:bg-[#090F1E] cursor-zoom-in"
                >
                  <img
                    src={item.poster_url}
                    alt={translatedTitle}
                    className="w-full max-h-[680px] object-contain mx-auto"
                  />
                  <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#102B69] text-[#D6F45A] border border-[#D6F45A]/50 text-xs font-extrabold shadow-md">
                    <ZoomIn className="w-3.5 h-3.5" />
                    {t("detail.zoomPoster")}
                  </span>
                </button>
              </div>
            ) : (
              <div className="relative rounded-[2rem] bg-[#1649B8] dark:bg-[#132B66] text-white border-2 border-[#102B69] dark:border-[#D6F45A] p-7 sm:p-10 bento-shadow overflow-hidden">
                <div className="pointer-events-none absolute -right-8 -bottom-8 opacity-25">
                  <RotatingShape variant="flower" className="w-40 h-40 text-[#D6F45A]" />
                </div>
                <div className="relative z-10 flex items-center gap-3 mb-4">
                  <span className="w-11 h-11 rounded-2xl bg-[#D6F45A] text-[#102B69] border-2 border-[#102B69] flex items-center justify-center">
                    <GraduationCap className="w-6 h-6" />
                  </span>
                  <span className="px-3.5 py-1 rounded-full bg-[#102B69] text-[#D6F45A] text-xs font-extrabold uppercase tracking-wider">
                    {item.display_category}
                  </span>
                </div>
                <p className="relative z-10 font-display text-xl sm:text-2xl font-extrabold leading-snug max-w-2xl">
                  {translatedTitle}
                </p>
                {item.student_presenter && (
                  <p className="relative z-10 text-xs sm:text-sm text-[#EAF1FF]/90 mt-3 font-medium">
                    {item.student_presenter} | {item.study_program}
                  </p>
                )}
              </div>
            )}

            <div className="rounded-[2rem] bg-white dark:bg-[#111A2E] border-2 border-[#102B69] dark:border-[#D6F45A]/75 p-6 sm:p-9 space-y-6 bento-shadow">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2.5 text-xs font-extrabold">
                  <span className="px-3.5 py-1 rounded-full bg-[#D6F45A] text-[#102B69] border border-[#102B69]">
                    {item.display_category}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5F7FC] dark:bg-[#090F1E] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200">
                    <span className={`w-2 h-2 rounded-full ${STATUS_DOT[item.status] || "bg-slate-400"}`} />
                    {item.display_status}
                  </span>
                </div>

                <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#102B69] dark:text-white leading-snug">
                  {translatedTitle}
                </h1>

                <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#1649B8] dark:text-[#D6F45A] shrink-0" />
                  <span>
                    {t("detail.organizedBy")}{" "}
                    <strong className="text-[#102B69] dark:text-white">{item.organizer}</strong>
                  </span>
                </p>
              </div>

              <div className="h-px bg-slate-200/80 dark:bg-slate-800" />

              <div className="space-y-3">
                <h2 className="font-display font-extrabold text-base uppercase tracking-wide text-[#102B69] dark:text-[#D6F45A]">
                  {t("detail.fullDescription")}
                </h2>
                <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-loose whitespace-pre-line">
                  {translatedDescription}
                </p>
              </div>

              {(item.student_presenter || item.room) && (
                <div className="rounded-2xl bg-[#EAF1FF]/70 dark:bg-[#0B1222] border-2 border-[#102B69]/15 dark:border-slate-700 p-5 space-y-3">
                  <h3 className="font-display font-bold text-sm text-[#102B69] dark:text-[#D6F45A] flex items-center gap-2">
                    <UserCheck className="w-4 h-4" />
                    {t("detail.presenterInfo")}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-700 dark:text-slate-300">
                    {item.student_presenter && (
                      <p>
                        <span className="text-xs text-slate-500 block">{t("detail.presenter")}</span>
                        <strong className="text-[#102B69] dark:text-white">
                          {item.student_presenter}
                        </strong>
                      </p>
                    )}
                    {item.study_program && (
                      <p>
                        <span className="text-xs text-slate-500 block">{t("detail.studyProgram")}</span>
                        <strong>{item.study_program}</strong>
                      </p>
                    )}
                    {item.room && (
                      <p className="flex items-center gap-1.5 sm:col-span-2">
                        <DoorOpen className="w-4 h-4 text-[#1649B8] dark:text-[#D6F45A]" />
                        <strong>{item.room}</strong>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {item.gallery?.length > 0 && <section aria-label="Galeri acara" className="grid grid-cols-2 gap-3">{item.gallery.map((media) =>
                <img key={media.id} loading="lazy" src={media.url} alt={media.alt_text || "Foto acara"} className="rounded-xl" />)}</section>}
              {item.requirements?.length > 0 && (
                <div className="pt-2 space-y-2.5">
                  <h3 className="font-display font-extrabold text-sm uppercase tracking-wide text-[#102B69] dark:text-[#D6F45A]">
                    {t("detail.reqBenefits")}
                  </h3>
                  <ul className="space-y-2">
                    {item.requirements.map((req) => (
                      <li
                        key={req}
                        className="text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2.5"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#1649B8] dark:text-[#D6F45A] shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {item.domain === "academic" && (
              <div className="rounded-[2rem] bg-[#EAF1FF] dark:bg-[#111A2E] border-2 border-[#102B69] dark:border-[#D6F45A]/75 p-6 sm:p-7 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src="/assets/ganeai-mascot.jpeg"
                      alt="GANEAI"
                      className="w-11 h-11 rounded-2xl object-cover border-2 border-[#102B69]"
                    />
                    <div>
                      <h3 className="font-display font-extrabold text-base text-[#102B69] dark:text-white">
                        GANEAI Event Summary
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {t("detail.aiSummaryDesc")}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleGenerateSummary}
                    disabled={!API_CONFIG.useMockApi || aiLoading}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#102B69] dark:bg-[#D6F45A] text-[#D6F45A] dark:text-[#102B69] text-xs font-extrabold hover:opacity-90 disabled:opacity-50 transition"
                  >
                    <Sparkles className="w-4 h-4" />
                    {!API_CONFIG.useMockApi ? "GaneAI belum tersedia" : aiLoading ? t("detail.generating") : "Generate AI Summary"}
                  </button>
                </div>

                {aiError && <ErrorState message={aiError} onRetry={handleGenerateSummary} />}

                {aiSummary && (
                  <div className="rounded-2xl bg-white dark:bg-[#090F1E] p-5 border-2 border-[#102B69]/15 dark:border-slate-700 space-y-3 text-sm text-slate-700 dark:text-slate-300">
                    <p><strong>{t("detail.objective")}</strong> {aiSummary.tujuan}</p>
                    <p><strong>{t("detail.topics")}</strong> {aiSummary.topik}</p>
                    <p><strong>{t("detail.schedulePlace")}</strong> {aiSummary.jadwal_lokasi}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <aside className="lg:col-span-4">
            <div className="rounded-[2rem] bg-white dark:bg-[#111A2E] border-2 border-[#102B69] dark:border-[#D6F45A] p-6 sm:p-7 bento-shadow space-y-5 sticky top-24">
              <h2 className="font-display font-extrabold text-lg text-[#102B69] dark:text-white">
                {t("detail.scheduleAccess")}
              </h2>

              <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-[#1649B8] dark:text-[#D6F45A] mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold text-[#102B69] dark:text-white">
                      {formatDateWITA(item.start_datetime)}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatTimeWITA(item.start_datetime)} - {formatTimeWITA(item.end_datetime)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#1649B8] dark:text-[#D6F45A] mt-0.5 shrink-0" />
                  <p>
                    {item.location}
                    {item.room ? ` (${item.room})` : ""}
                  </p>
                </div>

                {item.capacity && (
                  <div className="flex items-start gap-3">
                    <Users className="w-4 h-4 text-[#1649B8] dark:text-[#D6F45A] mt-0.5 shrink-0" />
                    <p>
                      {t("detail.quota")}{" "}
                      <strong className="text-[#102B69] dark:text-white">
                        {item.active_registrations ?? 0}
                      </strong>{" "}
                      / {item.capacity}
                    </p>
                  </div>
                )}

                {user && !API_CONFIG.useMockApi && item.domain === "academic" && ["online", "hybrid"].includes(item.location_mode) && (
                  <button type="button" className="font-bold underline" onClick={async () => {
                    try { window.location.assign(await eventService.getMeetingLink(item.id)); }
                    catch (err) { bentoToast.error("Tautan rapat belum dapat dibuka", err.message); }
                  }}>Buka tautan rapat</button>
                )}
                {item.registration_period && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-[#1649B8] dark:text-[#D6F45A] mt-0.5 shrink-0" />
                    <p>{item.registration_period}</p>
                  </div>
                )}

                {item.contact_person && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-[#1649B8] dark:text-[#D6F45A] mt-0.5 shrink-0" />
                    <p className="text-xs leading-relaxed">{item.contact_person}</p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                {item.domain === "non_academic" ? (
                  item.external_registration_url && item.external_registration_url !== "#detail-acara" ? (
                    <a
                      href={item.external_registration_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-full bg-[#D6F45A] text-[#102B69] border-2 border-[#102B69] font-display font-extrabold text-sm hover:brightness-95 transition"
                    >
                      {t("detail.registerExternal")}
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : (
                    <p className="text-xs text-center text-slate-600 dark:text-slate-400 bg-[#F5F7FC] dark:bg-[#090F1E] p-3.5 rounded-2xl">
                      {t("detail.openEntryHint")}
                    </p>
                  )
                ) : item.status === "open" ? (
                  <>
                    {role === "student" && !isVerifiedStudent && (
                      <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{t("detail.nimVerifyWarning")}</span>
                      </div>
                    )}
                    <button
                      onClick={handleAcademicRegister}
                      disabled={registering || (role === "student" && !isVerifiedStudent)}
                      className="w-full py-3.5 px-5 rounded-full bg-[#102B69] dark:bg-[#D6F45A] text-[#D6F45A] dark:text-[#102B69] border-2 border-[#102B69] font-display font-extrabold text-sm hover:opacity-95 disabled:opacity-50 transition"
                    >
                      {registering
                        ? t("detail.processing")
                        : role === "guest"
                          ? t("detail.signInToRegister")
                          : t("detail.registerNow")}
                    </button>
                  </>
                ) : (
                  <button
                    disabled
                    className="w-full py-3.5 px-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 font-display font-bold text-sm cursor-not-allowed capitalize"
                  >
                    {item.display_status}
                  </button>
                )}
              </div>
            </div>
          </aside>
        </div>

        {related.length > 0 && (
          <section className="mt-20 pt-10 border-t-2 border-[#102B69]/10 dark:border-slate-800">
            <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#102B69] dark:text-white uppercase mb-6">
              {t("detail.relatedEvents")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map((rel) => (
                <EventCard key={rel.id} event={rel} />
              ))}
            </div>
          </section>
        )}
      </div>

      {lightboxOpen && item.poster_url && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-[70] bg-black/85 backdrop-blur-xs p-4 sm:p-8 flex items-center justify-center cursor-zoom-out"
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            aria-label={t("common.close")}
            className="fixed top-4 right-4 p-2.5 rounded-full bg-white/15 text-white hover:bg-white/30 transition"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={item.poster_url}
            alt={translatedTitle}
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl cursor-default"
          />
        </div>
      )}
    </div>
  );
}
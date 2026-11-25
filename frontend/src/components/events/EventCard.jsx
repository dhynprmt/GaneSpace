import { Link } from "react-router-dom";
import { ArrowUpRight, Calendar, DoorOpen, GraduationCap, MapPin, User } from "lucide-react";
import { formatDateWITA } from "../../utils/dateFormatter";
import { useLanguage, useTranslatedText } from "../../contexts/LanguageContext";
import { RotatingShape } from "../ui/MotionPrimitives";

const STATUS_DOT = {
  open: "bg-emerald-500",
  upcoming: "bg-blue-500",
  full: "bg-amber-500",
  closed: "bg-slate-400",
  cancelled: "bg-red-500",
  external: "bg-violet-500",
};

export default function EventCard({ event }) {
  const { t, localizeEvent } = useLanguage();
  const item = localizeEvent(event);
  const translatedTitle = useTranslatedText(event.title, {
    id: event.translations?.id?.title,
    en: event.translations?.en?.title,
  });

  return (
    <article className="group rounded-[1.75rem] bg-white dark:bg-[#111A2E] border-2 border-[#102B69] dark:border-[#D6F45A]/75 overflow-hidden flex flex-col justify-between bento-shadow-hover">
      {/* Area Poster Utuh (4:5) atau Kartu Grafis Bento untuk Sempro / Tanpa Poster */}
      <Link
        to={`/events/${item.slug}`}
        className="block w-full aspect-[4/5] bg-[#F5F7FC] dark:bg-[#0B1222] border-b-2 border-[#102B69]/15 dark:border-slate-800 overflow-hidden"
      >
        {item.poster_url ? (
          <img
            src={item.poster_url}
            alt={translatedTitle}
            loading="lazy"
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="relative w-full h-full p-6 flex flex-col justify-between bg-[#1649B8] dark:bg-[#132B66] text-white overflow-hidden">
            {/* Elemen Geometris Halus agar Tidak Kosong namun Tetap Lega */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "radial-gradient(rgba(255,255,255,0.45) 1.2px, transparent 1.2px)",
                backgroundSize: "20px 20px",
              }}
            />
            <div className="pointer-events-none absolute -right-7 -top-7 opacity-25">
              <RotatingShape variant="flower" className="w-32 h-32 text-[#D6F45A]" />
            </div>
            <div className="pointer-events-none absolute -left-5 bottom-14 opacity-20">
              <RotatingShape variant="asterisk" reverse className="w-20 h-20 text-white" />
            </div>

            {/* Atas: Ikon & Label Prodi */}
            <div className="relative z-10 flex items-center justify-between gap-2">
              <span className="w-11 h-11 rounded-2xl bg-[#D6F45A] text-[#102B69] border-2 border-[#102B69] flex items-center justify-center shadow-[0_3px_0_0_#102B69]">
                <GraduationCap className="w-5 h-5" />
              </span>
              <span className="px-3 py-1 rounded-full bg-[#102B69]/80 border border-white/20 text-[10px] font-extrabold uppercase tracking-wider text-[#D6F45A]">
                {item.display_category}
              </span>
            </div>

            {/* Tengah: Judul Utama dalam Ruang Lega */}
            <div className="relative z-10 my-auto py-4 space-y-2">
              <p className="font-display font-extrabold text-xl leading-snug line-clamp-3">
                {translatedTitle}
              </p>
              <p className="text-xs font-semibold text-[#EAF1FF]/85">
                {item.study_program || item.organizer}
              </p>
            </div>

            {/* Bawah: Kartu Mini Info Penyaji & Ruang */}
            <div className="relative z-10 rounded-2xl bg-[#102B69]/75 border border-white/15 p-3 space-y-1.5 text-[11px] text-[#EAF1FF]">
              {item.student_presenter && (
                <p className="flex items-center gap-1.5 font-semibold truncate">
                  <User className="w-3.5 h-3.5 text-[#D6F45A] shrink-0" />
                  <span className="truncate">{item.student_presenter}</span>
                </p>
              )}
              <p className="flex items-center gap-1.5 font-medium truncate">
                <DoorOpen className="w-3.5 h-3.5 text-[#D6F45A] shrink-0" />
                <span className="truncate">{item.room || item.location}</span>
              </p>
            </div>
          </div>
        )}
      </Link>

      {/* Isi Ringkas di Bawah Poster (Anti Penuh Teks) */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3.5">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 text-[11px] font-bold">
            <span className="text-[#1649B8] dark:text-[#D6F45A] truncate">
              {item.display_category}
            </span>
            <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300 shrink-0">
              <span className={`w-2 h-2 rounded-full ${STATUS_DOT[item.status] || "bg-slate-400"}`} />
              {item.display_status}
            </span>
          </div>

          <Link to={`/events/${item.slug}`} className="block">
            <h3 className="font-display font-extrabold text-[15px] sm:text-base text-[#102B69] dark:text-white leading-snug line-clamp-2 group-hover:text-[#1649B8] dark:group-hover:text-[#D6F45A] transition">
              {translatedTitle}
            </h3>
          </Link>

          <div className="space-y-1 text-xs font-medium text-slate-600 dark:text-slate-400">
            <p className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 shrink-0 text-[#1649B8] dark:text-[#D6F45A]" />
              <span>{formatDateWITA(item.start_datetime)}</span>
            </p>
            <p className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-[#1649B8] dark:text-[#D6F45A]" />
              <span className="truncate">{item.location}</span>
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 truncate">
            {item.organizer}
          </span>
          <Link
            to={`/events/${item.slug}`}
            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-[#102B69] dark:bg-[#D6F45A] text-[#D6F45A] dark:text-[#102B69] text-xs font-extrabold hover:bg-[#1649B8] hover:text-white shrink-0 transition"
          >
            {t("view_details")} <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
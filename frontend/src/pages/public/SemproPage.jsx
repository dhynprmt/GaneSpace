import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Calendar,
  MapPin,
  DoorOpen,
  UserCheck,
  GraduationCap,
  Award,
  ArrowUpRight,
} from "lucide-react";
import { useRemoteList } from "../../hooks/useRemoteList";
import SEO from "../../seo/SEO";
import StatusBadge from "../../components/ui/StatusBadge";
import { EmptyState, ErrorState, EventCardSkeleton } from "../../components/ui/StateViews";
import { eventService } from "../../services/eventService";
import { useAuth } from "../../contexts/AuthContext";
import { formatDateWITA, formatTimeWITA } from "../../utils/dateFormatter";

export default function SemproPage() {
  const { user, role } = useAuth();

  const [search, setSearch] = useState("");
  const [studyProgram, setStudyProgram] = useState("all");
  const [faculty, setFaculty] = useState("all");
  const [date, setDate] = useState("");

  const [query, setQuery] = useState("");
  const loadRows = useCallback(async () => {
    const response = await eventService.getEvents({ semproOnly: true, search: query, date, sort: "soonest", per_page: 20 });
    return response.data.filter((row) => (studyProgram === "all" || row.study_program === studyProgram)
      && (faculty === "all" || row.faculty === faculty));
  }, [query, date, studyProgram, faculty]);
  const { items: sempros, error, loading, refresh } = useRemoteList(loadRows);

  const attended = user?.seminar_attendance_count;
  const target = user?.seminar_attendance_target || 10;
  const hasBackendAttendance = role === "student" && typeof attended === "number";
  const progressPct = hasBackendAttendance ? Math.min(100, Math.round((attended / target) * 100)) : 0;

  return (
    <div className="bg-[#FFFFFF] pb-20">
      <SEO
        title="Seminar Proposal (Sempro) | GANESPACE"
        description="Temukan jadwal Seminar Proposal terbuka di Universitas Pendidikan Ganesha lengkap dengan nama mahasiswa, judul penelitian, dan ruang seminar."
        canonical="/events/sempro"
      />

      <section className="bg-[#102B69] text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D6F45A] text-[#102B69] text-xs font-extrabold mb-3">
              <GraduationCap className="w-4 h-4" /> Jadwal Sempro Terbuka
            </span>
            <h1 className="font-display text-3xl md:text-5xl font-extrabold">
              Seminar Proposal (Sempro)
            </h1>
            <p className="text-sm md:text-base text-[#EAF1FF]/80 mt-2">
              Temukan jadwal Seminar Proposal lintas program studi secara terpusat untuk
              mempermudah pemenuhan kewajiban kehadiran minimal 10 kali menonton seminar.
            </p>
          </div>

          {/* Kartu Progress Kehadiran 10 Seminar (Hanya tampil berdasarkan data backend) */}
          <div className="lg:col-span-5 rounded-3xl bg-white/10 border border-white/15 p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D6F45A] flex items-center gap-1.5">
                <Award className="w-4 h-4" /> Progress Kehadiran Seminar
              </span>
              {hasBackendAttendance && (
                <span className="font-display font-extrabold text-sm">
                  {attended} / {target} Seminar
                </span>
              )}
            </div>

            {hasBackendAttendance ? (
              <>
                <div className="w-full h-3 rounded-full bg-white/15 overflow-hidden my-3">
                  <div
                    className="h-full rounded-full bg-[#D6F45A] transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <p className="text-xs text-[#EAF1FF]/80">
                  Anda telah memenuhi <strong>{progressPct}%</strong> dari target {target} kehadiran
                  seminar. Data resmi divalidasi oleh server akademik backend.
                </p>
              </>
            ) : (
              <p className="text-xs text-[#EAF1FF]/80 leading-relaxed mt-2">
                Login dengan akun <strong>Mahasiswa terverifikasi NIM</strong> untuk memantau
                progress kehadiran seminar Anda dari server akademik.
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {/* Search & Filter Sempro */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (query === search.trim()) refresh();
            else setQuery(search.trim());
          }}
          className="rounded-3xl bg-[#F5F7FC] border border-[#1649B8]/15 p-5 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 mb-10"
        >
          <div className="lg:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama mahasiswa atau judul penelitian..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1649B8]"
            />
          </div>

          <select
            value={faculty}
            onChange={(e) => setFaculty(e.target.value)}
            className="lg:col-span-3 px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-sm"
          >
            <option value="all">Semua Fakultas</option>
            <option value="Fakultas Teknik dan Kejuruan">Fakultas Teknik dan Kejuruan</option>
            <option value="FMIPA">FMIPA</option>
          </select>

          <select
            value={studyProgram}
            onChange={(e) => setStudyProgram(e.target.value)}
            className="lg:col-span-2 px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-sm"
          >
            <option value="all">Semua Prodi</option>
            <option value="Ilmu Komputer">Ilmu Komputer</option>
            <option value="Sistem Informasi">Sistem Informasi</option>
          </select>

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="lg:col-span-2 px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-sm"
          />

          <button
            type="submit"
            className="lg:col-span-1 py-2.5 px-4 rounded-xl bg-[#1649B8] text-white font-display font-bold text-sm hover:bg-[#102B69]"
          >
            Cari
          </button>
        </form>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((n) => <EventCardSkeleton key={n} />)}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={refresh} />
        ) : sempros.length === 0 ? (
          <EmptyState
            title="Belum ada jadwal Sempro yang cocok"
            description="Coba ubah filter program studi, fakultas, atau tanggal seminar."
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sempros.map((item) => (
              <article
                key={item.id}
                className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="px-3 py-1 rounded-full bg-[#EAF1FF] text-[#1649B8] text-xs font-bold">
                      {item.study_program || item.organizer}
                    </span>
                    <StatusBadge status={item.status} />
                  </div>

                  <h2 className="font-display font-bold text-xl text-[#102B69] leading-snug">
                    {item.title}
                  </h2>

                  <div className="rounded-2xl bg-[#F5F7FC] p-4 space-y-2 text-xs text-slate-700">
                    <p className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-[#1649B8]" />
                      <span>
                        <strong>Penyaji:</strong> {item.student_presenter || "Mahasiswa"} ({item.faculty})
                      </span>
                    </p>
                    {item.supervisors?.length > 0 && (
                      <p className="pl-6 text-slate-500">
                        <strong>Pembimbing:</strong> {item.supervisors.join(" • ")}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-[#1649B8]" />
                      {formatDateWITA(item.start_datetime)} • {formatTimeWITA(item.start_datetime)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <DoorOpen className="w-4 h-4 text-[#1649B8]" />
                      {item.room || "Ruang Seminar"}
                    </span>
                    <span className="flex items-center gap-1.5 sm:col-span-2">
                      <MapPin className="w-4 h-4 text-[#1649B8]" />
                      {item.location}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">
                    Audiens terdaftar: {item.active_registrations ?? 0}/{item.capacity ?? "-"}
                  </span>
                  <Link
                    to={`/events/${item.slug}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#102B69] text-white text-xs font-bold hover:bg-[#1649B8] transition"
                  >
                    Detail & Daftar <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
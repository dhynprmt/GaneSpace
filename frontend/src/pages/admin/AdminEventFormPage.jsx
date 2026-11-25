import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Upload, X } from "lucide-react";
import SEO from "../../seo/SEO";
import { useLanguage } from "../../contexts/LanguageContext";
import { adminService } from "../../services/adminService";
import { eventService } from "../../services/eventService";
import { bentoToast } from "../../utils/bentoToast";

const emptyForm = () => ({
  organization_id: "",
  event_type_id: "",
  title: "",
  description: "",
  objectives: "",
  topics: "",
  participant_requirements: "",
  start_at: "",
  end_at: "",
  location_mode: "onsite",
  venue_name: "",
  venue_address: "",
  meeting_url: "",
  capacity: "100",
  registration_opens_at: "",
  registration_closes_at: "",
  external_registration_url: "",
  contact_name: "",
  contact_email: "",
  contact_phone: "",
  poster_file: null,
  poster_url: "",
  poster_id: null,
  poster_alt_text: "",
  remove_poster: false,
});

const toDateTimeLocal = (value) => value ? String(value).slice(0, 16) : "";
const toWitaDateTime = (value) => value ? `${value}:00+08:00` : null;

export default function AdminEventFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [form, setForm] = useState(emptyForm);
  const [gallery, setGallery] = useState([]);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState("");

  const selectedType = useMemo(
    () => eventTypes.find((item) => String(item.id) === String(form.event_type_id)),
    [eventTypes, form.event_type_id]
  );
  const isAcademic = selectedType?.category?.slug === "academic";
  const needsMeetingUrl = isAcademic && ["online", "hybrid"].includes(form.location_mode);
  const needsVenue = ["onsite", "hybrid"].includes(form.location_mode);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setLoadError("");
      try {
        const [organizationRows, typeRows, event] = await Promise.all([
          adminService.getAdminOrganizations(),
          eventService.getEventTypes(),
          isEdit ? adminService.getAdminEventById(id) : Promise.resolve(null),
        ]);
        if (!active) return;
        setOrganizations(organizationRows);
        setEventTypes(typeRows);

        if (event) {
          setGallery(event.gallery || []);
          setForm((previous) => ({
            ...previous,
            organization_id: String(event.organization_id || event.organization?.id || ""),
            event_type_id: String(event.event_type_id || event.event_type?.id || ""),
            title: event.title || "",
            description: event.description || "",
            objectives: event.objectives || "",
            topics: event.topics || "",
            participant_requirements: event.participant_requirements || "",
            start_at: toDateTimeLocal(event.start_datetime),
            end_at: toDateTimeLocal(event.end_datetime),
            location_mode: event.location_mode || "onsite",
            venue_name: event.venue_name || event.room || "",
            venue_address: event.venue_address || event.location || "",
            // The API deliberately never returns the private meeting URL. Re-enter it when editing online/hybrid events.
            meeting_url: "",
            capacity: event.capacity ?? "",
            registration_opens_at: toDateTimeLocal(event.registration_opens_at),
            registration_closes_at: toDateTimeLocal(event.registration_closes_at),
            external_registration_url: event.external_registration_url || "",
            contact_name: event.contact_name || "",
            contact_email: event.contact_email || "",
            contact_phone: event.contact_phone || "",
            poster_url: event.poster_url || "",
            poster_id: event.poster_id || null,
            poster_alt_text: event.poster_alt_text || "",
          }));
        } else {
          setForm((previous) => ({
            ...previous,
            organization_id: organizationRows.length === 1 ? String(organizationRows[0].id) : "",
            event_type_id: typeRows[0] ? String(typeRows[0].id) : "",
          }));
        }
      } catch (error) {
        if (active) setLoadError(error.message || "Gagal memuat data formulir event.");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [id, isEdit]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handlePosterUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const accepted = ["image/jpeg", "image/png", "image/webp"];
    if (!accepted.includes(file.type)) {
      bentoToast.error("Format poster tidak didukung", "Gunakan JPG, PNG, atau WEBP.");
      event.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      bentoToast.error(t("admin.fileTooLargeTitle"), "Ukuran poster maksimal 5 MB.");
      event.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setForm((previous) => ({
      ...previous,
      poster_file: file,
      poster_url: String(reader.result || ""),
      remove_poster: false,
    }));
    reader.readAsDataURL(file);
  };

  const removePoster = () => {
    setForm((previous) => ({ ...previous, poster_file: null, poster_url: "", remove_poster: Boolean(previous.poster_id) }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.organization_id || !form.event_type_id) {
      bentoToast.error("Data organisasi belum lengkap", "Pilih organisasi dan tipe event terlebih dahulu.");
      return;
    }
    if (needsVenue && !form.venue_name.trim() && !form.venue_address.trim()) {
      bentoToast.error("Lokasi belum lengkap", "Isi nama tempat atau alamat untuk event onsite/hybrid.");
      return;
    }
    if (isAcademic) {
      if (!form.capacity || !form.registration_opens_at || !form.registration_closes_at) {
        bentoToast.error("Data registrasi akademik belum lengkap", "Kapasitas, waktu buka, dan waktu tutup registrasi wajib diisi.");
        return;
      }
      if (needsMeetingUrl && !form.meeting_url.trim()) {
        bentoToast.error("Meeting URL diperlukan", "Event akademik online/hybrid wajib memiliki URL meeting. Untuk edit, masukkan ulang URL karena API tidak pernah mengembalikannya.");
        return;
      }
    } else if (!form.external_registration_url.trim() && !form.contact_email.trim() && !form.contact_phone.trim()) {
      bentoToast.error("Informasi pendaftaran belum lengkap", "Isi URL pendaftaran eksternal atau email/telepon kontak.");
      return;
    }
    if (new Date(form.end_at) <= new Date(form.start_at)) {
      bentoToast.error("Jadwal tidak valid", "Waktu selesai harus setelah waktu mulai.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        organization_id: Number(form.organization_id),
        event_type_id: Number(form.event_type_id),
        title: form.title.trim(),
        description: form.description.trim(),
        objectives: form.objectives.trim() || null,
        topics: form.topics.trim() || null,
        participant_requirements: form.participant_requirements.trim() || null,
        start_at: toWitaDateTime(form.start_at),
        end_at: toWitaDateTime(form.end_at),
        location_mode: form.location_mode,
        venue_name: form.venue_name.trim() || null,
        venue_address: form.venue_address.trim() || null,
        meeting_url: needsMeetingUrl ? form.meeting_url.trim() : null,
        capacity: isAcademic ? Number(form.capacity) : null,
        registration_opens_at: isAcademic ? toWitaDateTime(form.registration_opens_at) : null,
        registration_closes_at: isAcademic ? toWitaDateTime(form.registration_closes_at) : null,
        external_registration_url: isAcademic ? null : (form.external_registration_url.trim() || null),
        contact_name: form.contact_name.trim() || null,
        contact_email: form.contact_email.trim() || null,
        contact_phone: form.contact_phone.trim() || null,
      };

      const savedEvent = isEdit
        ? await adminService.updateEvent(id, payload)
        : await adminService.createEvent(payload);

      if (form.remove_poster && form.poster_id) {
        await adminService.deleteEventMedia(savedEvent.id, form.poster_id);
      }
      if (form.poster_file) {
        try {
          await adminService.uploadEventMedia(savedEvent.id, form.poster_file, "poster", form.poster_alt_text);
        } catch (err) {
          bentoToast.error("Event tersimpan, poster gagal diunggah", err.message);
          if (!isEdit) navigate(`/admin/events/${savedEvent.id}/edit`, { replace: true });
          return;
        }
      }

      bentoToast.success(
        isEdit ? t("admin.changesSavedTitle") : t("admin.eventCreatedTitle"),
        form.title
      );
      navigate("/admin/events");
    } catch (error) {
      const validationMessages = error.errors
        ? Object.entries(error.errors).map(([field, messages]) => `${field}: ${messages.join(", ")}`).join("\n")
        : "";
      bentoToast.error(t("admin.saveFailedTitle"), [error.message, validationMessages].filter(Boolean).join("\n") || t("common.tryAgain"));
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl bg-[#F5F7FC] dark:bg-[#090F1E] border-2 border-[#102B69]/25 dark:border-slate-700 text-sm focus:border-[#102B69] dark:focus:border-[#D6F45A] focus:outline-none";
  const labelClass = "block text-xs font-extrabold text-[#102B69] dark:text-slate-200 mb-1";

  if (loading) return <div className="p-8 text-sm text-slate-500">Memuat formulir event...</div>;
  if (loadError) return <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-5 text-sm text-red-700">{loadError}</div>;

  return (
    <div className="max-w-5xl space-y-6">
      <SEO title={`${isEdit ? t("admin.editEvent") : t("admin.createEventFull")} | GANESPACE`} noIndex />
      <Link to="/admin/events" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white dark:bg-[#111A2E] border-2 border-[#102B69] dark:border-[#D6F45A] text-xs font-extrabold text-[#102B69] dark:text-[#D6F45A] hover:bg-[#D6F45A] hover:text-[#102B69] transition">
        <ArrowLeft className="w-4 h-4" /> {t("admin.backToManage")}
      </Link>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <aside className="lg:col-span-4 rounded-[2rem] bg-white dark:bg-[#111A2E] border-2 border-[#102B69] dark:border-[#D6F45A] p-5 bento-shadow space-y-4">
          <div className="flex items-center justify-between gap-2"><h2 className="font-display font-extrabold text-base text-[#102B69] dark:text-white">Poster event</h2><span className="px-3 py-0.5 rounded-full bg-[#D6F45A] border border-[#102B69] text-[#102B69] text-[11px] font-extrabold">Opsional</span></div>
          <p className="text-xs text-slate-500 dark:text-slate-400">JPG, PNG, WEBP maksimal 5 MB. Poster dikirim ke endpoint media setelah event tersimpan.</p>
          <div className="relative aspect-[4/5] w-full rounded-2xl bg-[#F5F7FC] dark:bg-[#090F1E] border-2 border-dashed border-[#102B69]/40 dark:border-[#D6F45A]/50 overflow-hidden flex items-center justify-center">
            {form.poster_url ? <><img src={form.poster_url} alt={form.poster_alt_text || "Preview poster"} className="w-full h-full object-contain" /><button type="button" onClick={removePoster} className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-[#102B69] text-white hover:bg-[#FF5A5F] transition" aria-label="Hapus poster"><X className="w-4 h-4" /></button></> : <label className="cursor-pointer text-center p-6 space-y-2"><Upload className="w-8 h-8 text-[#1649B8] dark:text-[#D6F45A] mx-auto" /><p className="text-xs font-extrabold text-[#102B69] dark:text-white">Pilih poster</p><input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePosterUpload} className="hidden" /></label>}
          </div>
          {form.poster_url && <label className="block w-full text-center py-2.5 rounded-full bg-[#EAF1FF] dark:bg-[#090F1E] border-2 border-[#102B69] dark:border-[#D6F45A] text-[#102B69] dark:text-[#D6F45A] text-xs font-extrabold cursor-pointer">Ganti poster<input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePosterUpload} className="hidden" /></label>}
          {isEdit && <section className="space-y-2">
            <label>Galeri acara <input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploadingGallery || gallery.length >= 12}
              onChange={async (e) => {
                const file = e.target.files[0]; e.target.value = "";
                if (!file) return;
                setUploadingGallery(true);
                try { const item = await adminService.uploadEventMedia(id, file, "gallery"); setGallery((rows) => [...rows, item]); }
                catch (err) { bentoToast.error("Unggah galeri gagal", err.message); }
                finally { setUploadingGallery(false); }
              }} /></label>
            {gallery.map((item) => <div key={item.id} className="flex gap-3 items-center">
              <img src={item.url} alt={item.alt_text || "Foto acara"} className="w-16 rounded" />
              <button type="button" className="underline" onClick={async () => {
                try { await adminService.deleteEventMedia(id, item.id); setGallery((rows) => rows.filter((row) => row.id !== item.id)); }
                catch (err) { bentoToast.error("Foto gagal dihapus", err.message); }
              }}>Hapus foto</button>
            </div>)}
          </section>}
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">Teks alternatif poster<input maxLength={220} value={form.poster_alt_text} onChange={(event) => setForm({ ...form, poster_alt_text: event.target.value })} className={`${inputClass} mt-1`} /></label>
        </aside>

        <section className="lg:col-span-8 rounded-[2rem] bg-white dark:bg-[#111A2E] border-2 border-[#102B69] dark:border-[#D6F45A] p-6 bento-shadow space-y-4">
          <div><h1 className="font-display text-xl font-extrabold text-[#102B69] dark:text-white">{isEdit ? t("admin.editEvent") : t("admin.createEventFull")}</h1><p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Event baru akan dibuat sebagai draft. Publikasikan setelah data dan poster siap.</p></div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block"><span className={labelClass}>Organisasi penyelenggara</span><select required name="organization_id" value={form.organization_id} onChange={handleChange} className={inputClass}><option value="">Pilih organisasi</option>{organizations.map((organization) => <option key={organization.id} value={organization.id}>{organization.name}</option>)}</select></label>
            <label className="block"><span className={labelClass}>Tipe event</span><select required name="event_type_id" value={form.event_type_id} onChange={handleChange} className={inputClass}><option value="">Pilih tipe event</option>{eventTypes.map((type) => <option key={type.id} value={type.id}>{type.name} ({type.category?.name || type.category?.slug || "Kategori"})</option>)}</select></label>
          </div>
          {selectedType && <p className="text-xs rounded-xl bg-[#EAF1FF] dark:bg-[#090F1E] px-3 py-2 text-[#102B69] dark:text-slate-300">Kategori: <strong>{selectedType.category?.name || selectedType.category?.slug}</strong>. Jenis pendaftaran dan persyaratan event ditentukan oleh kategori ini.</p>}

          <label className="block"><span className={labelClass}>Judul event</span><input required maxLength={220} name="title" value={form.title} onChange={handleChange} className={inputClass} /></label>
          <label className="block"><span className={labelClass}>Deskripsi</span><textarea required rows={4} name="description" value={form.description} onChange={handleChange} className={inputClass} /></label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block"><span className={labelClass}>Tujuan</span><textarea rows={3} name="objectives" value={form.objectives} onChange={handleChange} className={inputClass} /></label>
            <label className="block"><span className={labelClass}>Topik</span><textarea rows={3} name="topics" value={form.topics} onChange={handleChange} className={inputClass} /></label>
          </div>
          <label className="block"><span className={labelClass}>Persyaratan peserta</span><textarea rows={2} name="participant_requirements" value={form.participant_requirements} onChange={handleChange} className={inputClass} /></label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block"><span className={labelClass}>Waktu mulai (WITA)</span><input required type="datetime-local" name="start_at" value={form.start_at} onChange={handleChange} className={inputClass} /></label>
            <label className="block"><span className={labelClass}>Waktu selesai (WITA)</span><input required type="datetime-local" name="end_at" value={form.end_at} onChange={handleChange} className={inputClass} /></label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block"><span className={labelClass}>Mode lokasi</span><select name="location_mode" value={form.location_mode} onChange={handleChange} className={inputClass}><option value="onsite">Onsite</option><option value="online">Online</option><option value="hybrid">Hybrid</option></select></label>
            <label className="block"><span className={labelClass}>Nama tempat / ruangan {needsVenue ? "*" : "(opsional)"}</span><input name="venue_name" value={form.venue_name} onChange={handleChange} className={inputClass} /></label>
          </div>
          <label className="block"><span className={labelClass}>Alamat tempat</span><textarea rows={2} name="venue_address" value={form.venue_address} onChange={handleChange} className={inputClass} /></label>

          {needsMeetingUrl && <label className="block"><span className={labelClass}>Private meeting URL *</span><input required type="url" name="meeting_url" value={form.meeting_url} onChange={handleChange} placeholder="https://zoom.us/..." className={inputClass} /><span className="block text-[11px] text-amber-700 dark:text-amber-300 mt-1">URL ini disimpan terenkripsi dan tidak dikirim pada resource publik. Saat mengedit, masukkan ulang URL karena backend tidak mengembalikan URL sebelumnya.</span></label>}

          {isAcademic ? (
            <div className="rounded-2xl bg-[#EAF1FF] dark:bg-[#090F1E] border border-[#102B69]/20 dark:border-slate-700 p-4 space-y-3">
              <h2 className="text-sm font-extrabold text-[#102B69] dark:text-[#D6F45A]">Pendaftaran internal akademik</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="block"><span className={labelClass}>Kapasitas *</span><input required type="number" min={1} name="capacity" value={form.capacity} onChange={handleChange} className={inputClass} /></label>
                <label className="block"><span className={labelClass}>Registrasi dibuka *</span><input required type="datetime-local" name="registration_opens_at" value={form.registration_opens_at} onChange={handleChange} className={inputClass} /></label>
                <label className="block"><span className={labelClass}>Registrasi ditutup *</span><input required type="datetime-local" name="registration_closes_at" value={form.registration_closes_at} onChange={handleChange} className={inputClass} /></label>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-[#EAF1FF] dark:bg-[#090F1E] border border-[#102B69]/20 dark:border-slate-700 p-4 space-y-3">
              <h2 className="text-sm font-extrabold text-[#102B69] dark:text-[#D6F45A]">Pendaftaran eksternal</h2>
              <label className="block"><span className={labelClass}>URL pendaftaran eksternal</span><input type="url" name="external_registration_url" value={form.external_registration_url} onChange={handleChange} placeholder="https://..." className={inputClass} /></label>
              <p className="text-[11px] text-slate-500">Isi URL pendaftaran atau setidaknya satu metode kontak berupa email/telepon.</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="block"><span className={labelClass}>Nama kontak</span><input name="contact_name" maxLength={160} value={form.contact_name} onChange={handleChange} className={inputClass} /></label>
            <label className="block"><span className={labelClass}>Email kontak</span><input type="email" name="contact_email" maxLength={254} value={form.contact_email} onChange={handleChange} className={inputClass} /></label>
            <label className="block"><span className={labelClass}>Telepon kontak</span><input name="contact_phone" maxLength={40} value={form.contact_phone} onChange={handleChange} className={inputClass} /></label>
          </div>

          <button type="submit" disabled={submitting || organizations.length === 0 || eventTypes.length === 0} className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-full bg-[#102B69] dark:bg-[#D6F45A] text-[#D6F45A] dark:text-[#102B69] border-2 border-[#102B69] font-display font-extrabold text-sm hover:opacity-95 disabled:opacity-50 transition">
            <Save className="w-4 h-4" />{submitting ? t("common.saving") : t("admin.saveEventBtn")}
          </button>
          {organizations.length === 0 && <p className="text-xs text-red-600">Akun ini belum memiliki organisasi aktif yang dapat dikelola. Hubungi UPA TIK untuk penetapan role/organisasi.</p>}
          {eventTypes.length === 0 && <p className="text-xs text-red-600">Belum ada tipe event aktif. UPA TIK perlu mengatur event type terlebih dahulu.</p>}
        </section>
      </form>
    </div>
  );
}

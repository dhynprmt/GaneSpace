import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Clock,
  Edit3,
  Save,
  Upload,
  X,
} from "lucide-react";
import StudentPhotoEditor from "../../components/auth/StudentPhotoEditor";
import { API_CONFIG } from "../../services/api/apiClient";
import SEO from "../../seo/SEO";
import { useAuth } from "../../contexts/AuthContext";
import { campusDirectoryService } from "../../services/campusDirectoryService";
import { authService } from "../../services/authService";
import { useLanguage } from "../../contexts/LanguageContext";
import { bentoToast } from "../../utils/bentoToast";

export default function StudentProfilePage() {
  const { user, updateProfile, refreshUser } = useAuth();
  const { t } = useLanguage();

  const requestIds = useRef({ faculty: 0, department: 0 });
  const photoEditor = useRef(null);
  const [photoBlob, setPhotoBlob] = useState(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoRevision, setPhotoRevision] = useState(0);
  const [savingPhoto, setSavingPhoto] = useState(false);
  const hasPhoto = Boolean(user?.student?.has_profile_photo);
  useEffect(() => {
    let active = true;
    let url;
    if (hasPhoto) authService.getStudentPhoto().then((blob) => {
      if (!active) return;
      url = URL.createObjectURL(blob);
      setPhotoBlob(blob);
      setPhotoUrl(url);
    }).catch((err) => { if (active) bentoToast.error("Gagal memuat foto", err.message); });
    return () => { active = false; if (url) URL.revokeObjectURL(url); };
  }, [hasPhoto, user?.id, photoRevision]);

  const savePhoto = async () => {
    setSavingPhoto(true);
    try {
      const file = await photoEditor.current.getFile();
      if (!file) return;
      await authService.saveStudentPhoto(file);
      await refreshUser();
      setPhotoRevision((revision) => revision + 1);
      bentoToast.success("Foto profil tersimpan");
    } catch (err) { bentoToast.error("Gagal menyimpan foto", err.message); }
    finally { setSavingPhoto(false); }
  };
  const [isEditing, setIsEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    nim: "",
    faculty: "",
    department: "",
    study_program: "",
    email: "",
  });
  const [identityForm, setIdentityForm] = useState({ nim: "", faculty_id: "", department_id: "", study_program_id: "", ktm: null });
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [studyPrograms, setStudyPrograms] = useState([]);
  const [identitySubmitting, setIdentitySubmitting] = useState(false);


  useEffect(() => {
    if (!user) return;
    // The editable form is intentionally synchronized when the authenticated account changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProfileForm({
      name: user.name || "",
      nim: user.nim || "",
      faculty: user.faculty || "",
      department: user.department || "",
      study_program: user.study_program || "",
      email: user.email || "",
    });
  }, [user]);

  useEffect(() => {
    let active = true;
    const loadDirectory = async () => {
      try {
        const facultyList = await campusDirectoryService.getFaculties();
        if (!active) return;
        setFaculties(facultyList);
        const facultyId = user?.faculty_id ? String(user.faculty_id) : "";
        const departmentId = user?.department_id ? String(user.department_id) : "";
        setIdentityForm({
          nim: user?.nim || "",
          faculty_id: facultyId,
          department_id: departmentId,
          study_program_id: user?.study_program_id ? String(user.study_program_id) : "",
          ktm: null,
        });
        if (facultyId) {
          const departmentList = await campusDirectoryService.getDepartments(facultyId);
          if (!active) return;
          setDepartments(departmentList);
        }
        if (departmentId) {
          const programList = await campusDirectoryService.getStudyPrograms(departmentId);
          if (!active) return;
          setStudyPrograms(programList);
        }
      } catch (error) {
        console.error("Unable to load campus directory for identity resubmission:", error);
      }
    };
    if (user) loadDirectory();
    return () => { active = false; };
  }, [user]);

  const isVerified = user?.verification_status === "verified";

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) return;
    setSavingProfile(true);
    try {
      await updateProfile({ name: profileForm.name.trim() });
      setIsEditing(false);
      bentoToast.updated(t("student.profileUpdatedTitle"), t("student.profileUpdatedDesc"));
    } catch (err) {
      bentoToast.error(t("student.profileUpdateFailedTitle"), err.message || t("common.tryAgain"));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCancelEdit = () => {
    setProfileForm({
      name: user?.name || "",
      nim: user?.nim || "",
      faculty: user?.faculty || "",
      department: user?.department || "",
      study_program: user?.study_program || "",
      email: user?.email || "",
    });
    setIsEditing(false);
  };

  const handleIdentitySubmit = async (event) => {
    event.preventDefault();
    const changes = {};
    if (identityForm.ktm) changes.ktm = identityForm.ktm;
    if (identityForm.nim.trim() !== user.nim) changes.nim = identityForm.nim.trim();
    if (String(user.study_program_id) !== identityForm.study_program_id) changes.study_program_id = identityForm.study_program_id;
    if (!Object.keys(changes).length) {
      bentoToast.error("Ubah identitas atau pilih KTM baru terlebih dahulu.");
      return;
    }
    setIdentitySubmitting(true);
    try {
      await authService.resubmitStudentProfile(changes);
      await refreshUser();
      setIdentityForm((previous) => ({ ...previous, ktm: null }));
      bentoToast.success("Data identitas dikirim", "Status verifikasi NIM akan menunggu pemeriksaan UPA TIK.");
    } catch (error) {
      const firstError = error.errors ? Object.values(error.errors).flat()[0] : null;
      bentoToast.error("Gagal mengirim data identitas", firstError || error.message || t("common.tryAgain"));
    } finally {
      setIdentitySubmitting(false);
    }
  };

  const handleIdentityFacultyChange = async (facultyId) => {
    const request = ++requestIds.current.faculty;
    requestIds.current.department += 1;
    setIdentityForm((previous) => ({ ...previous, faculty_id: facultyId, department_id: "", study_program_id: "" }));
    setDepartments([]);
    setStudyPrograms([]);
    if (!facultyId) return;
    try {
      const rows = await campusDirectoryService.getDepartments(facultyId);
      if (request === requestIds.current.faculty) setDepartments(rows);
    } catch (err) { bentoToast.error("Direktori kampus gagal dimuat", err.message); }
  };

  const handleIdentityDepartmentChange = async (departmentId) => {
    const request = ++requestIds.current.department;
    setIdentityForm((previous) => ({ ...previous, department_id: departmentId, study_program_id: "" }));
    setStudyPrograms([]);
    if (!departmentId) return;
    try {
      const rows = await campusDirectoryService.getStudyPrograms(departmentId);
      if (request === requestIds.current.department) setStudyPrograms(rows);
    } catch (err) { bentoToast.error("Direktori kampus gagal dimuat", err.message); }
  };

  const inputCls =
    "w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#111A2E] border-2 border-[#102B69]/30 dark:border-slate-700 text-sm font-semibold text-[#102B69] dark:text-white focus:border-[#102B69] dark:focus:border-[#D6F45A] focus:outline-none";

  const profileFields = [
    { key: "name", label: t("auth.fullNameLabel"), type: "text" },
    { key: "nim", label: "NIM", type: "text", readOnly: true },
    { key: "faculty", label: t("auth.facultyLabel"), type: "text", readOnly: true },
    { key: "department", label: t("auth.deptLabel"), type: "text", readOnly: true },
    { key: "study_program", label: t("auth.prodiLabel"), type: "text", readOnly: true },
    { key: "email", label: "Email", type: "email", readOnly: true },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <SEO title={t("student.profileSeo")} noIndex />

      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#102B69] dark:text-white">
          {t("student.profileTitle")}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
          {t("student.profileSub")}
        </p>
      </div>

      <form
        onSubmit={handleSaveProfile}
        className="rounded-[2rem] bg-white dark:bg-[#111A2E] border-2 border-[#102B69] dark:border-[#D6F45A]/80 p-6 sm:p-8 bento-shadow space-y-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <span className="w-14 h-14 rounded-2xl bg-[#102B69] dark:bg-[#D6F45A] text-[#D6F45A] dark:text-[#102B69] border-2 border-[#102B69] font-display font-extrabold text-xl flex items-center justify-center">
              {user?.name?.charAt(0) || "M"}
            </span>
            <div>
              <h2 className="font-display font-extrabold text-lg text-[#102B69] dark:text-white">
                {user?.name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold border-2 border-[#102B69] ${
                isVerified ? "bg-[#D6F45A] text-[#102B69]" : "bg-[#FFD166] text-[#102B69]"
              }`}
            >
              {isVerified ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
              Status: {t(`status.${user?.verification_status || "pending"}`)}
            </span>

            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#102B69] dark:bg-[#D6F45A] text-[#D6F45A] dark:text-[#102B69] border-2 border-[#102B69] text-xs font-extrabold hover:opacity-90 transition"
              >
                <Edit3 className="w-3.5 h-3.5" /> {t("student.editProfile")}
              </button>
            )}
          </div>
        </div>

        {hasPhoto && photoUrl && <img src={photoUrl} alt="Foto profil mahasiswa" className="max-h-44 rounded-xl" />}
        {isEditing && !API_CONFIG.useMockApi && <div className="space-y-3">
          <StudentPhotoEditor key={photoRevision} ref={photoEditor} currentPhoto={hasPhoto ? photoBlob : null} />
          <button type="button" disabled={savingPhoto} onClick={savePhoto} className="underline font-bold">
            {savingPhoto ? "Menyimpan foto…" : "Simpan foto"}
          </button>
        </div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {profileFields.map((field) => (
            <div
              key={field.key}
              className="rounded-2xl bg-[#F5F7FC] dark:bg-[#090F1E] p-4 border-2 border-[#102B69]/15 dark:border-slate-800 space-y-1.5"
            >
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {field.label}
              </label>

              {isEditing && !field.readOnly ? (
                <input
                  type={field.type}
                  required
                  inputMode={field.numeric ? "numeric" : undefined}
                  value={profileForm[field.key]}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, [field.key]: e.target.value })
                  }
                  className={inputCls}
                />
              ) : (
                <p className="font-bold text-[#102B69] dark:text-white pt-0.5">
                  {profileForm[field.key] || "-"}
                  {isEditing && field.readOnly && (
                    <span className="block text-[10px] font-medium text-slate-400 mt-0.5">
                      {t("student.emailReadOnlyHint")}
                    </span>
                  )}
                </p>
              )}
            </div>
          ))}
        </div>

        {isEditing && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {t("student.helpChangeEmail")}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border-2 border-[#102B69] dark:border-slate-600 text-xs font-extrabold text-[#102B69] dark:text-slate-200"
              >
                <X className="w-3.5 h-3.5" /> {t("common.cancel")}
              </button>
              <button
                type="submit"
                disabled={savingProfile}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#D6F45A] text-[#102B69] border-2 border-[#102B69] text-xs font-extrabold shadow-[0_3px_0_0_#102B69] disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />{" "}
                {savingProfile ? t("common.saving") : t("student.saveChanges")}
              </button>
            </div>
          </div>
        )}
      </form>

      <form onSubmit={handleIdentitySubmit} className="rounded-[2rem] bg-white dark:bg-[#111A2E] border-2 border-[#102B69] dark:border-[#D6F45A]/80 p-6 sm:p-8 bento-shadow space-y-4">
        <div>
          <h2 className="font-display font-extrabold text-lg text-[#102B69] dark:text-white">Perbarui identitas mahasiswa</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Perubahan NIM atau data akademik dikirim untuk pemeriksaan ulang UPA TIK. Status verifikasi akan kembali menjadi pending.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input aria-label="NIM" required value={identityForm.nim} onChange={(event) => setIdentityForm({ ...identityForm, nim: event.target.value })} placeholder="NIM" className={inputCls} />
          <select required value={identityForm.faculty_id} onChange={(event) => handleIdentityFacultyChange(event.target.value)} className={inputCls}>
            <option value="">Pilih fakultas</option>
            {faculties.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <select required value={identityForm.department_id} onChange={(event) => handleIdentityDepartmentChange(event.target.value)} disabled={!identityForm.faculty_id} className={inputCls}>
            <option value="">Pilih jurusan</option>
            {departments.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <select required value={identityForm.study_program_id} onChange={(event) => setIdentityForm({ ...identityForm, study_program_id: event.target.value })} disabled={!identityForm.department_id} className={inputCls}>
            <option value="">Pilih program studi</option>
            {studyPrograms.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </div>
        <div>
          {user?.student?.has_ktm && <a className="block underline mb-2" href={`${API_CONFIG.baseURL}/me/student-profile/ktm`}>Unduh KTM saya</a>}
          <label className="block text-xs font-extrabold text-[#102B69] dark:text-slate-200 mb-1">KTM terbaru (PDF/JPG/PNG)</label>
          <input type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={(event) => setIdentityForm({ ...identityForm, ktm: event.target.files?.[0] || null })} className={inputCls} />
        </div>
        <button type="submit" disabled={identitySubmitting} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#102B69] dark:bg-[#D6F45A] text-[#D6F45A] dark:text-[#102B69] border-2 border-[#102B69] text-xs font-extrabold disabled:opacity-50">
          <Upload className="w-4 h-4" /> {identitySubmitting ? "Mengirim..." : "Kirim untuk verifikasi ulang"}
        </button>
      </form>

      <section className="rounded-[2rem] bg-white dark:bg-[#111A2E] border-2 border-[#102B69] dark:border-[#D6F45A]/80 p-6 sm:p-8 bento-shadow space-y-3">
        <h2 className="font-display font-extrabold text-lg text-[#102B69] dark:text-white">{t("student.changePassword")}</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Penggantian password menggunakan alur pemulihan password yang tersedia pada backend saat ini.</p>
        <Link to="/forgot-password" className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-[#102B69] dark:bg-[#D6F45A] text-[#D6F45A] dark:text-[#102B69] border-2 border-[#102B69] text-xs font-extrabold">Kirim tautan reset password</Link>
      </section>

    </div>
  );
}
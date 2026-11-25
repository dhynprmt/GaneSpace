import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SEO from "../../seo/SEO";
import TurnstileCaptcha from "../../components/auth/TurnstileCaptcha";
import StudentPhotoEditor from "../../components/auth/StudentPhotoEditor";
import ThemeToggle from "../../components/ui/ThemeToggle";
import LanguageToggle from "../../components/ui/LanguageToggle";
import { useLanguage } from "../../contexts/LanguageContext";
import { authService } from "../../services/authService";
import { campusDirectoryService } from "../../services/campusDirectoryService";
import { API_CONFIG } from "../../services/api/apiClient";
import { bentoToast } from "../../utils/bentoToast";

export default function RegisterPage() {
  const { t } = useLanguage();
  const facultyRequest = useRef(0);
  const programRequest = useRef(0);
  const photoEditor = useRef(null);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    nim: "",
    faculty_id: "",
    department_id: "",
    study_program_id: "",
    email: "",
    password: "",
    password_confirmation: "",
    ktm: null,
  });
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [studyPrograms, setStudyPrograms] = useState([]);
  const [loadingFaculties, setLoadingFaculties] = useState(true);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [directoryError, setDirectoryError] = useState("");
  const [captchaAttempt, setCaptchaAttempt] = useState(0);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    campusDirectoryService.getFaculties()
      .then((items) => { if (active) setFaculties(items); })
      .catch((error) => { if (active) setDirectoryError(error.message || "Gagal memuat daftar fakultas."); })
      .finally(() => { if (active) setLoadingFaculties(false); });
    return () => { active = false; };
  }, []);

  const handleChange = (event) => {
    const { name, value, files } = event.target;
    setForm((previous) => ({ ...previous, [name]: name === "ktm" ? files?.[0] || null : value }));
  };

  const handleFacultyChange = async (event) => {
    const request = ++facultyRequest.current;
    programRequest.current += 1;
    setLoadingPrograms(false);
    const facultyId = event.target.value;
    setForm((previous) => ({ ...previous, faculty_id: facultyId, department_id: "", study_program_id: "" }));
    setDepartments([]);
    setStudyPrograms([]);
    if (!facultyId) { setLoadingDepartments(false); return; }
    setLoadingDepartments(true);
    try {
      const rows = await campusDirectoryService.getDepartments(facultyId);
      if (request === facultyRequest.current) setDepartments(rows);
    } catch (error) {
      bentoToast.error("Gagal memuat jurusan", error.message);
    } finally {
      if (request === facultyRequest.current) setLoadingDepartments(false);
    }
  };

  const handleDepartmentChange = async (event) => {
    const request = ++programRequest.current;
    const departmentId = event.target.value;
    setForm((previous) => ({ ...previous, department_id: departmentId, study_program_id: "" }));
    setStudyPrograms([]);
    if (!departmentId) { setLoadingPrograms(false); return; }
    setLoadingPrograms(true);
    try {
      const rows = await campusDirectoryService.getStudyPrograms(departmentId);
      if (request === programRequest.current) setStudyPrograms(rows);
    } catch (error) {
      bentoToast.error("Gagal memuat program studi", error.message);
    } finally {
      if (request === programRequest.current) setLoadingPrograms(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!/^[A-Za-z0-9]{1,30}$/.test(form.nim.trim())) {
      bentoToast.error(t("auth.invalidNimTitle"), t("auth.invalidNimDesc"));
      return;
    }
    if (form.password.length < 10 || !/\p{L}/u.test(form.password) || !/\p{N}/u.test(form.password)) {
      bentoToast.error(t("auth.shortPwTitle"), t("auth.shortPwDesc"));
      return;
    }
    if (form.password !== form.password_confirmation) {
      bentoToast.error(t("auth.pwMismatchTitle"), t("auth.pwMismatchDesc"));
      return;
    }
    if (!API_CONFIG.useMockApi && (!form.faculty_id || !form.department_id || !form.study_program_id)) {
      bentoToast.error("Data akademik belum lengkap", "Pilih fakultas, jurusan, dan program studi.");
      return;
    }
    if (!API_CONFIG.useMockApi && !form.ktm) {
      bentoToast.error("KTM wajib diunggah", "Pilih file KTM dalam format PDF, JPG, atau PNG.");
      return;
    }
    if (form.ktm && !["application/pdf", "image/jpeg", "image/png"].includes(form.ktm.type)) {
      bentoToast.error("Format KTM tidak didukung", "Gunakan file PDF, JPG, atau PNG.");
      return;
    }
    if (form.ktm && form.ktm.size > 4 * 1024 * 1024) {
      bentoToast.error("File terlalu besar", "Ukuran KTM maksimal 4 MB.");
      return;
    }
    if (!turnstileToken) {
      bentoToast.error(t("auth.verifyReqTitle"), t("auth.verifyReqDesc"));
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        nim: form.nim.trim(),
        faculty_id: form.faculty_id,
        department_id: form.department_id,
        study_program_id: form.study_program_id,
        email: form.email.trim(),
        password: form.password,
        password_confirmation: form.password_confirmation,
        ktm: form.ktm,
        profile_photo: await photoEditor.current?.getFile(),
        turnstile_token: turnstileToken,
      };
      await authService.register(payload);
      bentoToast.success(t("auth.regSuccessTitle"), t("auth.regSuccessDesc"));
      navigate("/verify-email", { state: { email: form.email.trim() } });
    } catch (error) {
      const firstValidationError = error.errors ? Object.values(error.errors).flat()[0] : null;
      bentoToast.error(t("auth.regFailedTitle"), firstValidationError || error.message || t("auth.regFailedDesc"));
    } finally {
      setSubmitting(false);
      setTurnstileToken("");
      setCaptchaAttempt((attempt) => attempt + 1);
    }
  };

  const inputCls = "w-full px-4 py-2.5 rounded-2xl bg-[#F5F7FC] dark:bg-[#090F1E] border-2 border-[#102B69]/25 dark:border-slate-700 text-sm focus:border-[#102B69] dark:focus:border-[#D6F45A] focus:outline-none";
  const labelCls = "block text-xs font-extrabold text-[#102B69] dark:text-slate-200 mb-1";

  return (
    <div className="min-h-screen bg-[#F5F7FC] dark:bg-[#090F1E] bg-subtle-dots flex items-center justify-center px-4 py-12 transition-colors">
      <SEO title={t("auth.registerSeo")} noIndex />
      <div className="fixed top-4 right-4 z-40 flex items-center gap-2"><LanguageToggle /><ThemeToggle /></div>

      <div className="w-full max-w-xl rounded-[2rem] bg-white dark:bg-[#111A2E] border-2 border-[#102B69] dark:border-[#D6F45A] bento-shadow p-7 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-white border-2 border-[#102B69] p-1"><img src="/assets/logo-ganespace.png" alt="Logo GANESPACE" className="w-full h-full object-contain" /></div>
            <span className="font-display font-extrabold text-2xl text-[#102B69] dark:text-white">GANESPACE</span>
          </Link>
          <h1 className="font-display font-extrabold text-xl text-[#102B69] dark:text-white">{t("auth.registerTitle")}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t("auth.registerSub")}</p>
        </div>

        <form onSubmit={handleSubmit} encType="multipart/form-data" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelCls}>{t("auth.fullNameLabel")}</label>
            <input name="name" required value={form.name} onChange={handleChange} className={inputCls} autoComplete="name" />
          </div>
          <div>
            <label className={labelCls}>NIM</label>
            <input name="nim" maxLength={30} required placeholder={t("auth.nimPlaceholder")} value={form.nim} onChange={handleChange} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>{t("auth.facultyLabel")}</label>
            <select name="faculty_id" required={!API_CONFIG.useMockApi} value={form.faculty_id} onChange={handleFacultyChange} disabled={loadingFaculties} className={inputCls}>
              <option value="">{loadingFaculties ? "Memuat fakultas..." : "Pilih fakultas"}</option>
              {faculties.map((faculty) => <option key={faculty.id} value={faculty.id}>{faculty.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>{t("auth.deptLabel")}</label>
            <select name="department_id" required value={form.department_id} onChange={handleDepartmentChange} disabled={!form.faculty_id || loadingDepartments} className={inputCls}>
              <option value="">{loadingDepartments ? "Memuat jurusan..." : "Pilih jurusan"}</option>
              {departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>{t("auth.prodiLabel")}</label>
            <select name="study_program_id" required value={form.study_program_id} onChange={handleChange} disabled={!form.department_id || loadingPrograms} className={inputCls}>
              <option value="">{loadingPrograms ? "Memuat program studi..." : "Pilih program studi"}</option>
              {studyPrograms.map((program) => <option key={program.id} value={program.id}>{program.name}</option>)}
            </select>
          </div>

          {!API_CONFIG.useMockApi && <div className="sm:col-span-2"><StudentPhotoEditor ref={photoEditor} /></div>}
          {directoryError && <p role="alert" className="sm:col-span-2 text-xs text-red-600 dark:text-red-400">{directoryError}</p>}
          {!loadingFaculties && !directoryError && faculties.length === 0 && !API_CONFIG.useMockApi && (
            <div className="sm:col-span-2 rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/30 p-3 text-xs text-amber-800 dark:text-amber-200">
              Data fakultas belum tersedia. UPA TIK perlu mengisi fakultas, jurusan, dan program studi terlebih dahulu.
            </div>
          )}

          <div className="sm:col-span-2">
            <label className={labelCls}>{t("auth.campusEmailLabel")}</label>
            <input type="email" name="email" required placeholder="nama@undiksha.ac.id" value={form.email} onChange={handleChange} className={inputCls} autoComplete="email" />
          </div>
          <div>
            <label className={labelCls}>{t("auth.passwordLabel")}</label>
            <input type="password" name="password" required minLength={10} value={form.password} onChange={handleChange} className={inputCls} autoComplete="new-password" />
          </div>
          <div>
            <label className={labelCls}>{t("auth.confirmPasswordLabel")}</label>
            <input type="password" name="password_confirmation" required minLength={10} value={form.password_confirmation} onChange={handleChange} className={inputCls} autoComplete="new-password" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Kartu Tanda Mahasiswa (KTM)</label>
            <input type="file" name="ktm" required={!API_CONFIG.useMockApi} accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={handleChange} className={inputCls} />
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">PDF, JPG, atau PNG. Maksimal 4 MB. File disimpan secara privat.</p>
          </div>
          <div className="sm:col-span-2"><TurnstileCaptcha key={captchaAttempt} onVerify={setTurnstileToken} /></div>
          <div className="sm:col-span-2">
            <button type="submit" disabled={submitting || (!API_CONFIG.useMockApi && faculties.length === 0)} className="w-full py-3.5 rounded-full bg-[#102B69] dark:bg-[#D6F45A] text-[#D6F45A] dark:text-[#102B69] border-2 border-[#102B69] font-display font-extrabold text-sm hover:opacity-95 disabled:opacity-50 transition">
              {submitting ? t("auth.registering") : t("auth.registerBtn")}
            </button>
          </div>
        </form>

        <p className="text-center text-xs text-slate-600 dark:text-slate-400">{t("auth.hasAccount")} <Link to="/login" className="font-extrabold text-[#1649B8] dark:text-[#D6F45A] hover:underline">{t("auth.signInBtn")}</Link></p>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Edit, Plus, Trash2, Building2 } from "lucide-react";
import SEO from "../../seo/SEO";
import BentoIcon from "../../components/ui/BentoIcons";
import { adminService } from "../../services/adminService";
import { campusDirectoryService } from "../../services/campusDirectoryService";
import { bentoToast } from "../../utils/bentoToast";
import { useLanguage } from "../../contexts/LanguageContext";

const emptyOrganization = () => ({
  name: "",
  organization_type: "student_organization",
  parent_id: "",
  faculty_id: "",
  contact_email: "",
  contact_phone: "",
  is_active: true,
});

export default function MasterOrganizationsPage() {
  const { t } = useLanguage();
  const [orgs, setOrgs] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [modalOrg, setModalOrg] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      try {
        const [organizations, facultyRows] = await Promise.all([
          adminService.getOrganizations(),
          campusDirectoryService.getFaculties(),
        ]);
        if (active) {
          setOrgs(organizations);
          setFaculties(facultyRows);
        }
      } catch (error) {
        if (active) bentoToast.error(t("common.actionFailed"), error.message || t("common.tryAgain"));
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchData();
    return () => { active = false; };
  }, [t]);

  const parentOptions = orgs.filter((organization) => organization.is_active && organization.id !== modalOrg?.id);

  const openCreateModal = () => setModalOrg(emptyOrganization());

  const openEditModal = (organization) => setModalOrg({
    id: organization.id,
    name: organization.name || "",
    organization_type: organization.organization_type || organization.type || "student_organization",
    parent_id: organization.parent_id ? String(organization.parent_id) : "",
    faculty_id: organization.faculty_id ? String(organization.faculty_id) : "",
    contact_email: organization.contact_email || "",
    contact_phone: organization.contact_phone || "",
    is_active: Boolean(organization.is_active),
  });

  const handleSave = async (event) => {
    event.preventDefault();
    if (!/^[a-z0-9_-]{1,40}$/.test(modalOrg.organization_type)) {
      bentoToast.error("Format tipe organisasi tidak valid", "Gunakan huruf kecil, angka, underscore, atau tanda hubung; maksimal 40 karakter.");
      return;
    }

    setSaving(true);
    try {
      const updated = await adminService.saveOrganization(modalOrg);
      setOrgs(updated);
      setModalOrg(null);
      bentoToast.success(
        modalOrg.id ? t("master.orgUpdatedTitle") : t("master.orgCreatedTitle"),
        modalOrg.name
      );
    } catch (error) {
      bentoToast.error(t("common.actionFailed"), error.message || t("common.tryAgain"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDel) return;
    try {
      const updated = await adminService.deleteOrganization(confirmDel.id);
      setOrgs(updated);
      setConfirmDel(null);
      bentoToast.deleted(t("master.orgDeletedTitle"), confirmDel.name);
    } catch (error) {
      bentoToast.error(
        "Organisasi tidak dapat dihapus",
        error.message || "Jika organisasi memiliki event atau riwayat role, nonaktifkan organisasi melalui formulir edit."
      );
    }
  };

  const inputCls = "w-full px-4 py-2.5 rounded-2xl bg-[#F5F7FC] dark:bg-[#090F1E] border-2 border-[#102B69]/25 dark:border-slate-700 text-sm focus:border-[#102B69] dark:focus:border-[#D6F45A] focus:outline-none";

  return (
    <div className="space-y-6">
      <SEO title={`${t("master.organizations")} | UPA TIK`} noIndex />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BentoIcon name="org" tone="lime" size="sm" />
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-extrabold text-[#102B69] dark:text-white">{t("master.orgPageTitle")}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t("master.orgPageSub")}</p>
          </div>
        </div>
        <button onClick={openCreateModal} className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#D6F45A] text-[#102B69] border-2 border-[#102B69] text-xs font-extrabold shadow-[0_3px_0_0_#102B69] hover:brightness-95 transition">
          <Plus className="w-4 h-4" /> {t("master.addOrgBtn")}
        </button>
      </div>

      <div className="rounded-[2rem] bg-white dark:bg-[#111A2E] border-2 border-[#102B69] dark:border-[#D6F45A] bento-shadow overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#EAF1FF] dark:bg-[#0B1222] border-b-2 border-[#102B69] dark:border-[#D6F45A]/50 text-xs font-extrabold text-[#102B69] dark:text-[#D6F45A] uppercase">
            <tr>
              <th className="p-4">{t("master.colOrg")}</th>
              <th className="p-4">Tipe</th>
              <th className="p-4">Induk / Fakultas</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">{t("admin.colActions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800">
            {loading ? (
              <tr><td colSpan={5} className="p-6 text-center text-slate-500">Memuat organisasi...</td></tr>
            ) : orgs.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center text-slate-500">Belum ada organisasi.</td></tr>
            ) : orgs.map((organization) => (
              <tr key={organization.id} className="hover:bg-[#F5F7FC] dark:hover:bg-slate-800/40">
                <td className="p-4">
                  <p className="font-extrabold text-[#102B69] dark:text-white">{organization.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{organization.slug}</p>
                </td>
                <td className="p-4 text-xs text-slate-600 dark:text-slate-300">{organization.organization_type}</td>
                <td className="p-4 text-xs text-slate-600 dark:text-slate-300">
                  <p>{organization.parent_name || "—"}</p>
                  <p className="text-slate-400">{organization.faculty || "—"}</p>
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${organization.is_active ? "bg-[#D6F45A] text-[#102B69]" : "bg-slate-200 text-slate-600"}`}>
                    {organization.is_active ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEditModal(organization)} title={t("common.edit")} className="p-2 rounded-xl border-2 border-[#102B69] dark:border-[#D6F45A] bg-white dark:bg-[#090F1E] text-[#102B69] dark:text-[#D6F45A] hover:bg-[#D6F45A] hover:text-[#102B69] transition">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setConfirmDel(organization)} title={t("common.delete")} className="p-2 rounded-xl border-2 border-[#102B69] bg-[#FF5A5F] text-white hover:brightness-95 transition">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOrg && (
        <div className="fixed inset-0 z-50 bg-[#102B69]/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleSave} className="bg-white dark:bg-[#111A2E] border-2 border-[#102B69] dark:border-[#D6F45A] bento-shadow rounded-3xl max-w-xl w-full p-6 space-y-4 my-auto">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#1649B8] dark:text-[#D6F45A]" />
              <h3 className="font-display font-extrabold text-lg text-[#102B69] dark:text-white">{modalOrg.id ? t("master.editOrgModal") : t("master.addOrgModal")}</h3>
            </div>
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">Nama organisasi
                <input required maxLength={160} value={modalOrg.name} onChange={(event) => setModalOrg({ ...modalOrg, name: event.target.value })} className={`${inputCls} mt-1`} />
              </label>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">Tipe organisasi (slug)
                <input required maxLength={40} pattern="[a-z0-9_-]+" value={modalOrg.organization_type} onChange={(event) => setModalOrg({ ...modalOrg, organization_type: event.target.value })} className={`${inputCls} mt-1`} placeholder="student_organization" />
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">Organisasi induk
                  <select value={modalOrg.parent_id} onChange={(event) => setModalOrg({ ...modalOrg, parent_id: event.target.value })} className={`${inputCls} mt-1`}>
                    <option value="">Tidak ada</option>
                    {parentOptions.map((parent) => <option key={parent.id} value={parent.id}>{parent.name}</option>)}
                  </select>
                </label>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">Fakultas
                  <select value={modalOrg.faculty_id} onChange={(event) => setModalOrg({ ...modalOrg, faculty_id: event.target.value })} className={`${inputCls} mt-1`}>
                    <option value="">Tidak terkait fakultas</option>
                    {faculties.map((faculty) => <option key={faculty.id} value={faculty.id}>{faculty.name}</option>)}
                  </select>
                </label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">Email kontak
                  <input type="email" maxLength={254} value={modalOrg.contact_email} onChange={(event) => setModalOrg({ ...modalOrg, contact_email: event.target.value })} className={`${inputCls} mt-1`} />
                </label>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">Telepon kontak
                  <input maxLength={40} value={modalOrg.contact_phone} onChange={(event) => setModalOrg({ ...modalOrg, contact_phone: event.target.value })} className={`${inputCls} mt-1`} />
                </label>
              </div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                <input type="checkbox" checked={modalOrg.is_active} onChange={(event) => setModalOrg({ ...modalOrg, is_active: event.target.checked })} /> Organisasi aktif
              </label>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Slug dibuat otomatis oleh backend dan tetap stabil setelah organisasi dibuat. Penetapan akun Event Admin dilakukan terpisah melalui manajemen role.</p>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setModalOrg(null)} className="px-4 py-2 rounded-full border-2 border-[#102B69] dark:border-slate-600 text-xs font-extrabold">{t("common.cancel")}</button>
              <button type="submit" disabled={saving} className="px-5 py-2 rounded-full bg-[#102B69] dark:bg-[#D6F45A] text-[#D6F45A] dark:text-[#102B69] text-xs font-extrabold disabled:opacity-50">{saving ? t("common.saving") : t("common.save")}</button>
            </div>
          </form>
        </div>
      )}

      {confirmDel && (
        <div className="fixed inset-0 z-50 bg-[#102B69]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111A2E] border-2 border-[#102B69] dark:border-[#D6F45A] bento-shadow rounded-3xl max-w-sm w-full p-6 space-y-4">
            <h3 className="font-display font-extrabold text-lg text-[#102B69] dark:text-white">{t("master.deleteOrgTitle")}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">{t("master.deleteOrgDesc", { name: confirmDel.name })}</p>
            <p className="text-xs text-slate-500">Organisasi yang memiliki event, riwayat role, atau organisasi turunan tidak dapat dihapus. Nonaktifkan organisasi tersebut melalui formulir edit.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirmDel(null)} className="px-4 py-2 rounded-full border-2 border-[#102B69] dark:border-slate-600 text-xs font-extrabold">{t("common.cancel")}</button>
              <button onClick={handleDelete} className="px-5 py-2 rounded-full bg-[#FF5A5F] text-white border-2 border-[#102B69] text-xs font-extrabold">{t("common.delete")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

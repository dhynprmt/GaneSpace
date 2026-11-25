import { useEffect, useState } from "react";
import { Eye, Search } from "lucide-react";
import SEO from "../../seo/SEO";
import { adminService } from "../../services/adminService";
import { formatDateWITA } from "../../utils/dateFormatter";
import { bentoToast } from "../../utils/bentoToast";
import { useLanguage } from "../../contexts/LanguageContext";

export default function MasterUsersPage() {
  const { t } = useLanguage();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    adminService.getUsers().then(setUsers);
  }, []);

  const handleRoleChange = async (user, nextRole) => {
    const updated = await adminService.updateUserRole(user.id, nextRole);
    setUsers(updated);
    bentoToast.updated(t("master.roleUpdatedTitle"), `${user.name} -> ${nextRole.replace("_", " ")}`);
  };

  const filtered = users.filter((u) => {
    const matchText =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchText && matchRole;
  });

  return (
    <div className="space-y-6">
      <SEO title={`${t("master.users")} | UPA TIK`} noIndex />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: "all", label: t("common.all") },
            { key: "student", label: "Student" },
            { key: "event_admin", label: "Ormawa" },
            { key: "super_admin", label: "UPA TIK" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setRoleFilter(tab.key)}
              className={`px-4 py-2 rounded-full text-xs font-extrabold border-2 border-[#102B69] dark:border-[#D6F45A] transition ${
                roleFilter === tab.key
                  ? "bg-[#D6F45A] text-[#102B69] shadow-[0_3px_0_0_#102B69]"
                  : "bg-white dark:bg-[#111A2E] text-[#102B69] dark:text-slate-200 hover:bg-[#EAF1FF]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#1649B8] dark:text-[#D6F45A] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t("master.searchUserPh")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white dark:bg-[#111A2E] border-2 border-[#102B69] dark:border-[#D6F45A] text-sm font-medium focus:outline-none shadow-[0_3px_0_0_#102B69] dark:shadow-[0_3px_0_0_#D6F45A]"
          />
        </div>
      </div>

      <div className="rounded-[2rem] bg-white dark:bg-[#111A2E] border-2 border-[#102B69] dark:border-[#D6F45A] bento-shadow overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#EAF1FF] dark:bg-[#0B1222] border-b-2 border-[#102B69] dark:border-[#D6F45A]/50 text-xs font-extrabold text-[#102B69] dark:text-[#D6F45A] uppercase">
            <tr>
              <th className="p-4">{t("master.colUser")}</th>
              <th className="p-4">Role</th>
              <th className="p-4">{t("master.colJoined")}</th>
              <th className="p-4 text-right">Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800">
            {filtered.map((u) => (
              <tr key={u.id} className="hover:bg-[#F5F7FC] dark:hover:bg-slate-800/40">
                <td className="p-4">
                  <p className="font-extrabold text-[#102B69] dark:text-white">{u.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{u.email}</p>
                </td>
                <td className="p-4">
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u, e.target.value)}
                    className="px-3.5 py-1.5 rounded-full bg-[#EAF1FF] dark:bg-[#090F1E] border-2 border-[#102B69] dark:border-[#D6F45A] text-[#102B69] dark:text-[#D6F45A] text-xs font-extrabold focus:outline-none"
                  >
                    <option value="student">student</option>
                    <option value="event_admin">event_admin</option>
                    <option value="super_admin">super_admin</option>
                  </select>
                </td>
                <td className="p-4 text-xs text-slate-600 dark:text-slate-400">
                  {formatDateWITA(u.created_at)}
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => setSelectedUser(u)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#090F1E] border-2 border-[#102B69] dark:border-[#D6F45A] text-xs font-extrabold text-[#102B69] dark:text-[#D6F45A] hover:bg-[#D6F45A] hover:text-[#102B69] transition"
                  >
                    <Eye className="w-3.5 h-3.5" /> Detail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-[#102B69]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111A2E] border-2 border-[#102B69] dark:border-[#D6F45A] bento-shadow rounded-3xl max-w-md w-full p-6 space-y-3">
            <h3 className="font-display font-extrabold text-lg text-[#102B69] dark:text-white">
              {t("master.userDetails")}
            </h3>
            <div className="rounded-2xl bg-[#F5F7FC] dark:bg-[#090F1E] border border-slate-200 dark:border-slate-800 p-4 space-y-2 text-sm">
              <p><strong>{t("auth.fullNameLabel")}:</strong> {selectedUser.name}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Role:</strong> {selectedUser.role}</p>
              {selectedUser.nim && <p><strong>NIM:</strong> {selectedUser.nim}</p>}
              {selectedUser.organization && (
                <p><strong>{t("admin.orgLabel")}:</strong> {selectedUser.organization}</p>
              )}
            </div>
            <button
              onClick={() => setSelectedUser(null)}
              className="w-full py-2.5 rounded-full bg-[#102B69] dark:bg-[#D6F45A] text-[#D6F45A] dark:text-[#102B69] text-xs font-extrabold mt-2"
            >
              {t("common.close")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
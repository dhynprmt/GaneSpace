import { useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Calendar, Headphones, Home, LayoutDashboard, LogOut, Menu, Plus, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import ThemeToggle from "../components/ui/ThemeToggle";
import LanguageToggle from "../components/ui/LanguageToggle";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const ADMIN_LINKS = [
    { to: "/admin/dashboard", label: t("student.dashboard"), Icon: LayoutDashboard },
    { to: "/admin/events", label: t("admin.manageEvents"), Icon: Calendar },
    { to: "/admin/events/new", label: t("admin.createEvent"), Icon: Plus },
  ];

  const currentTitle = pathname.includes("/new")
    ? t("admin.createEventFull")
    : pathname.includes("/participants")
      ? t("admin.participants")
      : pathname.includes("/edit")
        ? t("admin.editEvent")
        : pathname.includes("/events")
          ? t("admin.manageEvents")
          : t("admin.dashboardTitle");

  const navCls = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-extrabold border-2 transition ${
      isActive
        ? "bg-[#D6F45A] text-[#102B69] border-[#102B69] shadow-[0_3px_0_0_#102B69]"
        : "bg-transparent text-slate-600 dark:text-slate-300 border-transparent hover:bg-[#EAF1FF] dark:hover:bg-slate-800 hover:text-[#102B69] dark:hover:text-white"
    }`;

  return (
    <div className="min-h-screen bg-[#F5F7FC] dark:bg-[#090F1E] bg-subtle-dots flex transition-colors">
      {open && (
        <div onClick={() => setOpen(false)} className="fixed inset-0 z-30 bg-[#102B69]/40 lg:hidden" />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-72 bg-white dark:bg-[#111A2E] border-r-2 border-[#102B69] dark:border-[#D6F45A]/40 flex flex-col justify-between p-5 transition-transform ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white border-2 border-[#102B69] p-1">
                <img src="/assets/logo-ganespace.png" alt="GANESPACE" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="font-display font-extrabold text-base text-[#102B69] dark:text-white block leading-none">
                  GANESPACE
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1649B8] dark:text-[#D6F45A]">
                  Ormawa Admin
                </span>
              </div>
            </Link>
            <button onClick={() => setOpen(false)} className="lg:hidden p-1.5 text-slate-500">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="rounded-2xl bg-[#EAF1FF] dark:bg-[#090F1E] border-2 border-[#102B69]/20 dark:border-slate-700 p-3.5">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#1649B8] dark:text-[#D6F45A]">
              {t("admin.orgLabel")}
            </p>
            <p className="text-xs font-extrabold text-[#102B69] dark:text-white mt-0.5 truncate">
              {user?.organization || "Ormawa"}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.name}</p>
          </div>

          <nav className="space-y-1.5">
            {ADMIN_LINKS.map(({ to, label, Icon }) => (
              <NavLink key={to} to={to} end={to === "/admin/events"} onClick={() => setOpen(false)} className={navCls}>
                <Icon className="w-4 h-4 shrink-0" /> {label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="space-y-2.5 pt-4 border-t border-slate-200 dark:border-slate-800">
          <a
            href="https://wa.me/6287701750377"
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-2xl bg-[#EAF1FF] dark:bg-[#090F1E] border-2 border-[#102B69] dark:border-[#D6F45A]/70 p-3 hover:bg-[#D6F45A] hover:text-[#102B69] dark:hover:bg-[#D6F45A] dark:hover:text-[#102B69] transition group"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-[#102B69] text-[#D6F45A] flex items-center justify-center shrink-0">
                <Headphones className="w-4 h-4" />
              </span>
              <div className="min-w-0 leading-tight">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#1649B8] dark:text-[#D6F45A] group-hover:text-[#102B69]">
                  {t("common.helpdeskTitle")}
                </p>
                <p className="text-xs font-mono font-extrabold text-[#102B69] dark:text-white group-hover:text-[#102B69] mt-0.5">
                  087701750377
                </p>
              </div>
            </div>
          </a>

          <Link
            to="/"
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white dark:bg-[#090F1E] border-2 border-[#102B69] dark:border-[#D6F45A]/60 text-xs font-extrabold text-[#102B69] dark:text-[#D6F45A] hover:bg-[#EAF1FF] transition"
          >
            <Home className="w-4 h-4" /> {t("common.publicPortal")}
          </Link>
          <button
            onClick={async () => {
              await logout();
              navigate("/login");
            }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-full text-xs font-extrabold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
          >
            <LogOut className="w-4 h-4" /> {t("common.logout")}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 bg-white/90 dark:bg-[#0B1222]/90 backdrop-blur-md border-b-2 border-[#102B69]/15 dark:border-slate-800 px-4 sm:px-8 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setOpen(true)} className="lg:hidden p-2 rounded-full bg-[#D6F45A] border-2 border-[#102B69] text-[#102B69] shrink-0">
              <Menu className="w-4 h-4" />
            </button>
            <h2 className="font-display font-extrabold text-base sm:text-lg text-[#102B69] dark:text-white truncate">
              {currentTitle}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <LanguageToggle />
            <ThemeToggle />
            <Link
              to="/admin/events/new"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#D6F45A] text-[#102B69] border-2 border-[#102B69] text-xs font-extrabold hover:brightness-95 transition"
            >
              <Plus className="w-4 h-4" /> {t("admin.newEventBtn")}
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
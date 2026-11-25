import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  Globe,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  Sparkles,
  Ticket,
  User,
  X,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import ThemeToggle from "../ui/ThemeToggle";

export default function PublicNavbar() {
  const { user, role, logout, unreadNotifications } = useAuth();
  const { lang, toggleLang, t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!profileOpen) return;
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === "Escape") setProfileOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [profileOpen]);

  const navClass = ({ isActive }) =>
    `px-3.5 py-1.5 rounded-full text-xs font-extrabold transition ${
      isActive
        ? "bg-[#102B69] text-[#D6F45A] dark:bg-[#D6F45A] dark:text-[#102B69]"
        : "text-[#102B69]/85 dark:text-slate-200 hover:bg-[#102B69]/10 dark:hover:bg-white/10"
    }`;

  const handleLogout = async () => {
    setProfileOpen(false);
    setMobileOpen(false);
    await logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 px-3 sm:px-6 pt-3 pb-2 bg-white/80 dark:bg-[#090F1E]/85 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto rounded-full bg-[#D6F45A] dark:bg-[#111A2E] border-2 border-[#102B69] dark:border-[#D6F45A] px-3 sm:px-5 h-14 flex items-center justify-between gap-2 shadow-[0_3px_0_0_#102B69] dark:shadow-[0_3px_0_0_#D6F45A]">
        <Link to="/" className="flex items-center gap-2 shrink-0 group">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border border-[#102B69]/20 p-1 flex items-center justify-center transition-transform duration-500 group-hover:rotate-12">
            <img
              src="/assets/logo-ganespace.png"
              alt="Logo GANESPACE"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="font-display font-extrabold text-[#102B69] dark:text-white tracking-tight text-sm sm:text-lg">
            GANESPACE
          </span>
        </Link>

        <nav aria-label="Navigasi utama" className="hidden lg:flex items-center gap-1">
          {(role === "guest" || role === "student") && (
            <>
              <NavLink to="/" end className={navClass}>{t("nav_home")}</NavLink>
              <NavLink to="/events" end className={navClass}>{t("nav_explore")}</NavLink>
              <NavLink to="/events/academic" className={navClass}>{t("nav_academic")}</NavLink>
              <NavLink to="/events/non-academic" className={navClass}>{t("nav_non_academic")}</NavLink>
            </>
          )}

          {role === "student" && (
            <>
              <NavLink to="/student/registrations" className={navClass}>{t("nav_bookings")}</NavLink>
              <NavLink
                to="/student/ai"
                className="ml-1 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1649B8] text-white text-xs font-extrabold hover:bg-[#102B69] transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#D6F45A]" /> GANEAI
              </NavLink>
            </>
          )}

          {role === "event_admin" && (
            <>
              <NavLink to="/admin/dashboard" className={navClass}>Dashboard</NavLink>
              <NavLink to="/admin/events" end className={navClass}>Events</NavLink>
              <NavLink to="/events" end className={navClass}>{t("nav_explore")}</NavLink>
            </>
          )}

          {role === "super_admin" && (
            <>
              <NavLink to="/master/dashboard" className={navClass}>Master Panel</NavLink>
              <NavLink to="/master/moderation" className={navClass}>Moderation</NavLink>
              <NavLink to="/master/student-verifications" className={navClass}>Verifications</NavLink>
              <NavLink to="/events" end className={navClass}>{t("nav_explore")}</NavLink>
            </>
          )}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={toggleLang}
            aria-label="Ganti bahasa"
            className="inline-flex items-center gap-1 h-9 px-2.5 sm:px-3 rounded-full bg-white dark:bg-[#090F1E] border-2 border-[#102B69] dark:border-[#D6F45A]/60 text-[11px] font-extrabold text-[#102B69] dark:text-[#D6F45A] hover:scale-105 transition"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{lang.toUpperCase()}</span>
          </button>

          <ThemeToggle />

          <div className="hidden lg:flex items-center gap-2 ml-1">
            {role === "guest" ? (
              <>
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-full text-[#102B69] dark:text-white text-xs font-extrabold hover:bg-[#102B69]/10 dark:hover:bg-white/10 transition"
                >
                  {t("nav_login")}
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-full bg-[#102B69] dark:bg-[#D6F45A] text-white dark:text-[#102B69] text-xs font-extrabold hover:opacity-90 transition"
                >
                  {t("nav_register")}
                </Link>
              </>
            ) : (
              <div ref={profileRef} className="flex items-center gap-2 relative">
                {role === "student" && (
                  <Link
                    to="/student/notifications"
                    aria-label="Notifikasi"
                    className="relative p-2 rounded-full bg-white dark:bg-[#090F1E] border border-[#102B69]/25 dark:border-slate-700 text-[#102B69] dark:text-white"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadNotifications > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-[#1649B8] text-white text-[10px] font-extrabold flex items-center justify-center">
                        {unreadNotifications}
                      </span>
                    )}
                  </Link>
                )}

                <button
                  type="button"
                  aria-expanded={profileOpen}
                  aria-haspopup="menu"
                  onClick={() => setProfileOpen((v) => !v)}
                  className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full bg-[#102B69] dark:bg-[#1649B8] text-white hover:opacity-95 transition"
                >
                  <span className="w-6 h-6 rounded-full bg-[#D6F45A] text-[#102B69] font-extrabold text-xs flex items-center justify-center">
                    {user?.name?.charAt(0) || "G"}
                  </span>
                  <span className="text-xs font-bold max-w-[100px] truncate">{user?.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#D6F45A]" />
                </button>

                {profileOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-12 w-60 rounded-3xl bg-white dark:bg-[#111A2E] border-2 border-[#102B69] dark:border-[#D6F45A] shadow-[0_6px_0_0_#102B69] dark:shadow-[0_6px_0_0_#D6F45A] p-2 text-[#172033] dark:text-slate-100"
                  >
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-extrabold text-[#102B69] dark:text-white truncate">{user?.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                    </div>

                    {role === "student" && (
                      <>
                        <Link to="/student/dashboard" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl hover:bg-[#EAF1FF] dark:hover:bg-slate-800">
                          <LayoutDashboard className="w-4 h-4 text-[#1649B8] dark:text-[#D6F45A]" /> Student Dashboard
                        </Link>
                        <Link to="/student/registrations" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl hover:bg-[#EAF1FF] dark:hover:bg-slate-800">
                          <Ticket className="w-4 h-4 text-[#1649B8] dark:text-[#D6F45A]" /> {t("nav_bookings")}
                        </Link>
                        <Link to="/student/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl hover:bg-[#EAF1FF] dark:hover:bg-slate-800">
                          <User className="w-4 h-4 text-[#1649B8] dark:text-[#D6F45A]" /> Profile
                        </Link>
                      </>
                    )}

                    {role === "event_admin" && (
                      <Link to="/admin/dashboard" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl hover:bg-[#EAF1FF] dark:hover:bg-slate-800">
                        <LayoutDashboard className="w-4 h-4 text-[#1649B8] dark:text-[#D6F45A]" /> Event Admin Panel
                      </Link>
                    )}

                    {role === "super_admin" && (
                      <Link to="/master/dashboard" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl hover:bg-[#EAF1FF] dark:hover:bg-slate-800">
                        <ShieldCheck className="w-4 h-4 text-[#1649B8] dark:text-[#D6F45A]" /> UPA TIK Master Panel
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-extrabold text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 mt-1"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="lg:hidden p-2 rounded-full bg-[#102B69] dark:bg-[#D6F45A] text-[#D6F45A] dark:text-[#102B69]"
            aria-label="Buka menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden max-w-7xl mx-auto mt-2.5 rounded-3xl bg-white dark:bg-[#111A2E] border-2 border-[#102B69] dark:border-[#D6F45A] shadow-[0_6px_0_0_#102B69] dark:shadow-[0_6px_0_0_#D6F45A] p-5 space-y-2">
          <Link to="/" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-xl text-sm font-extrabold text-[#102B69] dark:text-white hover:bg-[#EAF1FF] dark:hover:bg-slate-800">
            {t("nav_home")}
          </Link>
          <Link to="/events" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-[#EAF1FF] dark:hover:bg-slate-800">
            {t("nav_explore")}
          </Link>
          <Link to="/events/academic" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-[#EAF1FF] dark:hover:bg-slate-800">
            {t("nav_academic")}
          </Link>
          <Link to="/events/non-academic" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-[#EAF1FF] dark:hover:bg-slate-800">
            {t("nav_non_academic")}
          </Link>

          {role === "student" && (
            <>
              <Link to="/student/dashboard" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200">
                Student Dashboard
              </Link>
              <Link to="/student/ai" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-xl text-sm font-extrabold text-[#1649B8] dark:text-[#D6F45A]">
                GANEAI Assistant
              </Link>
            </>
          )}
          {role === "event_admin" && (
            <Link to="/admin/dashboard" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-xl text-sm font-extrabold text-[#1649B8] dark:text-[#D6F45A]">
              Event Admin Panel
            </Link>
          )}
          {role === "super_admin" && (
            <Link to="/master/dashboard" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-xl text-sm font-extrabold text-[#1649B8] dark:text-[#D6F45A]">
              UPA TIK Master Panel
            </Link>
          )}

          <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800">
            {role === "guest" ? (
              <div className="grid grid-cols-2 gap-2.5">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="text-center py-2.5 rounded-full border-2 border-[#102B69] dark:border-[#D6F45A] text-[#102B69] dark:text-white text-xs font-extrabold">
                  {t("nav_login")}
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="text-center py-2.5 rounded-full bg-[#102B69] dark:bg-[#D6F45A] text-[#D6F45A] dark:text-[#102B69] text-xs font-extrabold">
                  {t("nav_register")}
                </Link>
              </div>
            ) : (
              <button onClick={handleLogout} className="w-full py-2.5 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-extrabold">
                Logout ({user?.name})
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
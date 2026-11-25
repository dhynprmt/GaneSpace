import { Outlet } from "react-router-dom";
import PublicNavbar from "../components/layout/PublicNavbar";
import Footer from "../components/layout/Footer";

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#090F1E] text-[#172033] dark:text-slate-100 transition-colors duration-300">
      <PublicNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
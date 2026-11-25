import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Calendar, GraduationCap, Sparkles } from "lucide-react";
import { RotatingShape } from "../ui/MotionPrimitives";
import { useLanguage } from "../../contexts/LanguageContext";

export default function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 pt-3 pb-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <div className="lg:col-span-6 relative rounded-[2rem] sm:rounded-[2.25rem] bg-[#1649B8] dark:bg-[#132B66] text-white border-2 border-[#102B69] dark:border-[#D6F45A] p-6 sm:p-10 flex flex-col justify-between overflow-hidden bento-shadow">
          <div className="absolute -right-8 -bottom-8 opacity-25 pointer-events-none">
            <RotatingShape variant="flower" className="w-36 h-36 sm:w-44 sm:h-44 text-[#D6F45A]" />
          </div>

          <div className="relative z-10 space-y-4 sm:space-y-5">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/15 border border-white/25 text-[11px] font-bold tracking-wider uppercase text-[#D6F45A]">
              <Sparkles className="w-3.5 h-3.5" /> Undiksha Campus Hub
            </span>

            <h1 className="font-display font-extrabold text-3xl sm:text-5xl xl:text-[3.4rem] leading-[1.05] tracking-tight uppercase">
              YOUR CAMPUS.
              <br />
              <span className="text-[#D6F45A]">YOUR EVENTS.</span>
              <br />
              ONE SPACE.
            </h1>

            <p className="text-xs sm:text-sm text-[#EAF1FF]/90 max-w-md font-medium leading-relaxed">
              {t("home.heroDesc")}
            </p>
          </div>

          <div className="relative z-10 pt-7 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
            <Link
              to="/events"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#D6F45A] text-[#102B69] border-2 border-[#102B69] font-display font-extrabold text-xs sm:text-sm tracking-wide hover:scale-[1.02] transition"
            >
              EXPLORE EVENTS <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/events/academic?tab=seminar-proposal"
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-[#102B69] text-white border border-white/20 font-display font-bold text-xs sm:text-sm hover:bg-[#0B1F4D] transition"
            >
              <GraduationCap className="w-4 h-4 text-[#D6F45A]" /> Sempro
            </Link>
          </div>
        </div>

        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          <Link
            to="/events/academic?tab=seminar-proposal"
            className="group rounded-[2rem] bg-[#102B69] dark:bg-[#111A2E] text-white border-2 border-[#102B69] dark:border-[#D6F45A]/80 p-5 sm:p-6 flex flex-col justify-between bento-shadow-hover"
          >
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full bg-white/15 text-[10px] font-bold uppercase text-[#D6F45A]">
                {t("home.requiredTrack")}
              </span>
              <ArrowUpRight className="w-5 h-5 text-[#D6F45A] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
            </div>
            <div className="mt-5">
              <p className="font-display font-extrabold text-3xl text-[#D6F45A]">10x</p>
              <p className="text-xs font-semibold text-[#EAF1FF] mt-1">
                {t("home.openSempro")}
              </p>
            </div>
          </Link>

          <div className="relative rounded-[2rem] bg-[#D6F45A] text-[#102B69] border-2 border-[#102B69] p-5 sm:p-6 flex flex-col justify-between overflow-hidden">
            <div className="flex justify-end">
              <RotatingShape variant="asterisk" className="w-11 h-11 text-[#1649B8]" />
            </div>
            <div className="mt-3">
              <p className="font-display font-extrabold text-base sm:text-lg leading-tight">
                {t("home.fastBooking")}
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 relative rounded-[2rem] sm:rounded-[2.25rem] bg-[#EAF1FF] dark:bg-[#111A2E] border-2 border-[#102B69] dark:border-[#D6F45A]/80 p-5 sm:p-6 flex flex-col justify-between overflow-hidden bento-shadow">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-[#090F1E] border border-[#102B69]/20 dark:border-slate-700 text-[11px] font-extrabold text-[#102B69] dark:text-[#D6F45A]">
              <Calendar className="w-3.5 h-3.5 text-[#1649B8] dark:text-[#D6F45A]" /> WITA Live
            </span>
            <RotatingShape variant="star" reverse className="w-8 h-8 text-[#1685F5] dark:text-[#D6F45A]" />
          </div>

          <div className="my-5 flex flex-col items-center text-center animate-float-gentle">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[1.75rem] bg-white border-2 border-[#102B69] p-1.5 shadow-[0_4px_0_0_#102B69]">
              <img
                src="/assets/ganeai-mascot.jpeg"
                alt="GANEAI Companion"
                className="w-full h-full rounded-2xl object-cover"
              />
            </div>
            <p className="font-display font-extrabold text-lg text-[#102B69] dark:text-white mt-3.5">
              Meet GANEAI
            </p>
            <p className="text-xs font-semibold text-[#1649B8] dark:text-blue-300">
              Smart Campus Assistant
            </p>
          </div>

          <Link
            to="/student/ai"
            className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-full bg-white dark:bg-[#D6F45A] border-2 border-[#102B69] text-xs font-extrabold text-[#102B69] hover:bg-[#102B69] hover:text-[#D6F45A] transition"
          >
            {t("home.askGaneai")} <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
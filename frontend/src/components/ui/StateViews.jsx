import { RefreshCw } from "lucide-react";
import BentoIcon from "./BentoIcons";

export function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-white dark:bg-[#090F1E] transition-colors">
      <div className="flex flex-col items-center gap-3">
        <div className="w-11 h-11 rounded-full border-4 border-[#EAF1FF] dark:border-slate-800 border-t-[#1649B8] dark:border-t-[#D6F45A] animate-spin" />
        <p className="text-xs font-extrabold text-[#102B69] dark:text-[#D6F45A] uppercase tracking-wider">
          Memuat GANESPACE...
        </p>
      </div>
    </div>
  );
}

export function EventCardSkeleton() {
  return (
    <div className="rounded-[1.75rem] bg-white dark:bg-[#111A2E] border-2 border-[#102B69]/20 dark:border-slate-800 overflow-hidden animate-pulse">
      <div className="aspect-[4/5] bg-slate-200/80 dark:bg-slate-800" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-1/3 bg-slate-200 dark:bg-slate-800 rounded-full" />
        <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-800 rounded-full" />
        <div className="h-3 w-2/3 bg-slate-200 dark:bg-slate-800 rounded-full" />
      </div>
    </div>
  );
}

export function EmptyState({ title, description, action = null }) {
  return (
    <div className="rounded-[2rem] bg-white dark:bg-[#111A2E] border-2 border-[#102B69] dark:border-[#D6F45A]/80 bento-shadow p-8 sm:p-10 text-center space-y-3 max-w-lg mx-auto">
      <div className="flex justify-center">
        <BentoIcon name="calendar" tone="lime" />
      </div>
      <h3 className="font-display font-extrabold text-lg text-[#102B69] dark:text-white">
        {title}
      </h3>
      {description && (
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry = null }) {
  return (
    <div className="rounded-[2rem] bg-[#FFF1F2] dark:bg-[#2A1219] border-2 border-[#FF5A5F] p-6 text-center space-y-3 max-w-lg mx-auto">
      <div className="flex justify-center">
        <BentoIcon name="alert" tone="danger" size="sm" />
      </div>
      <p className="text-sm font-bold text-[#102B69] dark:text-white">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#102B69] dark:bg-[#D6F45A] text-[#D6F45A] dark:text-[#102B69] text-xs font-extrabold"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Coba Lagi
        </button>
      )}
    </div>
  );
}
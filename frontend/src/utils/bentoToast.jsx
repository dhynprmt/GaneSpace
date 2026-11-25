import toast from "react-hot-toast";
import { Check, Info, Trash2, X } from "lucide-react";

function renderBentoToast({ title, description, variant = "success" }) {
  const styles = {
    success: {
      badge: "bg-[#D6F45A] text-[#102B69]",
      Icon: Check,
    },
    deleted: {
      badge: "bg-[#FF5A5F] text-white",
      Icon: Trash2,
    },
    error: {
      badge: "bg-[#FF5A5F] text-white",
      Icon: X,
    },
    info: {
      badge: "bg-[#1649B8] text-white",
      Icon: Info,
    },
  };

  const { badge, Icon } = styles[variant] || styles.success;

  toast.custom(
    (t) => (
      <div
        role="status"
        className={`max-w-sm w-full pointer-events-auto rounded-2xl bg-white dark:bg-[#111A2E] border-2 border-[#102B69] dark:border-[#D6F45A] shadow-[4px_4px_0_0_#102B69] dark:shadow-[4px_4px_0_0_#D6F45A] p-3.5 flex items-start gap-3 transition-all duration-300 ${
          t.visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-2 scale-95"
        }`}
      >
        <span
          className={`w-8 h-8 rounded-xl border-2 border-[#102B69] flex items-center justify-center shrink-0 mt-0.5 ${badge}`}
        >
          <Icon className="w-4 h-4" strokeWidth={2.8} />
        </span>

        <div className="flex-1 min-w-0">
          <p className="font-display font-extrabold text-xs text-[#102B69] dark:text-white leading-snug">
            {title}
          </p>
          {description && (
            <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">
              {description}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => toast.dismiss(t.id)}
          aria-label="Tutup pemberitahuan"
          className="p-1 rounded-lg text-slate-400 hover:text-[#102B69] dark:hover:text-[#D6F45A] transition"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    ),
    { duration: 3500 }
  );
}

export const bentoToast = {
  success: (title, description = "") =>
    renderBentoToast({ title, description, variant: "success" }),
  updated: (title, description = "") =>
    renderBentoToast({ title, description, variant: "info" }),
  deleted: (title, description = "") =>
    renderBentoToast({ title, description, variant: "deleted" }),
  error: (title, description = "") =>
    renderBentoToast({ title, description, variant: "error" }),
};
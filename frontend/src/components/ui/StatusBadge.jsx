import { CheckCircle2, Clock, Users, Lock, Ban, FileEdit, EyeOff } from "lucide-react";

const STATUS_STYLES = {
  open: { label: "Open", cls: "bg-[#D6F45A] text-[#102B69] border-[#c2e43f]", Icon: CheckCircle2 },
  upcoming: { label: "Upcoming", cls: "bg-[#EAF1FF] text-[#1649B8] border-[#c9dcff]", Icon: Clock },
  full: { label: "Full", cls: "bg-amber-100 text-amber-900 border-amber-300", Icon: Users },
  closed: { label: "Closed", cls: "bg-slate-100 text-slate-600 border-slate-300", Icon: Lock },
  cancelled: { label: "Cancelled", cls: "bg-red-100 text-red-700 border-red-300", Icon: Ban },
  draft: { label: "Draft", cls: "bg-slate-100 text-slate-700 border-slate-300", Icon: FileEdit },
  published: { label: "Published", cls: "bg-[#D6F45A] text-[#102B69] border-[#c2e43f]", Icon: CheckCircle2 },
  unpublished: { label: "Unpublished", cls: "bg-amber-100 text-amber-900 border-amber-300", Icon: EyeOff },
  external: { label: "External", cls: "bg-[#EAF1FF] text-[#1649B8] border-[#c9dcff]", Icon: EyeOff },
};

export default function StatusBadge({ status = "open" }) {
  const cfg = STATUS_STYLES[status] || STATUS_STYLES.open;
  const Icon = cfg.Icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${cfg.cls}`}>
      <Icon className="w-3.5 h-3.5" />
      {cfg.label}
    </span>
  );
}

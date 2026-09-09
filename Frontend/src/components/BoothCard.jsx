import {
  DollarSign,
  Maximize2,
  CheckCircle,
  Layers,
  Sparkles
} from "lucide-react";

export const BoothCard = ({
  booth,
  onSelect,
  onReserve,
  isSelected = false,
  canReserve = false
}) => {
  const getStatusColor = () => {
    switch (booth.status) {
      case "available":
        return "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
      case "reserved":
        return "bg-teal-50 dark:bg-[#203748] text-[#1488A6] dark:text-[#38B2AC] border-[#1488A6]/30 dark:border-[#38B2AC]/40";
      case "booked":
        return "bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800";
      default:
        return "bg-slate-100 dark:bg-[#1A202C] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10";
    }
  };

  const getTierBadge = () => {
    switch (booth.tier) {
      case "platinum":
        return "bg-slate-900 text-[#38B2AC] dark:bg-[#203748] border-slate-700";
      case "gold":
        return "teal-badge";
      case "silver":
        return "bg-slate-100 dark:bg-[#1A202C] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10";
      default:
        return "bg-slate-100 dark:bg-[#1A202C] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10";
    }
  };

  return (
    <div
      onClick={() => onSelect && onSelect(booth)}
      className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
        isSelected
          ? "bg-teal-50/40 dark:bg-[#203748]/50 border-[#38B2AC] shadow-md ring-2 ring-[#38B2AC]/25"
          : "saas-card saas-card-hover"
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold font-mono text-[#1F2937] dark:text-[#F8FAFC]">
                Booth {booth.booth_number}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${getTierBadge()}`}>
                {booth.tier || "Standard"}
              </span>
            </div>
            <span className="text-xs text-[#6B7280] dark:text-[#CBD5E1]/70 flex items-center gap-1 mt-0.5">
              <Layers className="w-3 h-3 text-[#6B7280] dark:text-[#CBD5E1]/60" />
              {booth.hall || "Main Pavilion Hall"}
            </span>
          </div>

          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${getStatusColor()}`}>
            {booth.status}
          </span>
        </div>

        {booth.exhibitor_name ? (
          <div className="my-2 p-2.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10">
            <span className="text-[10px] font-mono uppercase font-bold text-[#6B7280] dark:text-[#CBD5E1]/60 block">Occupied by</span>
            <span className="text-xs font-semibold text-[#1488A6] dark:text-[#38B2AC] line-clamp-1">
              {booth.exhibitor_name}
            </span>
          </div>
        ) : (
          <div className="my-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Open for Booking</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 text-xs text-[#6B7280] dark:text-[#CBD5E1]/70 mt-3 pt-2 border-t border-[#E5E7EB] dark:border-white/10">
          <div className="flex items-center gap-1.5 font-mono">
            <Maximize2 className="w-3.5 h-3.5 text-[#6B7280] dark:text-[#CBD5E1]/60" />
            <span>{booth.dimensions || "10x10 ft"}</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[#1F2937] dark:text-[#F8FAFC]">
            <span className="font-bold">PKR {booth.price?.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {canReserve && booth.status === "available" && (
        <div className="mt-4 pt-3 border-t border-[#E5E7EB] dark:border-white/10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReserve && onReserve(booth._id);
            }}
            className="w-full py-2 btn-teal-primary text-xs font-bold transition-all shadow-xs cursor-pointer rounded-xl"
          >
            Lock Space
          </button>
        </div>
      )}
    </div>
  );
};

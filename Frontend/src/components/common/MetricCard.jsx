import { TrendingUp, TrendingDown, Minus, ArrowUpRight } from "lucide-react";

const colorMap = {
  teal: {
    bg: "bg-[#1488A6]",
    text: "text-[#1488A6] dark:text-[#38B2AC]",
    border: "border-[#1488A6]/30 dark:border-[#38B2AC]/40",
    lightBg: "bg-[#1488A6]/10 dark:bg-[#38B2AC]/15",
    stroke: "#38B2AC"
  },
  blue: {
    bg: "bg-[#1488A6]",
    text: "text-[#1488A6] dark:text-[#38B2AC]",
    border: "border-[#1488A6]/30 dark:border-[#38B2AC]/40",
    lightBg: "bg-[#1488A6]/10 dark:bg-[#38B2AC]/15",
    stroke: "#38B2AC"
  },
  cyan: {
    bg: "bg-[#1488A6]",
    text: "text-[#1488A6] dark:text-[#38B2AC]",
    border: "border-[#1488A6]/30 dark:border-[#38B2AC]/40",
    lightBg: "bg-[#1488A6]/10 dark:bg-[#38B2AC]/15",
    stroke: "#1488A6"
  },
  emerald: {
    bg: "bg-emerald-600",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-900/60",
    lightBg: "bg-emerald-50 dark:bg-emerald-950/60",
    stroke: "#10b981"
  },
  amber: {
    bg: "bg-[#1488A6]",
    text: "text-[#1488A6] dark:text-[#38B2AC]",
    border: "border-[#1488A6]/30 dark:border-[#38B2AC]/40",
    lightBg: "bg-[#1488A6]/10 dark:bg-[#38B2AC]/15",
    stroke: "#38B2AC"
  },
  gold: {
    bg: "bg-[#1488A6]",
    text: "text-[#1488A6] dark:text-[#38B2AC]",
    border: "border-[#1488A6]/30 dark:border-[#38B2AC]/40",
    lightBg: "bg-[#1488A6]/10 dark:bg-[#38B2AC]/15",
    stroke: "#38B2AC"
  },
  rose: {
    bg: "bg-rose-600",
    text: "text-rose-700 dark:text-rose-400",
    border: "border-rose-200 dark:border-rose-900/60",
    lightBg: "bg-rose-50 dark:bg-rose-950/60",
    stroke: "#ef4444"
  },
  slate: {
    bg: "bg-slate-700",
    text: "text-[#6B7280] dark:text-[#CBD5E1]",
    border: "border-[#E5E7EB] dark:border-white/10",
    lightBg: "bg-slate-100 dark:bg-[#203748]",
    stroke: "#64748b"
  },
  indigo: {
    bg: "bg-[#1488A6]",
    text: "text-[#1488A6] dark:text-[#38B2AC]",
    border: "border-[#1488A6]/30 dark:border-[#38B2AC]/40",
    lightBg: "bg-[#1488A6]/10 dark:bg-[#38B2AC]/15",
    stroke: "#38B2AC"
  },
  purple: {
    bg: "bg-[#1488A6]",
    text: "text-[#1488A6] dark:text-[#38B2AC]",
    border: "border-[#1488A6]/30 dark:border-[#38B2AC]/40",
    lightBg: "bg-[#1488A6]/10 dark:bg-[#38B2AC]/15",
    stroke: "#38B2AC"
  }
};

export const MetricCard = ({
  id,
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendDirection,
  color,
  accentColor,
  badge,
  actionLabel,
  onClick
}) => {
  const chosenColor = accentColor || color || "teal";
  const c = colorMap[chosenColor] || colorMap.teal;

  let trendVal = null;
  let trendLabel = null;
  let isPos = true;
  let isNeutral = false;

  if (trend !== undefined && trend !== null) {
    if (typeof trend === "object") {
      trendVal = trend.value ? String(trend.value) : null;
      trendLabel = trend.label ? String(trend.label) : null;
      if (trend.neutral) {
        isNeutral = true;
      } else if (trend.isPositive !== undefined) {
        isPos = Boolean(trend.isPositive);
      }
    } else {
      trendVal = String(trend);
      if (trendDirection === "down") {
        isPos = false;
      } else if (trendDirection === "neutral") {
        isNeutral = true;
      }
    }
  }

  return (
    <div
      id={id}
      onClick={onClick}
      className={`saas-card saas-card-hover rounded-2xl p-5 sm:p-6 relative overflow-hidden flex flex-col justify-between ${
        onClick ? "cursor-pointer group" : ""
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#6B7280] dark:text-[#CBD5E1]/70">
              {title}
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold font-heading text-[#1F2937] dark:text-[#F8FAFC] tracking-tight">
              {value}
            </div>
          </div>

          <div className={`w-10 h-10 rounded-xl ${c.lightBg} ${c.text} flex items-center justify-center border ${c.border} shrink-0`}>
            {Icon && <Icon className="w-5 h-5" />}
          </div>
        </div>

        {subtitle && (
          <p className="text-xs text-[#6B7280] dark:text-[#CBD5E1]/70 mt-2 line-clamp-1">
            {subtitle}
          </p>
        )}
      </div>

      <div className="pt-4 mt-3 border-t border-[#E5E7EB] dark:border-white/10 flex items-center justify-between text-xs gap-2">
        {trendVal ? (
          <div className="flex items-center gap-1 font-mono font-medium truncate">
            {isNeutral ? (
              <span className="text-slate-500 flex items-center gap-0.5 shrink-0">
                <Minus className="w-3.5 h-3.5" /> {trendVal}
              </span>
            ) : isPos ? (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 shrink-0">
                <TrendingUp className="w-3.5 h-3.5" /> {trendVal.startsWith("+") ? trendVal : `+${trendVal}`}
              </span>
            ) : (
              <span className="text-rose-600 dark:text-rose-400 flex items-center gap-0.5 shrink-0">
                <TrendingDown className="w-3.5 h-3.5" /> {trendVal.startsWith("-") ? trendVal : `-${trendVal}`}
              </span>
            )}
            {trendLabel && (
              <span className="text-[#6B7280] dark:text-[#CBD5E1]/60 text-[11px] truncate">
                {trendLabel}
              </span>
            )}
          </div>
        ) : badge ? (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold teal-badge">
            {badge}
          </span>
        ) : (
          <span className="text-[11px] font-mono text-[#6B7280] dark:text-[#CBD5E1]/60">Live Telemetry</span>
        )}

        {actionLabel && onClick ? (
          <span className="ml-auto flex items-center gap-0.5 text-xs font-semibold text-[#1488A6] dark:text-[#38B2AC] group-hover:underline shrink-0">
            {actionLabel}
            <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        ) : badge && trendVal ? (
          <span className="ml-auto px-2 py-0.5 rounded-md text-[10px] font-mono font-bold teal-badge shrink-0">
            {badge}
          </span>
        ) : null}
      </div>
    </div>
  );
};

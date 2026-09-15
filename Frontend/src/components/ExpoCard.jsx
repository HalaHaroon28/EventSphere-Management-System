import {
  Calendar,
  MapPin,
  Building2,
  Ticket,
  Briefcase,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { getExpoImage } from "../utils/expoImages";

export const ExpoCard = ({
  expo,
  onSelect,
  onRegisterPass,
  onApplyExhibitor,
  isRegistered = false,
  userRole = "attendee"
}) => {
  const bannerSrc = getExpoImage(expo);

  return (
    <div className="saas-card saas-card-hover rounded-2xl overflow-hidden flex flex-col justify-between group">
      <div>
        {/* Banner with overlay */}
        <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-slate-900 via-[#1488A6]/30 to-slate-950">
          <img
            src={bannerSrc}
            alt={expo.title}
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80";
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Category badge */}
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-950/80 backdrop-blur-md text-[#38B2AC] border border-[#38B2AC]/40">
              {expo.category || "Exhibition"}
            </span>
          </div>

          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <span
              className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-md ${
                expo.status === "published"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : expo.status === "ongoing"
                  ? "bg-[#38B2AC]/20 text-teal-200 border border-[#38B2AC]/40 animate-pulse"
                  : "bg-slate-800/80 text-slate-300 border border-slate-700"
              }`}
            >
              {expo.status || "Upcoming"}
            </span>
          </div>

          {/* Date Stamp */}
          <div className="absolute bottom-3 left-3 text-xs font-mono font-medium text-slate-200 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#38B2AC]" />
            <span>
              {new Date(expo.date).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric"
              })}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          <h3
            onClick={() => onSelect(expo._id)}
            className="text-base font-bold font-heading text-[#1F2937] dark:text-[#F8FAFC] group-hover:text-[#1488A6] dark:group-hover:text-[#38B2AC] transition-colors line-clamp-1 cursor-pointer"
          >
            {expo.title}
          </h3>

          <p className="text-xs text-[#6B7280] dark:text-[#CBD5E1] line-clamp-2 leading-relaxed">
            {expo.description}
          </p>

          <div className="pt-2 border-t border-[#E5E7EB] dark:border-white/10 space-y-1.5 text-xs text-[#6B7280] dark:text-[#CBD5E1]/70">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#38B2AC] shrink-0" />
              <span className="truncate">{expo.venue}, {expo.location}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#38B2AC] shrink-0" />
              <span className="font-mono text-[#1F2937] dark:text-[#CBD5E1]">{expo.total_booths || 40} Exhibition Booths</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 pt-0 flex items-center justify-between border-t border-[#E5E7EB] dark:border-white/10 mt-auto">
        <div>
          <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Free Entry
          </span>
        </div>

        <div className="flex items-center gap-2">
          {userRole === "exhibitor" ? (
            <button
              onClick={() => onApplyExhibitor && onApplyExhibitor(expo._id)}
              className="px-3.5 py-2 rounded-xl btn-teal-primary text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Apply for Space</span>
            </button>
          ) : isRegistered ? (
            <span className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Pass Active</span>
            </span>
          ) : (
            <button
              onClick={() => onRegisterPass && onRegisterPass(expo._id)}
              className="px-3.5 py-2 rounded-xl btn-teal-primary text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Get Pass</span>
            </button>
          )}

          <button
            onClick={() => onSelect(expo._id)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#203748] dark:hover:bg-[#203748]/80 text-[#1F2937] dark:text-[#CBD5E1] transition-colors cursor-pointer border border-[#E5E7EB] dark:border-white/10"
            title="View Details"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

import { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  Search,
  Calendar,
  MapPin,
  Ticket,
  Briefcase,
  QrCode,
  CheckCircle2
} from "lucide-react";

export const ExpoListing = ({
  onSelectExpo,
  onRegisterPass,
  onApplyExhibitor
}) => {
  const {
    expos = [],
    booths = [],
    currentUser,
    currentRole,
    registrations = [],
    setActivePassId
  } = useApp();

  const [searchQuery, setSearchQuery] = useState("");

  const formatDate = (dStr) => {
    if (!dStr) return "";
    const d = new Date(dStr);
    return isNaN(d.getTime()) ? "" : d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const formatDateWithYear = (dStr) => {
    if (!dStr) return "";
    const d = new Date(dStr);
    return isNaN(d.getTime()) ? "" : d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
  };

  const currentUserId = String(currentUser?._id || currentUser?.user_id || "");

  const filteredExpos = (expos || []).filter((expo) => {
    if (!expo) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (expo.title || "").toLowerCase().includes(q);
      const matchLoc = (expo.location || "").toLowerCase().includes(q);
      const matchTheme = (expo.theme || "").toLowerCase().includes(q);
      const matchCat = (expo.category || "").toLowerCase().includes(q);
      if (!matchTitle && !matchLoc && !matchTheme && !matchCat) return false;
    }
    return true;
  });

  return (
    <div id="expo-listing-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-body">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E5E7EB] dark:border-white/10 pb-6">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#1488A6] dark:text-[#38B2AC]">
            Discovery & Summits
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1F2937] dark:text-[#F8FAFC] tracking-tight mt-1 font-heading">
            Browse Global Expos & Summits
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#CBD5E1]/80 mt-1.5 max-w-xl leading-relaxed">
            Explore industry exhibitions, reserve attendee passes, or apply for verified exhibitor booths with live coordinate mapping.
          </p>
        </div>

        {/* Count Pill */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#1A202C] p-1.5 rounded-2xl text-xs self-start md:self-auto border border-[#E5E7EB] dark:border-white/10">
          <span className="px-3.5 py-1.5 rounded-xl font-bold bg-white dark:bg-[#203748] text-[#1488A6] dark:text-[#38B2AC] shadow-xs border border-[#E5E7EB] dark:border-white/10">
            All Expos ({expos.length})
          </span>
        </div>
      </div>

      {/* Filter Bar: Clean Search Bar */}
      <div className="bg-white dark:bg-[#1A202C] p-4 rounded-2xl border border-[#E5E7EB] dark:border-white/10 shadow-xs flex items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, city, category, topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-[#0F172A]/80 border border-[#E5E7EB] dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#38B2AC] text-[#1F2937] dark:text-white"
          />
        </div>
      </div>

      {/* Expo Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExpos.length === 0 ? (
          <div className="col-span-full py-16 text-center space-y-3 saas-card rounded-3xl p-8">
            <Calendar className="w-12 h-12 text-[#6B7280] dark:text-[#CBD5E1]/40 mx-auto" />
            <h3 className="text-base sm:text-lg font-bold text-[#1F2937] dark:text-[#F8FAFC]">
              No Expos Found
            </h3>
            <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#CBD5E1]/70 max-w-md mx-auto">
              Try adjusting your search query to explore available summits and exhibitions.
            </p>
          </div>
        ) : (
          filteredExpos.map((expo) => {
            const expoId = expo._id || expo.id;
            const expoBooths = (booths || []).filter((b) => b && (b.expo_id === expo._id || b.expo_id === expo.id));
            const availableCount = expoBooths.filter((b) => b.status === "available").length;
            const startStr = formatDate(expo.date);
            const endStr = formatDateWithYear(expo.endDate || expo.date);
            const dateLabel = startStr && endStr ? (startStr === endStr ? startStr : `${startStr} – ${endStr}`) : startStr || "TBA";

            // Check if current user is registered for this expo
            const userReg = (registrations || []).find((r) => {
              const rExpoId = typeof r.expo_id === "object" ? r.expo_id?._id : r.expo_id;
              const rUserId = String(typeof r.user_id === "object" ? r.user_id?._id : r.user_id || "");
              const rEmail = (r.user_email || r.email || "").toLowerCase();
              const uEmail = (currentUser?.email || "").toLowerCase();
              const matchExpo = String(rExpoId) === String(expoId);
              const matchUser = (rUserId && rUserId === currentUserId) || (uEmail && rEmail === uEmail);
              return matchExpo && matchUser;
            });

            const isRegistered = !!userReg;

            const bannerSrc = expo.banner_image
              ? expo.banner_image.startsWith("http") || expo.banner_image.startsWith("data:")
                ? expo.banner_image
                : `http://localhost:5000${expo.banner_image.startsWith("/") ? "" : "/"}${expo.banner_image}`
              : null;

            return (
              <div
                key={expoId}
                className="saas-card saas-card-hover rounded-3xl overflow-hidden flex flex-col justify-between group"
              >
                {/* Card Banner Image */}
                <div>
                  <div className="relative h-48 bg-gradient-to-br from-slate-900 via-[#1488A6]/30 to-slate-950 overflow-hidden">
                    {bannerSrc ? (
                      <img
                        src={bannerSrc}
                        alt={expo.title || "Expo"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-slate-900 via-[#1488A6]/20 to-[#203748] flex items-center justify-center p-6 text-center">
                        <span className="text-sm font-bold text-[#38B2AC]/80 font-heading tracking-wider uppercase">
                          {expo.category || "Convention Summit"}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent" />

                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-950/80 backdrop-blur-md text-[#38B2AC] border border-[#38B2AC]/40">
                        {expo.category || "General"}
                      </span>
                      {isRegistered && (
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Pass Active
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <div className="flex items-center gap-2 text-[11px] text-slate-300 mb-1">
                        <Calendar className="w-3.5 h-3.5 text-[#38B2AC]" />
                        <span>{dateLabel}</span>
                      </div>
                      <h3 className="text-base font-bold text-white tracking-tight line-clamp-1 leading-snug font-heading">
                        {expo.title || "Untitled Expo"}
                      </h3>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-4">
                    <div className="space-y-2.5">
                      <p className="text-xs text-[#6B7280] dark:text-[#CBD5E1]/80 line-clamp-2 leading-relaxed">
                        {expo.description || "No description provided."}
                      </p>

                      <div className="flex items-center gap-2 text-xs text-[#6B7280] dark:text-[#CBD5E1]/70">
                        <MapPin className="w-3.5 h-3.5 text-[#1488A6] dark:text-[#38B2AC] shrink-0" />
                        <span className="truncate">{expo.location || expo.venue || expo.city || "Apex Convention Center"}</span>
                      </div>
                    </div>

                    {/* Meta stats bar */}
                    <div className="pt-3 border-t border-[#E5E7EB] dark:border-white/10 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold font-mono text-[#6B7280] dark:text-[#CBD5E1]/60 block">
                          Available Booths
                        </span>
                        <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                          {availableCount > 0 ? `${availableCount} Open` : "Fully Booked"}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold font-mono text-[#6B7280] dark:text-[#CBD5E1]/60 block">
                          Access Tier
                        </span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          Free Entry Pass
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onSelectExpo(expoId)}
                    className="w-full py-2 px-3 rounded-xl border border-[#E5E7EB] dark:border-white/10 hover:bg-slate-50 dark:hover:bg-[#203748] text-[#1F2937] dark:text-[#CBD5E1] text-xs font-bold transition-colors text-center cursor-pointer"
                  >
                    View Details
                  </button>

                  {currentUser?.role === "exhibitor" || currentRole === "exhibitor" ? (
                    <button
                      onClick={() => onApplyExhibitor ? onApplyExhibitor(expoId) : onSelectExpo(expoId)}
                      className="w-full py-2 px-3 rounded-xl btn-teal-primary text-white text-xs font-bold transition-colors text-center flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Briefcase className="w-3.5 h-3.5" /> Exhibit
                    </button>
                  ) : isRegistered ? (
                    <button
                      onClick={() => setActivePassId(userReg._id || userReg.id)}
                      className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors text-center flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                      title="Display Turnstile QR Code"
                    >
                      <QrCode className="w-3.5 h-3.5" /> View QR Pass
                    </button>
                  ) : (
                    <button
                      onClick={() => onRegisterPass && onRegisterPass(expoId)}
                      className="w-full py-2 px-3 rounded-xl btn-teal-primary text-white text-xs font-bold transition-colors text-center flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Ticket className="w-3.5 h-3.5" /> Get Pass
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ExpoListing;

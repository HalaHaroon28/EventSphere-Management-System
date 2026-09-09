import { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  Search,
  Calendar,
  MapPin,
  Ticket,
  Briefcase
} from "lucide-react";

export const ExpoListing = ({
  onSelectExpo,
  onRegisterPass,
  onApplyExhibitor
}) => {
  const { expos = [], booths = [], currentUser, currentRole } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const categories = ["All", "Technology & AI", "Clean Energy & Climate", "Healthcare & Biotech"];

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

  const filteredExpos = (expos || []).filter((expo) => {
    if (!expo) return false;
    if (selectedCategory !== "All" && expo.category !== selectedCategory) return false;
    if (selectedStatus !== "all" && expo.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (expo.title || "").toLowerCase().includes(q);
      const matchLoc = (expo.location || "").toLowerCase().includes(q);
      const matchTheme = (expo.theme || "").toLowerCase().includes(q);
      if (!matchTitle && !matchLoc && !matchTheme) return false;
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

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#1A202C] p-1.5 rounded-2xl text-xs self-start md:self-auto border border-[#E5E7EB] dark:border-white/10">
          <button
            onClick={() => setSelectedStatus("all")}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${selectedStatus === "all"
              ? "bg-white dark:bg-[#203748] text-[#1488A6] dark:text-[#38B2AC] shadow-xs border border-[#E5E7EB] dark:border-white/10"
              : "text-[#6B7280] dark:text-[#CBD5E1]/70 hover:text-[#1F2937] dark:hover:text-white"
              }`}
          >
            All Status ({expos.length})
          </button>
          <button
            onClick={() => setSelectedStatus("upcoming")}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${selectedStatus === "upcoming"
              ? "bg-white dark:bg-[#203748] text-[#1488A6] dark:text-[#38B2AC] shadow-xs border border-[#E5E7EB] dark:border-white/10"
              : "text-[#6B7280] dark:text-[#CBD5E1]/70 hover:text-[#1F2937] dark:hover:text-white"
              }`}
          >
            Upcoming ({expos.filter((e) => e && e.status === "upcoming").length})
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 saas-card p-4 rounded-2xl">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, city, topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-[#0F172A]/80 border border-[#E5E7EB] dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1488A6] text-[#1F2937] dark:text-white"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${selectedCategory === cat
                ? "btn-teal-primary text-white shadow-xs"
                : "bg-slate-50 dark:bg-[#1A202C] hover:bg-slate-100 dark:hover:bg-[#203748] text-[#1F2937] dark:text-[#CBD5E1] border border-[#E5E7EB] dark:border-white/10"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Expo Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExpos.map((expo) => {
          const expoId = expo._id || expo.id;
          const expoBooths = (booths || []).filter((b) => b && (b.expo_id === expo._id || b.expo_id === expo.id));
          const availableCount = expoBooths.filter((b) => b.status === "available").length;
          const startStr = formatDate(expo.date);
          const endStr = formatDateWithYear(expo.endDate || expo.date);
          const dateLabel = startStr && endStr ? (startStr === endStr ? startStr : `${startStr} – ${endStr}`) : startStr || "TBA";

          const bannerSrc = expo.banner_image
            ? (expo.banner_image.startsWith("http") || expo.banner_image.startsWith("data:")
              ? expo.banner_image
              : `http://localhost:5000${expo.banner_image.startsWith("/") ? "" : "/"}${expo.banner_image}`)
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
                      <span className="truncate">
                        {expo.location || "Location TBA"}</span>
                    </div>
                  </div>

                  {/* Meta stats bar */}
                  <div className="pt-3 border-t border-[#E5E7EB] dark:border-white/10 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold font-mono text-[#6B7280] dark:text-[#CBD5E1]/60 block">Available Booths</span>
                      <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                        {availableCount > 0 ? `${availableCount} Open` : "Fully Booked"}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold font-mono text-[#6B7280] dark:text-[#CBD5E1]/60 block">Access</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        Free Entry
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

                {currentUser?.role === "exhibitor" || currentRole === "exhibitor" || onApplyExhibitor ? (
                  <button
                    onClick={() => onApplyExhibitor ? onApplyExhibitor(expoId) : onSelectExpo(expoId)}
                    className="w-full py-2 px-3 rounded-xl btn-teal-primary text-white text-xs font-bold transition-colors text-center flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Briefcase className="w-3.5 h-3.5" /> Exhibit at Expo
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
        })}
      </div>
    </div>
  );
};

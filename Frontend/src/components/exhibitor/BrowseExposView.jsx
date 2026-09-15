import { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  Search,
  Calendar,
  MapPin,
  Building2,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Grid,
  Plus
} from "lucide-react";
import { ApplyExpoModal } from "./ApplyExpoModal";
import { getExpoImage } from "../../utils/expoImages";

export const BrowseExposView = ({ onNavigateToBoothSelection, onNavigateToApplications }) => {
  const {
    expos = [],
    booths = [],
    applications = [],
    currentUser = {}
  } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedExpoForApply, setSelectedExpoForApply] = useState(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const userIdStr = String(currentUser?._id || currentUser?.user_id || "");
  const userEmail = currentUser?.email || "";
  const companyName = currentUser?.company_name || currentUser?.company_profile?.company_name || currentUser?.name || "";

  // Helper to format dates
  const formatDateRange = (startDate, endDate) => {
    if (!startDate) return "Dates TBA";
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;
    if (isNaN(start.getTime())) return "Dates TBA";

    const sStr = start.toLocaleDateString([], { month: "short", day: "numeric" });
    if (!end || isNaN(end.getTime())) {
      return `${sStr}, ${start.getFullYear()}`;
    }
    const eStr = end.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
    return `${sStr} – ${eStr}`;
  };

  // Find user's existing application for a given expo
  const getApplicationForExpo = (expoId) => {
    return (applications || []).find((app) => {
      const aExpoId = typeof app?.expo_id === "object" ? app?.expo_id?._id : app?.expo_id;
      if (String(aExpoId) !== String(expoId)) return false;

      const exhId = typeof app?.exhibitor_id === "object" ? app?.exhibitor_id?._id : app?.exhibitor_id;
      if (exhId && String(exhId) === userIdStr) return true;
      if (app?.contact_email && userEmail && app.contact_email.toLowerCase() === userEmail.toLowerCase()) return true;
      if (app?.company_name && companyName && app.company_name.toLowerCase() === companyName.toLowerCase()) return true;
      return false;
    });
  };

  // Categories list
  const categories = ["All", ...new Set((expos || []).map((e) => e.category).filter(Boolean))];

  // Filtered expos
  const filteredExpos = (expos || []).filter((expo) => {
    if (!expo) return false;
    if (selectedCategory !== "All" && expo.category !== selectedCategory) return false;
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

  const handleOpenApply = (expo) => {
    setSelectedExpoForApply(expo);
    setIsApplyModalOpen(true);
  };

  return (
    <div id="exhibitor-browse-expos-view" className="space-y-6 font-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] dark:border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold text-[#1F2937] dark:text-[#F8FAFC] tracking-tight font-heading">
              Browse & Apply for Expos
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#94A3B8] mt-1 font-normal">
            Explore upcoming industry summits, review booth availability, and submit vendor booth applications.
          </p>
        </div>

        {/* Global count */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenApply(null)}
            className="px-4 py-2.5 btn-teal-primary text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Apply For Expo
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-50 dark:bg-[#1A202C] p-3 rounded-2xl border border-[#E5E7EB] dark:border-white/10">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#CBD5E1]/60" />
          <input
            type="text"
            placeholder="Search summits, locations, categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#38B2AC]"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${selectedCategory === cat
                ? "btn-teal-primary text-white shadow-xs"
                : "bg-white dark:bg-[#0F172A] text-[#6B7280] dark:text-[#CBD5E1] border border-[#E5E7EB] dark:border-white/10 hover:border-[#38B2AC]"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Expos Grid */}
      {filteredExpos.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-[#1A202C] rounded-2xl border border-[#E5E7EB] dark:border-white/10 space-y-3 p-6">
          <Building2 className="w-10 h-10 mx-auto text-[#6B7280] dark:text-[#CBD5E1]/40" />
          <h4 className="text-base font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading">
            No expos match your search
          </h4>
          <p className="text-xs text-[#6B7280] dark:text-[#CBD5E1]/70 max-w-sm mx-auto">
            Try adjusting your search keywords or clear the category filter to view all active expos.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#203748] text-[#1F2937] dark:text-white text-xs font-bold hover:bg-slate-200 cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredExpos.map((expo, idx) => {
            const expoId = expo._id || expo.id;
            const bannerSrc = getExpoImage(expo, idx);
            const existingApp = getApplicationForExpo(expoId);
            const status = existingApp?.status;
            const expoBooths = (booths || []).filter(
              (b) => String(b.expo_id?._id || b.expo_id) === String(expoId)
            );

            return (
              <div
                key={expoId}
                className="bg-white dark:bg-[#1A202C] rounded-2xl border border-[#E5E7EB] dark:border-white/10 overflow-hidden flex flex-col shadow-xs hover:border-[#1488A6]/40 dark:hover:border-[#38B2AC]/40 transition-all group"
              >
                {/* Image Banner */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                  <img
                    src={bannerSrc}
                    alt={expo.title || "Expo"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80";
                    }}
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Category Badge */}
                  {expo.category && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-900/80 text-[#38B2AC] border border-white/10 backdrop-blur-md">
                      {expo.category}
                    </span>
                  )}

                  {/* Application Status Badge overlay */}
                  {status && (
                    <div className="absolute top-3 right-3">
                      {status === "approved" ? (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 backdrop-blur-md flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Approved
                        </span>
                      ) : status === "pending" ? (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-950/80 text-amber-400 border border-amber-500/30 backdrop-blur-md flex items-center gap-1">
                          <Clock className="w-3 h-3" /> In Review
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-950/80 text-rose-400 border border-rose-500/30 backdrop-blur-md">
                          {status}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Title on Banner */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-sm sm:text-base font-bold text-white font-heading truncate drop-shadow-sm">
                      {expo.title}
                    </h3>
                  </div>
                </div>

                {/* Details Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-[#6B7280] dark:text-[#CBD5E1]/80">
                      <Calendar className="w-3.5 h-3.5 text-[#1488A6] dark:text-[#38B2AC] shrink-0" />
                      <span>{formatDateRange(expo.start_date, expo.end_date)}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#6B7280] dark:text-[#CBD5E1]/80">
                      <MapPin className="w-3.5 h-3.5 text-[#1488A6] dark:text-[#38B2AC] shrink-0" />
                      <span className="truncate">{expo.location || "Convention Center"}</span>
                    </div>

                    {expo.theme && (
                      <p className="text-xs text-[#6B7280] dark:text-[#CBD5E1]/70 line-clamp-2 pt-1 border-t border-[#E5E7EB] dark:border-white/5">
                        {expo.theme}
                      </p>
                    )}
                  </div>

                  {/* Booths Capacity indicator */}
                  <div className="flex items-center justify-between text-[11px] font-mono py-2 px-3 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/5 text-[#6B7280] dark:text-[#CBD5E1]/80">
                    <span className="flex items-center gap-1.5">
                      <Grid className="w-3.5 h-3.5 text-[#1488A6] dark:text-[#38B2AC]" />
                      Floor Booths:
                    </span>
                    <span className="font-bold text-[#1F2937] dark:text-white">
                      {expoBooths.length > 0 ? `${expoBooths.length} Configured` : "Dynamic Layout"}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-1">
                    {status === "approved" ? (
                      <button
                        onClick={() => {
                          if (onNavigateToBoothSelection) {
                            onNavigateToBoothSelection(expoId);
                          }
                        }}
                        className="w-full py-2.5 px-3 rounded-xl btn-teal-primary text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Grid className="w-3.5 h-3.5" /> Reserve / View Booth
                      </button>
                    ) : status === "pending" ? (
                      <button
                        onClick={() => {
                          if (onNavigateToApplications) {
                            onNavigateToApplications();
                          }
                        }}
                        className="w-full py-2.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Clock className="w-3.5 h-3.5" /> Track Application Status
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenApply(expo)}
                        className="w-full py-2.5 px-3 rounded-xl btn-teal-primary text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Apply for Booth Space
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Apply Modal */}
      {isApplyModalOpen && (
        <ApplyExpoModal
          isOpen={isApplyModalOpen}
          onClose={() => {
            setIsApplyModalOpen(false);
            setSelectedExpoForApply(null);
          }}
          initialExpoId={selectedExpoForApply?._id || selectedExpoForApply?.id}
        />
      )}
    </div>
  );
};

export default BrowseExposView;

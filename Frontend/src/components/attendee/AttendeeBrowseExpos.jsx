import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { GetPassModal } from "./GetPassModal";
import { generatePassImage } from "../../utils/generatePassImage";
import {
  MapPin,
  Building2,
  Search,
  CheckCircle,
  Calendar,
  Download,
  Ticket
} from "lucide-react";

export const AttendeeBrowseExpos = ({
  onSelectExpo,
  onRegisterPass
}) => {
  const { expos, registrations, currentUser, showToast } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [getPassExpo, setGetPassExpo] = useState(null);

  const categories = ["all", "Technology & AI", "Clean Energy & Climate", "Healthcare & Biotech", "Aerospace & Defense"];

  const filteredExpos = expos.filter((e) => {
    if (selectedCategory !== "all" && e.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = e.title.toLowerCase().includes(q);
      const matchLoc = e.location.toLowerCase().includes(q);
      const matchDesc = e.description.toLowerCase().includes(q);
      if (!matchTitle && !matchLoc && !matchDesc) return false;
    }
    return true;
  });

  const handleOpenGetPass = (expo) => {
    if (!currentUser || currentUser.role === "public") {
      showToast("Authentication Required", "Please log in as an attendee to register for an event pass.", "error");
      if (onRegisterPass) onRegisterPass(expo._id);
      return;
    }
    setGetPassExpo(expo);
  };

  const handleDownloadExistingPass = (expo) => {
    const reg = registrations.find(
      (r) => r.expo_id === expo._id && r.user_id === currentUser?._id
    );
    if (reg) {
      generatePassImage(reg, expo);
      showToast("Pass Image Downloaded", "Your event pass badge image (PNG) has been saved.", "success");
    }
  };

  return (
    <div id="attendee-browse-expos-view" className="space-y-6 font-body">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#1F2937] dark:text-[#F8FAFC] tracking-tight font-heading">
          Browse Expos & Events
        </h2>
        <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#CBD5E1] mt-0.5">
          Find upcoming exhibitions, view event details, and register for digital entry passes.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-[#1A202C] p-4 rounded-2xl border border-[#E5E7EB] dark:border-white/10 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#CBD5E1]/60" />
          <input
            type="text"
            placeholder="Search exhibitions by name or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC]"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all capitalize cursor-pointer ${selectedCategory === cat
                ? "btn-teal-primary text-white shadow-xs"
                : "bg-slate-100 dark:bg-[#203748] text-[#6B7280] dark:text-[#CBD5E1] hover:text-[#1F2937] dark:hover:text-white"
                }`}
            >
              {cat === "all" ? "All Tracks" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Expos Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExpos.map((expo) => {
          const isRegistered = registrations.some(
            (r) => r.expo_id === expo._id && r.user_id === currentUser?._id
          );
          const bannerSrc = expo.banner_image
            ? (expo.banner_image.startsWith("http") || expo.banner_image.startsWith("data:")
              ? expo.banner_image
              : `http://localhost:5000${expo.banner_image.startsWith("/") ? "" : "/"}${expo.banner_image}`)
            : null;

          return (
            <div
              key={expo._id}
              className="bg-white dark:bg-[#1A202C] rounded-3xl border border-[#E5E7EB] dark:border-white/10 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="relative h-48 bg-gradient-to-br from-slate-900 via-[#1488A6]/30 to-slate-950 overflow-hidden">
                  {bannerSrc ? (
                    <img
                      src={bannerSrc}
                      alt={expo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-slate-900 via-[#1488A6]/20 to-[#203748] flex items-center justify-center p-4 text-center">
                      <span className="text-xs font-bold text-[#38B2AC]/80 font-heading tracking-wider uppercase">
                        {expo.category || "Exhibition"}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider teal-badge">
                    {expo.category}
                  </span>
                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <span className="text-[11px] text-[#CBD5E1] font-mono font-medium block">
                      {new Date(expo.date).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </span>
                    <h4 className="text-base font-bold text-white tracking-tight line-clamp-1 font-heading">
                      {expo.title}
                    </h4>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#CBD5E1] line-clamp-2 leading-relaxed">
                    {expo.description}
                  </p>

                  <div className="space-y-1.5 text-xs text-[#6B7280] dark:text-[#CBD5E1]/80 pt-2 border-t border-[#E5E7EB] dark:border-white/10">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#1488A6] dark:text-[#38B2AC] shrink-0" />
                      <span className="truncate">{expo.venue} {expo.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-[#1488A6] dark:text-[#38B2AC] shrink-0" />
                      <span>{expo.total_booths} Exhibition Booths</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-5 pt-0 mt-2 space-y-3">
                <div className="pt-3 border-t border-[#E5E7EB] dark:border-white/10 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold font-mono text-[#6B7280] dark:text-[#CBD5E1]/60 block">Exhibition Access</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      Free Entry
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold font-mono text-[#6B7280] dark:text-[#CBD5E1]/60 block">Exhibition Booths</span>
                    <span className="font-mono font-bold text-[#1488A6] dark:text-[#38B2AC]">
                      {expo.total_booths || 24} Spaces
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onSelectExpo(expo._id)}
                    className="w-full py-2 px-3 rounded-xl border border-[#E5E7EB] dark:border-white/10 hover:bg-slate-100 dark:hover:bg-[#203748] text-[#1F2937] dark:text-[#CBD5E1] text-xs font-bold transition-colors cursor-pointer text-center"
                  >
                    View Details
                  </button>
                  {isRegistered ? (
                    <button
                      onClick={() => handleDownloadExistingPass(expo)}
                      className="w-full py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-emerald-100 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Pass
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenGetPass(expo)}
                      className="w-full py-2 px-3 rounded-xl btn-teal-primary text-xs font-bold transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Ticket className="w-3.5 h-3.5 text-white" /> Get Pass
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Render GetPassModal when an expo is selected */}
      {getPassExpo && (
        <GetPassModal
          expo={getPassExpo}
          onClose={() => setGetPassExpo(null)}
        />
      )}
    </div>
  );
};

export default AttendeeBrowseExpos;
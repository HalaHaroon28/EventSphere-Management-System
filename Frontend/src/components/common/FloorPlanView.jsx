import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import {
  MapPin,
  CheckCircle,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Search,
  ArrowRight,
  MessageSquare,
  Building2,
  Edit2,
  Trash2
} from "lucide-react";

const getFloorPlanImageUrl = (expo) => {
  const url = expo?.floor_plan_image_url || expo?.floor_plan || "/blueprint-floorplan.jpg";
  if (!url || typeof url !== "string") return "/blueprint-floorplan.jpg";
  const clean = url.trim();
  if (clean.startsWith("http://") || clean.startsWith("https://") || clean.startsWith("data:") || clean.startsWith("blob:")) {
    return clean;
  }
  if (clean.startsWith("/uploads") || clean.startsWith("uploads")) {
    return `http://localhost:5000${clean.startsWith("/") ? "" : "/"}${clean}`;
  }
  return clean.startsWith("/") ? clean : `/${clean}`;
};

export const FloorPlanView = ({
  expoId,
  onSelectBooth,
  selectedBoothId,
  isSelectionMode = false,
  isOrganizerMode = false,
  onEditBooth
}) => {
  const { booths, expos, currentRole, setActiveView, setSelectedExpoId, sendMessage, deleteBooth, showToast } = useApp();
  const [activeBooth, setActiveBooth] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterHall, setFilterHall] = useState("all");
  const [filterSize, setFilterSize] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [quickMsgOpen, setQuickMsgOpen] = useState(false);
  const [quickMsgText, setQuickMsgText] = useState("");

  const expo = expos.find((e) => e._id === expoId || String(e._id) === String(expoId)) || expos[0];
  const expoBooths = booths.filter(
    (b) =>
      b.expo_id === expoId ||
      b.expo_id?._id === expoId ||
      String(b.expo_id) === String(expoId) ||
      String(b.expo_id?._id) === String(expoId)
  );

  useEffect(() => {
    if (selectedBoothId && expoBooths.length > 0) {
      const found = expoBooths.find(
        (b) =>
          String(b._id) === String(selectedBoothId) ||
          b.booth_number?.toLowerCase() === String(selectedBoothId).toLowerCase()
      );
      if (found) {
        setActiveBooth(found);
      }
    }
  }, [selectedBoothId, expoBooths]);

  const filteredBooths = expoBooths.filter((b) => {
    if (filterStatus !== "all" && b.status !== filterStatus) return false;
    if (filterSize !== "all" && b.size !== filterSize) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = b.booth_number.toLowerCase().includes(q);
      const matchExh = b.exhibitor_name?.toLowerCase().includes(q);
      if (!matchNum && !matchExh) return false;
    }
    return true;
  });

  const getBoothDimensions = (size) => {
    switch (size) {
      case "small":
        return { w: "w-11 sm:w-13 md:w-14", h: "h-9 sm:h-10 md:h-11", numText: "text-[10px] sm:text-xs", subText: "text-[8px] sm:text-[9px]" };
      case "medium":
        return { w: "w-12 sm:w-14 md:w-15", h: "h-10 sm:h-11 md:h-12", numText: "text-[10px] sm:text-xs", subText: "text-[8px] sm:text-[9px]" };
      case "large":
        return { w: "w-13 sm:w-15 md:w-16", h: "h-10 sm:h-12 md:h-13", numText: "text-[11px] sm:text-xs", subText: "text-[8px] sm:text-[9px]" };
      default:
        return { w: "w-12 sm:w-14 md:w-15", h: "h-10 sm:h-11 md:h-12", numText: "text-[10px] sm:text-xs", subText: "text-[8px] sm:text-[9px]" };
    }
  };

  const getStatusStyling = (status, isCurrentSelected) => {
    if (isCurrentSelected) {
      return "bg-[#1488A6] dark:bg-[#38B2AC] text-white dark:text-[#0F172A] border-2 border-teal-300 ring-4 ring-[#38B2AC]/40 shadow-lg font-bold";
    }
    switch (status) {
      case "available":
        return "bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-900 dark:text-emerald-200 border-2 border-emerald-400/90 shadow-xs hover:scale-105";
      case "reserved":
        return "bg-teal-50 dark:bg-[#203748] hover:bg-teal-100 dark:hover:bg-[#203748]/80 text-[#1488A6] dark:text-[#38B2AC] border-2 border-[#1488A6]/60 dark:border-[#38B2AC]/70 shadow-xs";
      case "booked":
        return "bg-slate-800 dark:bg-[#1A202C] text-[#CBD5E1] border-2 border-slate-700 dark:border-white/10 shadow-xs opacity-95";
      default:
        return "bg-slate-100 dark:bg-[#1A202C] text-slate-700 dark:text-[#CBD5E1] border border-[#E5E7EB] dark:border-white/10";
    }
  };

  const handleBoothClick = (b) => {
    setActiveBooth(b);
    if (onSelectBooth) {
      onSelectBooth(b);
    }
  };

  const handleSendInquiry = () => {
    if (!activeBooth || !quickMsgText.trim()) return;
    if (activeBooth.exhibitor_id) {
      sendMessage(
        activeBooth.exhibitor_id,
        activeBooth.exhibitor_name || "Exhibitor",
        `Inquiry for Booth ${activeBooth.booth_number}: ${quickMsgText}`,
        expoId
      );
      setQuickMsgText("");
      setQuickMsgOpen(false);
    }
  };

  return (
    <div id="interactive-floorplan-container" className="space-y-5">
      {/* Controls Bar */}
      <div className="bg-white dark:bg-[#1A202C] p-4 sm:p-5 rounded-2xl border border-[#E5E7EB] dark:border-white/10 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#CBD5E1]/60" />
          <input
            type="text"
            placeholder="Search booth number, exhibitor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] placeholder-[#6B7280] dark:placeholder-[#CBD5E1]/50 focus:outline-none focus:ring-2 focus:ring-[#38B2AC] transition-all font-sans"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center flex-wrap gap-3 text-sm">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#0F172A] p-1 rounded-xl border border-[#E5E7EB] dark:border-white/5">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${filterStatus === "all"
                ? "bg-white dark:bg-[#203748] text-[#1488A6] dark:text-[#38B2AC] shadow-xs font-bold"
                : "text-[#6B7280] dark:text-[#CBD5E1] hover:text-[#1F2937] dark:hover:text-white"
                }`}
            >
              All ({expoBooths.length})
            </button>
            <button
              onClick={() => setFilterStatus("available")}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${filterStatus === "available"
                ? "bg-emerald-600 text-white shadow-xs font-bold"
                : "text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60"
                }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Available ({expoBooths.filter((b) => b.status === "available").length})
            </button>
            <button
              onClick={() => setFilterStatus("booked")}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${filterStatus === "booked"
                ? "bg-slate-900 dark:bg-[#203748] text-white dark:text-[#CBD5E1] shadow-xs font-bold"
                : "text-[#6B7280] dark:text-[#CBD5E1] hover:bg-slate-200 dark:hover:bg-[#1A202C]"
                }`}
            >
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              Booked ({expoBooths.filter((b) => b.status === "booked").length})
            </button>
          </div>

          {/* Size Filter */}
          <select
            value={filterSize}
            onChange={(e) => setFilterSize(e.target.value)}
            className="text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl px-3 py-2 font-medium text-[#1F2937] dark:text-[#CBD5E1] focus:outline-none"
          >
            <option value="all">All Tiers</option>
            <option value="small">Small Standard</option>
            <option value="medium">Medium</option>
            <option value="large">Large Corner</option>
          </select>

          {/* Zoom Controls */}
          <div className="flex items-center border border-[#E5E7EB] dark:border-white/10 rounded-xl overflow-hidden bg-[#F8FAFC] dark:bg-[#0F172A]">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.1))}
              className="p-2 hover:bg-slate-200 dark:hover:bg-[#1A202C] text-[#6B7280] dark:text-[#CBD5E1] transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="px-2.5 text-xs font-mono text-[#1F2937] dark:text-[#CBD5E1] font-bold">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
              className="p-2 hover:bg-slate-200 dark:hover:bg-[#1A202C] text-[#6B7280] dark:text-[#CBD5E1] transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-2 hover:bg-slate-200 dark:hover:bg-[#1A202C] text-[#6B7280] dark:text-[#CBD5E1] border-l border-[#E5E7EB] dark:border-white/10 cursor-pointer"
              title="Reset Zoom"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Floor Plan Canvas & Detail Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Interactive Floor Plan Map */}
        <div className="lg:col-span-8 bg-[#0F172A] p-5 sm:p-7 rounded-3xl border border-white/10 shadow-xl overflow-hidden relative min-h-[500px]">
          {/* Architectural Background Grid */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(56,178,172,0.4) 1px, transparent 0)`,
              backgroundSize: "24px 24px"
            }}
          />

          {/* Stage / Entrance / Keynote Markers */}
          <div className="flex items-center justify-between text-xs sm:text-sm text-[#CBD5E1]/70 font-mono mb-5 px-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#38B2AC] animate-pulse" />
              <span className="font-bold text-[#F8FAFC]">MAIN STAGE & KEYNOTE AUDITORIUM</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-[#1A202C] text-[#CBD5E1] border border-white/10 font-bold text-xs">
                ENTRANCE & REGISTRATION TURNSTILE
              </span>
            </div>
          </div>

          {/* Interactive Scalable Map Container */}
          <div className="overflow-x-auto overflow-y-auto max-h-[580px] p-2 flex justify-start sm:justify-center touch-pan-x touch-pan-y no-scrollbar">
            <div
              className="relative w-full min-w-[540px] sm:min-w-full max-w-[760px] aspect-[4/3] bg-[#0A101D] rounded-2xl border border-[#38B2AC]/40 transition-transform duration-200 origin-top shadow-2xl shrink-0 overflow-hidden"
              style={{
                transform: `scale(${zoomLevel})`,
              }}
            >
              {/* Floor Plan Architectural Blueprint Image Layer */}
              <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
                <img
                  src={getFloorPlanImageUrl(expo)}
                  alt="Expo Floor Plan Blueprint"
                  className="w-full h-full object-cover opacity-35 mix-blend-screen contrast-125 filter brightness-110"
                  onError={(e) => {
                    if (!e.currentTarget.src.endsWith("/blueprint-floorplan.jpg")) {
                      e.currentTarget.src = "/blueprint-floorplan.jpg";
                    }
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A101D]/90 via-[#0A101D]/30 to-[#0A101D]/70" />
                <div
                  className="absolute inset-0 opacity-15"
                  style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, rgba(56, 178, 172, 0.4) 1px, transparent 0), linear-gradient(to right, rgba(56,178,172,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(56,178,172,0.1) 1px, transparent 1px)`,
                    backgroundSize: `24px 24px, 48px 48px, 48px 48px`
                  }}
                />
              </div>

              {/* Hall Zones */}
              <div className="absolute top-3 left-4 z-10 text-[10px] sm:text-[11px] font-mono font-bold text-[#38B2AC] bg-slate-950/90 px-2.5 py-1 rounded-lg border border-[#38B2AC]/40 uppercase tracking-widest pointer-events-none shadow-sm flex items-center gap-2 backdrop-blur-xs">
                <span className="w-2 h-2 rounded-full bg-[#38B2AC]" />
                ZONE A — MAIN GRAND HALL
              </div>
              <div className="absolute bottom-3 left-4 z-10 text-[10px] sm:text-[11px] font-mono font-bold text-[#38B2AC] bg-slate-950/90 px-2.5 py-1 rounded-lg border border-[#38B2AC]/40 uppercase tracking-widest pointer-events-none shadow-sm flex items-center gap-2 backdrop-blur-xs">
                <span className="w-2 h-2 rounded-full bg-[#38B2AC]" />
                ZONE C — INNOVATION & QUANTUM PAVILION
              </div>
              <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-[#38B2AC]/30 pointer-events-none z-10" />

              {/* Empty state overlay if no booths */}
              {filteredBooths.length === 0 && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center text-slate-400 font-body space-y-2 pointer-events-none">
                  <Building2 className="w-10 h-10 text-[#38B2AC] opacity-60" />
                  <p className="text-sm font-bold text-slate-200">No Floor Booths Found</p>
                  <p className="text-xs text-slate-400 max-w-xs">
                    There are no booths mapped for this expo layout matching your filters.
                  </p>
                </div>
              )}

              {/* Booth Nodes Overlay */}
              {filteredBooths.map((booth) => {
                const isSelected = selectedBoothId === booth._id || activeBooth?._id === booth._id;
                const dims = getBoothDimensions(booth.size);
                const styling = getStatusStyling(booth.status, isSelected);

                return (
                  <button
                    key={booth._id}
                    id={`floorplan-booth-${booth.booth_number}`}
                    onClick={() => handleBoothClick(booth)}
                    className={`absolute z-20 -translate-x-1/2 -translate-y-1/2 ${dims.w} ${dims.h} rounded-lg sm:rounded-xl flex flex-col items-center justify-center p-1 text-center transition-all cursor-pointer select-none ${styling}`}
                    style={{
                      left: `${booth.position.x}%`,
                      top: `${booth.position.y}%`
                    }}
                  >
                    <span className={`font-bold tracking-tight ${dims.numText} leading-none font-mono`}>
                      {booth.booth_number}
                    </span>
                    {booth.exhibitor_name ? (
                      <span className={`${dims.subText} truncate max-w-full font-semibold opacity-90 px-0.5 leading-tight mt-0.5`}>
                        {booth.exhibitor_name.split(" ")[0]}
                      </span>
                    ) : (
                      <span className={`${dims.subText} uppercase font-mono font-bold opacity-85 leading-tight mt-0.5`}>
                        {booth.status === "available" ? `PKR ${booth.price}` : booth.status}
                      </span>
                    )}

                    {/* Corner badge for size */}
                    {booth.size === "island" && (
                      <span className="absolute -top-1.5 -right-1.5 px-1 py-0.2 bg-[#38B2AC] text-[#0F172A] font-black text-[8px] rounded uppercase font-mono shadow-xs">
                        Island
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Map Legend */}
          <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between flex-wrap gap-3 text-xs sm:text-sm text-[#CBD5E1]">
            <div className="flex flex-wrap items-center gap-3 sm:gap-5">
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-emerald-500 border border-emerald-400" />
                Available ({expoBooths.filter((b) => b.status === "available").length})
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-[#1488A6] border border-[#38B2AC]" />
                Reserved ({expoBooths.filter((b) => b.status === "reserved").length})
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-slate-800 border border-slate-600" />
                Booked ({expoBooths.filter((b) => b.status === "booked").length})
              </span>
            </div>
            <span className="text-xs text-[#CBD5E1]/70 font-mono">
              Click any booth to inspect specs & vendor showcase
            </span>
          </div>
        </div>

        {/* Booth Details Sidebar Card */}
        <div className="lg:col-span-4 bg-white dark:bg-[#1A202C] p-6 rounded-3xl border border-[#E5E7EB] dark:border-white/10 shadow-sm space-y-5">
          {activeBooth ? (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-2xl font-extrabold text-[#1F2937] dark:text-[#F8FAFC] font-mono font-heading">
                      Booth {activeBooth.booth_number}
                    </h3>
                    <span
                      className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border uppercase ${activeBooth.status === "available"
                        ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                        : activeBooth.status === "reserved"
                          ? "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                          : "bg-slate-900 dark:bg-[#203748] text-white dark:text-[#CBD5E1] border-slate-700 dark:border-white/10"
                        }`}
                    >
                      {activeBooth.status === "booked" ? "Booked" : activeBooth.status === "reserved" ? "Reserved (Pending)" : "Available"}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#CBD5E1]/70 mt-1">{activeBooth.hall || "Main Grand Hall"}</p>
                </div>

                <div className="text-right">
                  <div className="text-xl sm:text-2xl font-bold text-[#1F2937] dark:text-[#F8FAFC] font-mono">
                    PKR {activeBooth.price.toLocaleString()}
                  </div>
                  <span className="text-xs text-[#6B7280] dark:text-[#CBD5E1]/60 uppercase font-mono font-bold">Base Fee</span>
                </div>
              </div>

              {/* Specs Pill Grid */}
              <div className="grid grid-cols-2 gap-3 bg-[#F8FAFC] dark:bg-[#0F172A] p-4 rounded-2xl border border-[#E5E7EB] dark:border-white/10 text-sm">
                <div>
                  <span className="text-[#6B7280] dark:text-[#CBD5E1]/70 text-xs block uppercase font-mono font-bold">Tier / Size</span>
                  <span className="font-bold text-[#1F2937] dark:text-[#F8FAFC] capitalize">{activeBooth.size} Booth</span>
                </div>
                <div>
                  <span className="text-[#6B7280] dark:text-[#CBD5E1]/70 text-xs block uppercase font-mono font-bold">Category</span>
                  <span className="font-bold text-[#1F2937] dark:text-[#F8FAFC]">{activeBooth.category || "General"}</span>
                </div>
                <div>
                  <span className="text-[#6B7280] dark:text-[#CBD5E1]/70 text-xs block uppercase font-mono font-bold">Grid Position</span>
                  <span className="font-mono text-[#1F2937] dark:text-[#CBD5E1] text-xs">
                    X: {activeBooth.position.x}%, Y: {activeBooth.position.y}%
                  </span>
                </div>
              </div>

              {/* Occupant / Exhibitor Details if Booked or Reserved */}
              {activeBooth.exhibitor_name || activeBooth.status !== "available" ? (
                <div className="p-4 bg-[#0F172A] text-white rounded-2xl space-y-3 border border-white/10 font-body">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Building2 className="w-5 h-5 text-[#38B2AC]" />
                      <div>
                        <span className="text-sm font-bold font-heading block">
                          {activeBooth.exhibitor_name || "Assigned Exhibitor"}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">
                          {activeBooth.status === "booked" ? "Booked & Assigned" : "Selected — Awaiting Admin Approval"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-[#CBD5E1] leading-relaxed">
                    Official exhibitor showcase stationed at Booth {activeBooth.booth_number}.
                  </p>

                  {isOrganizerMode && (
                    <button
                      onClick={() => setActiveView("booth-requests")}
                      className="w-full mt-2 py-2 px-3 bg-[#203748] hover:bg-[#2c475d] text-[#38B2AC] font-mono font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-[#38B2AC]/30"
                    >
                      <Building2 className="w-3.5 h-3.5" /> View in Booth Requests
                    </button>
                  )}

                  {currentRole === "attendee" && (
                    <button
                      onClick={() => setQuickMsgOpen(!quickMsgOpen)}
                      className="w-full mt-3 py-2.5 px-4 btn-teal-primary rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4" /> Direct Inquiry / Demo Booking
                    </button>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-900 dark:text-emerald-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-sm font-bold">Booth is Open for Reservation</span>
                  </div>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed">
                    Approved exhibitors can select and secure this booth instantly.
                  </p>
                </div>
              )}

              {/* Inline Quick Message Form */}
              {quickMsgOpen && (
                <div className="p-4 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-2xl space-y-3 animate-in slide-in-from-top-1">
                  <label className="text-xs font-bold text-[#1F2937] dark:text-[#F8FAFC] block font-heading">
                    Send Message to Exhibitor
                  </label>
                  <textarea
                    rows={2}
                    value={quickMsgText}
                    onChange={(e) => setQuickMsgText(e.target.value)}
                    placeholder="Ask about live demos, meetings or specs..."
                    className="w-full p-3 text-xs sm:text-sm bg-white dark:bg-[#1A202C] border border-[#E5E7EB] dark:border-white/10 text-[#1F2937] dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#38B2AC]"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setQuickMsgOpen(false)}
                      className="px-3 py-1.5 text-xs font-semibold text-[#6B7280] hover:text-[#1F2937] dark:text-[#CBD5E1]/70 dark:hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSendInquiry}
                      disabled={!quickMsgText.trim()}
                      className="px-4 py-2 btn-teal-primary text-xs font-bold rounded-xl disabled:opacity-50 cursor-pointer"
                    >
                      Send Inquiry
                    </button>
                  </div>
                </div>
              )}

              {/* Role Action Buttons */}
              {isSelectionMode && activeBooth.status === "available" && (
                <button
                  id="confirm-booth-selection-btn"
                  onClick={() => onSelectBooth && onSelectBooth(activeBooth)}
                  className="w-full py-3 px-5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <CheckCircle className="w-5 h-5" /> Select Booth {activeBooth.booth_number}
                </button>
              )}

              {isOrganizerMode && (
                <div className="space-y-2 pt-1">
                  <button
                    id="organizer-edit-booth-btn"
                    onClick={() => onEditBooth && onEditBooth(activeBooth)}
                    className="w-full py-2.5 px-4 btn-teal-primary text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" /> Edit Booth Details & Assignment
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete Booth ${activeBooth.booth_number}?`)) {
                        deleteBooth(activeBooth._id);
                        setActiveBooth(null);
                      }
                    }}
                    className="w-full py-2 px-4 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Booth
                  </button>
                </div>
              )}

              {currentRole === "public" && activeBooth.status === "available" && (
                <button
                  onClick={() => {
                    showToast("Authentication Required", "You need to login first.", "error");
                    setActiveView("login");
                  }}
                  className="w-full py-3 px-5 btn-teal-primary text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  Apply to Exhibit at this Booth <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <div className="py-14 text-center text-[#6B7280] dark:text-[#CBD5E1]/60 space-y-3">
              <MapPin className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 stroke-[1.5]" />
              <h4 className="text-base font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading">No Booth Selected</h4>
              <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#CBD5E1]/70 max-w-xs mx-auto leading-relaxed">
                Click on any booth block on the floor plan map to view dimensions, fees, and exhibitor showcase info.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

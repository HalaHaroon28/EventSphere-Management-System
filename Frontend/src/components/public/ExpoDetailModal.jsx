import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { FloorPlanView } from "../common/FloorPlanView";
import {
  X,
  Calendar,
  MapPin,
  Ticket,
  Clock,
  Building2,
  Layers,
  Check,
  Bookmark,
  Share2
} from "lucide-react";

export const ExpoDetailModal = ({
  expoId,
  onClose,
  onOpenRegisterPass,
  onOpenApplyExhibitor,
  onRegisterPass,
  onApplyExhibitor
}) => {
  const {
    expos,
    sessions,
    booths,
    bookmarks,
    toggleBookmark,
    registrations,
    currentUser,
    currentRole,
    showToast,
    setActiveView
  } = useApp();

  const handleRegisterClick = (id) => {
    if (currentRole === "public" || !currentUser || currentUser?.role === "public") {
      showToast("Authentication Required", "You need to login first.", "error");
      onClose();
      setActiveView("login");
      return;
    }
    if (isRegistered) {
      showToast("Already Registered", "You already have an active pass for this exhibition! You can download your Pass PDF directly from the Browse Expos page.", "info");
      return;
    }
    if (onOpenRegisterPass) {
      onOpenRegisterPass(id);
    } else if (onRegisterPass) {
      onRegisterPass(id);
    }
  };

  const handleApplyClick = (id) => {
    if (currentRole === "public" || !currentUser || currentUser?.role === "public") {
      showToast("Authentication Required", "You need to login first.", "error");
      onClose();
      setActiveView("login");
      return;
    }
    if (onOpenApplyExhibitor) {
      onOpenApplyExhibitor(id);
    } else if (onApplyExhibitor) {
      onApplyExhibitor(id);
    }
  };

  const [activeTab, setActiveTab] = useState("overview");
  const expo = expos.find((e) => e._id === expoId) || expos.find((e) => e.id === expoId) || expos[0];
  if (!expo) return null;

  const expoSessions = sessions.filter((s) => s.expo_id === expo._id);
  const expoBooths = booths.filter((b) => b.expo_id === expo._id);
  const isRegistered = registrations.some((r) => r.expo_id === expo._id && r.user_id === currentUser?._id);
  const availableBoothsCount = expoBooths.filter((b) => b.status === "available").length;
  const bookedBooths = expoBooths.filter((b) => b.status === "booked" && b.exhibitor_name);


  const bannerSrc = expo.banner_image
    ? (expo.banner_image.startsWith("http") || expo.banner_image.startsWith("data:")
        ? expo.banner_image
        : `http://localhost:5000${expo.banner_image.startsWith("/") ? "" : "/"}${expo.banner_image}`)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto font-body">
      <div className="bg-white dark:bg-[#1A202C] rounded-3xl shadow-2xl border border-[#E5E7EB] dark:border-white/10 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto text-[#1F2937] dark:text-[#F8FAFC]">
        {/* Top Hero Banner */}
        <div className="relative h-56 sm:h-64 bg-gradient-to-br from-slate-900 via-[#1488A6]/40 to-slate-950 shrink-0 overflow-hidden">
          {bannerSrc ? (
            <img
              src={bannerSrc}
              alt={expo.title}
              className="w-full h-full object-cover opacity-60"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-slate-950 via-[#1488A6]/25 to-slate-950 flex items-center justify-center" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

          {/* Close & Share buttons */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                showToast("Link Copied", "Expo link copied to clipboard.");
              }}
              className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-xs transition-colors cursor-pointer"
              title="Share Expo"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-xs transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Banner Meta Info */}
          <div className="absolute bottom-4 left-6 right-6 text-white">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#1488A6]/30 text-[#38B2AC] border border-[#38B2AC]/40">
                {expo.category}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/30 text-emerald-300 border border-emerald-400/30">
                {expo.status}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight font-heading">
              {expo.title}
            </h2>
            <p className="text-xs text-slate-300 mt-1 line-clamp-1">{expo.theme}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-[#E5E7EB] dark:border-white/10 bg-slate-50/80 dark:bg-[#0F172A]/80 px-6 flex items-center justify-between gap-4 overflow-x-auto shrink-0">
          <div className="flex space-x-2 sm:space-x-4 py-2">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-3 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === "overview"
                  ? "bg-white dark:bg-[#203748] text-[#1488A6] dark:text-[#38B2AC] shadow-xs border border-[#E5E7EB] dark:border-white/10"
                  : "text-[#6B7280] dark:text-[#CBD5E1]/70 hover:text-[#1F2937] dark:hover:text-white"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("floorplan")}
              className={`px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "floorplan"
                  ? "bg-white dark:bg-[#203748] text-[#1488A6] dark:text-[#38B2AC] shadow-xs border border-[#E5E7EB] dark:border-white/10"
                  : "text-[#6B7280] dark:text-[#CBD5E1]/70 hover:text-[#1F2937] dark:hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#1488A6] dark:text-[#38B2AC]" /> Interactive Floor Plan
            </button>
            <button
              onClick={() => setActiveTab("schedule")}
              className={`px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "schedule"
                  ? "bg-white dark:bg-[#203748] text-[#1488A6] dark:text-[#38B2AC] shadow-xs border border-[#E5E7EB] dark:border-white/10"
                  : "text-[#6B7280] dark:text-[#CBD5E1]/70 hover:text-[#1F2937] dark:hover:text-white"
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-[#1488A6] dark:text-[#38B2AC]" /> Keynote Schedule ({expoSessions.length})
            </button>
            <button
              onClick={() => setActiveTab("exhibitors")}
              className={`px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "exhibitors"
                  ? "bg-white dark:bg-[#203748] text-[#1488A6] dark:text-[#38B2AC] shadow-xs border border-[#E5E7EB] dark:border-white/10"
                  : "text-[#6B7280] dark:text-[#CBD5E1]/70 hover:text-[#1F2937] dark:hover:text-white"
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-[#1488A6] dark:text-[#38B2AC]" /> Exhibitors ({bookedBooths.length})
            </button>
          </div>

          {/* Quick Action Top Bar */}
          <div className="hidden sm:flex items-center gap-2 shrink-0 py-2">
            {(currentUser?.role === "exhibitor" || currentRole === "exhibitor") ? (
              <button
                onClick={() => handleApplyClick(expo._id)}
                className="px-3.5 py-1.5 btn-teal-primary text-white text-xs font-bold rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Building2 className="w-3.5 h-3.5" /> Exhibit at Expo
              </button>
            ) : isRegistered ? (
              <button
                onClick={() => {
                  showToast("Already Registered", "You already have an active pass for this exhibition! You can download your Pass PDF directly from the Browse Expos page.", "info");
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors"
              >
                <Check className="w-3.5 h-3.5" /> Registered (Pass Active)
              </button>
            ) : (
              <button
                onClick={() => handleRegisterClick(expo._id)}
                className="px-3.5 py-1.5 btn-teal-primary text-white text-xs font-bold rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Ticket className="w-3.5 h-3.5" /> Get Free Pass
              </button>
            )}
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Key Quick Facts Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0F172A]/60 border border-[#E5E7EB] dark:border-white/10">
                  <span className="text-[10px] uppercase font-mono font-bold text-[#6B7280] dark:text-[#CBD5E1]/60 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#1488A6] dark:text-[#38B2AC]" /> Event Dates
                  </span>
                  <span className="font-bold text-[#1F2937] dark:text-[#F8FAFC] block mt-1">
                    {new Date(expo.date).toLocaleDateString([], { month: "short", day: "numeric" })} –{" "}
                    {new Date(expo.endDate || expo.date).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0F172A]/60 border border-[#E5E7EB] dark:border-white/10">
                  <span className="text-[10px] uppercase font-mono font-bold text-[#6B7280] dark:text-[#CBD5E1]/60 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#1488A6] dark:text-[#38B2AC]" /> Location
                  </span>
                  <span className="font-bold text-[#1F2937] dark:text-[#F8FAFC] block mt-1 truncate">
                    {expo.location}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0F172A]/60 border border-[#E5E7EB] dark:border-white/10">
                  <span className="text-[10px] uppercase font-mono font-bold text-[#6B7280] dark:text-[#CBD5E1]/60 flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-[#1488A6] dark:text-[#38B2AC]" /> Booth Availability
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 block mt-1 font-mono">
                    {availableBoothsCount} of {expo.total_booths} Available
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0F172A]/60 border border-[#E5E7EB] dark:border-white/10">
                  <span className="text-[10px] uppercase font-mono font-bold text-[#6B7280] dark:text-[#CBD5E1]/60 flex items-center gap-1">
                    <Ticket className="w-3 h-3 text-[#1488A6] dark:text-[#38B2AC]" /> Access Fee
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 block mt-1 font-mono">
                    Free Entry
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading">About this Exhibition</h3>
                <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#CBD5E1]/80 leading-relaxed">
                  {expo.description}
                </p>
              </div>

              {/* Venue details */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A]/60 border border-[#E5E7EB] dark:border-white/10 flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#1488A6] dark:text-[#38B2AC] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading">Convention Venue</h4>
                  <p className="text-xs text-[#6B7280] dark:text-[#CBD5E1]/80 mt-0.5">{expo.venue}</p>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#CBD5E1]/50 mt-1">
                    Direct access via airport express shuttle and metro transit stations.
                  </p>
                </div>
              </div>

              {/* Dual Action Banner */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-[#1488A6]/20 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold font-heading">Participate in {expo.title}</h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {(currentUser?.role === "exhibitor" || currentRole === "exhibitor")
                      ? "Apply now for prime exhibition space at this summit."
                      : "Secure an Attendee Pass or apply for prime exhibition space."}
                  </p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => handleApplyClick(expo._id)}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl btn-teal-primary text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    Exhibit at this Expo
                  </button>
                  {(currentUser?.role !== "exhibitor" && currentRole !== "exhibitor") && (
                    isRegistered ? (
                      <button
                        onClick={() => {
                          showToast("Already Registered", "You already have an active pass for this exhibition! You can download your Pass PDF directly from the Browse Expos page.", "info");
                        }}
                        className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-emerald-950/90 text-emerald-300 text-xs font-bold border border-emerald-700/60 transition-colors cursor-pointer flex items-center gap-1.5 justify-center"
                      >
                        <Check className="w-4 h-4 text-emerald-400" /> Pass Active (Download on Browse Expos)
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRegisterClick(expo._id)}
                        className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-[#38B2AC] text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
                      >
                        Get Attendee Pass
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FLOOR PLAN */}
          {activeTab === "floorplan" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-[#6B7280] dark:text-[#CBD5E1]/70">
                <span>Interactive floor map for {expo.venue}</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  {availableBoothsCount} Open Booths
                </span>
              </div>
              <FloorPlanView expoId={expo._id} />
            </div>
          )}

          {/* TAB 3: SCHEDULE */}
          {activeTab === "schedule" && (
            <div className="space-y-3">
              {expoSessions.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#6B7280] dark:text-[#CBD5E1]/50">
                  No sessions announced for this expo yet.
                </div>
              ) : (
                expoSessions.map((session) => {
                  const isBookmarked = bookmarks.some(
                    (b) => b.session_id === session._id && b.user_id === currentUser._id
                  );
                  return (
                    <div
                      key={session._id}
                      className="p-4 rounded-2xl border border-[#E5E7EB] dark:border-white/10 bg-white dark:bg-[#203748]/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 text-[11px] text-[#6B7280] dark:text-[#CBD5E1]/70">
                          <span className="font-mono font-bold text-[#1488A6] dark:text-[#38B2AC]">
                            {new Date(session.start_time).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit"
                            })}{" "}
                            –{" "}
                            {new Date(session.end_time).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                          <span>•</span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[#1F2937] dark:text-[#CBD5E1] font-medium">
                            {session.location}
                          </span>
                          <span className="text-[#1488A6] dark:text-[#38B2AC] font-semibold">{session.topic}</span>
                        </div>

                        <h4 className="text-xs sm:text-sm font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading">
                          {session.title}
                        </h4>

                        <div className="flex items-center gap-2 text-xs text-[#6B7280] dark:text-[#CBD5E1]/80 pt-1">
                          <img
                            src={session.speaker_avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
                            alt={session.speaker}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                          <span className="font-medium text-[#1F2937] dark:text-[#F8FAFC]">{session.speaker}</span>
                          {session.speaker_title && (
                            <span className="text-[11px] text-[#6B7280] dark:text-[#CBD5E1]/50">({session.speaker_title})</span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => toggleBookmark(session._id, expo._id)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all self-start sm:self-center cursor-pointer ${
                          isBookmarked
                            ? "teal-badge"
                            : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[#1F2937] dark:text-[#CBD5E1]"
                        }`}
                      >
                        <Bookmark className="w-3.5 h-3.5" fill={isBookmarked ? "currentColor" : "none"} />
                        {isBookmarked ? "Bookmarked" : "Add to Agenda"}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 4: EXHIBITORS */}
          {activeTab === "exhibitors" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {bookedBooths.length === 0 ? (
                <div className="col-span-2 py-8 text-center text-xs text-[#6B7280] dark:text-[#CBD5E1]/50">
                  Exhibitors are currently being reviewed and assigned.
                </div>
              ) : (
                bookedBooths.map((b) => (
                  <div
                    key={b._id}
                    className="p-4 rounded-2xl border border-[#E5E7EB] dark:border-white/10 bg-white dark:bg-[#203748]/60 hover:shadow-xs transition-all flex items-start gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-800 text-[#38B2AC] flex items-center justify-center font-bold text-xs shrink-0 font-mono border border-[#38B2AC]/20">
                      {b.booth_number}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs sm:text-sm font-bold text-[#1F2937] dark:text-[#F8FAFC] truncate font-heading">
                        {b.exhibitor_name}
                      </h4>
                      <p className="text-[11px] text-[#6B7280] dark:text-[#CBD5E1]/70 mt-0.5">{b.category || "Industry Innovator"}</p>
                      <span className="inline-block mt-2 text-[10px] font-semibold text-[#1488A6] dark:text-[#38B2AC] hover:underline">
                        Located in {b.hall} →
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

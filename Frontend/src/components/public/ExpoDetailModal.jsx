import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { FloorPlanView } from "../common/FloorPlanView";
import { InContextFeedback } from "../common/InContextFeedback";
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
  Share2,
  QrCode,
  Sparkles,
  CheckCircle2,
  ArrowRight
} from "lucide-react";

export const ExpoDetailModal = ({
  expoId,
  initialTab = "overview",
  onClose,
  onOpenRegisterPass,
  onOpenApplyExhibitor,
  onRegisterPass,
  onApplyExhibitor,
  onOpenContactBooth
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
    setActivePassId,
    showToast,
    setActiveView
  } = useApp();

  const currentUserId = String(currentUser?._id || currentUser?.user_id || "");

  const expo = expos.find((e) => e._id === expoId) || expos.find((e) => e.id === expoId) || expos[0];
  if (!expo) return null;

  const expoSessions = sessions.filter((s) => s.expo_id === expo._id);
  const expoBooths = booths.filter((b) => b.expo_id === expo._id);

  // Check if current user is registered
  const userRegistration = (registrations || []).find((r) => {
    const rExpoId = typeof r.expo_id === "object" ? r.expo_id?._id : r.expo_id;
    const rUserId = String(typeof r.user_id === "object" ? r.user_id?._id : r.user_id || "");
    const rEmail = (r.user_email || r.email || "").toLowerCase();
    const uEmail = (currentUser?.email || "").toLowerCase();
    const matchExpo = String(rExpoId) === String(expo._id);
    const matchUser = (rUserId && rUserId === currentUserId) || (uEmail && rEmail === uEmail);
    return matchExpo && matchUser;
  });

  const isRegistered = !!userRegistration;
  const availableBoothsCount = expoBooths.filter((b) => b.status === "available").length;
  const bookedBooths = expoBooths.filter((b) => b.status === "booked" && b.exhibitor_name);

  const [activeTab, setActiveTab] = useState(initialTab || "overview");

  const handleRegisterClick = (id) => {
    if (currentRole === "public" || !currentUser || currentUser?.role === "public") {
      showToast("Authentication Required", "Please log in first to reserve your pass.", "error");
      onClose();
      setActiveView("login");
      return;
    }
    if (isRegistered) {
      if (userRegistration) {
        setActivePassId(userRegistration._id || userRegistration.id);
      }
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
      showToast("Authentication Required", "Please log in first as an exhibitor.", "error");
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

  const bannerSrc = expo.banner_image
    ? (expo.banner_image.startsWith("http") || expo.banner_image.startsWith("data:")
        ? expo.banner_image
        : `http://localhost:5000${expo.banner_image.startsWith("/") ? "" : "/"}${expo.banner_image}`)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs overflow-y-auto font-body">
      <div className="bg-white dark:bg-[#1A202C] rounded-3xl shadow-2xl border border-[#E5E7EB] dark:border-white/10 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto text-[#1F2937] dark:text-[#F8FAFC]">
        
        {/* Top Hero Banner */}
        <div className="relative h-48 sm:h-56 bg-gradient-to-br from-slate-900 via-[#1488A6]/30 to-slate-950 shrink-0 overflow-hidden">
          {bannerSrc ? (
            <img
              src={bannerSrc}
              alt={expo.title}
              className="w-full h-full object-cover opacity-60"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-slate-950 via-[#1488A6]/20 to-slate-950" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

          {/* Close & Share Header Controls */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                showToast("Link Copied", "Summit details link copied to clipboard.");
              }}
              className="p-2 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-xs transition-colors cursor-pointer"
              title="Share Expo"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-xs transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Banner Meta Info */}
          <div className="absolute bottom-4 left-6 right-6 text-white space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#1488A6]/40 text-[#38B2AC] border border-[#38B2AC]/40 font-mono">
                {expo.category || "Technology"}
              </span>
              {isRegistered ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Pass Active
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  {expo.status || "Upcoming"}
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white leading-snug font-heading">
              {expo.title}
            </h2>
            {expo.theme && (
              <p className="text-xs text-slate-300 line-clamp-1">{expo.theme}</p>
            )}
          </div>
        </div>

        {/* Tab Navigation Strip */}
        <div className="border-b border-[#E5E7EB] dark:border-white/10 bg-slate-50/90 dark:bg-[#0F172A]/90 px-6 py-2 flex items-center justify-between gap-4 overflow-x-auto shrink-0">
          <div className="flex space-x-2 sm:space-x-3">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === "overview"
                  ? "bg-white dark:bg-[#203748] text-[#1488A6] dark:text-[#38B2AC] shadow-xs border border-[#E5E7EB] dark:border-white/10"
                  : "text-[#6B7280] dark:text-[#CBD5E1]/70 hover:text-[#1F2937] dark:hover:text-white"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("floorplan")}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "floorplan"
                  ? "bg-white dark:bg-[#203748] text-[#1488A6] dark:text-[#38B2AC] shadow-xs border border-[#E5E7EB] dark:border-white/10"
                  : "text-[#6B7280] dark:text-[#CBD5E1]/70 hover:text-[#1F2937] dark:hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#1488A6] dark:text-[#38B2AC]" />
              <span>Interactive Floor Plan</span>
            </button>
            <button
              onClick={() => setActiveTab("schedule")}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "schedule"
                  ? "bg-white dark:bg-[#203748] text-[#1488A6] dark:text-[#38B2AC] shadow-xs border border-[#E5E7EB] dark:border-white/10"
                  : "text-[#6B7280] dark:text-[#CBD5E1]/70 hover:text-[#1F2937] dark:hover:text-white"
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-[#1488A6] dark:text-[#38B2AC]" />
              <span>Keynote Schedule ({expoSessions.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("exhibitors")}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "exhibitors"
                  ? "bg-white dark:bg-[#203748] text-[#1488A6] dark:text-[#38B2AC] shadow-xs border border-[#E5E7EB] dark:border-white/10"
                  : "text-[#6B7280] dark:text-[#CBD5E1]/70 hover:text-[#1F2937] dark:hover:text-white"
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-[#1488A6] dark:text-[#38B2AC]" />
              <span>Exhibitors ({bookedBooths.length})</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6 max-w-3xl mx-auto">
              {/* Key Quick Facts Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0F172A]/80 border border-[#E5E7EB] dark:border-white/10">
                  <span className="text-[10px] uppercase font-mono font-bold text-[#6B7280] dark:text-[#CBD5E1]/60 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#1488A6] dark:text-[#38B2AC]" /> Event Dates
                  </span>
                  <span className="font-bold text-[#1F2937] dark:text-[#F8FAFC] block mt-1">
                    {new Date(expo.date).toLocaleDateString([], { month: "short", day: "numeric" })} –{" "}
                    {new Date(expo.endDate || expo.date).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0F172A]/80 border border-[#E5E7EB] dark:border-white/10">
                  <span className="text-[10px] uppercase font-mono font-bold text-[#6B7280] dark:text-[#CBD5E1]/60 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#1488A6] dark:text-[#38B2AC]" /> Location
                  </span>
                  <span className="font-bold text-[#1F2937] dark:text-[#F8FAFC] block mt-1 truncate">
                    {expo.location || expo.venue || expo.city || "Apex Convention Center"}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0F172A]/80 border border-[#E5E7EB] dark:border-white/10">
                  <span className="text-[10px] uppercase font-mono font-bold text-[#6B7280] dark:text-[#CBD5E1]/60 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-[#1488A6] dark:text-[#38B2AC]" /> Booths
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 block mt-1 font-mono">
                    {availableBoothsCount} of {expo.total_booths} Open
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0F172A]/80 border border-[#E5E7EB] dark:border-white/10">
                  <span className="text-[10px] uppercase font-mono font-bold text-[#6B7280] dark:text-[#CBD5E1]/60 flex items-center gap-1">
                    <Ticket className="w-3.5 h-3.5 text-[#1488A6] dark:text-[#38B2AC]" /> Access Pass
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 block mt-1 font-mono">
                    Free Entry Pass
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading">
                  About this Exhibition
                </h3>
                <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#CBD5E1]/90 leading-relaxed">
                  {expo.description}
                </p>
              </div>

              {/* Venue details */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A]/80 border border-[#E5E7EB] dark:border-white/10 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#1488A6]/10 dark:bg-[#38B2AC]/15 flex items-center justify-center text-[#1488A6] dark:text-[#38B2AC] shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading">Convention Venue & Transit</h4>
                  <p className="text-xs text-[#6B7280] dark:text-[#CBD5E1]/80 mt-0.5">{expo.venue || expo.location || "Apex Convention Hall & Expo Center"}</p>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#CBD5E1]/50 mt-1">
                    Direct access via airport express shuttle and metro transit stations. Turnstile checkpoints active.
                  </p>
                </div>
              </div>

              {/* Action Callout */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 border border-[#1488A6]/30 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold font-heading">Participate in {expo.title}</h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {(currentUser?.role === "exhibitor" || currentRole === "exhibitor")
                      ? "Reserve your corporate booth space and showcase your product catalog."
                      : isRegistered
                        ? "You hold an active verified digital turnstile pass for this summit."
                        : "Claim your complimentary digital attendee pass with instant QR turnstile access."}
                  </p>
                </div>

                <div className="shrink-0 w-full sm:w-auto">
                  {(currentUser?.role === "exhibitor" || currentRole === "exhibitor") ? (
                    <button
                      onClick={() => handleApplyClick(expo._id)}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl btn-teal-primary text-white text-xs font-bold shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Building2 className="w-4 h-4" /> Exhibit at this Expo
                    </button>
                  ) : isRegistered ? (
                    <button
                      onClick={() => {
                        if (userRegistration) {
                          setActivePassId(userRegistration._id || userRegistration.id);
                        }
                      }}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <QrCode className="w-4 h-4" /> View Digital Turnstile QR Pass
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRegisterClick(expo._id)}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl btn-teal-primary text-white text-xs font-bold shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Ticket className="w-4 h-4" /> Get Free Access Pass
                    </button>
                  )}
                </div>
              </div>

              {/* In-Context Feedback */}
              <InContextFeedback expoId={expo._id} expoTitle={expo.title} />
            </div>
          )}

          {/* TAB 2: FLOOR PLAN */}
          {activeTab === "floorplan" && (
            <div className="space-y-4">
              <FloorPlanView expoId={expo._id} />
            </div>
          )}

          {/* TAB 3: KEYNOTE SCHEDULE */}
          {activeTab === "schedule" && (
            <div className="space-y-4 max-w-3xl mx-auto">
              {expoSessions.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#6B7280] dark:text-[#CBD5E1]/60 space-y-1">
                  <Clock className="w-8 h-8 mx-auto text-[#6B7280] dark:text-[#CBD5E1]/40" />
                  <p className="font-semibold">Keynote schedule in preparation</p>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#CBD5E1]/50">
                    Sessions and stage speaker allocations will appear here shortly.
                  </p>
                </div>
              ) : (
                expoSessions.map((session) => {
                  const isBookmarked = (bookmarks || []).some((b) => {
                    const bSessId = typeof b.session_id === "object" ? b.session_id?._id : b.session_id;
                    return String(bSessId) === String(session._id || session.id);
                  });

                  return (
                    <div
                      key={session._id || session.id}
                      className="p-4 rounded-2xl border border-[#E5E7EB] dark:border-white/10 bg-white dark:bg-[#203748]/50 hover:shadow-xs transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
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
                        onClick={() => toggleBookmark(session._id || session.id, expo._id)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all self-start sm:self-center cursor-pointer ${
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {bookedBooths.length === 0 ? (
                <div className="col-span-2 py-12 text-center text-xs text-[#6B7280] dark:text-[#CBD5E1]/60 space-y-1">
                  <Building2 className="w-8 h-8 mx-auto text-[#6B7280] dark:text-[#CBD5E1]/40" />
                  <p className="font-semibold">Exhibitor floor allocations in progress</p>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#CBD5E1]/50">
                    Verified vendors will appear here once booth assignments are confirmed.
                  </p>
                </div>
              ) : (
                bookedBooths.map((b) => (
                  <div
                    key={b._id}
                    className="p-4 rounded-2xl border border-[#E5E7EB] dark:border-white/10 bg-white dark:bg-[#203748]/60 hover:shadow-xs transition-all flex flex-col justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-800 text-[#38B2AC] flex items-center justify-center font-bold text-xs shrink-0 font-mono border border-[#38B2AC]/20">
                        {b.booth_number}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs sm:text-sm font-bold text-[#1F2937] dark:text-[#F8FAFC] truncate font-heading">
                          {b.exhibitor_name}
                        </h4>
                        <p className="text-[11px] text-[#6B7280] dark:text-[#CBD5E1]/70 mt-0.5">{b.category || "Technology"}</p>
                        <span className="inline-block mt-1 text-[10px] font-semibold text-[#1488A6] dark:text-[#38B2AC]">
                          Hall: {b.hall}
                        </span>
                      </div>
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

export default ExpoDetailModal;

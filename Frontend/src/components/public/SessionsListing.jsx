import { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  Search,
  Calendar,
  Clock,
  MapPin,
  Bookmark,
  Sparkles,
  Ticket,
  CheckCircle2,
  ChevronDown
} from "lucide-react";

export const SessionsListing = ({ onSelectExpo, onRegisterPass }) => {
  const {
    sessions = [],
    expos = [],
    bookmarks = [],
    toggleBookmark,
    registrations = [],
    currentUser,
    currentRole,
    setActivePassId,
    setActiveView,
    showToast
  } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExpoId, setSelectedExpoId] = useState("all");
  const [filterMode, setFilterMode] = useState("all");

  const currentUserId = String(currentUser?._id || currentUser?.user_id || "");

  const hasExpoPass = (expoId) => {
    if (!currentUser || currentUser.role === "public") return false;
    return (registrations || []).some((r) => {
      const rExpoId = String(typeof r.expo_id === "object" ? r.expo_id?._id : r.expo_id || "");
      const rUserId = String(typeof r.user_id === "object" ? r.user_id?._id : r.user_id || "");
      const rEmail = (r.user_email || r.email || "").toLowerCase();
      const uEmail = (currentUser?.email || "").toLowerCase();
      const matchExpo = rExpoId === String(expoId);
      const matchUser = (rUserId && rUserId === currentUserId) || (uEmail && rEmail === uEmail);
      return matchExpo && matchUser;
    });
  };

  const isBookmarked = (sessionId) => {
    if (!currentUser || currentRole === "public") return false;
    const currentUserId = String(currentUser?._id || currentUser?.user_id || "");
    if (!currentUserId) return false;

    return (bookmarks || []).some((b) => {
      const bSessId = typeof b.session_id === "object" ? b.session_id?._id : b.session_id;
      const bUserId = typeof b.user_id === "object" ? b.user_id?._id : b.user_id;
      return String(bUserId) === currentUserId && String(bSessId) === String(sessionId);
    });
  };

  const filteredSessions = (sessions || []).filter((session) => {
    if (!session) return false;
    const sExpoId = String(typeof session.expo_id === "object" ? session.expo_id?._id : session.expo_id || "");

    if (selectedExpoId !== "all" && sExpoId !== selectedExpoId) return false;

    const bookmarked = isBookmarked(session._id || session.id);
    if (filterMode === "bookmarked" && !bookmarked) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (session.title || "").toLowerCase().includes(q);
      const matchSpeaker = (session.speaker || "").toLowerCase().includes(q);
      const matchTopic = (session.topic || "").toLowerCase().includes(q);
      const matchLoc = (session.location || "").toLowerCase().includes(q);
      if (!matchTitle && !matchSpeaker && !matchTopic && !matchLoc) return false;
    }
    return true;
  });

  const totalBookmarkedCount = (!currentUser || currentRole === "public") ? 0 : (sessions || []).filter((s) => isBookmarked(s._id || s.id)).length;

  const handleBookmarkClick = (session) => {
    if (!currentUser || currentRole === "public") {
      showToast("Sign In Required", "Please sign in to save sessions to your schedule.", "error");
      setActiveView("login");
      return;
    }
    const sExpoId = typeof session.expo_id === "object" ? session.expo_id?._id : session.expo_id;
    toggleBookmark(session._id || session.id, sExpoId);
  };

  return (
    <div id="sessions-listing-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-body">

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E5E7EB] dark:border-white/10 pb-6">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#1488A6] dark:text-[#38B2AC]">
            Discovery & Agenda
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1F2937] dark:text-[#F8FAFC] tracking-tight mt-1 font-heading">
            Browse Summit Keynotes & Panels
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#CBD5E1]/80 mt-1.5 max-w-xl leading-relaxed">
            Explore multi-track stage sessions, panel discussions, and keynotes. Bookmark sessions for summits where you hold a verified access pass.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#1A202C] p-1.5 rounded-2xl text-xs self-start md:self-auto border border-[#E5E7EB] dark:border-white/10">
          <button
            onClick={() => setFilterMode("all")}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${filterMode === "all"
                ? "bg-white dark:bg-[#203748] text-[#1488A6] dark:text-[#38B2AC] shadow-xs border border-[#E5E7EB] dark:border-white/10"
                : "text-[#6B7280] dark:text-[#CBD5E1]/70 hover:text-[#1F2937] dark:hover:text-white"
              }`}
          >
            All Sessions ({sessions.length})
          </button>
          <button
            onClick={() => setFilterMode("bookmarked")}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${filterMode === "bookmarked"
                ? "bg-white dark:bg-[#203748] text-[#1488A6] dark:text-[#38B2AC] shadow-xs border border-[#E5E7EB] dark:border-white/10"
                : "text-[#6B7280] dark:text-[#CBD5E1]/70 hover:text-[#1F2937] dark:hover:text-white"
              }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>My Bookmarked ({totalBookmarkedCount})</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1A202C] p-4 rounded-2xl border border-[#E5E7EB] dark:border-white/10 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">

        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search talks, speakers, halls, or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-[#0F172A]/80 border border-[#E5E7EB] dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#38B2AC] text-[#1F2937] dark:text-white"
          />
        </div>

        <div className="relative w-full sm:w-80 shrink-0">
          <div className="relative">
            <select
              value={selectedExpoId}
              onChange={(e) => setSelectedExpoId(e.target.value)}
              className="w-full appearance-none pl-3.5 pr-10 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-[#0F172A]/80 border border-[#E5E7EB] dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#38B2AC] text-[#1F2937] dark:text-white font-semibold cursor-pointer shadow-xs truncate"
            >
              <option value="all">All Summits & Expos ({expos.length})</option>
              {expos.map((e) => (
                <option key={e._id || e.id} value={e._id || e.id}>
                  {e.title}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#6B7280] dark:text-[#CBD5E1]/60" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSessions.length === 0 ? (
          <div className="col-span-full py-16 text-center space-y-3 saas-card rounded-3xl p-8">
            <Clock className="w-12 h-12 text-[#6B7280] dark:text-[#CBD5E1]/40 mx-auto" />
            <h3 className="text-base sm:text-lg font-bold text-[#1F2937] dark:text-[#F8FAFC]">
              No Keynote Sessions Found
            </h3>
            <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#CBD5E1]/70 max-w-md mx-auto">
              Try selecting a different summit or clearing your search term to explore available sessions.
            </p>
          </div>
        ) : (
          filteredSessions.map((session) => {
            const sId = session._id || session.id;
            const sExpoId = typeof session.expo_id === "object" ? session.expo_id?._id : session.expo_id;
            const expo = expos.find((e) => e._id === sExpoId || e.id === sExpoId);
            const bookmarked = isBookmarked(sId);
            const userHasPass = hasExpoPass(sExpoId);

            return (
              <div
                key={sId}
                className="saas-card saas-card-hover rounded-3xl p-5 sm:p-6 flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3.5">

                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-xs text-[#1488A6] dark:text-[#38B2AC] bg-teal-50 dark:bg-[#203748] px-2.5 py-1 rounded-lg border border-[#1488A6]/20 dark:border-[#38B2AC]/30 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {session.start_time
                          ? new Date(session.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                          : "TBA"}
                        {session.end_time
                          ? ` – ${new Date(session.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                          : ""}
                      </span>
                    </span>

                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[#1F2937] dark:text-[#CBD5E1]">
                      {session.location || "Main Stage"}
                    </span>
                  </div>

                  <div>
                    {session.topic && (
                      <span className="text-[11px] font-bold text-[#1488A6] dark:text-[#38B2AC] uppercase tracking-wider block mb-1">
                        {session.topic}
                      </span>
                    )}
                    <h3 className="text-base font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading line-clamp-2 leading-snug group-hover:text-[#1488A6] dark:group-hover:text-[#38B2AC] transition-colors">
                      {session.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2.5 pt-1">
                    <div className="min-w-0 flex-1 leading-tight">
                      <p className="text-xs font-bold text-[#1F2937] dark:text-[#F8FAFC] truncate">
                        {session.speaker}
                      </p>
                      {session.speaker_title && (
                        <p className="text-[10px] text-[#6B7280] dark:text-[#CBD5E1]/60 truncate">
                          {session.speaker_title}
                        </p>
                      )}
                    </div>
                  </div>

                  {expo && (
                    <div className="text-[11px] text-[#6B7280] dark:text-[#CBD5E1]/70 font-mono flex items-center gap-1.5 pt-1 border-t border-[#E5E7EB] dark:border-white/5">
                      <Calendar className="w-3 h-3 text-[#1488A6] dark:text-[#38B2AC]" />
                      <span className="truncate">{expo.title}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-[#E5E7EB] dark:border-white/10 flex items-center justify-between gap-2">
                  <div>
                    {userHasPass ? (
                      <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Pass Active
                      </span>
                    ) : (
                      <button
                        onClick={() => onRegisterPass && onRegisterPass(sExpoId)}
                        className="text-[10px] font-mono font-bold text-[#1488A6] dark:text-[#38B2AC] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Ticket className="w-3 h-3" /> Claim Pass to Save
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => handleBookmarkClick(session)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${bookmarked
                        ? "btn-teal-primary text-white"
                        : "bg-slate-100 dark:bg-[#1A202C] hover:bg-slate-200 dark:hover:bg-[#203748] text-[#1F2937] dark:text-[#CBD5E1] border border-[#E5E7EB] dark:border-white/10"
                      }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" fill={bookmarked ? "currentColor" : "none"} />
                    <span>{bookmarked ? "Saved" : "Add to Schedule"}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SessionsListing;

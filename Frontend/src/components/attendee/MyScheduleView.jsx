import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import {
  Bookmark,
  Search,
  MapPin,
  Clock,
  Calendar,
  Sparkles,
  Layers,
  CheckCircle2
} from "lucide-react";

export const MyScheduleView = () => {
  const {
    sessions = [],
    expos = [],
    bookmarks = [],
    fetchBookmarksApi,
    fetchSessionsForExpo,
    toggleBookmark,
    currentUser = {}
  } = useApp();

  const [selectedExpoId, setSelectedExpoId] = useState(expos[0]?._id || "");
  const [filterMode, setFilterMode] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("all");

  // Sync selectedExpoId when expos load
  useEffect(() => {
    if (expos.length > 0 && (!selectedExpoId || !expos.some((e) => e._id === selectedExpoId || String(e._id) === String(selectedExpoId)))) {
      setSelectedExpoId(expos[0]._id);
    }
  }, [expos, selectedExpoId]);

  // Fetch bookmarks from MongoDB on mount
  useEffect(() => {
    if (fetchBookmarksApi) {
      fetchBookmarksApi();
    }
  }, []);

  // Fetch sessions from MongoDB when selected expo changes
  useEffect(() => {
    if (selectedExpoId && fetchSessionsForExpo) {
      fetchSessionsForExpo(selectedExpoId);
    }
  }, [selectedExpoId]);

  const currentUserId = currentUser?._id || currentUser?.user_id;

  // Helper to check if session is bookmarked in MongoDB state
  const isBookmarked = (sessionId) => {
    return (bookmarks || []).some((b) => {
      const bSessId = typeof b.session_id === "object" ? b.session_id?._id : b.session_id;
      const bUserId = typeof b.user_id === "object" ? b.user_id?._id : b.user_id;
      if (bUserId && currentUserId && String(bUserId) !== String(currentUserId)) {
        return false;
      }
      return String(bSessId) === String(sessionId);
    });
  };

  const expoSessions = (sessions || []).filter((s) => {
    const sExpoId = typeof s.expo_id === "object" ? s.expo_id?._id : s.expo_id;
    return String(sExpoId) === String(selectedExpoId);
  });

  const topics = ["all", ...Array.from(new Set(expoSessions.map((s) => s.topic).filter(Boolean)))];

  const filteredSessions = expoSessions.filter((s) => {
    const bookmarked = isBookmarked(s._id);
    if (filterMode === "bookmarked" && !bookmarked) return false;
    if (selectedTopic !== "all" && s.topic !== selectedTopic) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (s.title || "").toLowerCase().includes(q);
      const matchSpeaker = (s.speaker || "").toLowerCase().includes(q);
      const matchTopic = (s.topic || "").toLowerCase().includes(q);
      const matchLoc = (s.location || "").toLowerCase().includes(q);
      if (!matchTitle && !matchSpeaker && !matchTopic && !matchLoc) return false;
    }
    return true;
  });

  const totalBookmarkedCount = expoSessions.filter((s) => isBookmarked(s._id)).length;

  return (
    <div id="my-schedule-view" className="space-y-6 font-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1F2937] dark:text-[#F8FAFC] tracking-tight font-heading">
            My Schedule & Keynotes
          </h2>
          <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#CBD5E1] mt-0.5">
            Explore stage talks and bookmark keynotes to build your personal event agenda.
          </p>
        </div>

        {/* Dynamic Expo Selector */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#1488A6] dark:text-[#38B2AC] shrink-0" />
          <select
            value={selectedExpoId}
            onChange={(e) => {
              setSelectedExpoId(e.target.value);
              setSelectedTopic("all");
            }}
            className="text-xs sm:text-sm bg-white dark:bg-[#1A202C] border border-[#E5E7EB] dark:border-white/10 rounded-xl px-3 py-2 font-semibold text-[#1F2937] dark:text-[#F8FAFC] shadow-xs focus:outline-none focus:ring-2 focus:ring-[#38B2AC] cursor-pointer"
          >
            {expos.map((e) => (
              <option key={e._id} value={e._id}>
                {e.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter Bar & Topic Badges */}
      <div className="bg-white dark:bg-[#1A202C] p-4 rounded-2xl border border-[#E5E7EB] dark:border-white/10 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#0F172A] p-1 rounded-xl text-xs border border-[#E5E7EB] dark:border-white/10">
              <button
                onClick={() => setFilterMode("all")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${filterMode === "all"
                  ? "bg-white dark:bg-[#203748] text-[#1F2937] dark:text-white shadow-xs border border-[#E5E7EB] dark:border-white/10"
                  : "text-[#6B7280] dark:text-[#CBD5E1]/70 hover:text-[#1F2937] dark:hover:text-white"
                  }`}
              >
                All Program ({expoSessions.length})
              </button>
              <button
                onClick={() => setFilterMode("bookmarked")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${filterMode === "bookmarked"
                  ? "btn-teal-primary text-white shadow-xs"
                  : "text-[#6B7280] dark:text-[#CBD5E1]/70 hover:text-[#1F2937] dark:hover:text-white"
                  }`}
              >
                <Bookmark className="w-3.5 h-3.5" /> My Starred Agenda ({totalBookmarkedCount})
              </button>
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#CBD5E1]/60" />
            <input
              type="text"
              placeholder="Search topic or speaker..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC]"
            />
          </div>
        </div>

        {/* Dynamic Topic Badges Filter */}
        {topics.length > 1 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#E5E7EB] dark:border-white/10 text-xs">
            <span className="text-[11px] font-bold text-[#6B7280] dark:text-[#CBD5E1]/70 uppercase tracking-wider font-mono mr-1">
              Topics:
            </span>
            {topics.map((tp) => (
              <button
                key={tp}
                onClick={() => setSelectedTopic(tp)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${selectedTopic === tp
                  ? "bg-[#1488A6] text-white shadow-xs font-bold"
                  : "bg-slate-100 dark:bg-[#0F172A] hover:bg-slate-200 dark:hover:bg-white/10 text-[#6B7280] dark:text-[#CBD5E1]"
                  }`}
              >
                {tp === "all" ? "All Topics" : tp}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Sessions Timeline List */}
      <div className="space-y-3">
        {filteredSessions.length === 0 ? (
          <div className="py-12 bg-white dark:bg-[#1A202C] rounded-2xl border border-[#E5E7EB] dark:border-white/10 text-center text-xs sm:text-sm text-[#6B7280] dark:text-[#CBD5E1]/70 p-6 space-y-2">
            <Calendar className="w-8 h-8 mx-auto text-[#6B7280] dark:text-[#CBD5E1]/40" />
            <h4 className="font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading">
              {filterMode === "bookmarked"
                ? "No bookmarked sessions in your agenda"
                : "No keynote sessions found"}
            </h4>
            <p className="text-xs max-w-sm mx-auto">
              {filterMode === "bookmarked"
                ? "Click the 'Bookmark' button on any session to save it to your personal schedule."
                : "Try selecting another expo or clearing your search filters."}
            </p>
          </div>
        ) : (
          filteredSessions.map((s) => {
            const bookmarked = isBookmarked(s._id);
            return (
              <div
                key={s._id}
                className="bg-white dark:bg-[#1A202C] p-4 sm:p-5 rounded-2xl border border-[#E5E7EB] dark:border-white/10 hover:border-[#38B2AC]/50 dark:hover:border-[#38B2AC]/50 shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#6B7280] dark:text-[#CBD5E1]/80">
                    <span className="font-mono font-bold text-[#1F2937] dark:text-[#F8FAFC] bg-slate-100 dark:bg-[#0F172A] px-2.5 py-0.5 rounded border border-[#E5E7EB] dark:border-white/5">
                      {s.start_time
                        ? new Date(s.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : "09:00 AM"}
                      {" – "}
                      {s.end_time
                        ? new Date(s.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : "10:00 AM"}
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-[#1488A6] dark:text-[#38B2AC] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {s.location || "Main Stage"}
                    </span>
                    {s.topic && (
                      <>
                        <span>•</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold teal-badge uppercase">
                          {s.topic}
                        </span>
                      </>
                    )}
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading">
                    {s.title}
                  </h3>

                  <div className="flex items-center gap-3 pt-1">
                    <div>
                      <span className="text-xs font-bold text-[#1F2937] dark:text-[#F8FAFC] block">
                        Speaker : {s.speaker || "Keynote Speaker"}
                      </span>
                      {s.speaker_title && (
                        <span className="text-[11px] text-[#6B7280] dark:text-[#CBD5E1]/60 block -mt-0.5">
                          {s.speaker_title}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => toggleBookmark(s._id, selectedExpoId)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ${bookmarked
                      ? "btn-teal-primary text-white"
                      : "bg-slate-50 dark:bg-[#0F172A] hover:bg-slate-100 dark:hover:bg-[#203748] text-[#1F2937] dark:text-[#CBD5E1] border border-[#E5E7EB] dark:border-white/10"
                      }`}
                  >
                    <Bookmark
                      className={`w-4 h-4 ${bookmarked ? "fill-white text-white" : "text-[#6B7280] dark:text-[#CBD5E1]/60"}`}
                    />
                    {bookmarked ? "Starred" : "Bookmark"}
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

export default MyScheduleView;


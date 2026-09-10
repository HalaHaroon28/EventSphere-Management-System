import { useApp } from "../../context/AppContext";
import {
  X,
  Bookmark,
  Calendar,
  Clock,
  MapPin,
  Trash2,
  ExternalLink,
  Sparkles,
  Plus
} from "lucide-react";

export const MySessionsModal = ({ isOpen, onClose, onSelectExpo }) => {
  const {
    sessions = [],
    expos = [],
    bookmarks = [],
    toggleBookmark,
    currentUser,
    setActiveView
  } = useApp();

  if (!isOpen) return null;

  const currentUserId = String(currentUser?._id || currentUser?.user_id || "");

  // Filter bookmarked sessions for the current user
  const userBookmarkedSessions = (!currentUser || !currentUserId)
    ? []
    : sessions.filter((s) => {
        return (bookmarks || []).some((b) => {
          const bSessId = typeof b.session_id === "object" ? b.session_id?._id : b.session_id;
          const bUserId = typeof b.user_id === "object" ? b.user_id?._id : b.user_id;
          return String(bUserId) === currentUserId && String(bSessId) === String(s._id || s.id);
        });
      });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200 font-body">
      <div className="bg-white dark:bg-[#1A202C] rounded-3xl shadow-2xl border border-[#E5E7EB] dark:border-white/10 max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-[#1488A6] to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
              <Bookmark className="w-5 h-5 text-[#38B2AC]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#38B2AC]">
                  Personal Agenda
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#38B2AC]/20 text-[#38B2AC] border border-[#38B2AC]/30 font-mono">
                  {userBookmarkedSessions.length} {userBookmarkedSessions.length === 1 ? "Session" : "Sessions"}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white font-heading">
                My Bookmarked Sessions & Keynotes
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {userBookmarkedSessions.length === 0 ? (
            <div className="py-12 px-4 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-[#203748] flex items-center justify-center mx-auto text-[#1488A6] dark:text-[#38B2AC]">
                <Bookmark className="w-8 h-8 opacity-60" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-[#1F2937] dark:text-[#F8FAFC]">
                  No Bookmarked Sessions Yet
                </h4>
                <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#CBD5E1]/70 max-w-md mx-auto">
                  Browse summit keynote sessions and bookmark the stage talks you'd like to attend.
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  setActiveView("sessions");
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 btn-teal-primary text-white text-xs sm:text-sm font-bold rounded-xl shadow-md cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" /> Explore Keynote Sessions
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {userBookmarkedSessions.map((session) => {
                const sExpoId = typeof session.expo_id === "object" ? session.expo_id?._id : session.expo_id;
                const expo = expos.find((e) => e._id === sExpoId || e.id === sExpoId);

                return (
                  <div
                    key={session._id || session.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A]/70 border border-[#E5E7EB] dark:border-white/10 hover:border-[#1488A6]/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-[11px]">
                        <span className="font-mono font-bold text-[#1488A6] dark:text-[#38B2AC] bg-teal-50 dark:bg-[#203748] px-2.5 py-0.5 rounded-md border border-[#1488A6]/20 dark:border-[#38B2AC]/30">
                          {session.start_time
                            ? new Date(session.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                            : "TBA"}
                          {" – "}
                          {session.end_time
                            ? new Date(session.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                            : ""}
                        </span>
                        {session.location && (
                          <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[#1F2937] dark:text-[#CBD5E1] font-semibold text-[10px]">
                            {session.location}
                          </span>
                        )}
                        {session.topic && (
                          <span className="text-[#1488A6] dark:text-[#38B2AC] font-bold text-[10px]">
                            {session.topic}
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm sm:text-base font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading line-clamp-1">
                        {session.title}
                      </h4>

                      <div className="flex items-center gap-2 text-xs text-[#6B7280] dark:text-[#CBD5E1]/80">
                        <img
                          src={session.speaker_avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
                          alt={session.speaker}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span className="font-medium text-[#1F2937] dark:text-[#F8FAFC]">{session.speaker}</span>
                        {session.speaker_title && (
                          <span className="text-[11px] text-[#6B7280] dark:text-[#CBD5E1]/50">({session.speaker_title})</span>
                        )}
                        {expo && (
                          <span className="text-[10px] text-[#6B7280] dark:text-[#CBD5E1]/60 font-mono ml-auto">
                            • {expo.title}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => toggleBookmark(session._id, sExpoId)}
                      className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer self-start sm:self-center shrink-0 border border-transparent hover:border-rose-200 dark:hover:border-rose-900"
                      title="Remove from Schedule"
                      aria-label="Remove session from schedule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-[#0F172A]/50 border-t border-[#E5E7EB] dark:border-white/10 flex items-center justify-between text-xs text-[#6B7280] dark:text-[#CBD5E1]/60">
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-[#38B2AC]" />
            <span>Personalized agenda synchronized across sessions</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-[#203748] text-[#1F2937] dark:text-white font-bold cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

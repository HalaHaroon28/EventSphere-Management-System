import { useEffect, useState } from "react";
import { useApp } from "../../context/AppContext";
import { MetricCard } from "../common/MetricCard";
import {
  Ticket,
  QrCode,
  Calendar,
  Building2,
  Clock,
  ArrowRight,
  Sparkles,
  Bookmark,
  Compass,
  MessageSquare,
  Search,
  Zap,
  Cpu
} from "lucide-react";

export const AttendeeDashboard = ({
  onNavigate,
  onOpenPass,
  onOpenAIMatchmaker
}) => {
  const {
    currentUser = {},
    registrations = [],
    bookmarks = [],
    sessions = [],
    expos = [],
    messages = [],
    fetchRegistrationsApi,
    fetchBookmarksApi,
    fetchExpos,
    fetchInboxApi
  } = useApp();

  const [aiSearchInput, setAiSearchInput] = useState("");

  const handleTriggerMatchmaker = (customQuery) => {
    const q = customQuery !== undefined ? customQuery : aiSearchInput;
    if (onOpenAIMatchmaker) {
      onOpenAIMatchmaker(q);
    }
  };

  useEffect(() => {
    if (typeof fetchRegistrationsApi === "function") fetchRegistrationsApi();
    if (typeof fetchBookmarksApi === "function") fetchBookmarksApi();
    if (typeof fetchExpos === "function") fetchExpos();
    if (typeof fetchInboxApi === "function") fetchInboxApi();
  }, []);

  const userIdStr = String(currentUser?._id || currentUser?.user_id || "");
  const userEmail = currentUser?.email || "";

  const myRegistrations = (registrations || []).filter((r) => {
    const rUserId = typeof r.user_id === "object" ? r.user_id?._id : r.user_id;
    if (rUserId) return String(rUserId) === userIdStr;
    return r.user_email === userEmail;
  });

  const myBookmarkedSessions = (sessions || []).filter((s) =>
    (bookmarks || []).some((b) => {
      const bSessId = typeof b.session_id === "object" ? b.session_id?._id : b.session_id;
      const bUserId = typeof b.user_id === "object" ? b.user_id?._id : b.user_id;
      return String(bSessId) === String(s._id) && (String(bUserId) === userIdStr || b.user_email === userEmail);
    })
  );

  const myMessages = (messages || []).filter((m) => {
    const senderId = typeof m.sender_id === "object" ? m.sender_id?._id : m.sender_id;
    const receiverId = typeof m.receiver_id === "object" ? m.receiver_id?._id : m.receiver_id;
    return String(senderId) === userIdStr || String(receiverId) === userIdStr;
  });

  return (
    <div id="attendee-dashboard-view" className="space-y-8 font-body">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] dark:text-[#F8FAFC] tracking-tight font-heading">
              Attendee Dashboard
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold teal-badge font-mono">
              Attendee
            </span>
          </div>
          <p className="text-sm sm:text-base text-[#6B7280] dark:text-[#CBD5E1] mt-1">
            Welcome back, {currentUser?.name || "Attendee"} • View your digital tickets, saved sessions, and exhibitor contacts.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={() => handleTriggerMatchmaker("I want edge computing hardware and IoT sensors")}
            className="flex-1 sm:flex-initial justify-center px-4 py-2.5 bg-gradient-to-r from-[#1488A6] to-[#38B2AC] hover:from-[#117690] hover:to-[#2C9A93] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" /> AI Booth Matchmaker
          </button>
          <button
            onClick={() => onNavigate("browse-expos")}
            className="flex-1 sm:flex-initial justify-center px-4 sm:px-5 py-2.5 border border-[#E5E7EB] dark:border-white/10 hover:bg-slate-100 dark:hover:bg-[#1E293B] text-[#1F2937] dark:text-[#F8FAFC] text-xs sm:text-sm font-bold rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <Compass className="w-4 h-4" /> Browse All Expos
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-[#0C2A31] to-slate-900 text-white p-6 sm:p-7 border border-teal-500/30 shadow-xl shadow-teal-950/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">

          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-[#38B2AC]/20 text-[#38B2AC] border border-[#38B2AC]/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#38B2AC]" /> Gemini AI Matchmaker
              </span>
              <span className="text-xs text-slate-300 font-mono hidden sm:inline">
                • Real-time Active Catalog Synthesis
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight font-heading">
              What are you looking for at this expo?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Describe the specific technologies, hardware, or solutions you need. Gemini AI will cross-reference the live exhibitor floor to deliver your tailored <strong className="text-[#38B2AC]">"Top 3 Booths You Must Visit"</strong>.
            </p>
          </div>

          <div className="w-full lg:max-w-md space-y-3">
            <div className="relative flex items-center">
              <Search className="w-4.5 h-4.5 absolute left-3.5 text-slate-400" />
              <input
                type="text"
                value={aiSearchInput}
                onChange={(e) => setAiSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleTriggerMatchmaker();
                }}
                placeholder="e.g. edge computing hardware and IoT sensors..."
                className="w-full pl-10 pr-28 py-3 rounded-2xl bg-white/10 dark:bg-black/40 border border-white/20 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#38B2AC] backdrop-blur-sm"
              />
              <button
                onClick={() => handleTriggerMatchmaker()}
                className="absolute right-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#1488A6] to-[#38B2AC] hover:from-[#117690] hover:to-[#2C9A93] text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" /> Match
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => handleTriggerMatchmaker("I want edge computing hardware and IoT sensors")}
                className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer"
              >
                Edge & IoT Hardware
              </button>
              <button
                onClick={() => handleTriggerMatchmaker("Looking for computer vision and AI camera nodes")}
                className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer"
              >
                AI & Computer Vision
              </button>
              <button
                onClick={() => handleTriggerMatchmaker("Enterprise zero-trust network cybersecurity")}
                className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer"
              >
                Zero-Trust Cybersecurity
              </button>
            </div>
          </div>

        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        <MetricCard
          id="metric-attendee-passes"
          title="Digital Passes"
          value={myRegistrations.length}
          subtitle="Instant QR verification ready"
          icon={Ticket}
          accentColor="teal"
          badge={myRegistrations.length > 0 ? "Active Pass" : "Get Pass"}
          trend={{
            value: myRegistrations.length > 0 ? "Gate Validated" : "No pass",
            isPositive: myRegistrations.length > 0
          }}
          onClick={() => {
            if (myRegistrations[0]) onOpenPass(myRegistrations[0]._id);
            else onNavigate("browse-expos");
          }}
          actionLabel={myRegistrations.length > 0 ? "Show QR" : "Get Pass"}
        />

        <MetricCard
          id="metric-attendee-schedule"
          title="Starred Sessions"
          value={myBookmarkedSessions.length}
          subtitle="Keynotes & workshop tracks"
          icon={Clock}
          accentColor="teal"
          trend={{
            value: `${myBookmarkedSessions.length} saved`,
            label: "in agenda",
            isPositive: true
          }}
          onClick={() => onNavigate("my-schedule")}
          actionLabel="My Agenda"
        />

        <MetricCard
          id="metric-attendee-expos"
          title="Upcoming Summits"
          value={expos.length}
          subtitle="Global tech exhibitions open"
          icon={Calendar}
          accentColor="emerald"
          trend={{
            value: `${expos.filter((e) => e.status === "upcoming" || !e.status).length} upcoming`,
            isPositive: true
          }}
          onClick={() => onNavigate("browse-expos")}
          actionLabel="Browse"
        />

        <MetricCard
          id="metric-attendee-messages"
          title="Booth Inquiries"
          value={myMessages.length}
          subtitle="Direct chat with exhibitors"
          icon={MessageSquare}
          accentColor="teal"
          trend={{
            value: "Connected",
            label: "live concierge",
            isPositive: true
          }}
          onClick={() => onNavigate("messages")}
          actionLabel="Inbox"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        <div className="lg:col-span-6 bg-white dark:bg-[#1A202C] p-6 sm:p-7 rounded-2xl border border-[#E5E7EB] dark:border-white/10 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#1F2937] dark:text-[#F8FAFC] flex items-center gap-2 font-heading">
                <Ticket className="w-5 h-5 text-[#1488A6] dark:text-[#38B2AC]" />
                My Verified Digital Passes
              </h3>
              <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#CBD5E1]/70 mt-1">
                Present your QR barcode at the registration turnstile.
              </p>
            </div>

            <button
              onClick={() => onNavigate("browse-expos")}
              className="text-xs sm:text-sm font-bold text-[#1488A6] dark:text-[#38B2AC] hover:underline flex items-center gap-1 cursor-pointer shrink-0"
            >
              Browse Expos <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {myRegistrations.length === 0 ? (
              <div className="py-10 text-center text-sm text-[#6B7280] dark:text-[#CBD5E1]/60 bg-slate-50 dark:bg-[#0F172A] rounded-xl border border-dashed border-[#E5E7EB] dark:border-white/10">
                You haven't claimed any exhibition passes yet.
              </div>
            ) : (
              myRegistrations.map((reg) => {
                const passCode = reg.ticket_number || reg.ticket_code || (reg._id ? String(reg._id).slice(-8).toUpperCase() : "PASS-9901");
                const passTitle = reg.expo_title || "Summit Exhibition Pass";
                const passTier = reg.pass_tier || reg.badge_tier || "Standard Attendee Pass";

                return (
                  <div
                    key={reg._id}
                    className="p-5 rounded-2xl border border-[#1488A6]/30 dark:border-[#38B2AC]/30 bg-slate-900 text-white flex items-center justify-between gap-4 shadow-md"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <span className="text-xs font-mono text-[#38B2AC] font-bold uppercase tracking-wider">
                        Turnstile Entry Token
                      </span>
                      <h4 className="text-base font-bold text-white line-clamp-1 font-heading">{passTitle}</h4>
                      <div className="text-xs text-slate-300 font-mono">
                        Pass #{passCode} • Tier: {passTier}
                      </div>
                    </div>

                    <button
                      onClick={() => onOpenPass(reg._id)}
                      className="px-4 py-2.5 rounded-xl btn-teal-primary text-white text-xs sm:text-sm font-bold shadow-md flex items-center gap-2 shrink-0 transition-colors cursor-pointer"
                    >
                      <QrCode className="w-4.5 h-4.5 text-white" /> View QR
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Bookmarked Keynotes & Sessions */}
        <div className="lg:col-span-6 bg-white dark:bg-[#1A202C] p-6 sm:p-7 rounded-2xl border border-[#E5E7EB] dark:border-white/10 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#1F2937] dark:text-[#F8FAFC] flex items-center gap-2 font-heading">
                <Bookmark className="w-5 h-5 text-[#1488A6] dark:text-[#38B2AC]" />
                Bookmarked Keynotes & Panels
              </h3>
              <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#CBD5E1]/70 mt-1">Your personalized summit agenda timeline.</p>
            </div>

            <button
              onClick={() => onNavigate("my-schedule")}
              className="text-xs sm:text-sm font-bold text-[#1488A6] dark:text-[#38B2AC] hover:underline flex items-center gap-1 cursor-pointer"
            >
              Full Schedule <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {myBookmarkedSessions.length === 0 ? (
              <div className="p-4 rounded-xl border border-[#E5E7EB] dark:border-white/10 bg-slate-50/70 dark:bg-[#0F172A]/70 space-y-3">
                <div className="p-3.5 rounded-xl border border-[#E5E7EB] dark:border-white/10 bg-white dark:bg-[#1A202C] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#1488A6] dark:text-[#38B2AC] bg-teal-50 dark:bg-[#203748] px-2.5 py-0.5 rounded-md border border-[#1488A6]/20 dark:border-[#38B2AC]/30">
                        02:30 PM
                      </span>
                      <h4 className="text-sm font-bold text-[#1F2937] dark:text-[#F8FAFC] truncate font-heading">
                        Keynote: The Architectural Convergence
                      </h4>
                    </div>
                    <p className="text-xs text-[#6B7280] dark:text-[#CBD5E1]/70 truncate">
                      Dr. Aris Thorne • Main Auditorium — Level 2
                    </p>
                  </div>
                  <span className="text-[10px] font-mono uppercase font-bold text-[#6B7280] dark:text-[#CBD5E1]/80 bg-slate-100 dark:bg-[#203748] border border-[#E5E7EB] dark:border-white/10 px-2.5 py-1 rounded-md shrink-0 self-start sm:self-auto">
                    KEYNOTE ADDRESS
                  </span>
                </div>

                <div className="p-3.5 rounded-xl border border-[#E5E7EB] dark:border-white/10 bg-white dark:bg-[#1A202C] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#1488A6] dark:text-[#38B2AC] bg-teal-50 dark:bg-[#203748] px-2.5 py-0.5 rounded-md border border-[#1488A6]/20 dark:border-[#38B2AC]/30">
                        04:15 PM
                      </span>
                      <h4 className="text-sm font-bold text-[#1F2937] dark:text-[#F8FAFC] truncate font-heading">
                        Scaling Autonomous Fleet Operations
                      </h4>
                    </div>
                    <p className="text-xs text-[#6B7280] dark:text-[#CBD5E1]/70 truncate">
                      Marcus Chen • Technical Stage Alpha
                    </p>
                  </div>
                  <span className="text-[10px] font-mono uppercase font-bold text-[#6B7280] dark:text-[#CBD5E1]/80 bg-slate-100 dark:bg-[#203748] border border-[#E5E7EB] dark:border-white/10 px-2.5 py-1 rounded-md shrink-0 self-start sm:self-auto">
                    ROBOTICS & LOGISTICS
                  </span>
                </div>
              </div>
            ) : (
              myBookmarkedSessions.map((session) => {
                const startTimeStr = session.start_time
                  ? new Date(session.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  : "10:00 AM";
                const speakerName = session.speaker_name || session.speaker || "Keynote Speaker";
                const locationName = session.location || session.room || "Main Auditorium";

                return (
                  <div
                    key={session._id}
                    className="p-3.5 rounded-xl border border-[#E5E7EB] dark:border-white/10 hover:border-[#38B2AC] bg-slate-50/70 dark:bg-[#0F172A]/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[#1488A6] dark:text-[#38B2AC] bg-teal-50 dark:bg-[#203748] px-2.5 py-0.5 rounded-md border border-[#1488A6]/20 dark:border-[#38B2AC]/30">
                          {startTimeStr}
                        </span>
                        <h4 className="text-sm font-bold text-[#1F2937] dark:text-[#F8FAFC] truncate font-heading">
                          {session.title}
                        </h4>
                      </div>
                      <p className="text-xs text-[#6B7280] dark:text-[#CBD5E1]/70 truncate">
                        {speakerName} • {locationName}
                      </p>
                    </div>

                    <span className="text-[10px] font-mono uppercase font-bold text-[#6B7280] dark:text-[#CBD5E1]/80 bg-slate-100 dark:bg-[#203748] border border-[#E5E7EB] dark:border-white/10 px-2.5 py-1 rounded-md shrink-0 self-start sm:self-auto">
                      {session.topic || session.category || "KEYNOTE"}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Quick Discovery Navigation Bar */}
      <div className="bg-slate-50 dark:bg-[#1A202C] p-6 rounded-2xl border border-[#E5E7EB] dark:border-white/10 space-y-4 shadow-xs">
        <h4 className="text-xs font-mono font-bold text-[#6B7280] dark:text-[#CBD5E1]/60 uppercase tracking-wider">
          Attendee Experience Shortcuts
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <button
            onClick={() => onNavigate("browse-expos")}
            className="p-3.5 bg-white dark:bg-[#203748] hover:bg-slate-100 dark:hover:bg-[#203748]/80 rounded-xl font-semibold text-[#1F2937] dark:text-[#F8FAFC] border border-[#E5E7EB] dark:border-white/10 shadow-xs transition-colors flex items-center gap-2.5 cursor-pointer"
          >
            <Compass className="w-4.5 h-4.5 text-[#1488A6] dark:text-[#38B2AC] shrink-0" />
            <span>Discover Summits</span>
          </button>
          <button
            onClick={() => onNavigate("exhibitors")}
            className="p-3.5 bg-white dark:bg-[#203748] hover:bg-slate-100 dark:hover:bg-[#203748]/80 rounded-xl font-semibold text-[#1F2937] dark:text-[#F8FAFC] border border-[#E5E7EB] dark:border-white/10 shadow-xs transition-colors flex items-center gap-2.5 cursor-pointer"
          >
            <Building2 className="w-4.5 h-4.5 text-[#1488A6] dark:text-[#38B2AC] shrink-0" />
            <span>Search Exhibitors</span>
          </button>
          <button
            onClick={() => onNavigate("my-schedule")}
            className="p-3.5 bg-white dark:bg-[#203748] hover:bg-slate-100 dark:hover:bg-[#203748]/80 rounded-xl font-semibold text-[#1F2937] dark:text-[#F8FAFC] border border-[#E5E7EB] dark:border-white/10 shadow-xs transition-colors flex items-center gap-2.5 cursor-pointer"
          >
            <Clock className="w-4.5 h-4.5 text-[#1488A6] dark:text-[#38B2AC] shrink-0" />
            <span>Schedule Planner</span>
          </button>
          <button
            onClick={() => onNavigate("messages")}
            className="p-3.5 bg-white dark:bg-[#203748] hover:bg-slate-100 dark:hover:bg-[#203748]/80 rounded-xl font-semibold text-[#1F2937] dark:text-[#F8FAFC] border border-[#E5E7EB] dark:border-white/10 shadow-xs transition-colors flex items-center gap-2.5 cursor-pointer"
          >
            <Sparkles className="w-4.5 h-4.5 text-[#1488A6] dark:text-[#38B2AC] shrink-0" />
            <span>Vendor Chat ({myMessages.length})</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendeeDashboard;

import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  Search,
  Calendar,
  Clock,
  MapPin,
  Building2,
  Tag,
  User
} from "lucide-react";

export const ScheduleManager = () => {
  const { sessions, expos, createSession, updateSession, deleteSession, currentUser, setActiveView } = useApp();

  const myExpos = expos.filter((e) => {
    if (!currentUser) return true;
    const orgId = typeof e.organizer_id === "object" ? e.organizer_id?._id : e.organizer_id;
    return (
      orgId === currentUser._id ||
      e.organizer_name === currentUser.name ||
      e.organizer_id === currentUser._id
    );
  });

  const displayExpos = myExpos.length > 0 ? myExpos : expos;

  const [selectedExpoId, setSelectedExpoId] = useState(displayExpos[0]?._id || "");

  useEffect(() => {
    if (displayExpos.length > 0 && (!selectedExpoId || !displayExpos.some(e => e._id === selectedExpoId))) {
      setSelectedExpoId(displayExpos[0]._id);
    }
  }, [displayExpos, selectedExpoId]);

  const currentExpo = displayExpos.find((e) => e._id === selectedExpoId) || displayExpos[0];
  const expoSessions = sessions.filter((s) => s.expo_id === selectedExpoId);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const getExpoDateStr = (expoDate) => {
    if (!expoDate) {
      const today = new Date();
      return today.toISOString().split("T")[0];
    }
    return new Date(expoDate).toISOString().split("T")[0];
  };

  const getTimeStr = (d) => {
    if (!d) return "10:00";
    const dateObj = new Date(d);
    if (isNaN(dateObj.getTime())) return "10:00";
    const hours = String(dateObj.getHours()).padStart(2, "0");
    const minutes = String(dateObj.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [speaker, setSpeaker] = useState("");
  const [sessionTimeStart, setSessionTimeStart] = useState("10:00");
  const [sessionTimeEnd, setSessionTimeEnd] = useState("11:00");

  const openCreateModal = () => {
    setEditingSession(null);
    setTitle("");
    setTopic(currentExpo?.category || "Keynote & Panel");
    setSpeaker("");
    setSessionTimeStart("10:00");
    setSessionTimeEnd("11:00");
    setIsModalOpen(true);
  };

  const openEditModal = (s) => {
    setEditingSession(s);
    setTitle(s.title || "");
    setTopic(s.topic || "");
    setSpeaker(s.speaker || "");
    setSessionTimeStart(getTimeStr(s.start_time));
    setSessionTimeEnd(getTimeStr(s.end_time));
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    const eventDateStr = getExpoDateStr(currentExpo?.date);
    const finalLocation = currentExpo?.location || "Grand Main Hall";

    const startIso = new Date(`${eventDateStr}T${sessionTimeStart}:00`).toISOString();
    const endIso = new Date(`${eventDateStr}T${sessionTimeEnd}:00`).toISOString();

    const payload = {
      expo_id: selectedExpoId,
      title: title.trim(),
      topic: topic.trim(),
      speaker: speaker.trim(),
      location: finalLocation,
      start_time: startIso,
      end_time: endIso,
      created_by: currentUser?._id || "user_org_1"
    };

    if (editingSession) {
      updateSession(editingSession._id, payload);
    } else {
      createSession(payload);
    }
    setIsModalOpen(false);
  };

  const filteredSessions = expoSessions.filter(
    (s) =>
      s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.speaker?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.topic?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (displayExpos.length === 0) {
    return (
      <div id="schedule-manager-empty" className="py-16 text-center bg-white dark:bg-[#1A202C] rounded-3xl border border-[#E5E7EB] dark:border-white/10 p-8 space-y-4 font-body">
        <Building2 className="w-12 h-12 text-[#1488A6] dark:text-[#38B2AC] mx-auto opacity-80" />
        <h3 className="text-xl font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading">No Exhibitions Found</h3>
        <p className="text-sm text-[#6B7280] dark:text-[#CBD5E1]/70 max-w-md mx-auto">
          You haven&apos;t published any trade expos yet. Please create an exhibition first before programming event sessions.
        </p>
        <button
          onClick={() => setActiveView("organizer_expos")}
          className="px-5 py-2.5 btn-teal-primary text-xs sm:text-sm font-bold rounded-xl shadow-sm inline-flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Go to Manage Expos
        </button>
      </div>
    );
  }

  return (
    <div id="schedule-manager-view" className="space-y-6 font-body">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1F2937] dark:text-[#F8FAFC] tracking-tight font-heading">
            Event Schedule & Sessions
          </h2>
          <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#CBD5E1] mt-0.5">
            Dynamic schedule management center to program keynotes, workshops, and speaker tracks.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-nowrap">

          <div className="relative w-52 sm:w-64 md:w-72 shrink-0">
            <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#1488A6] dark:text-[#38B2AC] pointer-events-none z-10" />
            <select
              value={selectedExpoId}
              onChange={(e) => setSelectedExpoId(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-white dark:bg-[#1A202C] border border-[#E5E7EB] dark:border-white/10 rounded-xl font-bold text-[#1F2937] dark:text-[#F8FAFC] shadow-xs focus:outline-none focus:ring-2 focus:ring-[#38B2AC] cursor-pointer truncate"
            >
              {displayExpos.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.title}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={openCreateModal}
            className="px-4 py-2 btn-teal-primary text-xs sm:text-sm font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Program New Session
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1A202C] p-4 rounded-2xl border border-[#E5E7EB] dark:border-white/10 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#CBD5E1]/60" />
          <input
            type="text"
            placeholder="Search session title, speaker, topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC]"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filteredSessions.length === 0 ? (
          <div className="py-12 bg-white dark:bg-[#1A202C] rounded-2xl border border-[#E5E7EB] dark:border-white/10 text-center text-xs sm:text-sm text-[#6B7280] dark:text-[#CBD5E1]/70 space-y-3 p-6">
            <Clock className="w-10 h-10 text-[#1488A6] dark:text-[#38B2AC] mx-auto opacity-75" />
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-[#1F2937] dark:text-[#F8FAFC] font-heading">
                No sessions scheduled for this expo
              </h4>
              <p className="text-xs text-[#6B7280] dark:text-[#CBD5E1]/60 max-w-sm mx-auto">
                Click &ldquo;Program New Session&rdquo; above to publish your first talk, keynote, or workshop.
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 btn-teal-primary text-white text-xs font-bold rounded-xl shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Program New Session
            </button>
          </div>
        ) : (
          filteredSessions.map((session) => (
            <div
              key={session._id}
              className="p-4 sm:p-5 bg-white dark:bg-[#1A202C] rounded-2xl border border-[#E5E7EB] dark:border-white/10 shadow-xs hover:border-[#1488A6]/40 dark:hover:border-[#38B2AC]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#6B7280] dark:text-[#CBD5E1]/70">
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/5 font-mono font-bold text-[#1F2937] dark:text-[#F8FAFC]">
                    <Clock className="w-3.5 h-3.5 text-[#1488A6] dark:text-[#38B2AC]" />
                    {getTimeStr(session.start_time)} – {getTimeStr(session.end_time)}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-[#1488A6] dark:text-[#38B2AC] font-semibold">
                    <MapPin className="w-3.5 h-3.5" />
                    {session.location || currentExpo?.location || "Grand Main Hall"}
                  </span>
                  {session.topic && (
                    <>
                      <span>•</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold teal-badge uppercase">
                        {session.topic}
                      </span>
                    </>
                  )}
                </div>

                <h3 className="text-base font-bold text-[#1F2937] dark:text-[#F8FAFC] truncate font-heading">
                  {session.title}
                </h3>

                {session.speaker && (
                  <p className="text-xs text-[#6B7280] dark:text-[#CBD5E1]/80 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#6B7280] dark:text-[#CBD5E1]/60" />
                    <span>Speaker: <strong className="text-[#1F2937] dark:text-[#F8FAFC]">{session.speaker}</strong></span>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  onClick={() => openEditModal(session)}
                  className="px-3 py-1.5 rounded-xl border border-[#E5E7EB] dark:border-white/10 hover:bg-slate-50 dark:hover:bg-[#203748] text-xs font-bold text-[#1F2937] dark:text-[#F8FAFC] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-[#1488A6] dark:text-[#38B2AC]" /> Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete session "${session.title}"?`)) {
                      deleteSession(session._id);
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200 font-body">
          <div className="bg-white dark:bg-[#1A202C] rounded-3xl shadow-2xl border border-[#E5E7EB] dark:border-white/10 max-w-lg w-full flex flex-col max-h-[90vh] overflow-hidden text-[#1F2937] dark:text-[#F8FAFC]">

            <div className="bg-gradient-to-r from-slate-900 via-[#1488A6] to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between shrink-0 relative">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-[#38B2AC] flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-[#38B2AC]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#38B2AC]">
                      Schedule Manager
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#38B2AC]/20 text-[#38B2AC] border border-[#38B2AC]/30">
                      {editingSession ? "Edit Mode" : "New Session"}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white font-heading">
                    {editingSession ? "Edit Session Details" : "Program New Session"}
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Define talk title, speaker presentation, and timing schedule.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">

              <div>
                <label className="block text-xs font-bold text-[#1F2937] dark:text-[#CBD5E1] uppercase tracking-wider font-mono mb-1">
                  Session Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Keynote: Autonomous AI Systems & Future Robotics"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div>
                  <label className="block text-xs font-bold text-[#1F2937] dark:text-[#CBD5E1] uppercase tracking-wider font-mono mb-1">
                    Speaker Name
                  </label>
                  <input
                    type="text"
                    value={speaker}
                    onChange={(e) => setSpeaker(e.target.value)}
                    placeholder="e.g. Dr. Sarah Jenkins"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F2937] dark:text-[#CBD5E1] uppercase tracking-wider font-mono mb-1">
                    Topic / Track
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. AI & Keynote Track"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-[#1F2937] dark:text-[#CBD5E1] uppercase tracking-wider font-mono">
                      Location / Hall Stage
                    </label>
                  </div>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#CBD5E1]/60" />
                    <input
                      type="text"
                      disabled
                      readOnly
                      value={currentExpo?.location || "Grand Main Hall"}
                      className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-slate-100 dark:bg-[#0F172A]/60 border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#6B7280] dark:text-[#CBD5E1] cursor-not-allowed font-medium"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-[#1F2937] dark:text-[#CBD5E1] uppercase tracking-wider font-mono">
                      Event Date
                    </label>
                  </div>
                  <div className="relative">
                    <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#CBD5E1]/60" />
                    <input
                      type="date"
                      disabled
                      readOnly
                      value={getExpoDateStr(currentExpo?.date)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-slate-100 dark:bg-[#0F172A]/60 border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#6B7280] dark:text-[#CBD5E1] cursor-not-allowed font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F2937] dark:text-[#CBD5E1] uppercase tracking-wider font-mono mb-1">
                    Start Time *
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#1488A6] dark:text-[#38B2AC]" />
                    <input
                      type="time"
                      required
                      value={sessionTimeStart}
                      onChange={(e) => setSessionTimeStart(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC] font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F2937] dark:text-[#CBD5E1] uppercase tracking-wider font-mono mb-1">
                    End Time *
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#1488A6] dark:text-[#38B2AC]" />
                    <input
                      type="time"
                      required
                      value={sessionTimeEnd}
                      onChange={(e) => setSessionTimeEnd(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC] font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-3 border-t border-[#E5E7EB] dark:border-white/10 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[#6B7280] dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#0F172A] cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 btn-teal-primary text-xs sm:text-sm font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" /> {editingSession ? "Save Changes" : "Publish Session"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleManager;

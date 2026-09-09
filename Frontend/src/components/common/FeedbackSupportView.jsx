import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import {
  MessageSquare,
  Send,
  CheckCircle2,
  Clock,
  Loader2
} from "lucide-react";

export const FeedbackSupportView = () => {
  const {
    currentUser = {},
    expos = [],
    feedbackList = [],
    submitFeedback,
    fetchFeedbackList,
    showToast
  } = useApp();

  const [type, setType] = useState("suggestion");
  const [selectedExpoId, setSelectedExpoId] = useState(expos[0]?._id || "");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  // Sync selectedExpoId if expos load asynchronously
  useEffect(() => {
    if (expos.length > 0 && (!selectedExpoId || !expos.some((e) => e._id === selectedExpoId || String(e._id) === String(selectedExpoId)))) {
      setSelectedExpoId(expos[0]._id);
    }
  }, [expos, selectedExpoId]);

  // Fetch feedback list from MongoDB on mount
  useEffect(() => {
    if (typeof fetchFeedbackList === "function") {
      fetchFeedbackList();
    }
  }, []);

  const selectedExpo = expos.find((e) => e._id === selectedExpoId || String(e._id) === String(selectedExpoId)) || expos[0];
  const userIdStr = String(currentUser?._id || currentUser?.user_id || "");

  // Filter feedback entries to ONLY show the logged in user's own submissions
  const myFeedback = (feedbackList || []).filter((f) => {
    const fUserId = typeof f.user_id === "object" ? f.user_id?._id : f.user_id;
    if (fUserId) return String(fUserId) === userIdStr;
    return f.user_email === currentUser?.email;
  });

  const filteredFeedback = myFeedback.filter((item) => {
    if (filterStatus !== "all" && item.status !== filterStatus) return false;
    return true;
  });

  const inReviewCount = myFeedback.filter((f) => f.status !== "resolved").length;
  const resolvedCount = myFeedback.filter((f) => f.status === "resolved").length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      showToast("Message Empty", "Please write a message before submitting.", "error");
      return;
    }

    setSubmitting(true);
    const res = await submitFeedback({
      expo_id: selectedExpoId,
      expo_title: selectedExpo ? selectedExpo.title : "EventSphere Exhibition",
      type,
      comments: message.trim(),
      content: message.trim()
    });
    setSubmitting(false);

    if (res) {
      setMessage("");
      setSubmittedSuccess(true);
      setTimeout(() => setSubmittedSuccess(false), 4000);
      if (typeof fetchFeedbackList === "function") fetchFeedbackList();
    }
  };

  return (
    <div id="feedback-support-view" className="space-y-6 font-body">
      {/* Top Standard Header (matching My Schedule page) */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#1F2937] dark:text-[#F8FAFC] tracking-tight font-heading">
          Feedback & Support
        </h2>
        <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#CBD5E1] mt-0.5">
          Submit suggestions, report technical problems, or ask event organizers for help.
        </p>
      </div>

      {/* Main Ticket Submission Form */}
      <div className="bg-white dark:bg-[#1A202C] p-6 rounded-2xl border border-[#E5E7EB] dark:border-white/10 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-white/10 pb-3">
          <h3 className="text-base font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading flex items-center gap-2">
            <Send className="w-4 h-4 text-[#1488A6] dark:text-[#38B2AC]" /> Send Feedback Note
          </h3>
          <span className="text-xs text-[#6B7280] dark:text-[#CBD5E1]/70 font-mono">
            Sender: <strong className="text-[#1F2937] dark:text-white">{currentUser.name || "User"}</strong>
          </span>
        </div>

        {submittedSuccess && (
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>Thank you! Your feedback note has been saved and sent to event organizers.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category Selector */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1F2937] dark:text-[#F8FAFC] block font-heading">
                Category
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl px-3 py-2 text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC] cursor-pointer"
              >
                <option value="suggestion">💡 Suggestion / Idea</option>
                <option value="issue">⚠️ Report Technical Issue</option>
                <option value="inquiry">💬 General Inquiry / Assistance</option>
                <option value="general">📝 General Feedback</option>
              </select>
            </div>

            {/* Related Expo Selector */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1F2937] dark:text-[#F8FAFC] block font-heading">
                Related Expo / Event
              </label>
              <select
                value={selectedExpoId}
                onChange={(e) => setSelectedExpoId(e.target.value)}
                className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl px-3 py-2 text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC] cursor-pointer"
              >
                {expos.map((expo) => (
                  <option key={expo._id} value={expo._id}>
                    {expo.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Text Area */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#1F2937] dark:text-[#F8FAFC] block font-heading">
              Your Message
            </label>
            <textarea
              required
              rows={4}
              placeholder="Describe your feedback, suggestion, or issue in detail..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl p-3 text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC]"
            />
          </div>

          {/* Submit Action */}
          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 btn-teal-primary text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Send Note to Organizers
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Past Sent Feedback Notes */}
      <div className="bg-white dark:bg-[#1A202C] p-6 rounded-2xl border border-[#E5E7EB] dark:border-white/10 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] dark:border-white/10 pb-3">
          <h3 className="text-base font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#1488A6] dark:text-[#38B2AC]" /> Sent Notes & Organizer Responses
          </h3>

          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#0F172A] p-1 rounded-xl text-xs border border-[#E5E7EB] dark:border-white/10">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                filterStatus === "all"
                  ? "bg-white dark:bg-[#203748] text-[#1F2937] dark:text-white shadow-xs"
                  : "text-[#6B7280] dark:text-[#CBD5E1]/70"
              }`}
            >
              All ({myFeedback.length})
            </button>
            <button
              onClick={() => setFilterStatus("pending")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                filterStatus === "pending"
                  ? "bg-amber-500 text-white shadow-xs font-bold"
                  : "text-[#6B7280] dark:text-[#CBD5E1]/70"
              }`}
            >
              In Review ({inReviewCount})
            </button>
            <button
              onClick={() => setFilterStatus("resolved")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                filterStatus === "resolved"
                  ? "bg-emerald-600 text-white shadow-xs font-bold"
                  : "text-[#6B7280] dark:text-[#CBD5E1]/70"
              }`}
            >
              Resolved ({resolvedCount})
            </button>
          </div>
        </div>

        {filteredFeedback.length === 0 ? (
          <div className="py-8 text-center text-xs sm:text-sm text-[#6B7280] dark:text-[#CBD5E1]/70 bg-slate-50 dark:bg-[#0F172A] rounded-xl border border-dashed border-[#E5E7EB] dark:border-white/10">
            {filterStatus === "resolved"
              ? "No resolved notes yet."
              : filterStatus === "pending"
              ? "No pending notes in review."
              : "You haven't submitted any feedback notes yet."}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFeedback.map((item) => {
              const expoTitle = typeof item.expo_id === "object" ? item.expo_id?.title : item.expo_title || "General Event";
              const feedbackMsg = item.content || item.comments || item.message || "";
              const responseMsg = item.response || item.replyText || "";
              const isResolved = item.status === "resolved";

              return (
                <div
                  key={item._id}
                  className="p-4 rounded-xl border border-[#E5E7EB] dark:border-white/10 bg-slate-50/70 dark:bg-[#0F172A]/70 space-y-2.5 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                          item.type === "issue"
                            ? "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                            : "bg-teal-50 dark:bg-[#203748] text-[#1488A6] dark:text-[#38B2AC] border border-[#1488A6]/30 dark:border-[#38B2AC]/40"
                        }`}
                      >
                        {item.type || "suggestion"}
                      </span>

                      <span className="font-bold text-[#1F2937] dark:text-[#F8FAFC]">
                        {expoTitle}
                      </span>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase font-mono ${
                        isResolved
                          ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                          : "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                      }`}
                    >
                      {isResolved ? "Resolved ✓" : "In Review"}
                    </span>
                  </div>

                  <p className="text-xs text-[#1F2937] dark:text-[#CBD5E1] bg-white dark:bg-[#1A202C] p-3 rounded-lg border border-[#E5E7EB] dark:border-white/5 whitespace-pre-wrap">
                    &ldquo;{feedbackMsg}&rdquo;
                  </p>

                  {responseMsg ? (
                    <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-xs space-y-1">
                      <span className="font-bold text-emerald-800 dark:text-emerald-300 block font-heading">
                        Organizer Response:
                      </span>
                      <p className="text-emerald-950 dark:text-emerald-100 font-medium whitespace-pre-wrap">
                        {responseMsg}
                      </p>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                      Pending organizer response...
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackSupportView;

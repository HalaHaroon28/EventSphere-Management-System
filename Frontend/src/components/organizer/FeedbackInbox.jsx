import { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  CheckCircle,
  Reply,
  X,
  Check
} from "lucide-react";
const FeedbackInbox = () => {
  const { feedbackList = [], resolveFeedback, currentUser, expos = [] } = useApp();
  const [activeFilter, setActiveFilter] = useState("all");
  const [replyingFeedback, setReplyingFeedback] = useState(null);
  const [replyText, setReplyText] = useState("");

  const currentUserIdStr = String(currentUser?._id || currentUser?.user_id || "");

  // Strictly filter expos belonging to the logged-in organizer
  const myExpoIds = expos.filter((e) => {
    if (!currentUser) return false;
    const orgId = typeof e.organizer_id === "object" ? String(e.organizer_id?._id || "") : String(e.organizer_id || "");
    return orgId === currentUserIdStr || (e.organizer_name && e.organizer_name === currentUser.name);
  }).map((e) => String(e._id));

  // Strictly filter feedback belonging to this organizer's expos
  const myFeedbackList = feedbackList.filter((f) => {
    if (!currentUser) return false;
    const fExpoId = typeof f.expo_id === "object" ? String(f.expo_id?._id || "") : String(f.expo_id || "");
    return myExpoIds.includes(fExpoId);
  });

  const filteredFeedback = myFeedbackList.filter((f) => {
    if (activeFilter !== "all" && f.status !== activeFilter) return false;
    return true;
  });

  const handleOpenReply = (f) => {
    setReplyingFeedback(f);
    setReplyText(f.response || "Thank you for reaching out. An EventSphere representative has reviewed your inquiry.");
  };

  const handleConfirmReply = (e) => {
    e.preventDefault();
    if (!replyingFeedback) return;
    resolveFeedback(replyingFeedback._id, replyText);
    setReplyingFeedback(null);
    setReplyText("");
  };

  return (
    <div id="feedback-inbox-view" className="space-y-6 font-body">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1F2937] dark:text-[#F8FAFC] tracking-tight font-heading">
            Feedback & Enterprise Inquiries
          </h2>
          <p className="text-xs text-[#6B7280] dark:text-[#CBD5E1] mt-0.5">
            Manage inquiries, feedback, and enterprise lead messages for your expos.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#1A202C] p-1 rounded-xl text-xs border border-[#E5E7EB] dark:border-white/10">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${activeFilter === "all"
                ? "bg-white dark:bg-[#203748] text-[#1F2937] dark:text-white shadow-xs"
                : "text-[#6B7280] dark:text-[#CBD5E1]/70"
              }`}
          >
            All ({myFeedbackList.length})
          </button>
          <button
            onClick={() => setActiveFilter("open")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${activeFilter === "open"
                ? "btn-teal-primary text-white shadow-xs"
                : "text-[#6B7280] dark:text-[#CBD5E1]/70"
              }`}
          >
            Open ({myFeedbackList.filter((f) => f.status === "open" || f.status === "pending").length})
          </button>
          <button
            onClick={() => setActiveFilter("resolved")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${activeFilter === "resolved"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-[#6B7280] dark:text-[#CBD5E1]/70"
              }`}
          >
            Resolved ({myFeedbackList.filter((f) => f.status === "resolved").length})
          </button>
        </div>
      </div>

      {/* Feedback List */}
      <div className="space-y-3">
        {filteredFeedback.length === 0 ? (
          <div className="py-12 bg-white dark:bg-[#1A202C] rounded-2xl border border-[#E5E7EB] dark:border-white/10 text-center text-xs text-[#6B7280] dark:text-[#CBD5E1]/60">
            No feedback or inquiry items found for your organized expos.
          </div>
        ) : (
          filteredFeedback.map((item) => {
            const rawType = typeof item.type === "object" && item.type !== null ? item.type.type : item.type;
            const displayType = String(rawType || item.inquiryType || item.category || "general");
            const rawStatus = typeof item.status === "object" && item.status !== null ? item.status.status : item.status;
            const displayStatus = String(rawStatus || "open");
            const displayUserName = item.name || (typeof item.user_id === "object" && item.user_id !== null ? item.user_id.name : item.user_name || "Enterprise Lead");
            const displayUserEmail = item.email || (typeof item.user_id === "object" && item.user_id !== null ? item.user_id.email : item.user_email || "");
            const displayCompany = item.company || "";
            const displayUserRole = typeof item.user_id === "object" && item.user_id !== null ? item.user_id.role : (item.email ? "Public Lead" : item.user_role || "Attendee");
            const displayExpoTitle = typeof item.expo_id === "object" && item.expo_id !== null ? item.expo_id.title : (item.expo_title || "Expo Operations");
            const displayMessage = item.content || item.comments || item.message || "";
            const displayResponse = item.response || null;

            return (
              <div
                key={item._id}
                className="bg-white dark:bg-[#1A202C] p-5 rounded-2xl border border-[#E5E7EB] dark:border-white/10 hover:border-[#38B2AC]/50 shadow-xs transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4"
              >
                <div className="space-y-2.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${displayType === "issue" || displayType === "complaint"
                          ? "bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                          : displayType === "enterprise" || displayType === "custom" || displayType === "partnership"
                          ? "bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                          : "bg-teal-50 dark:bg-[#203748] text-[#1488A6] dark:text-[#38B2AC] border border-[#1488A6]/30 dark:border-[#38B2AC]/40"
                        }`}
                    >
                      {displayType}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${displayStatus === "open" || displayStatus === "pending"
                          ? "bg-teal-50 dark:bg-[#203748] text-[#1488A6] dark:text-[#38B2AC] border-[#1488A6]/30 dark:border-[#38B2AC]/40"
                          : "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                        }`}
                    >
                      {displayStatus}
                    </span>
                    <span className="text-xs font-bold text-[#1F2937] dark:text-[#F8FAFC]">{displayUserName}</span>
                    <span className="text-[11px] text-[#6B7280] dark:text-[#CBD5E1]/60 capitalize">({displayUserRole})</span>
                    {displayCompany && (
                      <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        🏢 {displayCompany}
                      </span>
                    )}
                    {displayUserEmail && (
                      <a
                        href={`mailto:${displayUserEmail}`}
                        className="text-[11px] text-[#1488A6] dark:text-[#38B2AC] hover:underline font-mono"
                      >
                        ✉️ {displayUserEmail}
                      </a>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-[#1F2937] dark:text-[#CBD5E1] leading-relaxed font-normal bg-slate-50/50 dark:bg-[#0F172A]/50 p-3 rounded-xl border border-slate-100 dark:border-white/5">
                    &ldquo;{displayMessage}&rdquo;
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-[#6B7280] dark:text-[#CBD5E1]/60">
                    <span>Target Event: <strong className="text-[#1F2937] dark:text-white">{displayExpoTitle}</strong></span>
                    <span>•</span>
                    <span>{new Date(item.createdAt || item.created_at || Date.now()).toLocaleDateString()}</span>
                  </div>

                  {displayResponse && (
                    <div className="mt-2 p-3 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/50 rounded-xl text-xs text-emerald-950 dark:text-emerald-200 space-y-1">
                      <span className="font-bold flex items-center gap-1 text-emerald-800 dark:text-emerald-300">
                        <CheckCircle className="w-3.5 h-3.5" /> Organizer Response:
                      </span>
                      <p className="text-emerald-900 dark:text-emerald-200">
                        {displayResponse}
                      </p>
                    </div>
                  )}
                </div>

                <div className="shrink-0 self-end sm:self-start">
                  <button
                    onClick={() => handleOpenReply(item)}
                    className="px-3.5 py-1.5 rounded-xl btn-teal-primary text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Reply className="w-3.5 h-3.5" />
                    {displayStatus === "open" || displayStatus === "pending" ? "Respond & Resolve" : "Edit Response"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reply Modal */}
      {replyingFeedback && (() => {
        const modalUserName = replyingFeedback.name || (typeof replyingFeedback.user_id === "object" && replyingFeedback.user_id !== null 
          ? replyingFeedback.user_id.name 
          : (replyingFeedback.user_name || "User"));
        const modalMessage = replyingFeedback.content || replyingFeedback.comments || replyingFeedback.message || "";

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs font-body">
            <div className="bg-white dark:bg-[#1A202C] rounded-3xl shadow-2xl border border-[#E5E7EB] dark:border-white/10 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 font-body">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-white/10 pb-3">
                <h3 className="text-base font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading">
                  Respond to {modalUserName}
                </h3>
                <button
                  onClick={() => setReplyingFeedback(null)}
                  className="p-1 rounded-lg text-[#6B7280] dark:text-[#CBD5E1]/60 hover:text-[#1F2937] dark:hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-[#0F172A] rounded-xl text-xs text-[#6B7280] dark:text-[#CBD5E1] border border-[#E5E7EB] dark:border-white/10">
                <span className="font-semibold text-[#1F2937] dark:text-[#F8FAFC] block mb-0.5">Original Message:</span>
                &ldquo;{modalMessage}&rdquo;
              </div>

              <form onSubmit={handleConfirmReply} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#1F2937] dark:text-[#CBD5E1] mb-1">
                    Organizer Response (Sent to User)
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Explain resolution, instructions or next steps..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#0F172A] text-[#1F2937] dark:text-[#F8FAFC] border border-[#E5E7EB] dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#38B2AC]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#E5E7EB] dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setReplyingFeedback(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6B7280] dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#203748] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-4 h-4" /> Mark Resolved & Dispatch
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
export {
  FeedbackInbox
};

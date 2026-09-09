import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { X, MessageSquare, Send } from "lucide-react";

const FeedbackModal = ({ onClose }) => {
  const { submitFeedback, expos } = useApp();
  const [type, setType] = useState("suggestion");
  const [selectedExpoId, setSelectedExpoId] = useState(expos[0]?._id || "");
  const [message, setMessage] = useState("");

  const selectedExpo = expos.find((e) => e._id === selectedExpoId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    submitFeedback({
      expo_id: selectedExpoId || void 0,
      expo_title: selectedExpo ? selectedExpo.title : void 0,
      type,
      message: message.trim()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#1A202C] rounded-2xl sm:rounded-3xl shadow-2xl border border-[#E5E7EB] dark:border-white/10 max-w-md w-full p-5 sm:p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#1488A6]/10 dark:bg-[#38B2AC]/20 text-[#1488A6] dark:text-[#38B2AC] flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading">
                Submit Feedback / Issue
              </h3>
              <p className="text-xs text-[#6B7280] dark:text-[#CBD5E1]/70">Direct channel to operations team.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#6B7280] dark:text-[#CBD5E1] hover:text-[#1F2937] dark:hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider font-mono text-[#6B7280] dark:text-[#CBD5E1]/70 mb-1.5">
              Feedback Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType("suggestion")}
                className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  type === "suggestion"
                    ? "bg-[#1488A6]/15 dark:bg-[#38B2AC]/20 text-[#1488A6] dark:text-[#38B2AC] border-[#1488A6]/30 dark:border-[#38B2AC]/40"
                    : "bg-[#F8FAFC] dark:bg-[#0F172A] text-[#6B7280] dark:text-[#CBD5E1]/70 border-[#E5E7EB] dark:border-white/10 hover:text-[#1F2937] dark:hover:text-white"
                }`}
              >
                Suggestion / Feature
              </button>
              <button
                type="button"
                onClick={() => setType("issue")}
                className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  type === "issue"
                    ? "bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-700"
                    : "bg-[#F8FAFC] dark:bg-[#0F172A] text-[#6B7280] dark:text-[#CBD5E1]/70 border-[#E5E7EB] dark:border-white/10 hover:text-[#1F2937] dark:hover:text-white"
                }`}
              >
                Operational Issue
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider font-mono text-[#6B7280] dark:text-[#CBD5E1]/70 mb-1.5">
              Related Exhibition
            </label>
            <select
              value={selectedExpoId}
              onChange={(e) => setSelectedExpoId(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC]"
            >
              <option value="">-- General Platform Feedback --</option>
              {expos.map((expo) => (
                <option key={expo._id} value={expo._id}>
                  {expo.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider font-mono text-[#6B7280] dark:text-[#CBD5E1]/70 mb-1.5">
              Your Note or Report Details *
            </label>
            <textarea
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your suggestion, observation, or bug..."
              className="w-full px-3 py-2.5 text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] placeholder-[#6B7280] dark:placeholder-[#CBD5E1]/50 focus:outline-none focus:ring-2 focus:ring-[#38B2AC]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E7EB] dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-[#6B7280] dark:text-[#CBD5E1]/70 hover:bg-slate-100 dark:hover:bg-[#203748] cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 btn-teal-primary text-xs sm:text-sm font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" /> Dispatch Feedback
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export { FeedbackModal };

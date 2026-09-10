import { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  Star,
  Send,
  MessageSquare,
  CheckCircle2,
  Sparkles,
  HelpCircle
} from "lucide-react";

export const InContextFeedback = ({ expoId, expoTitle, sessionId, sessionTitle }) => {
  const { currentUser, submitFeedback, showToast } = useApp();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [category, setCategory] = useState("general");
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comments.trim()) {
      showToast("Missing Comments", "Please share a brief review or feedback.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: currentUser?.name || "Verified Attendee",
        email: currentUser?.email || "attendee@eventsphere.com",
        expo_id: expoId || undefined,
        session_id: sessionId || undefined,
        type: category,
        rating: Number(rating),
        content: comments.trim(),
        comments: comments.trim(),
        message: `[Rating: ${rating}/5 | Target: ${sessionTitle || expoTitle || "Expo"}]\n\n${comments.trim()}`
      };

      if (submitFeedback) {
        await submitFeedback(payload);
      }

      setIsSubmitted(true);
      showToast("Feedback Submitted", "Thank you for your review and rating!", "success");
      setComments("");
    } catch (err) {
      console.error("Failed to submit feedback:", err);
      showToast("Error", "Could not submit review. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-slate-50 dark:bg-[#0F172A]/70 border border-[#E5E7EB] dark:border-white/10 space-y-4 font-body">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E7EB] dark:border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#1488A6] dark:text-[#38B2AC] flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Attendee Review & Feedback
          </span>
          <h4 className="text-sm sm:text-base font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading mt-0.5">
            Share Your Experience for {sessionTitle || expoTitle || "This Exhibition"}
          </h4>
        </div>

        {/* Interactive Star Rating */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
              title={`${star} Star${star > 1 ? "s" : ""}`}
            >
              <Star
                className="w-5 h-5"
                fill={(hoverRating || rating) >= star ? "currentColor" : "none"}
              />
            </button>
          ))}
          <span className="text-xs font-mono font-bold text-[#6B7280] dark:text-[#CBD5E1]/70 ml-1.5">
            {rating}/5
          </span>
        </div>
      </div>

      {isSubmitted ? (
        <div className="py-6 text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h5 className="text-xs sm:text-sm font-bold text-[#1F2937] dark:text-[#F8FAFC]">
            Thank You for Your Feedback!
          </h5>
          <p className="text-xs text-[#6B7280] dark:text-[#CBD5E1]/70">
            Your review helps organizers and speakers continuously refine the summit experience.
          </p>
          <button
            type="button"
            onClick={() => setIsSubmitted(false)}
            className="text-xs font-bold text-[#1488A6] dark:text-[#38B2AC] hover:underline cursor-pointer pt-1"
          >
            Submit another note
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono text-[#6B7280] dark:text-[#CBD5E1]/60 font-bold uppercase">Topic:</span>
            {["general", "speaker", "organization", "venue"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                  category === cat
                    ? "btn-teal-primary text-white shadow-xs"
                    : "bg-white dark:bg-[#1A202C] text-[#1F2937] dark:text-[#CBD5E1] border border-[#E5E7EB] dark:border-white/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div>
            <textarea
              required
              rows={3}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="What did you think of the keynote sessions, exhibits, or organization?"
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-[#1A202C] border border-[#E5E7EB] dark:border-white/10 rounded-2xl text-[#1F2937] dark:text-white placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#38B2AC]"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-[#6B7280] dark:text-[#CBD5E1]/50 font-mono">
              Feedback is reviewed by event organizers
            </span>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold btn-teal-primary text-white rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Submitting...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Post Review</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

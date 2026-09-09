import {
  MapPin,
  Bookmark
} from "lucide-react";

export const SessionCard = ({
  session,
  isBookmarked,
  onToggleBookmark,
  showExpoTag = false
}) => {
  return (
    <div className="saas-card saas-card-hover p-4 sm:p-5 rounded-2xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
      <div className="space-y-2.5 flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-mono font-bold text-[#1488A6] dark:text-[#38B2AC] bg-teal-50 dark:bg-[#203748] border border-[#1488A6]/25 dark:border-[#38B2AC]/30 px-2.5 py-0.5 rounded-md">
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
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="font-medium text-[#6B7280] dark:text-[#CBD5E1] flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#38B2AC]" />
            {session.location}
          </span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-100 dark:bg-[#0F172A] text-[#1F2937] dark:text-[#CBD5E1] border border-[#E5E7EB] dark:border-white/10">
            {session.topic}
          </span>
        </div>

        <h4 className="text-base font-bold font-heading text-[#1F2937] dark:text-[#F8FAFC] group-hover:text-[#1488A6] dark:group-hover:text-[#38B2AC] transition-colors">
          {session.title}
        </h4>

        {session.description && (
          <p className="text-xs text-[#6B7280] dark:text-[#CBD5E1] line-clamp-2 leading-relaxed">
            {session.description}
          </p>
        )}

        <div className="flex items-center gap-3 pt-1">
          <img
            src={session.speaker_avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
            alt={session.speaker}
            className="w-7 h-7 rounded-full object-cover border border-[#E5E7EB] dark:border-white/10"
          />
          <div>
            <span className="text-xs font-bold text-[#1F2937] dark:text-[#F8FAFC]">{session.speaker}</span>
            {session.speaker_title && (
              <span className="text-[11px] text-[#6B7280] dark:text-[#CBD5E1]/70 block -mt-0.5">
                {session.speaker_title}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="shrink-0 self-end sm:self-center">
        <button
          onClick={() => onToggleBookmark(session._id)}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
            isBookmarked
              ? "btn-teal-primary text-white"
              : "bg-slate-100 dark:bg-[#203748] hover:bg-slate-200 dark:hover:bg-[#203748]/80 text-[#1F2937] dark:text-[#CBD5E1] border border-[#E5E7EB] dark:border-white/10"
          }`}
        >
          <Bookmark
            className={`w-3.5 h-3.5 ${isBookmarked ? "fill-white text-white" : "text-[#6B7280] dark:text-[#CBD5E1]/70"}`}
          />
          <span>{isBookmarked ? "Bookmarked" : "Add to Agenda"}</span>
        </button>
      </div>
    </div>
  );
};

import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { FileText, Plus, CheckCircle, Clock, XCircle, ArrowRight, Layers } from "lucide-react";
import { ApplyExpoModal } from "./ApplyExpoModal";

const MyApplicationsView = ({ onNavigateToBoothSelection }) => {
  const { applications, currentUser } = useApp();
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const myApps = applications.filter((a) => a.exhibitor_id === currentUser._id || a.exhibitor_id?._id === currentUser._id);

  return (
    <div id="my-applications-view" className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1F2937] dark:text-[#F8FAFC] tracking-tight font-heading">
            My Applications
          </h2>
          <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#94A3B8] mt-1 font-normal">
            Check the status of your expo participation requests and see your assigned booths.
          </p>
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {myApps.length === 0 ? (
          <div className="py-12 bg-white dark:bg-[#1A202C] rounded-2xl border border-[#E5E7EB] dark:border-white/10 text-center space-y-3 p-6">
            <FileText className="w-8 h-8 mx-auto text-[#6B7280] dark:text-[#CBD5E1]/50" />
            <h4 className="text-sm font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading">
              No applications on file
            </h4>
            <p className="text-xs text-[#6B7280] dark:text-[#CBD5E1]/70 max-w-sm mx-auto">
              Submit your vendor credentials to any active summit to begin the review and booth reservation process.
            </p>
            <button
              onClick={() => setIsApplyModalOpen(true)}
              className="px-4 py-2 btn-teal-primary text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Start Application
            </button>
          </div>
        ) : (
          myApps.map((app, idx) => {
            const hasAssignedBooth = Boolean(app.booth_id || app.booth_number);
            const boothNum = app.booth_number || app.booth_id?.booth_number;
            const expoTitle = app.expo_title || app.expo_id?.title || "Summit Event";
            const appKey = app._id || `app-${idx}`;
            return (
              <div
                key={appKey}
                className="bg-white dark:bg-[#1A202C] p-5 sm:p-6 rounded-2xl border border-[#E5E7EB] dark:border-white/10 hover:border-[#1488A6]/40 dark:hover:border-[#38B2AC]/40 shadow-xs transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E7EB] dark:border-white/10 pb-3">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono uppercase font-bold text-[#6B7280] dark:text-[#CBD5E1]/60">
                      Application ID: {app._id}
                    </span>
                    <h3 className="text-base font-extrabold text-[#1F2937] dark:text-[#F8FAFC] font-heading">
                      {expoTitle}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${app.status === "approved"
                        ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                        : app.status === "pending"
                          ? "bg-teal-50 dark:bg-[#203748] text-[#1488A6] dark:text-[#38B2AC] border border-[#1488A6]/30 dark:border-[#38B2AC]/40"
                          : "bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                        }`}
                    >
                      {app.status === "approved" ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      ) : app.status === "pending" ? (
                        <Clock className="w-3.5 h-3.5 text-[#1488A6] dark:text-[#38B2AC]" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                      )}
                      <span className="capitalize">{app.status}</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#6B7280] dark:text-[#CBD5E1]/60 block font-mono">
                      Requested Tier
                    </span>
                    <span className="font-bold text-[#1F2937] dark:text-[#F8FAFC] capitalize mt-0.5 block">
                      {app.booth_tier_requested || "medium"} Tier Space
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#6B7280] dark:text-[#CBD5E1]/60 block font-mono">
                      Products / Showcase
                    </span>
                    <span className="text-[#6B7280] dark:text-[#CBD5E1]/80 line-clamp-2 mt-0.5 block">
                      {app.products_services || "No outline specified."}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#6B7280] dark:text-[#CBD5E1]/60 block font-mono">
                      Floor Status
                    </span>
                    {app.booth_status === "confirmed" ? (
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                        Confirmed Booth: #{boothNum}
                      </span>
                    ) : app.booth_status === "selected" || hasAssignedBooth ? (
                      <span className="font-mono font-bold text-[#1488A6] dark:text-[#38B2AC] mt-0.5 block">
                        Selected Booth: #{boothNum} (Awaiting Confirmation)
                      </span>
                    ) : app.status === "approved" ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 block">
                        Approved — Ready to Pick Floor Booth
                      </span>
                    ) : app.status === "rejected" ? (
                      <span className="text-rose-600 dark:text-rose-400 font-semibold mt-0.5 block">
                        Application Declined
                      </span>
                    ) : (
                      <span className="text-[#6B7280] dark:text-[#CBD5E1]/50 mt-0.5 block">
                        Awaiting Organizer Review
                      </span>
                    )}
                  </div>
                </div>

                {/* Status Message / Rejection Reason Box */}
                {app.status === "approved" && (app.approval_message || app.review_notes) && (
                  <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                    <span className="font-bold">Organizer Approval Note:</span>{" "}
                    {app.approval_message || app.review_notes}
                  </div>
                )}

                {app.status === "rejected" && (app.rejection_reason || app.review_notes) && (
                  <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 rounded-xl text-xs text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50">
                    <span className="font-bold">Rejection Reason:</span>{" "}
                    {app.rejection_reason || app.review_notes}
                  </div>
                )}

                {/* Action button ONLY if approved without booth */}
                {app.status === "approved" && !hasAssignedBooth && onNavigateToBoothSelection && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => onNavigateToBoothSelection(app.expo_id?._id || app.expo_id)}
                      className="px-4 py-2 btn-teal-primary text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Layers className="w-4 h-4" /> Open Interactive Floor Plan to Pick Booth{" "}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {isApplyModalOpen && <ApplyExpoModal onClose={() => setIsApplyModalOpen(false)} />}
    </div>
  );
};

export { MyApplicationsView };

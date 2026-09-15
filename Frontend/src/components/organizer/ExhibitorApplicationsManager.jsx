import { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  Check,
  X,
  FileText,
  Search
} from "lucide-react";
const ExhibitorApplicationsManager = ({
  selectedAppIdForApproval,
  onClearApprovalTarget
}) => {
  const {
    applications,
    booths,
    expos,
    approveApplication,
    rejectApplication,
    confirmBoothAssignment,
    showToast
  } = useApp();
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeAppModal, setActiveAppModal] = useState(() => {
    if (selectedAppIdForApproval) {
      return applications.find((a) => a._id === selectedAppIdForApproval) || null;
    }
    return null;
  });
  const [reviewNotes, setReviewNotes] = useState("");
  const [rejectNotes, setRejectNotes] = useState("");
  const [rejectingAppId, setRejectingAppId] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';

  const filteredApps = applications.filter((a) => {
    if (!a) return false;
    if (filterStatus !== "all" && a.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const comp = (a.company_name || "").toLowerCase();
      const expTitle = (a.expo_id?.title || a.expo_title || "").toLowerCase();
      const exhName = (a.exhibitor_id?.name || a.exhibitor_name || "").toLowerCase();
      const email = (a.contact_email || "").toLowerCase();
      if (!comp.includes(q) && !expTitle.includes(q) && !exhName.includes(q) && !email.includes(q)) {
        return false;
      }
    }
    return true;
  });

  const handleOpenApproveModal = (app) => {
    setActiveAppModal(app);
    setReviewNotes(app.approval_message || `Your application has been accepted! Please select your preferred floor booth.`);
  };

  const handleConfirmApproval = () => {
    if (!activeAppModal) return;
    approveApplication(activeAppModal._id, "", reviewNotes);
    setActiveAppModal(null);
    if (onClearApprovalTarget) onClearApprovalTarget();
  };

  const handleConfirmBooth = (appId) => {
    confirmBoothAssignment(appId);
  };

  const handleConfirmRejection = (appId) => {
    rejectApplication(appId, rejectNotes || "Does not meet current summit requirements.");
    setRejectingAppId(null);
    setRejectNotes("");
  };

  const getDocUrl = (docPath) => {
    if (!docPath) return "#";
    if (docPath.startsWith("http://") || docPath.startsWith("https://")) return docPath;
    if (docPath.startsWith("uploads/")) return `${API_URL}/${docPath}`;
    return "#";
  };

  const getDocFileName = (docPath) => {
    if (!docPath) return "Document";
    const parts = docPath.split("/");
    return parts[parts.length - 1];
  };

  return (
    <div id="exhibitor-applications-view" className="space-y-6 font-body">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1F2937] dark:text-[#F8FAFC] tracking-tight font-heading">
            Exhibitor Applications
          </h2>
          <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#CBD5E1] mt-0.5">
            Accept or reject exhibitor applications. Approved exhibitors will select their floor booth locations.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#1A202C] p-1 rounded-xl text-xs overflow-x-auto no-scrollbar border border-[#E5E7EB] dark:border-white/10">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 cursor-pointer ${filterStatus === "all"
              ? "bg-white dark:bg-[#203748] text-[#1F2937] dark:text-white shadow-xs"
              : "text-[#6B7280] dark:text-[#CBD5E1]/70 hover:text-[#1F2937] dark:hover:text-white"
              }`}
          >
            All ({applications.length})
          </button>
          <button
            onClick={() => setFilterStatus("pending")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${filterStatus === "pending"
              ? "btn-teal-primary text-white font-bold shadow-xs"
              : "text-[#6B7280] dark:text-[#CBD5E1]/70 hover:text-[#1F2937] dark:hover:text-white"
              }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
            Pending ({applications.filter((a) => a.status === "pending").length})
          </button>
          <button
            onClick={() => setFilterStatus("approved")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 cursor-pointer ${filterStatus === "approved"
              ? "bg-emerald-600 text-white shadow-xs"
              : "text-[#6B7280] dark:text-[#CBD5E1]/70 hover:text-[#1F2937] dark:hover:text-white"
              }`}
          >
            Approved ({applications.filter((a) => a.status === "approved").length})
          </button>
          <button
            onClick={() => setFilterStatus("rejected")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 cursor-pointer ${filterStatus === "rejected"
              ? "bg-[#1F2937] dark:bg-[#0F172A] text-white shadow-xs"
              : "text-[#6B7280] dark:text-[#CBD5E1]/70 hover:text-[#1F2937] dark:hover:text-white"
              }`}
          >
            Rejected ({applications.filter((a) => a.status === "rejected").length})
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1A202C] p-4 rounded-2xl border border-[#E5E7EB] dark:border-white/10 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#CBD5E1]/60" />
          <input
            type="text"
            placeholder="Search company, applicant, email, expo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC] focus:bg-white dark:focus:bg-[#0F172A]"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredApps.length === 0 ? (
          <div className="py-12 bg-white dark:bg-[#1A202C] rounded-2xl border border-[#E5E7EB] dark:border-white/10 text-center text-xs sm:text-sm text-[#6B7280] dark:text-[#CBD5E1]/60">
            No exhibitor applications matching your filter criteria.
          </div>
        ) : (
          filteredApps.map((app) => {
            const expoTitle = app.expo_id?.title || app.expo_id?.name || app.expo_title || "Summit Event";
            const boothNum = app.booth_id?.booth_number || app.booth_number;
            const noteText = app.approval_message || app.rejection_reason || app.review_notes;

            return (
              <div
                key={app._id}
                className="bg-white dark:bg-[#1A202C] p-4 sm:p-6 rounded-2xl border border-[#E5E7EB] dark:border-white/10 hover:border-[#38B2AC]/50 shadow-xs transition-all flex flex-col md:flex-row md:items-start justify-between gap-4"
              >

                <div className="space-y-2.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading truncate">
                      {app.company_name}
                    </h3>
                    <span
                      className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${app.status === "pending"
                        ? "bg-teal-50 dark:bg-[#203748] text-[#1488A6] dark:text-[#38B2AC] border border-[#1488A6]/30 dark:border-[#38B2AC]/40"
                        : app.status === "approved"
                          ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                          : "bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                        }`}
                    >
                      {app.status}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-[#1F2937] dark:text-[#CBD5E1] leading-relaxed max-w-2xl">
                    {app.products_services || "No product description provided."}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px] text-[#6B7280] dark:text-[#CBD5E1]/70 pt-1">
                    <span className="font-semibold text-[#1F2937] dark:text-[#F8FAFC]">Expo: {expoTitle}</span>
                    <span>Email: <strong className="font-mono text-[#1F2937] dark:text-white">{app.contact_email}</strong></span>
                    <span className="capitalize font-mono">Requested Tier: <strong>{app.booth_tier_requested || "medium"}</strong></span>
                    {app.status === "approved" && (
                      boothNum ? (
                        <span className={`px-2.5 py-0.5 rounded font-bold font-mono text-[10px] ${app.booth_status === "confirmed"
                          ? "bg-emerald-600 text-white"
                          : "bg-[#1488A6] dark:bg-[#38B2AC] text-white dark:text-slate-950"
                          }`}>
                          {app.booth_status === "confirmed" ? `Confirmed Booth: ${boothNum}` : `Exhibitor Picked Booth: ${boothNum}`}
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-300 font-bold font-mono text-[10px]">
                          Awaiting Exhibitor Booth Selection
                        </span>
                      )
                    )}
                  </div>

                  {app.documents && app.documents.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-[10px] font-bold uppercase font-mono text-[#6B7280] dark:text-[#CBD5E1]/60">Attached Docs:</span>
                      {app.documents.map((doc, i) => {
                        const url = getDocUrl(doc);
                        const fileName = getDocFileName(doc);
                        return url !== "#" ? (
                          <a
                            key={i}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 dark:bg-[#0F172A] hover:bg-teal-100 dark:hover:bg-[#203748] border border-[#1488A6]/30 dark:border-[#38B2AC]/40 rounded-lg text-[11px] font-mono text-[#1488A6] dark:text-[#38B2AC] transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>{fileName}</span>
                          </a>
                        ) : (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-lg text-[11px] font-mono text-[#6B7280] dark:text-[#CBD5E1]"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>{fileName}</span>
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {noteText && (
                    <div className={`text-[11px] p-3 rounded-xl border font-body ${app.status === "rejected"
                      ? "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/50 text-rose-800 dark:text-rose-300"
                      : "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300"
                      }`}>
                      <span className="font-bold">
                        {app.status === "rejected" ? "Rejection Reason:" : "Approval Message:"}
                      </span>{" "}
                      {noteText}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0 self-stretch sm:self-auto justify-end pt-2 sm:pt-0">
                  {app.status === "pending" && (
                    <>
                      <button
                        onClick={() => {
                          setRejectingAppId(app._id);
                          setRejectNotes("");
                        }}
                        className="px-3 py-2 rounded-xl border border-[#E5E7EB] dark:border-white/10 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-[#6B7280] dark:text-[#CBD5E1] hover:text-rose-700 dark:hover:text-rose-400 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleOpenApproveModal(app)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Check className="w-4 h-4" /> Accept Application
                      </button>
                    </>
                  )}

                  {app.status === "approved" && (
                    boothNum && app.booth_status !== "confirmed" ? (
                      <button
                        onClick={() => handleConfirmBooth(app._id)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-4 h-4" /> Confirm Booth #{boothNum}
                      </button>
                    ) : app.booth_status === "confirmed" ? (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Check className="w-4 h-4" /> Booth Locked
                      </span>
                    ) : (
                      <span className="text-xs text-[#6B7280] dark:text-[#CBD5E1]/60 italic font-medium">
                        Waiting for Exhibitor to pick booth
                      </span>
                    )
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {activeAppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1A202C] rounded-2xl sm:rounded-3xl shadow-2xl border border-[#E5E7EB] dark:border-white/10 max-w-md w-full p-5 sm:p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 font-body">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-white/10 pb-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading">
                  Accept Application: {activeAppModal.company_name}
                </h3>
                <p className="text-xs text-[#6B7280] dark:text-[#CBD5E1]/70">
                  Accepting allows the exhibitor to choose their booth from available floor plan spots.
                </p>
              </div>
              <button
                onClick={() => setActiveAppModal(null)}
                className="p-1 rounded-lg text-[#6B7280] dark:text-[#CBD5E1]/60 hover:text-[#1F2937] dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1F2937] dark:text-[#F8FAFC] mb-1">
                  Approval Message to Exhibitor *
                </label>
                <textarea
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Welcome message sent to exhibitor upon acceptance..."
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC]"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2 border-t border-[#E5E7EB] dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveAppModal(null)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold text-[#6B7280] dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#203748] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmApproval}
                  className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Accept Application
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {rejectingAppId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1A202C] rounded-2xl sm:rounded-3xl shadow-2xl border border-[#E5E7EB] dark:border-white/10 max-w-md w-full p-5 sm:p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 font-body">
            <h3 className="text-sm sm:text-base font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading">
              Decline Exhibitor Application
            </h3>
            <p className="text-xs text-[#6B7280] dark:text-[#CBD5E1]/70">
              Provide a clear rejection reason. This reason will be saved and displayed to the exhibitor.
            </p>

            <textarea
              rows={3}
              required
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              placeholder="e.g. Products do not align with the security summit category..."
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC]"
            />

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <button
                onClick={() => setRejectingAppId(null)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold text-[#6B7280] dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#203748] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmRejection(rejectingAppId)}
                className="w-full sm:w-auto px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export {
  ExhibitorApplicationsManager
};

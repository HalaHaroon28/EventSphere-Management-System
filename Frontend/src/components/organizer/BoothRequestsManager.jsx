import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import {
  Check,
  X,
  FileText,
  Search,
  Grid,
  Building2,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";

const BoothRequestsManager = () => {
  const { applications, booths, fetchApplications, fetchExpos, confirmBoothAssignment, showToast } = useApp();
  const [filterStatus, setFilterStatus] = useState("all"); // 'all', 'pending', 'confirmed'
  const [searchQuery, setSearchQuery] = useState("");
  const [rejectingAppId, setRejectingAppId] = useState(null);
  const [rejectNote, setRejectNote] = useState("");

  useEffect(() => {
    if (typeof fetchApplications === "function") fetchApplications();
    if (typeof fetchExpos === "function") fetchExpos();
  }, []);

  const API_URL = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace("/api", "")
    : "http://localhost:5000";

  // Filter applications that have a booth selection
  const boothRequests = applications.filter((a) => {
    if (!a) return false;
    const hasBooth = Boolean(a.booth_id || a.booth_number || a.booth_status === "selected" || a.booth_status === "confirmed");
    if (!hasBooth) return false;

    if (filterStatus === "pending" && a.booth_status !== "selected") return false;
    if (filterStatus === "confirmed" && a.booth_status !== "confirmed") return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const comp = (a.company_name || "").toLowerCase();
      const expTitle = (a.expo_id?.title || a.expo_title || "").toLowerCase();
      const boothNum = (a.booth_id?.booth_number || a.booth_number || "").toLowerCase();
      const email = (a.contact_email || "").toLowerCase();
      if (!comp.includes(q) && !expTitle.includes(q) && !boothNum.includes(q) && !email.includes(q)) {
        return false;
      }
    }
    return true;
  });

  const pendingRequestsCount = applications.filter(
    (a) => a.booth_status === "selected"
  ).length;

  const confirmedRequestsCount = applications.filter(
    (a) => a.booth_status === "confirmed"
  ).length;

  const handleApproveBooth = (appId) => {
    confirmBoothAssignment(appId, "confirm");
  };

  const handleConfirmRejectBooth = (appId) => {
    confirmBoothAssignment(appId, "reject", rejectNote || "Booth request declined. Please select another booth.");
    setRejectingAppId(null);
    setRejectNote("");
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
    <div id="booth-requests-view" className="space-y-6 font-body">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1F2937] dark:text-[#F8FAFC] tracking-tight font-heading flex items-center gap-2.5">
            <Grid className="w-6 h-6 text-[#1488A6] dark:text-[#38B2AC]" />
            Booth Selection Requests
          </h2>
          <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#CBD5E1] mt-0.5">
            Review floor booth spaces requested by approved exhibitors. Approve to lock or reject to release booth back to map.
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#1A202C] p-1 rounded-xl text-xs overflow-x-auto no-scrollbar border border-[#E5E7EB] dark:border-white/10">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 cursor-pointer ${
              filterStatus === "all"
                ? "bg-white dark:bg-[#203748] text-[#1F2937] dark:text-white shadow-xs font-bold"
                : "text-[#6B7280] dark:text-[#CBD5E1]/70 hover:text-[#1F2937] dark:hover:text-white"
            }`}
          >
            All Requests ({applications.filter((a) => a.booth_id || a.booth_number).length})
          </button>
          <button
            onClick={() => setFilterStatus("pending")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              filterStatus === "pending"
                ? "bg-amber-500 text-white font-bold shadow-xs"
                : "text-[#6B7280] dark:text-[#CBD5E1]/70 hover:text-[#1F2937] dark:hover:text-white"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
            Pending Approval ({pendingRequestsCount})
          </button>
          <button
            onClick={() => setFilterStatus("confirmed")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 cursor-pointer ${
              filterStatus === "confirmed"
                ? "bg-emerald-600 text-white shadow-xs font-bold"
                : "text-[#6B7280] dark:text-[#CBD5E1]/70 hover:text-[#1F2937] dark:hover:text-white"
            }`}
          >
            Confirmed & Booked ({confirmedRequestsCount})
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-[#1A202C] p-4 rounded-2xl border border-[#E5E7EB] dark:border-white/10 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#CBD5E1]/60" />
          <input
            type="text"
            placeholder="Search company, booth #, email, expo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC]"
          />
        </div>
        <span className="text-xs text-[#6B7280] dark:text-[#CBD5E1]/70 font-mono font-medium">
          {boothRequests.length} Booth Requests
        </span>
      </div>

      {/* Booth Requests Grid */}
      <div className="space-y-4">
        {boothRequests.length === 0 ? (
          <div className="py-16 bg-white dark:bg-[#1A202C] rounded-2xl border border-[#E5E7EB] dark:border-white/10 text-center space-y-3 p-6">
            <Building2 className="w-10 h-10 mx-auto text-[#6B7280] dark:text-[#CBD5E1]/40" />
            <h4 className="text-sm font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading">
              No booth requests found
            </h4>
            <p className="text-xs text-[#6B7280] dark:text-[#CBD5E1]/70 max-w-sm mx-auto">
              When approved exhibitors select their floor booth on the interactive map, their requests will appear here for final confirmation.
            </p>
          </div>
        ) : (
          boothRequests.map((app) => {
            const expoTitle = app.expo_id?.title || app.expo_id?.name || app.expo_title || "Summit Event";
            const boothObj = typeof app.booth_id === "object" ? app.booth_id : booths.find((b) => b._id === app.booth_id);
            const boothNum = boothObj?.booth_number || app.booth_number || "N/A";
            const boothHall = boothObj?.hall || "Main Hall";
            const boothSize = boothObj?.size || app.booth_tier_requested || "medium";
            const boothPrice = boothObj?.price || boothObj?.booth_fee || 500;
            const isConfirmed = app.booth_status === "confirmed";

            return (
              <div
                key={app._id}
                className="bg-white dark:bg-[#1A202C] p-5 sm:p-6 rounded-2xl border border-[#E5E7EB] dark:border-white/10 hover:border-[#38B2AC]/50 shadow-xs transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5"
              >
                {/* Left: Application & Booth Summary */}
                <div className="space-y-3 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-extrabold text-[#1F2937] dark:text-[#F8FAFC] font-heading">
                      {app.company_name}
                    </h3>
                    <span
                      className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 font-mono ${
                        isConfirmed
                          ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                          : "bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                      }`}
                    >
                      {isConfirmed ? (
                        <>
                          <CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          Booked & Officially Assigned
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                          Reserved (Awaiting Organizer Confirmation)
                        </>
                      )}
                    </span>
                  </div>

                  {/* Highlighted Requested Booth Box */}
                  <div className="bg-[#F8FAFC] dark:bg-[#0F172A] p-3.5 rounded-xl border border-[#E5E7EB] dark:border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#1488A6] dark:bg-[#38B2AC] text-white dark:text-slate-950 flex items-center justify-center font-mono font-extrabold text-sm shrink-0">
                        {boothNum}
                      </div>
                      <div>
                        <span className="font-bold text-[#1F2937] dark:text-[#F8FAFC] block font-heading text-sm">
                          Booth #{boothNum} ({boothObj?.status === "booked" ? "Booked" : "Reserved"})
                        </span>
                        <span className="text-[11px] text-[#6B7280] dark:text-[#CBD5E1]/70 font-mono">
                          {boothHall} • <span className="capitalize">{boothSize} Tier</span>
                        </span>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <span className="text-xs text-[#6B7280] dark:text-[#CBD5E1]/60 block">Booth Price</span>
                      <span className="font-extrabold text-[#1F2937] dark:text-[#F8FAFC]">
                        PKR {boothPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#6B7280] dark:text-[#CBD5E1]/80 pt-0.5 font-sans">
                    <span>Expo: <strong className="text-[#1F2937] dark:text-white font-semibold">{expoTitle}</strong></span>
                    <span>Exhibitor Email: <strong className="font-mono text-[#1F2937] dark:text-white">{app.contact_email}</strong></span>
                    <span>Company / Contact: <strong className="text-[#1F2937] dark:text-white font-semibold">{app.company_name} ({app.exhibitor_name || app.exhibitor_id?.name || "Exhibitor"})</strong></span>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-row lg:flex-col items-center lg:items-end justify-end gap-2.5 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-[#E5E7EB] dark:border-white/10">
                  {!isConfirmed ? (
                    <>
                      <button
                        onClick={() => handleApproveBooth(app._id)}
                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer w-full lg:w-auto justify-center"
                      >
                        <Check className="w-4 h-4" /> Approve & Change Status to Booked
                      </button>
                      <button
                        onClick={() => {
                          setRejectingAppId(app._id);
                          setRejectNote("");
                        }}
                        className="px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-800/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-400 text-xs font-semibold transition-colors cursor-pointer w-full lg:w-auto justify-center"
                      >
                        <X className="w-4 h-4" /> Decline Selection
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold rounded-lg text-xs flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800 font-mono">
                        <Check className="w-4 h-4" /> Booth #{boothNum} Locked
                      </span>
                      <button
                        onClick={() => {
                          setRejectingAppId(app._id);
                          setRejectNote("");
                        }}
                        className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline font-semibold cursor-pointer"
                      >
                        Re-open / Decline Booth
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reject / Decline Booth Request Modal */}
      {rejectingAppId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1A202C] rounded-2xl sm:rounded-3xl shadow-2xl border border-[#E5E7EB] dark:border-white/10 max-w-md w-full p-5 sm:p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 font-body">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <h3 className="text-sm sm:text-base font-bold font-heading">
                Decline Booth Selection
              </h3>
            </div>
            <p className="text-xs text-[#6B7280] dark:text-[#CBD5E1]/70">
              Declining will release this booth space back to available status on the floor plan and allow the exhibitor to choose a different booth.
            </p>

            <textarea
              rows={3}
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="e.g. This booth space is reserved for platinum sponsors. Please pick a booth in Hall B..."
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC]"
            />

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E5E7EB] dark:border-white/10">
              <button
                onClick={() => setRejectingAppId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6B7280] dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#203748] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmRejectBooth(rejectingAppId)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                Confirm Decline & Release Booth
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoothRequestsManager;
export { BoothRequestsManager };

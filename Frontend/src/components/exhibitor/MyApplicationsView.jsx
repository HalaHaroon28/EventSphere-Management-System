import { useState, useMemo } from "react";
import { useApp } from "../../context/AppContext";
import {
  FileText,
  Plus,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
  Layers,
  Search,
  Building2,
  Calendar,
  MapPin,
  Sparkles,
  ShieldCheck,
  Store,
  ExternalLink,
  ChevronRight,
  Info,
  SlidersHorizontal,
  Check,
  AlertCircle
} from "lucide-react";
import { ApplyExpoModal } from "./ApplyExpoModal";

const MyApplicationsView = ({ onNavigateToBoothSelection }) => {
  const { applications = [], currentUser = {}, expos = [], booths = [] } = useApp();
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const userIdStr = String(currentUser?._id || currentUser?.user_id || "");
  const userEmail = currentUser?.email || "";
  const userName = currentUser?.name || "";
  const companyName = currentUser?.company_name || currentUser?.company_profile?.company_name || userName;

  const myApps = useMemo(() => {
    return (applications || []).filter((a) => {
      const exhId = typeof a?.exhibitor_id === "object" ? a?.exhibitor_id?._id : a?.exhibitor_id;
      if (exhId && String(exhId) === userIdStr) return true;
      if (a?.contact_email && userEmail && a.contact_email.toLowerCase() === userEmail.toLowerCase()) return true;
      if (a?.company_name && companyName && a.company_name.toLowerCase() === companyName.toLowerCase()) return true;
      return false;
    });
  }, [applications, userIdStr, userEmail, companyName]);

  const pendingCount = myApps.filter((a) => a?.status === "pending").length;
  const approvedCount = myApps.filter((a) => a?.status === "approved").length;
  const rejectedCount = myApps.filter((a) => a?.status === "rejected").length;
  const confirmedBoothsCount = myApps.filter(
    (a) => a?.status === "approved" && (a?.booth_status === "confirmed" || a?.booth_id || a?.booth_number)
  ).length;
  const actionRequiredCount = myApps.filter(
    (a) => a?.status === "approved" && !a?.booth_id && !a?.booth_number
  ).length;

  const filteredApps = useMemo(() => {
    return myApps.filter((app) => {

      if (statusFilter === "pending" && app.status !== "pending") return false;
      if (statusFilter === "approved" && app.status !== "approved") return false;
      if (statusFilter === "rejected" && app.status !== "rejected") return false;
      if (statusFilter === "action_required") {
        if (app.status !== "approved" || app.booth_id || app.booth_number) return false;
      }
      if (statusFilter === "confirmed_booth") {
        if (!app.booth_id && !app.booth_number && app.booth_status !== "confirmed") return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const expoTitle = (app.expo_title || app.expo_id?.title || "").toLowerCase();
        const appId = String(app._id || "").toLowerCase();
        const tier = (app.booth_tier_requested || "").toLowerCase();
        const products = (app.products_services || "").toLowerCase();
        const comp = (app.company_name || "").toLowerCase();
        const boothNum = String(app.booth_number || app.booth_id?.booth_number || "").toLowerCase();

        return (
          expoTitle.includes(q) ||
          appId.includes(q) ||
          tier.includes(q) ||
          products.includes(q) ||
          comp.includes(q) ||
          boothNum.includes(q)
        );
      }

      return true;
    });
  }, [myApps, statusFilter, searchQuery]);

  return (
    <div id="my-applications-view" className="space-y-6 font-body">

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading tracking-tight whitespace-nowrap">
              My Applications & Booths
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#CBD5E1] mt-0.5">
            Track your vendor review status, view organizer notes, and pick your interactive floor plan booth.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsApplyModalOpen(true)}
            className="py-2.5 px-4 btn-teal-primary text-white text-xs sm:text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Apply for New Expo</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1A202C] p-3.5 sm:p-4 rounded-2xl border border-[#E5E7EB] dark:border-white/10 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#CBD5E1]/60 pointer-events-none" />
          <input
            type="text"
            placeholder="Search expo, ID, booth tier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-white/5 border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] placeholder-[#6B7280]/60 dark:placeholder-[#CBD5E1]/40 focus:outline-none focus:ring-2 focus:ring-[#38B2AC]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#6B7280] hover:text-[#1F2937] dark:hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-slate-100 dark:bg-white/5 p-1 rounded-xl text-xs border border-[#E5E7EB] dark:border-white/10 shrink-0">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 cursor-pointer ${statusFilter === "all"
              ? "bg-white dark:bg-[#203748] text-[#1F2937] dark:text-white shadow-xs font-bold"
              : "text-[#6B7280] dark:text-[#CBD5E1]/70 hover:text-[#1F2937] dark:hover:text-white"
              }`}
          >
            All ({myApps.length})
          </button>
          <button
            onClick={() => setStatusFilter("pending")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${statusFilter === "pending"
              ? "bg-amber-500 text-white font-bold shadow-xs"
              : "text-[#6B7280] dark:text-[#CBD5E1]/70 hover:text-[#1F2937] dark:hover:text-white"
              }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setStatusFilter("approved")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 cursor-pointer ${statusFilter === "approved"
              ? "bg-emerald-600 text-white font-bold shadow-xs"
              : "text-[#6B7280] dark:text-[#CBD5E1]/70 hover:text-[#1F2937] dark:hover:text-white"
              }`}
          >
            Approved ({approvedCount})
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredApps.length === 0 ? (
          <div className="py-14 bg-white dark:bg-[#1A202C] rounded-2xl border border-[#E5E7EB] dark:border-white/10 text-center space-y-4 p-6 shadow-xs">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#1488A6]/10 dark:bg-[#38B2AC]/15 flex items-center justify-center text-[#1488A6] dark:text-[#38B2AC]">
              <FileText className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h4 className="text-base font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading">
                {myApps.length === 0 ? "No applications submitted yet" : "No matching applications found"}
              </h4>
              <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#CBD5E1]/70">
                {myApps.length === 0
                  ? "Explore upcoming summits and expos, submit your vendor portfolio, and get approved to choose your spot on the live interactive floor plan."
                  : "Try clearing your search query or selecting a different status filter above."}
              </p>
            </div>
            {myApps.length === 0 ? (
              <div className="pt-2">
                <button
                  onClick={() => setIsApplyModalOpen(true)}
                  className="px-5 py-2.5 btn-teal-primary text-white text-xs sm:text-sm font-bold rounded-xl cursor-pointer shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Start First Application
                </button>
              </div>
            ) : (
              <div className="pt-1">
                <button
                  onClick={() => {
                    setStatusFilter("all");
                    setSearchQuery("");
                  }}
                  className="px-4 py-2 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-[#1F2937] dark:text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        ) : (
          filteredApps.map((app, idx) => {
            const hasAssignedBooth = Boolean(app.booth_id || app.booth_number);
            const boothNum = app.booth_number || app.booth_id?.booth_number;
            const boothHall = app.booth_id?.hall || "Main Hall";
            const expoTitle = app.expo_title || app.expo_id?.title || "Industry Summit Event";
            const expoObj = expos.find((e) => String(e._id) === String(app.expo_id?._id || app.expo_id));
            const expoLocation = expoObj?.location || "Convention Center";
            const expoDates = expoObj?.start_date
              ? `${new Date(expoObj.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${expoObj.end_date
                ? new Date(expoObj.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                : ""
              }`
              : "Upcoming Schedule";

            const submittedDate = app.createdAt || app.created_at
              ? new Date(app.createdAt || app.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric"
              })
              : "Recently Submitted";

            const appKey = app._id || `app-${idx}`;
            const isApprovedWithoutBooth = app.status === "approved" && !hasAssignedBooth;

            return (
              <div
                key={appKey}
                className={`bg-white dark:bg-[#1A202C] rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs hover:shadow-md ${isApprovedWithoutBooth
                  ? "border-[#1488A6]/50 dark:border-[#38B2AC]/50 ring-1 ring-[#1488A6]/20 dark:ring-[#38B2AC]/30"
                  : app.status === "approved"
                    ? "border-emerald-200 dark:border-emerald-800/40 hover:border-emerald-400 dark:hover:border-emerald-700"
                    : app.status === "rejected"
                      ? "border-rose-200 dark:border-rose-800/40 hover:border-rose-400 dark:hover:border-rose-700"
                      : "border-[#E5E7EB] dark:border-white/10 hover:border-[#1488A6]/30 dark:hover:border-[#38B2AC]/30"
                  }`}
              >

                <div className="p-5 sm:p-6 pb-4 border-b border-[#E5E7EB] dark:border-white/10">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-[#6B7280] dark:text-[#CBD5E1]/80">
                          ID: {app._id ? app._id.slice(-8).toUpperCase() : `APP-${idx + 1}`}
                        </span>
                        <span className="text-[11px] text-[#6B7280] dark:text-[#CBD5E1]/60 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#6B7280] dark:text-[#CBD5E1]/50" />
                          Applied {submittedDate}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading tracking-tight">
                        {expoTitle}
                      </h3>
                      <div className="flex items-center gap-4 text-xs text-[#6B7280] dark:text-[#CBD5E1]/70">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#1488A6] dark:text-[#38B2AC]" />
                          {expoLocation}
                        </span>
                        <span>•</span>
                        <span>{expoDates}</span>
                      </div>
                    </div>

                    <div className="shrink-0 self-start sm:self-center">
                      <div
                        className={`text-xs font-bold px-3.5 py-1.5 rounded-xl border flex items-center gap-2 shadow-xs ${app.status === "approved"
                          ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                          : app.status === "pending"
                            ? "bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                            : "bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                          }`}
                      >
                        {app.status === "approved" ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        ) : app.status === "pending" ? (
                          <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-pulse" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                        )}
                        <span className="capitalize">
                          {app.status === "approved"
                            ? hasAssignedBooth
                              ? "Approved & Booth Booked"
                              : "Approved — Select Booth"
                            : app.status === "pending"
                              ? "Under Review"
                              : "Application Declined"}
                        </span>
                      </div>
                    </div>
                  </div>

                </div>

                <div className="p-5 sm:p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">

                    <div className="bg-slate-50 dark:bg-white/5 p-3.5 rounded-xl border border-[#E5E7EB] dark:border-white/10">
                      <span className="text-[10px] uppercase font-bold text-[#6B7280] dark:text-[#CBD5E1]/60 block font-mono">
                        Requested Booth Space
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-bold text-[#1F2937] dark:text-[#F8FAFC] capitalize text-sm">
                          {app.booth_tier_requested || "Standard"} Tier
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1488A6]/10 text-[#1488A6] dark:bg-[#38B2AC]/20 dark:text-[#38B2AC]">
                          Space Tier
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-white/5 p-3.5 rounded-xl border border-[#E5E7EB] dark:border-white/10 md:col-span-2">
                      <span className="text-[10px] uppercase font-bold text-[#6B7280] dark:text-[#CBD5E1]/60 block font-mono">
                        Showcase Outline & Products
                      </span>
                      <p className="text-[#1F2937] dark:text-[#CBD5E1] line-clamp-2 mt-1 text-xs">
                        {app.products_services || "No product outline details provided."}
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-[#E5E7EB] dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-[#203748] flex items-center justify-center text-[#1488A6] dark:text-[#38B2AC] shrink-0">
                        <Store className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#CBD5E1]/60 block font-mono">
                          Floor Plan Placement
                        </span>
                        {hasAssignedBooth ? (
                          <span className="font-bold text-[#1F2937] dark:text-white flex items-center gap-1.5 mt-0.5">
                            <span className="text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                              Booth #{boothNum}
                            </span>
                            <span className="text-[#6B7280] dark:text-[#CBD5E1]/70">
                              ({boothHall}) — Confirmed Spot
                            </span>
                          </span>
                        ) : app.status === "approved" ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold mt-0.5 block">
                            Approved — No booth chosen yet. Open the floor map to lock your space.
                          </span>
                        ) : app.status === "rejected" ? (
                          <span className="text-rose-600 dark:text-rose-400 font-medium mt-0.5 block">
                            Application was not approved for this summit.
                          </span>
                        ) : (
                          <span className="text-[#6B7280] dark:text-[#CBD5E1]/70 mt-0.5 block">
                            Organizer is reviewing your application details.
                          </span>
                        )}
                      </div>
                    </div>

                    {hasAssignedBooth && onNavigateToBoothSelection && (
                      <button
                        onClick={() => onNavigateToBoothSelection(app.expo_id?._id || app.expo_id)}
                        className="text-xs font-bold text-[#1488A6] dark:text-[#38B2AC] hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
                      >
                        <span>View on Floor Map</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {app.status === "approved" && (app.approval_message || app.review_notes) && (
                    <div className="p-4 bg-emerald-50/80 dark:bg-emerald-950/40 rounded-xl text-xs text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800/50 flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block mb-0.5">Organizer Approval Note:</span>
                        <span>{app.approval_message || app.review_notes}</span>
                      </div>
                    </div>
                  )}

                  {app.status === "rejected" && (app.rejection_reason || app.review_notes) && (
                    <div className="p-4 bg-rose-50/80 dark:bg-rose-950/40 rounded-xl text-xs text-rose-900 dark:text-rose-200 border border-rose-200 dark:border-rose-800/50 flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block mb-0.5">Reason for Decision:</span>
                        <span>{app.rejection_reason || app.review_notes}</span>
                      </div>
                    </div>
                  )}

                  {isApprovedWithoutBooth && onNavigateToBoothSelection && (
                    <div className="pt-2">
                      <div className="p-4 rounded-xl bg-gradient-to-r from-[#1488A6]/10 via-[#38B2AC]/10 to-emerald-500/10 dark:from-[#1488A6]/20 dark:via-[#38B2AC]/20 dark:to-emerald-500/20 border border-[#1488A6]/30 dark:border-[#38B2AC]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-0.5">
                          <div className="text-xs font-bold text-[#1F2937] dark:text-[#F8FAFC] flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-[#1488A6] dark:text-[#38B2AC]" />
                            <span>Action Required: Choose Your Booth Location</span>
                          </div>
                          <p className="text-[11px] text-[#6B7280] dark:text-[#CBD5E1]/80">
                            Select your preferred spot on the interactive 2D floor map to finalize your reservation.
                          </p>
                        </div>
                        <button
                          onClick={() => onNavigateToBoothSelection(app.expo_id?._id || app.expo_id)}
                          className="py-2.5 px-4 btn-teal-primary text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 whitespace-nowrap"
                        >
                          <Layers className="w-4 h-4" />
                          <span>Open Floor Plan to Pick Booth</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
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

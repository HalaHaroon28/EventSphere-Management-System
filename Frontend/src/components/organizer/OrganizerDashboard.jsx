import { useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { MetricCard } from "../common/MetricCard";
import {
  Layers,
  Calendar,
  Building2,
  Clock,
  ArrowRight,
  CheckCircle,
  Plus,
  TrendingUp,
  MessageSquare,
  Check,
  X,
  FileText,
  Ticket,
  Mail
} from "lucide-react";

export const OrganizerDashboard = ({
  onNavigate,
  onOpenCreateExpo,
  onOpenApproveModal
}) => {
  const {
    expos = [],
    booths = [],
    applications = [],
    registrations = [],
    feedbackList = [],
    rejectApplication,
    fetchExpos,
    fetchApplications,
    fetchFeedbackList,
    fetchNotifications
  } = useApp();

  // Fetch live organizer data on mount
  useEffect(() => {
    if (typeof fetchExpos === "function") fetchExpos();
    if (typeof fetchApplications === "function") fetchApplications();
    if (typeof fetchFeedbackList === "function") fetchFeedbackList();
    if (typeof fetchNotifications === "function") fetchNotifications();
  }, []);

  const pendingApps = (applications || []).filter((a) => a?.status === "pending");
  const bookedBooths = (booths || []).filter((b) => b?.status === "booked");
  const openFeedback = (feedbackList || []).filter((f) => f?.status === "open" || f?.status === "pending");
  const totalRevenue = bookedBooths.reduce((sum, b) => sum + (b?.price || 0), 0);
  const occupancyRate = booths.length > 0 ? Math.round((bookedBooths.length / booths.length) * 100) : 0;

  return (
    <div id="organizer-dashboard" className="space-y-8">
      {/* Top Banner / Metrics Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] dark:text-[#F8FAFC] tracking-tight font-heading">
            Organizer Dashboard
          </h2>
          <p className="text-sm sm:text-base text-[#6B7280] dark:text-[#CBD5E1] mt-1 font-body">
            Welcome to your event manager center. Keep track of your expos, booth bookings, and applicant requests.
          </p>
        </div>
      </div>

      {/* 4 Primary KPI Cards using MetricCard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Active Expos */}
        <MetricCard
          id="metric-active-expos"
          title="Total Expos"
          value={expos.length}
          subtitle={`${expos.filter((e) => e.status === "upcoming").length} Upcoming • Global summits`}
          icon={Calendar}
          accentColor="teal"
          trend={{
            value: "+14%",
            label: "vs last season",
            isPositive: true
          }}
          sparklineData={[3, 4, 4, 5, 5, 6, expos.length || 6]}
          onClick={() => onNavigate("expos")}
          actionLabel="Manage"
        />

        {/* Card 2: Live Applications */}
        <MetricCard
          id="metric-live-applications"
          title="Exhibitor Applications"
          value={applications.length}
          subtitle={`${pendingApps.length} pending review • ${applications.filter((a) => a.status === "approved").length} approved`}
          icon={FileText}
          accentColor={pendingApps.length > 0 ? "teal" : "emerald"}
          badge={pendingApps.length > 0 ? `${pendingApps.length} Need Review` : "All Caught Up"}
          trend={{
            value: `${pendingApps.length} pending`,
            label: "action required",
            neutral: pendingApps.length === 0,
            isPositive: pendingApps.length === 0
          }}
          onClick={() => onNavigate("applications")}
          actionLabel="Review"
        />

        {/* Card 3: Total Booths & Occupancy */}
        <MetricCard
          id="metric-total-booths"
          title="Booth Spaces"
          value={booths.length > 0 ? `${bookedBooths.length}/${booths.length}` : "0/0"}
          subtitle={booths.length > 0 ? `${occupancyRate}% Floor occupancy allocated` : "0% Floor occupancy allocated"}
          icon={Building2}
          accentColor="teal"
          trend={{
            value: `${occupancyRate}%`,
            label: "hall capacity",
            isPositive: occupancyRate >= 60
          }}
          sparklineData={[40, 55, 65, 75, 80, 85, occupancyRate]}
          onClick={() => onNavigate("floorplan")}
          actionLabel="View Map"
        />

        {/* Card 4: Registration Count & Revenue */}
        <MetricCard
          id="metric-registration-count"
          title="Total Attendees"
          value={registrations.length}
          subtitle={`$${totalRevenue.toLocaleString()} total ticket & booth revenue`}
          icon={Ticket}
          accentColor="emerald"
          trend={{
            value: "+28%",
            label: "ticket volume",
            isPositive: true
          }}
          sparklineData={[120, 180, 240, 310, 420, 520, registrations.length * 100 || 600]}
          onClick={() => onNavigate("analytics")}
          actionLabel="Reports"
        />
      </div>

      {/* Main Grid: Pending Applications Triage + Active Expos Quick List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Pending Exhibitor Applications */}
        <div className="lg:col-span-7 bg-white dark:bg-[#1A202C] p-6 sm:p-7 rounded-2xl border border-[#E5E7EB] dark:border-white/10 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-white/5">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading">
                  Exhibitor Application Approval Queue
                </h3>
                {pendingApps.length > 0 ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 dark:bg-[#203748] text-[#1488A6] dark:text-[#38B2AC] border border-[#1488A6]/30 dark:border-[#38B2AC]/40">
                    {pendingApps.length} pending
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                    All caught up
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#CBD5E1]/70 mt-1 font-body">
                Review submitted company credentials, evaluate tier requests, and assign booths.
              </p>
            </div>

            <button
              onClick={() => onNavigate("applications")}
              className="text-xs sm:text-sm font-bold text-[#1488A6] dark:text-[#38B2AC] hover:text-[#116982] dark:hover:text-[#4FD1C5] flex items-center gap-1.5 cursor-pointer font-body self-start sm:self-center px-3 py-1.5 rounded-xl hover:bg-teal-50 dark:hover:bg-[#203748] transition-colors shrink-0"
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {pendingApps.length === 0 ? (
              <div className="py-12 px-4 text-center bg-slate-50/60 dark:bg-[#0F172A]/50 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 font-body">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center mx-auto mb-3 border border-emerald-500/20">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading">
                  All Applications Reviewed
                </h4>
                <p className="text-xs text-[#6B7280] dark:text-[#CBD5E1]/70 mt-1 max-w-sm mx-auto">
                  There are no pending exhibitor applications in the queue. New submissions will automatically appear here.
                </p>
              </div>
            ) : (
              pendingApps.slice(0, 4).map((app) => {
                const expoTitle =
                  app.expo_id?.title ||
                  app.expo_id?.name ||
                  app.expo_title ||
                  expos.find((e) => String(e._id) === String(app.expo_id?._id || app.expo_id))?.title ||
                  "Exhibition Event";

                const companyInitials = (app.company_name || "EX")
                  .split(" ")
                  .filter(Boolean)
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                const tier = (app.booth_tier_requested || "standard").toLowerCase();
                const tierStyles = {
                  premium: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
                  large: "bg-teal-500/10 text-[#1488A6] dark:text-[#38B2AC] border-[#38B2AC]/30",
                  medium: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
                  small: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30",
                };
                const tierBadgeStyle = tierStyles[tier] || tierStyles.large;

                return (
                  <div
                    key={app._id}
                    className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-[#0F172A]/60 hover:bg-white dark:hover:bg-[#0F172A] hover:border-[#38B2AC]/60 hover:shadow-md transition-all duration-200 space-y-3.5 font-body"
                  >
                    {/* Top Row: Company Avatar, Name, Tier Badge, Action Buttons */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1488A6] to-[#0B5A6F] text-white font-bold font-heading flex items-center justify-center text-xs shadow-xs shrink-0 tracking-wider">
                          {companyInitials}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-sm sm:text-base text-[#1F2937] dark:text-[#F8FAFC] font-heading truncate">
                              {app.company_name}
                            </h4>
                            <span className={`text-[10px] uppercase font-mono font-extrabold px-2 py-0.5 rounded-md border tracking-wider ${tierBadgeStyle}`}>
                              {app.booth_tier_requested || "Standard"} Tier
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-[#6B7280] dark:text-[#CBD5E1]/70 mt-0.5">
                            <Building2 className="w-3.5 h-3.5 text-[#1488A6] dark:text-[#38B2AC] shrink-0" />
                            <span className="truncate font-medium">{expoTitle}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          onClick={() => rejectApplication(app._id, "Does not match current exhibition scope.")}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-[#6B7280] dark:text-[#CBD5E1] hover:text-rose-600 dark:hover:text-rose-400 text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                          title="Decline Application"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Decline</span>
                        </button>
                        <button
                          onClick={() => onOpenApproveModal(app._id)}
                          className="px-3.5 py-1.5 bg-[#1488A6] hover:bg-[#116982] dark:bg-[#38B2AC] dark:hover:bg-[#319795] text-white dark:text-slate-950 text-xs sm:text-sm font-bold rounded-xl shadow-xs hover:shadow transition-all flex items-center gap-1.5 cursor-pointer font-heading"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Review & Assign</span>
                        </button>
                      </div>
                    </div>

                    {/* Products / Services description */}
                    {app.products_services && (
                      <p className="text-xs sm:text-sm text-[#4B5563] dark:text-[#CBD5E1] leading-relaxed line-clamp-2 bg-white/80 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-white/5">
                        {app.products_services}
                      </p>
                    )}

                    {/* Meta Bar */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-[#6B7280] dark:text-[#CBD5E1]/70 pt-1 border-t border-slate-100 dark:border-white/5">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#1488A6] dark:text-[#38B2AC]" />
                        <span className="font-mono text-slate-700 dark:text-slate-200">{app.contact_email}</span>
                      </div>
                      {app.contact_phone && (
                        <div className="flex items-center gap-1.5 font-mono">
                          <span>•</span>
                          <span>{app.contact_phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Expos & Quick Operations */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Expos Summary */}
          <div className="bg-white dark:bg-[#1A202C] p-6 rounded-2xl border border-[#E5E7EB] dark:border-white/10 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading">Current Expos</h3>
              <button
                onClick={() => onNavigate("expos")}
                className="text-xs sm:text-sm font-bold text-[#1488A6] dark:text-[#38B2AC] hover:text-[#116982] dark:hover:text-[#4FD1C5] flex items-center gap-1 cursor-pointer font-body"
              >
                Manage <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {expos.map((expo) => (
                <div
                  key={expo._id}
                  className="p-4 rounded-xl border border-[#E5E7EB] dark:border-white/10 bg-white dark:bg-[#0F172A]/70 hover:bg-slate-50 dark:hover:bg-[#0F172A] transition-colors flex items-center justify-between gap-3 font-body"
                >
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-[#1F2937] dark:text-[#F8FAFC] truncate font-heading">{expo.title}</h4>
                    <span className="text-xs text-[#6B7280] dark:text-[#CBD5E1]/70 block truncate mt-0.5">{expo.location}</span>
                  </div>
                  <span
                    className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border shrink-0 uppercase ${expo.status === "upcoming"
                      ? "bg-teal-50 dark:bg-[#203748] text-[#1488A6] dark:text-[#38B2AC] border-[#1488A6]/30 dark:border-[#38B2AC]/40"
                      : "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                      }`}
                  >
                    {expo.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-[#0F172A] border border-white/10 text-white p-6 rounded-2xl space-y-4 shadow-md font-body">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#38B2AC]">
              Operations Shortcuts
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <button
                onClick={() => onNavigate("floorplan")}
                className="p-3 bg-[#1A202C] hover:bg-[#203748] rounded-xl text-left font-semibold transition-colors flex items-center gap-2.5 cursor-pointer border border-white/5"
              >
                <Layers className="w-4 h-4 text-[#38B2AC] shrink-0" />
                <span>Floor Plan Matrix</span>
              </button>
              <button
                onClick={() => onNavigate("schedule")}
                className="p-3 bg-[#1A202C] hover:bg-[#203748] rounded-xl text-left font-semibold transition-colors flex items-center gap-2.5 cursor-pointer border border-white/5"
              >
                <Clock className="w-4 h-4 text-[#38B2AC] shrink-0" />
                <span>Session Timelines</span>
              </button>
              <button
                onClick={() => onNavigate("analytics")}
                className="p-3 bg-[#1A202C] hover:bg-[#203748] rounded-xl text-left font-semibold transition-colors flex items-center gap-2.5 cursor-pointer border border-white/5"
              >
                <TrendingUp className="w-4 h-4 text-[#38B2AC] shrink-0" />
                <span>Analytics Engine</span>
              </button>
              <button
                onClick={() => onNavigate("feedback")}
                className="p-3 bg-[#1A202C] hover:bg-[#203748] rounded-xl text-left font-semibold transition-colors flex items-center gap-2.5 cursor-pointer border border-white/5"
              >
                <MessageSquare className="w-4 h-4 text-[#38B2AC] shrink-0" />
                <span>Support ({openFeedback.length})</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

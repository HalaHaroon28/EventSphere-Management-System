import { useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { MetricCard } from "../common/MetricCard";
import {
  MessageSquare,
  Building2,
  ArrowRight,
  Plus,
  FileText,
  Users,
  Sparkles,
  Store,
  Grid
} from "lucide-react";

export const ExhibitorDashboard = ({
  onNavigate,
  onOpenApply
}) => {
  const {
    currentUser = {},
    applications = [],
    booths = [],
    messages = [],
    showcases = [],
    showcase = [],
    fetchApplications,
    fetchExpos,
    fetchInboxApi
  } = useApp();

  // Fetch live exhibitor data on mount
  useEffect(() => {
    if (typeof fetchApplications === "function") fetchApplications();
    if (typeof fetchExpos === "function") fetchExpos();
    if (typeof fetchInboxApi === "function") fetchInboxApi();
  }, []);

  const allShowcases = (showcases && showcases.length) ? showcases : ((showcase && showcase.length) ? showcase : []);

  const userIdStr = String(currentUser?._id || currentUser?.user_id || "");
  const userEmail = currentUser?.email || "";
  const userName = currentUser?.name || "";
  const companyName = currentUser?.company_name || currentUser?.company_profile?.company_name || userName;

  const myApps = (applications || []).filter((a) => {
    const exhId = typeof a?.exhibitor_id === "object" ? a?.exhibitor_id?._id : a?.exhibitor_id;
    if (exhId && String(exhId) === userIdStr) return true;
    if (a?.contact_email && userEmail && a.contact_email.toLowerCase() === userEmail.toLowerCase()) return true;
    if (a?.company_name && companyName && a.company_name.toLowerCase() === companyName.toLowerCase()) return true;
    return false;
  });

  const approvedApps = myApps.filter((a) => a?.status === "approved");
  const pendingApps = myApps.filter((a) => a?.status === "pending");

  const myBookedBooths = (booths || []).filter((b) => {
    const exhId = typeof b?.exhibitor_id === "object" ? b?.exhibitor_id?._id : b?.exhibitor_id;
    if (exhId && String(exhId) === userIdStr) return true;
    if (b?.exhibitor_name && userName && b.exhibitor_name.toLowerCase() === userName.toLowerCase()) return true;
    if (b?.exhibitor_name && companyName && b.exhibitor_name.toLowerCase() === companyName.toLowerCase()) return true;
    return false;
  });

  const myMessages = (messages || []).filter((m) => {
    const senderId = typeof m?.sender_id === "object" ? m?.sender_id?._id : m?.sender_id;
    const receiverId = typeof m?.receiver_id === "object" ? m?.receiver_id?._id : m?.receiver_id;
    return (senderId && String(senderId) === userIdStr) || (receiverId && String(receiverId) === userIdStr);
  });

  const unreadMessages = (messages || []).filter((m) => {
    const receiverId = typeof m?.receiver_id === "object" ? m?.receiver_id?._id : m?.receiver_id;
    return receiverId && String(receiverId) === userIdStr && !m?.read;
  });

  const myShowcase = allShowcases.find((s) => {
    const exhId = typeof s?.exhibitor_id === "object" ? s?.exhibitor_id?._id : s?.exhibitor_id;
    return exhId && String(exhId) === userIdStr;
  }) || null;

  const productCount = myShowcase?.products?.length || 0;

  return (
    <div id="exhibitor-dashboard-view" className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold text-[#1F2937] dark:text-[#F8FAFC] tracking-tight font-heading">
              Exhibitor Dashboard
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#94A3B8] mt-1 font-normal">
            {currentUser?.company_name || currentUser?.company_profile?.company_name || userName || "Your Company"} • Track your booth applications, reserved spaces, and visitor messages.
          </p>
        </div>
      </div>

      {/* KPI Cards with MetricCard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Applications Status */}
        <MetricCard
          id="metric-exhibitor-applications"
          title="Active Applications"
          value={myApps.length}
          subtitle={`${approvedApps.length} Approved • ${pendingApps.length} In Review`}
          icon={FileText}
          accentColor="teal"
          trend={{
            value: approvedApps.length > 0 ? `${approvedApps.length} Approved` : "Pending",
            label: "pipeline",
            isPositive: approvedApps.length > 0
          }}
          sparklineData={[1, 1, 2, 2, 3, myApps.length || 3]}
          onClick={() => onNavigate("my-applications")}
          actionLabel="View"
        />

        {/* Card 2: Confirmed Floor Booths */}
        <MetricCard
          id="metric-exhibitor-booths"
          title="Allocated Booths"
          value={myBookedBooths.length}
          subtitle={myBookedBooths.map((b) => b.booth_number).join(", ") || "Selection Pending"}
          icon={Grid}
          accentColor="teal"
          badge={myBookedBooths.length > 0 ? "Floor Locked" : "Select Space"}
          trend={{
            value: myBookedBooths.length > 0 ? "Confirmed" : "Action required",
            isPositive: myBookedBooths.length > 0
          }}
          onClick={() => onNavigate("booth-selection")}
          actionLabel="Reserve"
        />

        {/* Card 3: Attendee Inquiries */}
        <MetricCard
          id="metric-exhibitor-leads"
          title="Lead Inquiries"
          value={myMessages.length}
          subtitle={`${unreadMessages.length} unread visitor inquiries`}
          icon={MessageSquare}
          accentColor={unreadMessages.length > 0 ? "teal" : "slate"}
          badge={unreadMessages.length > 0 ? `${unreadMessages.length} New` : undefined}
          trend={{
            value: `${unreadMessages.length} unread`,
            label: "inbox",
            neutral: unreadMessages.length === 0,
            isPositive: unreadMessages.length === 0
          }}
          sparklineData={[2, 4, 3, 6, 8, 7, myMessages.length || 9]}
          onClick={() => onNavigate("messages")}
          actionLabel="Chat"
        />

        {/* Card 4: Catalog Showcase Products */}
        <MetricCard
          id="metric-exhibitor-showcase"
          title="Showcase Products"
          value={productCount}
          subtitle={productCount > 0 ? "Specs, demo videos & digital catalog live" : "No products added yet"}
          icon={Store}
          accentColor={productCount > 0 ? "emerald" : "slate"}
          badge={productCount > 0 ? "Published" : "Draft"}
          trend={{
            value: productCount > 0 ? `${productCount} Live` : "Not Published",
            label: "catalog",
            neutral: productCount === 0,
            isPositive: productCount > 0
          }}
          onClick={() => onNavigate("my-booth")}
          actionLabel={productCount > 0 ? "Edit Deck" : "Add Products"}
        />
      </div>

      {/* Main Content Split: Applications Status + Assigned Booth Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Applications Tracker */}
        <div className="lg:col-span-7 bg-white dark:bg-[#1A202C] p-6 sm:p-7 rounded-2xl border border-[#E5E7EB] dark:border-white/10 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-[#1F2937] dark:text-[#F8FAFC] font-heading">
                Application Review Tracker
              </h3>
              <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#CBD5E1]/80 mt-1">
                Track per-expo review status and booth locking privileges.
              </p>
            </div>
            <button
              onClick={() => onNavigate("my-applications")}
              className="text-xs sm:text-sm font-bold text-[#1488A6] dark:text-[#38B2AC] hover:underline flex items-center gap-1 cursor-pointer"
            >
              Details <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {myApps.length === 0 ? (
              <div className="py-10 text-center text-sm text-[#6B7280] dark:text-[#CBD5E1]/70 bg-[#F8FAFC] dark:bg-[#0F172A] rounded-xl border border-dashed border-[#E5E7EB] dark:border-white/10">
                You have not submitted any expo applications yet.
              </div>
            ) : (
              myApps.map((app, idx) => {
                const appKey = app._id || `exh-app-${idx}`;
                return (
                  <div
                    key={appKey}
                    className="p-4 sm:p-5 rounded-xl border border-[#E5E7EB] dark:border-white/10 bg-[#F8FAFC] dark:bg-[#0F172A] hover:border-[#1488A6]/40 dark:hover:border-[#38B2AC]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-sm sm:text-base text-[#1F2937] dark:text-[#F8FAFC] font-heading">
                          {app.expo_title}
                        </span>
                        <span
                          className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border uppercase ${app.status === "approved"
                            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                            : app.status === "pending"
                              ? "bg-teal-50 dark:bg-[#203748] text-[#1488A6] dark:text-[#38B2AC] border border-[#1488A6]/30 dark:border-[#38B2AC]/40"
                              : "bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                            }`}
                        >
                          {app.status}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#CBD5E1]/80 line-clamp-1">
                        {app.products_services}
                      </p>
                      <div className="text-xs text-[#6B7280] dark:text-[#CBD5E1]/60 font-mono">
                        Tier: {app.booth_tier_requested} •{" "}
                        {app.booth_number
                          ? `Assigned: Booth ${app.booth_number}`
                          : "Awaiting Booth Selection"}
                      </div>
                    </div>

                    {app.status === "approved" && !app.booth_id && (
                      <button
                        onClick={() => onNavigate("booth-selection")}
                        className="px-4 py-2 btn-teal-primary text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs self-end sm:self-center transition-all cursor-pointer whitespace-nowrap"
                      >
                        Pick Floor Booth →
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Confirmed Booth Card & Quick Shortcuts */}
        <div className="lg:col-span-5 space-y-6">
          {/* Confirmed Booth Card */}
          {myBookedBooths.length > 0 ? (
            <div className="bg-gradient-to-br from-[#1488A6] to-[#0F172A] dark:from-[#203748] dark:to-[#0F172A] border border-white/10 text-white p-6 sm:p-7 rounded-2xl space-y-4 relative overflow-hidden shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-widest text-[#38B2AC] font-bold">
                  Confirmed Floor Space
                </span>
                <span className="px-2.5 py-0.5 rounded bg-white/10 text-teal-200 text-xs font-mono font-bold">
                  {myBookedBooths[0].hall}
                </span>
              </div>

              <div>
                <h4 className="text-3xl font-black font-mono tracking-tight text-white">
                  Booth {myBookedBooths[0].booth_number}
                </h4>
                <p className="text-xs sm:text-sm text-[#CBD5E1] mt-1 capitalize">
                  {myBookedBooths[0].size} Pavilion • Coordinates: X={myBookedBooths[0].position?.x}%, Y={myBookedBooths[0].position?.y}%
                </p>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs sm:text-sm">
                <button
                  onClick={() => onNavigate("my-booth")}
                  className="text-[#38B2AC] hover:text-teal-200 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  Manage Digital Booth Catalog <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#1A202C] p-6 sm:p-7 rounded-2xl border border-[#E5E7EB] dark:border-white/10 space-y-3 text-center shadow-xs">
              <Building2 className="w-10 h-10 mx-auto text-[#6B7280] dark:text-[#CBD5E1]/50" />
              <h4 className="text-base font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading">
                No Floor Booth Locked Yet
              </h4>
              <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#CBD5E1]/70">
                Once an organizer approves your application, you can select and reserve your prime floor coordinates.
              </p>
              <button
                onClick={() => onNavigate("my-applications")}
                className="px-5 py-2.5 btn-teal-primary text-white text-xs sm:text-sm font-bold rounded-xl cursor-pointer"
              >
                View Applications
              </button>
            </div>
          )}

          {/* Quick Links */}
          <div className="bg-white dark:bg-[#1A202C] p-6 rounded-2xl border border-[#E5E7EB] dark:border-white/10 shadow-xs space-y-4">
            <h4 className="text-xs font-mono font-bold text-[#6B7280] dark:text-[#CBD5E1]/70 uppercase tracking-wider">
              Exhibitor Management Tools
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <button
                onClick={() => onNavigate("my-booth")}
                className="p-3 bg-[#F8FAFC] dark:bg-[#0F172A] hover:bg-[#E2E8F0] dark:hover:bg-[#203748] rounded-xl text-left font-semibold text-[#1F2937] dark:text-[#F8FAFC] transition-colors flex items-center gap-2.5 cursor-pointer border border-[#E5E7EB] dark:border-white/5"
              >
                <Building2 className="w-4 h-4 text-[#1488A6] dark:text-[#38B2AC] shrink-0" />
                <span>Showcase Products</span>
              </button>
              <button
                onClick={() => onNavigate("messages")}
                className="p-3 bg-[#F8FAFC] dark:bg-[#0F172A] hover:bg-[#E2E8F0] dark:hover:bg-[#203748] rounded-xl text-left font-semibold text-[#1F2937] dark:text-[#F8FAFC] transition-colors flex items-center gap-2.5 cursor-pointer border border-[#E5E7EB] dark:border-white/5"
              >
                <MessageSquare className="w-4 h-4 text-[#1488A6] dark:text-[#38B2AC] shrink-0" />
                <span>Inbox ({myMessages.length})</span>
              </button>
              <button
                onClick={() => onNavigate("company-profile")}
                className="p-3 bg-[#F8FAFC] dark:bg-[#0F172A] hover:bg-[#E2E8F0] dark:hover:bg-[#203748] rounded-xl text-left font-semibold text-[#1F2937] dark:text-[#F8FAFC] transition-colors flex items-center gap-2.5 cursor-pointer border border-[#E5E7EB] dark:border-white/5"
              >
                <Users className="w-4 h-4 text-[#1488A6] dark:text-[#38B2AC] shrink-0" />
                <span>Company Profile</span>
              </button>
              <button
                onClick={() => onNavigate("feedback")}
                className="p-3 bg-[#F8FAFC] dark:bg-[#0F172A] hover:bg-[#E2E8F0] dark:hover:bg-[#203748] rounded-xl text-left font-semibold text-[#1F2937] dark:text-[#F8FAFC] transition-colors flex items-center gap-2.5 cursor-pointer border border-[#E5E7EB] dark:border-white/5"
              >
                <Sparkles className="w-4 h-4 text-[#1488A6] dark:text-[#38B2AC] shrink-0" />
                <span>Support & Notes</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

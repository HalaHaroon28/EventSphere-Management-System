import { useApp } from "../../context/AppContext";
import { EventSphereLogo } from "./EventSphereLogo";
import {
  LayoutDashboard,
  Calendar,
  Grid,
  Building2,
  Clock,
  BarChart3,
  FileText,
  Store,
  Compass,
  MessageSquare,
  Bell,
  Ticket,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sun,
  Moon,
  X,
  User,
  HelpCircle,
  Plus
} from "lucide-react";

export const Sidebar = ({
  isCollapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile
}) => {
  const {
    theme,
    toggleTheme,
    currentRole,
    activeView,
    setActiveView,
    currentUser,
    loginAs,
    setCurrentRole,
    applications,
    messages,
    notifications,
    registrations,
    bookmarks,
    feedbackList,
    resetAllData
  } = useApp();

  const pendingAppsCount = applications.filter((a) => a.status === "pending").length;
  const pendingBoothRequestsCount = applications.filter((a) => a.booth_status === "selected").length;
  const myApps = applications.filter((a) => a.exhibitor_id === currentUser?._id || a.exhibitor_id?._id === currentUser?._id);
  const unreadMessagesCount = messages.filter(
    (m) => m.receiver_id === currentUser?._id && !m.read
  ).length;
  const currentUserId = String(currentUser?._id || currentUser?.user_id || "");
  const unreadNotifsCount = (notifications || []).filter((n) => {
    if (n.read) return false;
    if (!currentUser || !currentUserId) return false;
    const notifUserId = n.user_id ? String(typeof n.user_id === "object" ? n.user_id?._id : n.user_id) : "";
    if (notifUserId) {
      return notifUserId === currentUserId;
    }
    return !n.target_role || n.target_role === currentRole || n.target_role === "all";
  }).length;
  const myPassesCount = registrations.filter((r) => r.user_id === currentUser?._id).length;
  const openFeedbackCount = feedbackList.filter((f) => f.status === "open").length;

  const getNavSections = () => {
    switch (currentRole) {
      case "organizer":
        return [
          {
            title: "EVENT MANAGEMENT",
            items: [
              { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
              { id: "expos", label: "Manage Expos", icon: Calendar },
              { id: "floorplan", label: "Floor Plan & Booths", icon: Grid },
              {
                id: "applications",
                label: "Exhibitor Applications",
                icon: Building2,
                badge: pendingAppsCount > 0 ? pendingAppsCount : undefined,
                badgeColor: "teal-badge font-bold"
              },
              {
                id: "booth-requests",
                label: "Booth Requests",
                icon: Store,
                badge: pendingBoothRequestsCount > 0 ? pendingBoothRequestsCount : undefined,
                badgeColor: "bg-amber-500/20 text-amber-600 dark:text-amber-300 font-bold border border-amber-500/40"
              },
              { id: "schedule", label: "Event Schedule", icon: Clock }
            ]
          },
          {
            title: "REPORTS & INBOX",
            items: [
              { id: "analytics", label: "Analytics & Reports", icon: BarChart3 },
              {
                id: "messages",
                label: "Messages Inbox",
                icon: MessageSquare,
                badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
                badgeColor: "teal-badge font-bold"
              },
              {
                id: "feedback",
                label: "Feedback Inbox",
                icon: HelpCircle,
                badge: openFeedbackCount > 0 ? openFeedbackCount : undefined,
                badgeColor: "bg-[#1488A6]/10 text-[#1488A6] dark:bg-[#38B2AC]/20 dark:text-[#38B2AC] font-bold border border-[#1488A6]/30 dark:border-[#38B2AC]/40"
              }
            ]
          }
        ];
      case "exhibitor":
        return [
          {
            title: "EXHIBITOR TOOLS",
            items: [
              { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
              { id: "browse-expos", label: "Browse & Apply", icon: Plus },
              {
                id: "my-applications",
                label: "My Applications",
                icon: FileText,
                badge: myApps.length > 0 ? myApps.length : undefined,
                badgeColor: "teal-badge font-bold"
              },
              { id: "booth-selection", label: "Choose a Booth", icon: Grid },
              { id: "my-booth", label: "My Booth", icon: Store },
              { id: "company-profile", label: "Company Profile", icon: Building2 }
            ]
          },
          {
            title: "MESSAGES & COMMUNICATION",
            items: [
              {
                id: "messages",
                label: "Messages",
                icon: MessageSquare,
                badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
                badgeColor: "teal-badge font-bold"
              }
            ]
          }
        ];
      default:
        return [];
    }
  };

  const sections = getNavSections();

  const handleNavClick = (viewId) => {
    setActiveView(viewId);
    onCloseMobile();
    if (isCollapsed) {
      onToggleCollapse();
    }
  };

  const handleRoleSwitch = (newRole) => {
    if (newRole === currentRole) return;
    loginAs(newRole);
    setActiveView("dashboard");
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between select-none bg-white dark:bg-[#0F172A] text-[#1F2937] dark:text-[#F8FAFC]">

      <div className="flex-1 overflow-y-auto">
        <div className={`h-16 sm:h-20 px-3 sm:px-4 border-b border-[#E5E7EB] dark:border-white/10 flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}>
          <div
            id="sidebar-brand-btn"
            onClick={(e) => {
              if (isCollapsed) {
                onToggleCollapse();
              } else {
                handleNavClick("dashboard");
              }
            }}
            className={`flex items-center cursor-pointer overflow-hidden group ${isCollapsed ? "justify-center w-full" : "w-auto"}`}
            title={isCollapsed ? "Click to Expand Sidebar" : "Go to Dashboard"}
          >
            {isCollapsed ? (
              <EventSphereLogo size="sm" showText={false} interactive={true} />
            ) : (
              <EventSphereLogo size="sm" showText={true} interactive={true} />
            )}
          </div>

          {!isCollapsed && (
            <div className="flex items-center gap-1 shrink-0">

              <button
                onClick={onCloseMobile}
                className="md:hidden p-2 rounded-xl text-[#6B7280] dark:text-[#CBD5E1] hover:text-[#1F2937] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1A202C] transition-colors cursor-pointer"
                aria-label="Close navigation drawer"
              >
                <X className="w-5 h-5" />
              </button>

              <button
                id="sidebar-toggle-collapse-btn"
                onClick={onToggleCollapse}
                className="hidden md:flex p-1.5 sm:p-2 rounded-xl text-[#6B7280] dark:text-[#CBD5E1] hover:text-[#1F2937] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1A202C] transition-colors cursor-pointer border border-transparent hover:border-[#E5E7EB] dark:hover:border-white/10"
                title="Collapse Sidebar"
                aria-label="Collapse Sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {!isCollapsed ? (
          <div className="m-3 p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#1A202C] border border-[#E5E7EB] dark:border-white/10 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                {currentUser?.profile_photo_url ? (
                  <img
                    src={currentUser.profile_photo_url.startsWith("http") || currentUser.profile_photo_url.startsWith("data:") ? currentUser.profile_photo_url : `http://localhost:5000${currentUser.profile_photo_url.startsWith("/") ? "" : "/"}${currentUser.profile_photo_url}`}
                    alt={currentUser?.name || "User"}
                    className="w-9 h-9 rounded-xl object-cover ring-2 ring-[#1488A6] dark:ring-[#38B2AC] shrink-0 shadow-xs"
                    onError={(e) => {
                      e.target.style.display = "none";
                      if (e.target.nextSibling) e.target.nextSibling.classList.remove("hidden");
                    }}
                  />
                ) : null}
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br from-[#1488A6] to-[#38B2AC] text-white ${currentUser?.profile_photo_url ? "hidden" : "flex"} items-center justify-center font-bold text-sm shrink-0 shadow-xs`}>
                  {(currentUser?.name || currentRole || "U").charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#1F2937] dark:text-[#F8FAFC] truncate font-heading">
                    {currentUser?.name || "Guest User"}
                  </p>
                  <p className="text-xs font-mono text-[#6B7280] dark:text-[#CBD5E1]/70 truncate">
                    {currentUser?.company_name || currentUser?.email || "Guest"}
                  </p>
                </div>
              </div>

              <span
                className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider teal-badge"
              >
                {currentRole}
              </span>
            </div>
          </div>
        ) : (
          <div className="py-3 flex flex-col items-center gap-1.5 border-b border-[#E5E7EB] dark:border-white/10">
            {currentUser?.profile_photo_url ? (
              <img
                src={currentUser.profile_photo_url}
                alt={currentUser?.name || "User"}
                className="w-9 h-9 rounded-xl object-cover ring-2 ring-[#1488A6] dark:ring-[#38B2AC]"
                title={`${currentUser?.name || "User"} (${currentRole.toUpperCase()})`}
              />
            ) : (
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm bg-[#1488A6]/10 dark:bg-[#38B2AC]/20 text-[#1488A6] dark:text-[#38B2AC] border border-[#1488A6]/30 dark:border-[#38B2AC]/40"
                title={`Role: ${currentRole.toUpperCase()}`}
              >
                {currentRole.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        )}

        <div className="px-3 py-2 space-y-5">
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-1.5">
              {!isCollapsed && (
                <span className="px-3 text-[10px] font-mono uppercase tracking-widest text-[#6B7280] dark:text-[#CBD5E1]/60 font-bold block mb-1">
                  {section.title}
                </span>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeView === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`sidebar-nav-${item.id}`}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all relative group cursor-pointer ${isActive
                        ? "bg-[#1488A6]/10 dark:bg-[#203748] text-[#1488A6] dark:text-[#38B2AC] shadow-xs border-l-2 border-[#1488A6] dark:border-[#38B2AC]"
                        : "text-[#6B7280] dark:text-[#CBD5E1] hover:text-[#1F2937] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1A202C]"
                        } ${isCollapsed ? "justify-center px-0" : ""}`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <Icon
                        className={`w-4.5 h-4.5 shrink-0 transition-transform ${isActive ? "text-[#1488A6] dark:text-[#38B2AC]" : "text-[#6B7280] dark:text-[#CBD5E1]/70 group-hover:text-[#1F2937] dark:group-hover:text-white"
                          }`}
                      />
                      {!isCollapsed && <span className="truncate flex-1 text-left font-heading">{item.label}</span>}

                      {item.badge !== undefined && !isCollapsed && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${item.badgeColor || "teal-badge"
                            }`}
                        >
                          {item.badge}
                        </span>
                      )}

                      {isActive && !isCollapsed && <div className="w-1.5 h-1.5 rounded-full bg-[#1488A6] dark:bg-[#38B2AC] ml-auto" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>

      <aside
        id="persistent-desktop-sidebar"
        onClick={() => {
          if (isCollapsed) onToggleCollapse();
        }}
        className={`hidden md:flex fixed top-0 left-0 bottom-0 z-40 bg-white dark:bg-[#0F172A] border-r border-[#E5E7EB] dark:border-white/10 flex-col transition-all duration-300 ${isCollapsed ? "w-20 cursor-pointer" : "w-64 lg:w-72"
          }`}
        title={isCollapsed ? "Click to expand sidebar" : undefined}
      >
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div
          id="mobile-sidebar-backdrop"
          onClick={onCloseMobile}
          className="md:hidden fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 animate-in fade-in duration-200 flex"
        >
          <div
            id="mobile-sidebar-drawer"
            onClick={(e) => e.stopPropagation()}
            className="w-72 max-w-[85vw] h-full bg-white dark:bg-[#0F172A] border-r border-[#E5E7EB] dark:border-white/10 shadow-2xl animate-in slide-in-from-left duration-200 overflow-hidden"
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

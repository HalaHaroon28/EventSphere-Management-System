import { useState, useEffect, useRef } from "react";
import { useApp } from "../../context/AppContext";
import {
  Plus,
  Calendar,
  Grid,
  Building2,
  Clock,
  BarChart3,
  MessageSquare,
  Ticket,
  Search,
  Store,
  Compass,
  FileText,
  Bell,
  X,
  Zap,
  ArrowRight
} from "lucide-react";
const QuickActionsMenu = ({
  onOpenCreateExpo,
  onOpenApplyModal,
  onOpenPassModal
}) => {
  const {
    currentRole,
    activeView,
    setActiveView,
    applications,
    messages,
    notifications,
    registrations,
    currentUser,
    showToast
  } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const menuRef = useRef(null);
  const searchInputRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);
  const pendingAppsCount = applications.filter((a) => a.status === "pending").length;
  const unreadMessagesCount = messages.filter(
    (m) => m.receiver_id === currentUser._id && !m.read
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
  const getContextActions = () => {
    switch (currentRole) {
      case "organizer":
        return [
          {
            id: "organizer_create_event",
            title: "Create New Event / Expo",
            description: "Launch a new exhibition with custom dates, hall capacity & ticketing.",
            icon: Plus,
            badge: "Primary",
            badgeColor: "teal-badge",
            color: "text-[#1488A6] dark:text-[#38B2AC] bg-teal-50 dark:bg-[#203748]",
            action: () => {
              if (onOpenCreateExpo) {
                onOpenCreateExpo();
              } else {
                setActiveView("expos");
              }
              showToast("Create Event", "Opening event configuration suite...", "info");
            }
          },
          {
            id: "organizer_review_apps",
            title: "Review Exhibitor Applications",
            description: "Approve vendor documentation and assign booth spaces.",
            icon: FileText,
            badge: pendingAppsCount > 0 ? `${pendingAppsCount} Pending` : void 0,
            badgeColor: "teal-badge",
            color: "text-[#1488A6] dark:text-[#38B2AC] bg-teal-50 dark:bg-[#203748]",
            action: () => {
              setActiveView("applications");
              showToast("Applications", "Navigated to exhibitor applications pipeline.", "info");
            }
          },
          {
            id: "organizer_allocate_booths",
            title: "Manage Floor Plan & Booths",
            description: "Configure interactive hall matrix, pricing & vendor assignments.",
            icon: Grid,
            color: "text-purple-600 bg-purple-50",
            action: () => {
              setActiveView("floorplan");
              showToast("Floor Plan", "Navigated to spatial floor plan manager.", "info");
            }
          },
          {
            id: "organizer_schedule_session",
            title: "Schedule Keynote Session",
            description: "Add speakers, keynote topics, and workshop tracks.",
            icon: Clock,
            color: "text-blue-600 bg-blue-50",
            action: () => {
              setActiveView("schedule");
              showToast("Agenda Manager", "Navigated to keynote & session scheduler.", "info");
            }
          },
          {
            id: "organizer_analytics",
            title: "Audit Analytics & Turnstile Reports",
            description: "View real-time footfall, ticket revenue & exhibitor conversion.",
            icon: BarChart3,
            color: "text-emerald-600 bg-emerald-50",
            action: () => {
              setActiveView("analytics");
            }
          },
          {
            id: "organizer_support_inbox",
            title: "Feedback & Support Inbox",
            description: "Review attendee questions and reported hall issues.",
            icon: MessageSquare,
            color: "text-slate-600 bg-slate-100",
            action: () => {
              setActiveView("feedback");
            }
          }
        ];
      case "exhibitor":
        return [
          {
            id: "exhibitor_apply_expo",
            title: "Apply for New Exhibition",
            description: "Submit product portfolio and reserve booth space in upcoming summits.",
            icon: Plus,
            badge: "Fast-Track",
            badgeColor: "bg-emerald-100 text-emerald-800",
            color: "text-emerald-600 bg-emerald-50",
            action: () => {
              if (onOpenApplyModal) {
                onOpenApplyModal();
              } else {
                setActiveView("browse-expos");
              }
              showToast("Exhibitor Application", "Opening summit application form...", "info");
            }
          },
          {
            id: "exhibitor_update_booth",
            title: "Update Booth Info & Showcase",
            description: "Publish hardware catalog, digital brochures, and staff credentials.",
            icon: Store,
            badge: "Showcase",
            badgeColor: "teal-badge",
            color: "text-[#1488A6] dark:text-[#38B2AC] bg-teal-50 dark:bg-[#203748]",
            action: () => {
              setActiveView("my-booth");
              showToast("Booth Hub", "Navigated to digital showcase manager.", "info");
            }
          },
          {
            id: "exhibitor_reserve_space",
            title: "Select & Reserve Floor Booth",
            description: "Pick optimal zone, island size, and power supply on the live map.",
            icon: Compass,
            color: "text-cyan-600 bg-cyan-50",
            action: () => {
              setActiveView("booth-selection");
            }
          },
          {
            id: "exhibitor_company_profile",
            title: "Edit Company Profile & Deck",
            description: "Update brand identity, media links, and vertical sectors.",
            icon: Building2,
            color: "text-purple-600 bg-purple-50",
            action: () => {
              setActiveView("company-profile");
            }
          },
          {
            id: "exhibitor_lead_inquiries",
            title: "Attendee Inquiries & Leads",
            description: "Chat directly with summit passholders and schedule VIP demos.",
            icon: MessageSquare,
            badge: unreadMessagesCount > 0 ? `${unreadMessagesCount} Unread` : void 0,
            badgeColor: "teal-badge",
            color: "text-[#1488A6] dark:text-[#38B2AC] bg-teal-50 dark:bg-[#203748]",
            action: () => {
              setActiveView("messages");
            }
          }
        ];
      case "attendee":
      default:
        const userPass = registrations.find((r) => r.user_id === currentUser._id) || registrations[0];
        return [
          {
            id: "attendee_open_pass",
            title: "View Digital QR Turnstile Pass",
            description: "Display optical barcode and NFC token for swift gate entry.",
            icon: Ticket,
            badge: "Ready for Gate",
            badgeColor: "teal-badge",
            color: "text-[#1488A6] dark:text-[#38B2AC] bg-teal-50 dark:bg-[#203748]",
            action: () => {
              if (onOpenPassModal && userPass) {
                onOpenPassModal(userPass._id);
              } else {
                setActiveView("dashboard");
              }
              showToast("Digital Pass", "Displaying active turnstile credentials.", "info");
            }
          },
          {
            id: "attendee_browse_expos",
            title: "Discover Upcoming Expos",
            description: "Explore global summits, keynote speakers, and register tickets.",
            icon: Calendar,
            color: "text-[#1488A6] dark:text-[#38B2AC] bg-teal-50 dark:bg-[#203748]",
            action: () => {
              setActiveView("browse-expos");
            }
          },
          {
            id: "attendee_search_exhibitors",
            title: "Exhibitor & Product Directory",
            description: "Find technology vendors, locate booths, and send demo inquiries.",
            icon: Building2,
            color: "text-emerald-600 bg-emerald-50",
            action: () => {
              setActiveView("exhibitors");
            }
          },
          {
            id: "attendee_my_schedule",
            title: "Personal Keynote Schedule",
            description: "Check starred presentations and track keynote stage locations.",
            icon: Clock,
            color: "text-blue-600 bg-blue-50",
            action: () => {
              setActiveView("my-schedule");
            }
          },
          {
            id: "attendee_messages",
            title: "Messages & Demo Inquiries",
            description: "Direct conversations with verified exhibitors and summit hosts.",
            icon: MessageSquare,
            color: "text-purple-600 bg-purple-50",
            action: () => {
              setActiveView("messages");
            }
          },
          {
            id: "attendee_alerts",
            title: "Summit Alerts & Notifications",
            description: "Live keynote starting reminders and badge check-in updates.",
            icon: Bell,
            badge: unreadNotifsCount > 0 ? `${unreadNotifsCount} New` : void 0,
            badgeColor: "bg-rose-100 text-rose-700",
            color: "text-rose-600 bg-rose-50",
            action: () => {
              setActiveView("notifications");
            }
          }
        ];
    }
  };
  const allActions = getContextActions();
  const filteredActions = allActions.filter(
    (action) => action.title.toLowerCase().includes(searchQuery.toLowerCase()) || action.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const getRoleLabel = () => {
    switch (currentRole) {
      case "organizer":
        return "Organizer Suite";
      case "exhibitor":
        return "Exhibitor Portal";
      case "attendee":
        return "Attendee Wallet";
      default:
        return "Public Explore";
    }
  };
  return <div ref={menuRef} className="fixed bottom-6 right-6 z-50">
      {
    /* Floating Speed Dial / Quick Actions Trigger Button */
  }
      <button
        id="quick-actions-floating-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className={`group relative flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl transition-all duration-300 font-bold text-xs ${
          isOpen
            ? "bg-[#0F172A] text-white ring-4 ring-[#38B2AC]/20 scale-105"
            : currentRole === "organizer"
            ? "bg-gradient-to-r from-[#1488A6] to-[#0D5C75] hover:from-[#0D5C75] hover:to-[#094255] text-white shadow-teal-500/25"
            : currentRole === "exhibitor"
            ? "bg-gradient-to-r from-[#1488A6] to-[#38B2AC] hover:from-[#0D5C75] hover:to-[#1488A6] text-white shadow-teal-500/25"
            : "bg-gradient-to-r from-[#0F172A] to-[#1A202C] hover:from-[#1A202C] hover:to-[#203748] text-white shadow-slate-900/30"
        }`}
        title="Quick Actions (⌘K)"
      >
        <div className="relative">
          {isOpen ? (
            <X className="w-5 h-5 transition-transform duration-200 rotate-90" />
          ) : (
            <Zap className="w-5 h-5 text-[#38B2AC] group-hover:scale-110 transition-transform" />
          )}
          {(pendingAppsCount > 0 || unreadMessagesCount > 0) && !isOpen && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
          )}
        </div>

        <span className="hidden sm:inline font-heading tracking-wide">Quick Actions</span>

        <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-medium rounded bg-white/20 text-white/90 border border-white/20">
          ⌘K
        </kbd>
      </button>

      {/* Floating Modal / Radial Card Menu */}
      {isOpen && (
        <div
          id="quick-actions-flyout-panel"
          className="absolute bottom-16 right-0 w-[92vw] sm:w-[420px] max-h-[80vh] bg-white dark:bg-[#1A202C] rounded-2xl shadow-2xl border border-[#E5E7EB] dark:border-white/10 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200 z-50 font-body"
        >
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-[#0F172A] to-[#1A202C] text-white">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#1488A6]/20 border border-[#38B2AC]/30 flex items-center justify-center text-[#38B2AC]">
                  <Zap className="w-4 h-4 text-[#38B2AC]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-heading text-white tracking-tight">
                    Quick Actions Engine
                  </h3>
                  <p className="text-[11px] text-[#CBD5E1] font-mono">
                    {getRoleLabel()} • 1-Click Operations
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search quick tasks, shortcuts..."
                className="w-full pl-9 pr-3 py-2 bg-slate-800/90 border border-slate-700 text-xs text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#38B2AC] focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Action Items List */}
          <div className="p-2.5 overflow-y-auto space-y-1 divide-y divide-[#E5E7EB] dark:divide-white/10 max-h-[360px] bg-white dark:bg-[#1A202C]">
            {filteredActions.length === 0 ? (
              <div className="py-8 text-center text-[#6B7280] dark:text-[#CBD5E1]/60">
                <p className="text-xs">No matching quick actions found.</p>
              </div>
            ) : (
              filteredActions.map((item) => {
                const ItemIcon = item.icon;
                return (
                  <button
                    key={item.id}
                    id={`quick-action-item-${item.id}`}
                    onClick={() => {
                      item.action();
                      setIsOpen(false);
                    }}
                    className="w-full text-left p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-[#203748] flex items-start gap-3 transition-colors group relative cursor-pointer"
                  >
                    <div
                      className={`w-9 h-9 rounded-xl ${item.color} flex items-center justify-center shrink-0 border border-[#E5E7EB] dark:border-white/10 shadow-xs group-hover:scale-105 transition-transform`}
                    >
                      <ItemIcon className="w-4.5 h-4.5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[#1F2937] dark:text-[#F8FAFC] group-hover:text-[#1488A6] dark:group-hover:text-[#38B2AC] transition-colors font-heading truncate">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono ${
                              item.badgeColor || "teal-badge"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#6B7280] dark:text-[#CBD5E1]/70 line-clamp-1 mt-0.5">
                        {item.description}
                      </p>
                    </div>

                    <ArrowRight className="w-4 h-4 text-[#6B7280] dark:text-[#CBD5E1]/60 opacity-0 group-hover:opacity-100 group-hover:text-[#1488A6] dark:group-hover:text-[#38B2AC] group-hover:translate-x-0.5 transition-all self-center shrink-0" />
                  </button>
                );
              })
            )}
          </div>

          {/* Footer Shortcuts hint */}
          <div className="px-4 py-2 bg-slate-50 dark:bg-[#0F172A] border-t border-[#E5E7EB] dark:border-white/10 flex items-center justify-between text-[10px] text-[#6B7280] dark:text-[#CBD5E1]/60 font-mono">
            <span>Role Context: {currentRole.toUpperCase()}</span>
            <span>Esc to close</span>
          </div>
        </div>
      )}
    </div>;
};
export {
  QuickActionsMenu
};

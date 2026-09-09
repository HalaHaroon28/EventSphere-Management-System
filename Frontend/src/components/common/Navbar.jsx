import { useState, useRef, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import { EventSphereLogo } from "./EventSphereLogo";
import {
  Bell,
  CheckCheck,
  ChevronDown,
  ExternalLink,
  Shield,
  Briefcase,
  Ticket,
  LogOut,
  Menu,
  X,
  Sun,
  Moon
} from "lucide-react";

export const Navbar = ({ onOpenAuth, onOpenFeedback, onToggleMobileSidebar }) => {
  const {
    theme,
    toggleTheme,
    currentRole,
    setCurrentRole,
    currentUser,
    loginAs,
    activeView,
    setActiveView,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    logout: appLogout
  } = useApp();

  const { logout: authLogout } = useAuth();

  const [showNotifs, setShowNotifs] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const notifsRef = useRef(null);
  const roleMenuRef = useRef(null);

  // Click-outside listener for popups/dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifsRef.current && !notifsRef.current.contains(event.target)) {
        setShowNotifs(false);
      }
      if (roleMenuRef.current && !roleMenuRef.current.contains(event.target)) {
        setShowRoleMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const userNotifs = (notifications || []).filter((n) => {
    if (!currentUser) return false;
    const currentUserId = String(currentUser._id || currentUser.user_id || "");
    const notifUserId = n.user_id ? String(typeof n.user_id === "object" ? n.user_id?._id : n.user_id) : "";
    if (notifUserId) {
      return notifUserId === currentUserId;
    }
    return !n.target_role || n.target_role === currentRole || n.target_role === "all";
  });
  const unreadCount = userNotifs.filter((n) => !n.read).length;

  const handleRoleChange = (role) => {
    setShowRoleMenu(false);
    setMobileMenuOpen(false);
    loginAs(role);
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "organizer":
        return {
          label: "Organizer Admin",
          bg: "bg-[#1488A6]/10 text-[#1488A6] dark:bg-[#38B2AC]/15 dark:text-[#38B2AC] border-[#1488A6]/30 dark:border-[#38B2AC]/40",
          dot: "bg-[#1488A6] dark:bg-[#38B2AC]"
        };
      case "exhibitor":
        return {
          label: "Exhibitor Portal",
          bg: "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 border-emerald-500/30 dark:border-emerald-500/40",
          dot: "bg-emerald-500"
        };
      case "attendee":
        return {
          label: "Attendee Hub",
          bg: "bg-sky-500/10 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300 border-sky-500/30 dark:border-sky-500/40",
          dot: "bg-sky-500"
        };
      default:
        return {
          label: "Public View",
          bg: "bg-slate-100 dark:bg-[#203748] text-slate-700 dark:text-[#CBD5E1] border-[#E5E7EB] dark:border-white/10",
          dot: "bg-slate-400 dark:bg-[#38B2AC]"
        };
    }
  };

  const badge = getRoleBadge(currentRole);
  const isAuthPage = activeView === "login" || activeView === "register" || activeView === "forgot-password";
  const isPublicView = currentRole === "public" || isAuthPage;

  return (
    <header id="main-header" className="sticky top-0 z-30 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-b border-[#E5E7EB] dark:border-white/10 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Left Area:
              - In Public View: Show EventSphere Logo
              - In Management Panels: NO Logo on desktop; only mobile sidebar toggle on mobile
          */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {!isPublicView && onToggleMobileSidebar && (
              <button
                id="mobile-sidebar-toggle-btn"
                onClick={onToggleMobileSidebar}
                className="md:hidden p-2 -ml-1 text-slate-600 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#1A202C] rounded-xl cursor-pointer"
                title="Toggle Portal Navigation Menu"
                aria-label="Toggle Portal Navigation"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            {/* Brand Logo: Shown ONLY on public pages */}
            {isPublicView && (
              <button
                id="brand-logo-btn"
                onClick={() => {
                  setActiveView("landing");
                }}
                className="flex items-center group text-left focus:outline-none cursor-pointer"
              >
                <EventSphereLogo size="sm" showText={true} showTagline={true} interactive={true} />
              </button>
            )}
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center space-x-1.5 sm:space-x-3">
            {/* In Management Panels: Show Static Role Badge */}
            {!isPublicView && (
              <div className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold border shadow-xs ${badge.bg}`}>
                <span className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shrink-0 ${badge.dot}`} />
                <span className="hidden sm:inline">{badge.label}</span>
                <span className="sm:hidden text-[11px]">{currentRole.toUpperCase()}</span>
              </div>
            )}

            {/* Theme Toggle Button */}
            <button
              id="navbar-theme-toggle-btn"
              onClick={toggleTheme}
              className="p-2 sm:p-2.5 text-[#6B7280] dark:text-[#CBD5E1] hover:text-[#1488A6] dark:hover:text-[#38B2AC] hover:bg-slate-100 dark:hover:bg-[#1A202C] rounded-xl transition-colors focus:outline-none cursor-pointer border border-[#E5E7EB] dark:border-white/10"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? (
                <Sun className="w-4 sm:w-5 h-4 sm:h-5 text-[#38B2AC] hover:rotate-45 transition-transform duration-200" />
              ) : (
                <Moon className="w-4 sm:w-5 h-4 sm:h-5 text-[#1488A6] hover:-rotate-12 transition-transform duration-200" />
              )}
            </button>

            {/* Notifications Bell (Only in Management Panels) */}
            {!isPublicView && (
              <div className="relative" ref={notifsRef}>
                <button
                  id="notifications-bell-btn"
                  onClick={() => setShowNotifs(!showNotifs)}
                  className="relative p-2 sm:p-2.5 text-[#6B7280] dark:text-[#CBD5E1] hover:text-[#1488A6] dark:hover:text-[#38B2AC] hover:bg-slate-100 dark:hover:bg-[#1A202C] rounded-xl transition-colors focus:outline-none cursor-pointer border border-[#E5E7EB] dark:border-white/10"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 sm:w-5 h-4 sm:h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#38B2AC] ring-2 ring-white dark:ring-[#0F172A] animate-pulse" />
                  )}
                </button>

                {showNotifs && (
                  <div
                    id="notifications-drawer"
                    className="fixed sm:absolute right-3 sm:right-0 top-18 sm:top-full mt-2 w-[calc(100vw-24px)] sm:w-96 bg-white dark:bg-[#1A202C] rounded-2xl shadow-2xl border border-[#E5E7EB] dark:border-white/10 py-3 z-50 animate-in fade-in"
                  >
                    <div className="flex items-center justify-between px-4 pb-3 border-b border-slate-100 dark:border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm sm:text-base text-[#1F2937] dark:text-[#F8FAFC]">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="text-[11px] sm:text-xs font-bold px-2 py-0.5 rounded-full teal-badge">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllNotificationsRead}
                          className="text-xs text-[#1488A6] dark:text-[#38B2AC] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCheck className="w-3.5 h-3.5" /> Mark read
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 sm:max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
                      {userNotifs.length === 0 ? (
                        <div className="py-8 text-center text-xs sm:text-sm text-[#6B7280] dark:text-[#CBD5E1]/70">
                          No notifications yet
                        </div>
                      ) : (
                        userNotifs.map((n) => {
                          const notifTitle = n.title
                            ? (typeof n.title === 'object' ? (n.title.title || JSON.stringify(n.title)) : String(n.title))
                            : n.type === 'application_status' ? 'Exhibitor Application Status'
                              : n.type === 'booth_update' ? 'Booth Assignment Update'
                                : n.type === 'message' ? 'New Message'
                                  : n.type === 'session_reminder' ? 'Upcoming Session Reminder'
                                    : 'Notification Alert';

                          const notifMsg = typeof n.message === 'object' && n.message !== null
                            ? (n.message.message || n.message.text || JSON.stringify(n.message))
                            : String(n.message || '');

                          const markReadHandler = markNotificationRead || markNotificationAsRead;

                          return (
                            <div
                              key={n._id}
                              onClick={() => markReadHandler && markReadHandler(n._id)}
                              className={`p-3 sm:p-4 hover:bg-slate-50 dark:hover:bg-[#203748] cursor-pointer transition-colors ${!n.read ? "bg-teal-500/5 dark:bg-[#38B2AC]/10" : ""
                                }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <h5 className={`text-xs sm:text-sm ${!n.read ? "font-bold text-[#1F2937] dark:text-[#F8FAFC]" : "font-medium text-[#6B7280] dark:text-[#CBD5E1]"}`}>
                                  {notifTitle}
                                </h5>
                                <span className="text-[10px] sm:text-xs text-[#6B7280] dark:text-[#CBD5E1]/60 whitespace-nowrap font-mono">
                                  {new Date(n.created_at || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </span>
                              </div>
                              <p className="text-xs text-[#6B7280] dark:text-[#CBD5E1]/80 mt-1 line-clamp-2 leading-relaxed">
                                {notifMsg}
                              </p>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Auth Buttons (Public View) vs User Profile / Logout (Panel View) */}
            {isPublicView ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  id="header-login-btn"
                  onClick={() => {
                    if (onOpenAuth) onOpenAuth("login");
                    else setActiveView("login");
                  }}
                  className={`px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-bold rounded-xl transition-colors cursor-pointer ${activeView === "login"
                      ? "bg-slate-200 dark:bg-[#203748] text-[#1F2937] dark:text-[#F8FAFC]"
                      : "text-[#6B7280] dark:text-[#CBD5E1] hover:text-[#1488A6] dark:hover:text-[#38B2AC] hover:bg-slate-100 dark:hover:bg-[#1A202C]"
                    }`}
                >
                  Sign In
                </button>
                <button
                  id="header-register-btn"
                  onClick={() => {
                    if (onOpenAuth) onOpenAuth("register");
                    else setActiveView("register");
                  }}
                  className="px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold btn-teal-primary rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  Register
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="flex items-center gap-2 p-1 rounded-xl text-left">
                  <img
                    src={currentUser?.profile_photo_url ? (currentUser.profile_photo_url.startsWith("http") || currentUser.profile_photo_url.startsWith("data:") ? currentUser.profile_photo_url : `http://localhost:5000${currentUser.profile_photo_url.startsWith("/") ? "" : "/"}${currentUser.profile_photo_url}`) : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"}
                    alt={currentUser?.name || "User"}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-2 ring-[#1488A6] dark:ring-[#38B2AC]"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80";
                    }}
                  />
                  <div className="hidden lg:block text-left leading-tight">
                    <div className="text-sm font-bold text-[#1F2937] dark:text-[#F8FAFC] truncate max-w-[120px]">
                      {currentUser?.name || "User"}
                    </div>
                    <div className="text-xs text-[#6B7280] dark:text-[#CBD5E1]/70 capitalize">
                      {currentUser?.role || currentRole}
                    </div>
                  </div>
                </div>

                <button
                  id="logout-btn"
                  onClick={() => {
                    authLogout();
                    appLogout();
                  }}
                  title="Log Out & Switch to Public Home"
                  className="p-1.5 sm:p-2 text-[#6B7280] dark:text-[#CBD5E1]/70 hover:text-[#1F2937] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1A202C] rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-4.5 sm:w-5 h-4.5 sm:h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};


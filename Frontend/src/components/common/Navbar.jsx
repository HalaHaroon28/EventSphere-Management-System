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
  Moon,
  MessageSquare,
  User,
  HelpCircle,
  Calendar,
  Building2,
  Clock,
  Bookmark,
  Sparkles,
  QrCode
} from "lucide-react";

export const Navbar = ({
  onOpenAuth,
  onOpenFeedback,
  onToggleMobileSidebar,
  onOpenMyPasses,
  onOpenInquiries,
  onOpenProfile,
  onOpenMySessions
}) => {
  const {
    theme,
    toggleTheme,
    currentRole,
    currentUser,
    loginAs,
    activeView,
    setActiveView,
    notifications,
    messages,
    registrations,
    bookmarks = [],
    markNotificationRead,
    markAllNotificationsRead,
    logout: appLogout
  } = useApp();

  const { logout: authLogout } = useAuth();

  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const notifsRef = useRef(null);
  const userMenuRef = useRef(null);

  // Click-outside listener for popups/dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifsRef.current && !notifsRef.current.contains(event.target)) {
        setShowNotifs(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const currentUserId = String(currentUser?._id || currentUser?.user_id || "");

  // Notifications filtering
  const userNotifs = (notifications || []).filter((n) => {
    if (!currentUser) return false;
    const notifUserId = n.user_id ? String(typeof n.user_id === "object" ? n.user_id?._id : n.user_id) : "";
    if (notifUserId) {
      return notifUserId === currentUserId;
    }
    return !n.target_role || n.target_role === currentRole || n.target_role === "all";
  });
  const unreadCount = userNotifs.filter((n) => !n.read).length;

  // Unread Inquiries / Messages Count for Attendee
  const unreadInquiriesCount = (messages || []).filter((m) => {
    const receiverId = String(m.receiver_id?._id || m.receiver_id || "");
    return receiverId === currentUserId && !m.read;
  }).length;

  // Registered passes count for attendee
  const userPassesCount = (registrations || []).filter((r) => {
    const regUserId = String(typeof r.user_id === "object" ? r.user_id?._id : r.user_id || "");
    const regEmail = (r.user_email || r.email || "").toLowerCase();
    const userEmail = (currentUser?.email || "").toLowerCase();
    return (regUserId && regUserId === currentUserId) || (userEmail && regEmail === userEmail);
  }).length;

  // Bookmarked sessions count
  const userBookmarksCount = (!currentUser || !currentUserId) ? 0 : (bookmarks || []).filter((b) => {
    const bUserId = typeof b.user_id === "object" ? b.user_id?._id : b.user_id;
    return String(bUserId) === currentUserId;
  }).length;

  const isAuthPage = activeView === "login" || activeView === "register" || activeView === "forgot-password" || activeView === "reset-password";
  const isAttendee = currentRole === "attendee" || currentUser?.role === "attendee";
  const isPublicView = currentRole === "public" || isAttendee || isAuthPage;

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
      default:
        return {
          label: "Attendee Hub",
          bg: "bg-sky-500/10 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300 border-sky-500/30 dark:border-sky-500/40",
          dot: "bg-sky-500"
        };
    }
  };

  const badge = getRoleBadge(currentRole);

  const handleLogout = () => {
    setShowUserMenu(false);
    setMobileMenuOpen(false);
    authLogout();
    appLogout();
  };

  return (
    <header id="main-header" className="sticky top-0 z-30 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-b border-[#E5E7EB] dark:border-white/10 transition-colors duration-200 font-body">
      <div className={`${isPublicView ? "max-w-7xl mx-auto" : "w-full"} px-4 sm:px-6 lg:px-8`}>
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">

          {/* LEFT: Brand Logo (Public) OR Portal Sidebar Toggle (Dashboard) */}
          <div className="flex items-center space-x-3 sm:space-x-4 shrink-0">
            {/* Mobile Sidebar toggle for Organizer/Exhibitor only */}
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

            {/* Brand Logo (Public site) */}
            {isPublicView && (
              <button
                id="brand-logo-btn"
                onClick={() => setActiveView("landing")}
                className="flex items-center group text-left focus:outline-none cursor-pointer shrink-0"
              >
                <EventSphereLogo size="sm" showText={true} showTagline={true} interactive={true} />
              </button>
            )}
          </div>

          {/* MIDDLE: Desktop Navigation Links (Public site - centered, clean, no line) */}
          {isPublicView && (
            <nav className="hidden md:flex items-center justify-center space-x-1 sm:space-x-2">
              <button
                id="nav-home-btn"
                onClick={() => setActiveView("landing")}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${activeView === "landing"
                  ? "text-[#1488A6] dark:text-[#38B2AC] bg-slate-100 dark:bg-[#203748]"
                  : "text-[#6B7280] dark:text-[#CBD5E1] hover:text-[#1F2937] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5"
                  }`}
              >
                Home
              </button>
              <button
                id="nav-explore-expos-btn"
                onClick={() => setActiveView("expos")}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${activeView === "expos"
                  ? "text-[#1488A6] dark:text-[#38B2AC] bg-slate-100 dark:bg-[#203748]"
                  : "text-[#6B7280] dark:text-[#CBD5E1] hover:text-[#1F2937] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5"
                  }`}
              >
                Expos
              </button>
              <button
                id="nav-explore-exhibitors-btn"
                onClick={() => setActiveView("exhibitors")}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${activeView === "exhibitors"
                  ? "text-[#1488A6] dark:text-[#38B2AC] bg-slate-100 dark:bg-[#203748]"
                  : "text-[#6B7280] dark:text-[#CBD5E1] hover:text-[#1F2937] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5"
                  }`}
              >
                Exhibitors
              </button>
              <button
                id="nav-explore-sessions-btn"
                onClick={() => setActiveView("sessions")}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${activeView === "sessions"
                  ? "text-[#1488A6] dark:text-[#38B2AC] bg-slate-100 dark:bg-[#203748]"
                  : "text-[#6B7280] dark:text-[#CBD5E1] hover:text-[#1F2937] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5"
                  }`}
              >
                Sessions
              </button>
            </nav>
          )}

          {/* RIGHT ACTION BAR: Profile Menu, Notifications Bell, Light/Dark Toggle */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">


            {/* Public Guest Auth Buttons vs Logged-In User Profile */}
            {!currentUser ? (
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
              /* User Profile Menu Dropdown */
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1 sm:p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#1A202C] transition-colors cursor-pointer border border-[#E5E7EB] dark:border-white/10"
                  aria-label="User profile menu"
                >
                  <img
                    src={
                      currentUser?.profile_photo_url
                        ? currentUser.profile_photo_url.startsWith("http") || currentUser.profile_photo_url.startsWith("data:")
                          ? currentUser.profile_photo_url
                          : `http://localhost:5000${currentUser.profile_photo_url.startsWith("/") ? "" : "/"}${currentUser.profile_photo_url}`
                        : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"
                    }
                    alt={currentUser?.name || "User"}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-2 ring-[#1488A6] dark:ring-[#38B2AC]"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80";
                    }}
                  />
                  <div className="hidden lg:block text-left leading-tight pr-1">
                    <div className="text-xs font-bold text-[#1F2937] dark:text-[#F8FAFC] truncate max-w-[110px]">
                      {currentUser?.name || "User"}
                    </div>
                    <div className="text-[10px] text-[#6B7280] dark:text-[#CBD5E1]/70 capitalize font-mono">
                      {currentUser?.role || currentRole}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#6B7280] dark:text-[#CBD5E1]/60" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-60 bg-white dark:bg-[#1A202C] rounded-2xl shadow-2xl border border-[#E5E7EB] dark:border-white/10 py-2 z-50 animate-in fade-in">
                    {/* User header info */}
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-white/10">
                      <p className="text-xs font-bold text-[#1F2937] dark:text-[#F8FAFC] truncate">
                        {currentUser?.name || "Attendee"}
                      </p>
                      <p className="text-[11px] text-[#6B7280] dark:text-[#CBD5E1]/70 truncate font-mono">
                        {currentUser?.email}
                      </p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-[#1488A6]/10 text-[#1488A6] dark:bg-[#38B2AC]/20 dark:text-[#38B2AC]">
                        {currentUser?.role || currentRole}
                      </span>
                    </div>

                    {/* Attendee Actions inside dropdown */}
                    {isAttendee && (
                      <div className="py-1 border-b border-slate-100 dark:border-white/10">
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            if (onOpenMyPasses) onOpenMyPasses();
                          }}
                          className="w-full px-4 py-2 text-xs font-semibold text-[#1F2937] dark:text-[#CBD5E1] hover:bg-slate-50 dark:hover:bg-[#203748] flex items-center justify-between cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <Ticket className="w-4 h-4 text-[#1488A6] dark:text-[#38B2AC]" />
                            <span>My Access Passes</span>
                          </div>
                          {userPassesCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[#38B2AC]/20 text-[#38B2AC] font-mono font-bold">
                              {userPassesCount}
                            </span>
                          )}
                        </button>

                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            if (onOpenMySessions) onOpenMySessions();
                            else setActiveView("sessions");
                          }}
                          className="w-full px-4 py-2 text-xs font-semibold text-[#1F2937] dark:text-[#CBD5E1] hover:bg-slate-50 dark:hover:bg-[#203748] flex items-center justify-between cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <Bookmark className="w-4 h-4 text-[#1488A6] dark:text-[#38B2AC]" />
                            <span>My Bookmarked Sessions</span>
                          </div>
                          {userBookmarksCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[#38B2AC]/20 text-[#38B2AC] font-mono font-bold">
                              {userBookmarksCount}
                            </span>
                          )}
                        </button>

                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            if (onOpenInquiries) onOpenInquiries();
                          }}
                          className="w-full px-4 py-2 text-xs font-semibold text-[#1F2937] dark:text-[#CBD5E1] hover:bg-slate-50 dark:hover:bg-[#203748] flex items-center justify-between cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-[#1488A6] dark:text-[#38B2AC]" />
                            <span>My Inquiries</span>
                          </div>
                          {unreadInquiriesCount > 0 && (
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                          )}
                        </button>
                      </div>
                    )}

                    {/* Common Options */}
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          if (onOpenProfile) onOpenProfile();
                          else setActiveView("profile");
                        }}
                        className="w-full px-4 py-2 text-xs font-semibold text-[#1F2937] dark:text-[#CBD5E1] hover:bg-slate-50 dark:hover:bg-[#203748] flex items-center gap-2 cursor-pointer"
                      >
                        <User className="w-4 h-4 text-[#6B7280] dark:text-[#CBD5E1]/70" />
                        <span>My Profile</span>
                      </button>

                      {/* Submit feedback is available for Exhibitor and Attendee, but NOT for Organizer */}
                      {onOpenFeedback && currentRole !== "organizer" && (
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            onOpenFeedback();
                          }}
                          className="w-full px-4 py-2 text-xs font-semibold text-[#1F2937] dark:text-[#CBD5E1] hover:bg-slate-50 dark:hover:bg-[#203748] flex items-center gap-2 cursor-pointer"
                        >
                          <HelpCircle className="w-4 h-4 text-[#6B7280] dark:text-[#CBD5E1]/70" />
                          <span>Submit Feedback</span>
                        </button>
                      )}
                    </div>

                    {/* Sign Out */}
                    <div className="pt-1 border-t border-slate-100 dark:border-white/10">
                      <button
                        id="logout-btn"
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Notifications Bell (Right of profile) */}
            {currentUser && (
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

                          return (
                            <div
                              key={n._id}
                              onClick={() => markNotificationRead && markNotificationRead(n._id)}
                              className={`p-3 sm:p-4 hover:bg-slate-50 dark:hover:bg-[#203748] cursor-pointer transition-colors ${!n.read ? "bg-teal-500/5 dark:bg-[#38B2AC]/10" : ""}`}
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

            {/* Theme Toggle Button (Right of profile & notifs) */}
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

            {/* Mobile Menu Toggle Button */}
            {isPublicView && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-slate-600 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#1A202C] rounded-xl cursor-pointer border border-[#E5E7EB] dark:border-white/10"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Dropdown Menu for Public / Attendee */}
        {isPublicView && mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#E5E7EB] dark:border-white/10 space-y-2 animate-in slide-in-from-top-2 duration-150">
            <button
              onClick={() => {
                setActiveView("landing");
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeView === "landing"
                ? "bg-slate-100 dark:bg-[#203748] text-[#1488A6] dark:text-[#38B2AC]"
                : "text-[#1F2937] dark:text-[#CBD5E1]"
                }`}
            >
              Home
            </button>
            <button
              onClick={() => {
                setActiveView("expos");
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeView === "expos"
                ? "bg-slate-100 dark:bg-[#203748] text-[#1488A6] dark:text-[#38B2AC]"
                : "text-[#1F2937] dark:text-[#CBD5E1]"
                }`}
            >
              Expos
            </button>
            <button
              onClick={() => {
                setActiveView("exhibitors");
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeView === "exhibitors"
                ? "bg-slate-100 dark:bg-[#203748] text-[#1488A6] dark:text-[#38B2AC]"
                : "text-[#1F2937] dark:text-[#CBD5E1]"
                }`}
            >
              Exhibitors
            </button>
            <button
              onClick={() => {
                setActiveView("sessions");
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeView === "sessions"
                ? "bg-slate-100 dark:bg-[#203748] text-[#1488A6] dark:text-[#38B2AC]"
                : "text-[#1F2937] dark:text-[#CBD5E1]"
                }`}
            >
              Sessions
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;

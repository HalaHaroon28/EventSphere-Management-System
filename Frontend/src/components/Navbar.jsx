import { useState } from "react";
import {
  Sparkles,
  Search,
  Bell,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Layers,
  Menu,
  X,
  ExternalLink
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const Navbar = ({
  currentTab,
  onTabChange,
  onOpenAuth,
  onSearch,
  isSidebarCollapsed,
  unreadNotificationsCount = 0,
  activeNotifications = [],
  onMarkNotificationRead
}) => {
  const { user, isAuthenticated, role, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const isDashboardView =
    currentTab?.startsWith("admin_") ||
    currentTab?.startsWith("exhibitor_") ||
    currentTab?.startsWith("attendee_") ||
    currentTab?.startsWith("dashboard");

  const getDashboardTarget = (targetRole) => {
    switch (targetRole) {
      case "organizer":
        return "admin_dashboard";
      case "exhibitor":
        return "exhibitor_dashboard";
      case "attendee":
      default:
        return "attendee_dashboard";
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(searchValue);
    if (!isDashboardView) {
      onTabChange("attendee_expos");
    }
  };

  return (
    <header
      className={`sticky top-0 z-30 transition-all duration-300 ${
        isDashboardView ? (isSidebarCollapsed ? "md:pl-20" : "md:pl-72") : "pl-0"
      } bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-xl border-b border-[#E5E7EB] dark:border-white/10 font-body`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-18 flex items-center justify-between gap-4">

        <div className="flex items-center gap-4">
          {!isDashboardView ? (
            <div
              onClick={() => onTabChange("home")}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#1488A6] to-[#38B2AC] p-0.5 shadow-xs group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-[#0F172A] rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-[#38B2AC]" />
                </div>
              </div>
              <div className="hidden sm:block leading-tight">
                <span className="font-heading font-extrabold text-lg text-[#1F2937] dark:text-[#F8FAFC] tracking-tight flex items-center gap-1">
                  EventSphere<span className="text-[#38B2AC]">.</span>
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#6B7280] dark:text-[#CBD5E1]/70 font-semibold block">
                  Enterprise Expo OS
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#6B7280] dark:text-[#CBD5E1]/70 font-bold">
                {role === "organizer" ? "Organizer" : role === "exhibitor" ? "Exhibitor" : "Attendee"}
              </span>
              <span className="text-[#9CA3AF] dark:text-[#64748B]">/</span>
              <span className="text-xs font-bold text-[#1488A6] dark:text-[#38B2AC] font-heading capitalize truncate max-w-[180px] sm:max-w-none">
                {currentTab?.replace("admin_", "").replace("exhibitor_", "").replace("attendee_", "").replace("_", " ")}
              </span>
            </div>
          )}

          {!isDashboardView && (
            <nav className="hidden md:flex items-center gap-1 ml-6 pl-6 border-l border-[#E5E7EB] dark:border-white/10">
              <button
                onClick={() => onTabChange("home")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  currentTab === "home"
                    ? "text-[#1F2937] dark:text-white bg-slate-100 dark:bg-[#203748] font-bold"
                    : "text-[#6B7280] dark:text-[#CBD5E1] hover:text-[#1F2937] dark:hover:text-white"
                }`}
              >
                Home
              </button>
              <button
                onClick={() => onTabChange("attendee_expos")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  currentTab === "attendee_expos"
                    ? "text-[#1F2937] dark:text-white bg-slate-100 dark:bg-[#203748] font-bold"
                    : "text-[#6B7280] dark:text-[#CBD5E1] hover:text-[#1F2937] dark:hover:text-white"
                }`}
              >
                Explore Summits
              </button>
              <button
                onClick={() => onTabChange("about")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  currentTab === "about"
                    ? "text-[#1F2937] dark:text-white bg-slate-100 dark:bg-[#203748] font-bold"
                    : "text-[#6B7280] dark:text-[#CBD5E1] hover:text-[#1F2937] dark:hover:text-white"
                }`}
              >
                About Platform
              </button>
              <button
                onClick={() => onTabChange("contact")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  currentTab === "contact"
                    ? "text-[#1F2937] dark:text-white bg-slate-100 dark:bg-[#203748] font-bold"
                    : "text-[#6B7280] dark:text-[#CBD5E1] hover:text-[#1F2937] dark:hover:text-white"
                }`}
              >
                Support & Contact
              </button>
            </nav>
          )}
        </div>

        <div className="hidden lg:flex items-center flex-1 max-w-xs mx-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="w-4 h-4 text-[#6B7280] dark:text-[#CBD5E1]/60 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search expos, booths, tech..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#1A202C] border border-[#E5E7EB] dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#38B2AC] text-xs text-[#1F2937] dark:text-[#F8FAFC] placeholder:text-[#6B7280] dark:placeholder:text-[#CBD5E1]/50 transition-all"
            />
          </form>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">

          {!isDashboardView ? (
            <button
              onClick={() => onTabChange(getDashboardTarget(role))}
              className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1488A6]/10 dark:bg-[#38B2AC]/15 border border-[#1488A6]/30 dark:border-[#38B2AC]/30 text-[#1488A6] dark:text-[#38B2AC] text-xs font-bold transition-all cursor-pointer"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Go to {role === "organizer" ? "Admin Panel" : role === "exhibitor" ? "Exhibitor Portal" : "My Passbook"}</span>
            </button>
          ) : (
            <button
              onClick={() => onTabChange("home")}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-[#1A202C] border border-[#E5E7EB] dark:border-white/10 hover:bg-slate-200 dark:hover:bg-[#203748] text-[#1F2937] dark:text-[#CBD5E1] text-xs font-semibold transition-all cursor-pointer"
            >
              <span>Public Site</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#6B7280] dark:text-[#CBD5E1]/60" />
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => setShowNotificationMenu(!showNotificationMenu)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-[#1A202C] border border-[#E5E7EB] dark:border-white/10 hover:bg-slate-200 dark:hover:bg-[#203748] text-[#6B7280] dark:text-[#CBD5E1] transition-colors relative cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#38B2AC] ring-2 ring-white dark:ring-[#0F172A] animate-pulse" />
              )}
            </button>

            {showNotificationMenu && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-[#1A202C] border border-[#E5E7EB] dark:border-white/10 shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB] dark:border-white/10">
                  <span className="text-xs font-bold font-heading text-[#1F2937] dark:text-[#F8FAFC]">EventSphere Alerts</span>
                  <span className="text-[10px] font-mono teal-badge px-2 py-0.5 rounded">
                    {unreadNotificationsCount} unread
                  </span>
                </div>
                <div className="py-2 space-y-2 max-h-64 overflow-y-auto">
                  {activeNotifications.length === 0 ? (
                    <p className="text-xs text-[#6B7280] dark:text-[#CBD5E1]/60 text-center py-4">No new alerts</p>
                  ) : (
                    activeNotifications.slice(0, 4).map((n) => (
                      <div
                        key={n._id}
                        onClick={() => {
                          if (onMarkNotificationRead) onMarkNotificationRead(n._id);
                        }}
                        className={`p-2.5 rounded-xl text-xs cursor-pointer transition-colors ${
                          n.read
                            ? "bg-slate-50 dark:bg-[#0F172A] text-[#6B7280] dark:text-[#CBD5E1]/70"
                            : "bg-[#1488A6]/10 dark:bg-[#38B2AC]/15 border border-[#1488A6]/20 dark:border-[#38B2AC]/30 text-[#1F2937] dark:text-[#F8FAFC]"
                        }`}
                      >
                        <p className="font-bold text-[#1488A6] dark:text-[#38B2AC] line-clamp-1">
                          {typeof n.title === "object" && n.title !== null ? (n.title.title || JSON.stringify(n.title)) : String(n.title || "")}
                        </p>
                        <p className="text-[11px] text-[#6B7280] dark:text-[#CBD5E1]/70 line-clamp-2 mt-0.5">
                          {typeof n.message === "object" && n.message !== null ? (n.message.message || n.message.text || JSON.stringify(n.message)) : String(n.message || "")}
                        </p>
                      </div>
                    ))
                  )}
                </div>
                <button
                  onClick={() => {
                    setShowNotificationMenu(false);
                    onTabChange("attendee_notifications");
                  }}
                  className="w-full py-1.5 text-center text-[11px] font-bold text-[#1488A6] dark:text-[#38B2AC] hover:underline border-t border-[#E5E7EB] dark:border-white/10 block pt-2 cursor-pointer"
                >
                  View All Notifications →
                </button>
              </div>
            )}
          </div>

          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-slate-100 dark:bg-[#1A202C] border border-[#E5E7EB] dark:border-white/10 hover:bg-slate-200 dark:hover:bg-[#203748] transition-all cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#1488A6] to-[#38B2AC] flex items-center justify-center text-white font-bold text-xs">
                  {user.name.charAt(0)}
                </div>
                <span className="text-xs font-bold text-[#1F2937] dark:text-[#F8FAFC] hidden md:block max-w-[120px] truncate font-heading">
                  {user.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#6B7280] dark:text-[#CBD5E1]/60" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#1A202C] border border-[#E5E7EB] dark:border-white/10 shadow-2xl p-2 z-50 animate-in fade-in">
                  <div className="p-2 border-b border-[#E5E7EB] dark:border-white/10">
                    <p className="text-xs font-bold text-[#1F2937] dark:text-[#F8FAFC] truncate font-heading">{user.name}</p>
                    <p className="text-[10px] font-mono text-[#6B7280] dark:text-[#CBD5E1]/60 truncate">{user.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase teal-badge">
                      Role: {role}
                    </span>
                  </div>

                  <div className="py-1 space-y-0.5">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onTabChange(getDashboardTarget(role));
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-[#1F2937] dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#203748] flex items-center gap-2 cursor-pointer"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-[#1488A6] dark:text-[#38B2AC]" />
                      <span>Workspace Dashboard</span>
                    </button>
                    {role === "exhibitor" && (
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          onTabChange("exhibitor_profile");
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-[#1F2937] dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#203748] flex items-center gap-2 cursor-pointer"
                      >
                        <Layers className="w-3.5 h-3.5 text-[#1488A6] dark:text-[#38B2AC]" />
                        <span>Company Profile</span>
                      </button>
                    )}
                  </div>

                  <div className="pt-1 border-t border-[#E5E7EB] dark:border-white/10">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        logout();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth("login")}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#1F2937] dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#1A202C] transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth("register")}
                className="px-4 py-1.5 rounded-xl btn-teal-primary text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Get Started
              </button>
            </div>
          )}

          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-[#1A202C] border border-[#E5E7EB] dark:border-white/10 text-[#1F2937] dark:text-[#CBD5E1] cursor-pointer"
            aria-label="Toggle navigation"
          >
            {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileNavOpen && (
        <div className="md:hidden px-4 py-4 bg-white dark:bg-[#0F172A] border-b border-[#E5E7EB] dark:border-white/10 space-y-2">
          <button
            onClick={() => {
              onTabChange("home");
              setMobileNavOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-[#1F2937] dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#1A202C] cursor-pointer"
          >
            Home
          </button>
          <button
            onClick={() => {
              onTabChange("attendee_expos");
              setMobileNavOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-[#1F2937] dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#1A202C] cursor-pointer"
          >
            Explore Summits
          </button>
          <button
            onClick={() => {
              onTabChange("about");
              setMobileNavOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-[#1F2937] dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#1A202C] cursor-pointer"
          >
            About Platform
          </button>
          <button
            onClick={() => {
              onTabChange("contact");
              setMobileNavOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-[#1F2937] dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#1A202C] cursor-pointer"
          >
            Support & Contact
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;

import { useState, useEffect } from "react";
import { AppContextProvider, useApp } from "./context/AppContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Navbar } from "./components/common/Navbar";
import { ToastContainer } from "./components/common/ToastContainer";
import { DigitalPassModal } from "./components/common/DigitalPassModal";
import { FeedbackModal } from "./components/common/FeedbackModal";
import { Sidebar } from "./components/common/Sidebar";
import { AIChatbot } from "./components/common/AIChatbot";
import { LandingPage } from "./components/public/LandingPage";
import { ExpoListing } from "./components/public/ExpoListing";
import { LoginPage } from "./components/public/LoginPage";
import { RegisterPage } from "./components/public/RegisterPage";
import { ForgotPasswordPage } from "./components/public/ForgotPasswordPage";
import { ResetPasswordPage } from "./components/public/ResetPasswordPage";
import { ExpoDetailModal } from "./components/public/ExpoDetailModal";
import { OrganizerDashboard } from "./components/organizer/OrganizerDashboard";
import { ManageExpos } from "./components/organizer/ManageExpos";
import { FloorPlanManager } from "./components/organizer/FloorPlanManager";
import { ExhibitorApplicationsManager } from "./components/organizer/ExhibitorApplicationsManager";
import { BoothRequestsManager } from "./components/organizer/BoothRequestsManager";
import { ScheduleManager } from "./components/organizer/ScheduleManager";
import { AnalyticsReports } from "./components/organizer/AnalyticsReports";
import { FeedbackInbox } from "./components/organizer/FeedbackInbox";
import { ExhibitorDashboard } from "./components/exhibitor/ExhibitorDashboard";
import { MyApplicationsView } from "./components/exhibitor/MyApplicationsView";
import { BoothSelectionView } from "./components/exhibitor/BoothSelectionView";
import { MyBoothManager } from "./components/exhibitor/MyBoothManager";
import { CompanyProfileView } from "./components/exhibitor/CompanyProfileView";
import { ExhibitorMessages } from "./components/exhibitor/ExhibitorMessages";
import { ApplyExpoModal } from "./components/exhibitor/ApplyExpoModal";
import { AttendeeDashboard } from "./components/attendee/AttendeeDashboard";
import { AttendeeBrowseExpos } from "./components/attendee/AttendeeBrowseExpos";
import { ExhibitorSearch } from "./components/attendee/ExhibitorSearch";
import { AttendeeMessages } from "./components/attendee/AttendeeMessages";
import { MyScheduleView } from "./components/attendee/MyScheduleView";
import { NotificationsView } from "./components/attendee/NotificationsView";
import { ProfileView } from "./components/common/ProfileView";
import { FeedbackSupportView } from "./components/common/FeedbackSupportView";
import { Menu } from "lucide-react";

const MainContent = () => {
  const {
    currentRole,
    currentUser,
    setCurrentUser,
    authLoading,
    authUser,
    activeView,
    setActiveView,
    showToast,
    setSelectedExpoId,
    activePassId,
    setActivePassId,
    registerForExpo,
    registrations,
    expos
  } = useApp();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [authRole, setAuthRole] = useState("organizer");
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applyExpoId, setApplyExpoId] = useState("expo_1");
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [approvalTargetAppId, setApprovalTargetAppId] = useState(null);
  const [detailModalExpoId, setDetailModalExpoId] = useState(null);
  const [getPassExpo, setGetPassExpo] = useState(null);
  const [activeChatExhibitorId, setActiveChatExhibitorId] = useState(null);
  const [resetToken, setResetToken] = useState(null);

  useEffect(() => {
    if (!authLoading) {
      if (authUser) {
        setCurrentUser(authUser);
      } else {
        setCurrentUser(null);
      }
    }
  }, [authUser, authLoading]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get("resetToken") || urlParams.get("token");
    if (tokenFromUrl || window.location.hash.includes("reset-password")) {
      if (tokenFromUrl) {
        setResetToken(tokenFromUrl);
      }
      setActiveView("reset-password");
    }
  }, []);
  const handleOpenAuth = (mode = "login", role = "organizer") => {
    setAuthRole(role);
    setActiveView(mode);
  };
  const handleSelectExpo = (expoId) => {
    setSelectedExpoId(expoId);
    setDetailModalExpoId(expoId);
  };
  const handleRegisterPass = (expoId) => {
    if (currentRole === "public" || !currentUser || currentUser?.role === "public") {
      showToast("Authentication Required", "You need to login first.", "error");
      setDetailModalExpoId(null);
      handleOpenAuth("login", "attendee");
      return;
    }
    setDetailModalExpoId(null);
    const targetExpo = expos.find((e) => e._id === expoId || e.id === expoId);
    if (targetExpo) {
      setGetPassExpo(targetExpo);
    } else {
      registerForExpo(expoId, "Standard Attendee Pass");
    }
  };
  const handleApplyExhibitor = (expoId) => {
    if (currentRole === "public" || (!currentUser && currentRole === "public")) {
      showToast("Authentication Required", "You need to login first as an exhibitor.", "error");
      setDetailModalExpoId(null);
      handleOpenAuth("login", "exhibitor");
      return;
    }
    setDetailModalExpoId(null);
    setApplyExpoId(expoId);
    setIsApplyModalOpen(true);
  };
  const handleQuickApproveModal = (appId) => {
    setApprovalTargetAppId(appId);
    setActiveView("applications");
  };
  const isAuthPage = activeView === "login" || activeView === "register" || activeView === "forgot-password" || activeView === "reset-password";
  const showSidebar = currentRole !== "public" && activeView !== "landing" && !isAuthPage;
  const renderCurrentView = () => {
    if (activeView === "login") {
      return <LoginPage initialRole={authRole} />;
    }
    if (activeView === "register") {
      return <RegisterPage initialRole={authRole} />;
    }
    if (activeView === "forgot-password") {
      return <ForgotPasswordPage onResetTokenGenerated={(token) => setResetToken(token)} />;
    }
    if (activeView === "reset-password") {
      return <ResetPasswordPage token={resetToken} />;
    }
    if (activeView === "landing") {
      return <LandingPage
        onSelectExpo={handleSelectExpo}
        onRegisterPass={handleRegisterPass}
        onApplyExhibitor={handleApplyExhibitor}
        onOpenAuth={handleOpenAuth}
      />;
    }
    if (activeView === "expos" && currentRole !== "organizer" && currentRole !== "attendee") {
      return <ExpoListing
        onSelectExpo={handleSelectExpo}
        onRegisterPass={handleRegisterPass}
        onApplyExhibitor={handleApplyExhibitor}
      />;
    }
    if (currentRole === "organizer") {
      switch (activeView) {
        case "dashboard":
          return <OrganizerDashboard
            onNavigate={(v) => setActiveView(v)}
            onOpenCreateExpo={() => setActiveView("expos")}
            onOpenApproveModal={handleQuickApproveModal}
          />;
        case "expos":
          return <ManageExpos />;
        case "floorplan":
          return <FloorPlanManager />;
        case "applications":
          return <ExhibitorApplicationsManager
            selectedAppIdForApproval={approvalTargetAppId}
            onClearApprovalTarget={() => setApprovalTargetAppId(null)}
          />;
        case "booth-requests":
          return <BoothRequestsManager />;
        case "schedule":
          return <ScheduleManager />;
        case "analytics":
          return <AnalyticsReports />;
        case "messages":
          return <ExhibitorMessages />;
        case "feedback":
          return <FeedbackInbox />;
        case "notifications":
          return <NotificationsView />;
        case "profile":
          return <ProfileView />;
        default:
          return <OrganizerDashboard
            onNavigate={(v) => setActiveView(v)}
            onOpenCreateExpo={() => setActiveView("expos")}
            onOpenApproveModal={handleQuickApproveModal}
          />;
      }
    }
    if (currentRole === "exhibitor") {
      switch (activeView) {
        case "dashboard":
          return <ExhibitorDashboard
            onNavigate={(v) => setActiveView(v)}
            onOpenApply={() => setIsApplyModalOpen(true)}
          />;
        case "my-applications":
          return <MyApplicationsView
            onNavigateToBoothSelection={(expoId) => {
              setApplyExpoId(expoId);
              setActiveView("booth-selection");
            }}
          />;
        case "booth-selection":
          return <BoothSelectionView
            initialExpoId={applyExpoId}
            onBookingSuccess={() => setActiveView("dashboard")}
          />;
        case "my-booth":
          return <MyBoothManager />;
        case "company-profile":
          return <CompanyProfileView />;
        case "messages":
          return <ExhibitorMessages />;
        case "feedback":
          return <FeedbackSupportView />;
        case "profile":
          return <ProfileView />;
        case "browse-expos":
        case "expos":
          return <ExpoListing
            onSelectExpo={handleSelectExpo}
            onRegisterPass={handleRegisterPass}
            onApplyExhibitor={handleApplyExhibitor}
          />;
        default:
          return <ExhibitorDashboard
            onNavigate={(v) => setActiveView(v)}
            onOpenApply={() => setIsApplyModalOpen(true)}
          />;
      }
    }
    if (currentRole === "attendee") {
      switch (activeView) {
        case "dashboard":
          return <AttendeeDashboard
            onNavigate={(v) => setActiveView(v)}
            onOpenPass={(regId) => setActivePassId(regId)}
            onSelectExpo={handleSelectExpo}
          />;
        case "browse-expos":
        case "expos":
          return <AttendeeBrowseExpos
            onSelectExpo={handleSelectExpo}
            onRegisterPass={handleRegisterPass}
          />;
        case "exhibitors":
          return <ExhibitorSearch onMessageExhibitor={(exhibitorId) => {
            setActiveChatExhibitorId(exhibitorId);
            setActiveView("messages");
          }} />;
        case "my-schedule":
          return <MyScheduleView />;
        case "messages":
          return <AttendeeMessages initialExhibitorId={activeChatExhibitorId} />;
        case "feedback":
          return <FeedbackSupportView />;
        case "profile":
          return <ProfileView />;
        default:
          return <AttendeeDashboard
            onNavigate={(v) => setActiveView(v)}
            onOpenPass={(regId) => setActivePassId(regId)}
            onSelectExpo={handleSelectExpo}
          />;
      }
    }
    return <LandingPage
      onSelectExpo={handleSelectExpo}
      onRegisterPass={handleRegisterPass}
      onApplyExhibitor={handleApplyExhibitor}
      onOpenAuth={handleOpenAuth}
    />;
  };
  return (
    <div className="min-h-screen bg-white dark:bg-[#0F172A] text-[#1F2937] dark:text-[#F8FAFC] flex flex-col font-body selection:bg-[#38B2AC] selection:text-white transition-colors duration-200">
      {/* Persistent Role Sidebar (Fixed on left) */}
      {showSidebar && (
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          mobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Main Layout Area - dynamically padded on desktop when sidebar is active */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${showSidebar ? (isSidebarCollapsed ? "md:pl-20" : "md:pl-64 lg:pl-72") : ""
          }`}
      >
        {/* Universal Top Navigation */}
        <Navbar
          onOpenAuth={(mode, role) => handleOpenAuth(mode, role)}
          onOpenFeedback={() => setIsFeedbackModalOpen(true)}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        {/* Mobile Sidebar Trigger for Auth Roles */}
        {showSidebar && (
          <div className="md:hidden bg-white dark:bg-[#1A202C] border-b border-[#E5E7EB] dark:border-white/10 px-4 py-2.5 flex items-center justify-between">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="flex items-center gap-2 text-xs font-bold text-[#1F2937] dark:text-[#CBD5E1] hover:text-[#1488A6] dark:hover:text-white px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-[#203748] border border-[#E5E7EB] dark:border-white/10 cursor-pointer"
            >
              <Menu className="w-4 h-4 text-[#1488A6] dark:text-[#38B2AC]" />
              <span>Navigation Menu</span>
            </button>
            <span className="text-[11px] font-mono font-bold text-[#6B7280] dark:text-[#CBD5E1]/70 capitalize">
              {currentRole} Portal
            </span>
          </div>
        )}

        {/* Main View Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-16 font-body">
          {renderCurrentView()}
        </main>

        {/* Professional Footer */}
        <footer className="border-t border-[#E5E7EB] dark:border-white/10 bg-white dark:bg-[#0F172A] py-8 text-xs text-[#6B7280] dark:text-[#CBD5E1]/70 mt-auto font-body">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading">
              <span className="w-2.5 h-2.5 rounded-full bg-[#38B2AC]" />
              <span>EventSphere Enterprise Expo Architecture</span>
            </div>

            <div className="flex items-center gap-6 font-mono text-[11px] text-[#6B7280] dark:text-[#CBD5E1]/60">
              <span>Spatial Coordinates Engine</span>
              <span>QR Turnstile Verification</span>
              <span>Real-Time Vendor Pipeline</span>
            </div>

            <p className="text-[#6B7280] dark:text-[#CBD5E1]/50 font-mono text-[11px]">
              © 2026 EventSphere Inc. All rights reserved.
            </p>
          </div>
        </footer>
      </div>

      {
        /* Gemini AI Multi-turn Chatbot Concierge */
      }
      <AIChatbot />

      {
        /* Global Modals & Overlays */
      }
      <ToastContainer />

      {/* Expo Detail Modal */}
      {detailModalExpoId && (
        <ExpoDetailModal
          expoId={detailModalExpoId}
          onClose={() => setDetailModalExpoId(null)}
          onRegisterPass={handleRegisterPass}
          onApplyExhibitor={handleApplyExhibitor}
          onOpenRegisterPass={handleRegisterPass}
          onOpenApplyExhibitor={handleApplyExhibitor}
        />
      )}

      {
        /* Digital Pass QR Modal */
      }
      {activePassId && <DigitalPassModal
        registrationId={activePassId}
        onClose={() => setActivePassId(null)}
      />}

      {
        /* Apply for Expo Modal */
      }
      {isApplyModalOpen && <ApplyExpoModal
        initialExpoId={applyExpoId}
        onClose={() => setIsApplyModalOpen(false)}
        onSuccess={() => setActiveView("my-applications")}
      />}

      {/* Get Pass Modal */}
      {getPassExpo && (
        <GetPassModal
          expo={getPassExpo}
          onClose={() => setGetPassExpo(null)}
        />
      )}

      {/* Feedback Modal */}
      {isFeedbackModalOpen && <FeedbackModal onClose={() => setIsFeedbackModalOpen(false)} />}
    </div>
  );
};
function App() {
  return <AuthProvider>
    <AppContextProvider>
      <MainContent />
    </AppContextProvider>

  </AuthProvider>;
}
export {
  App as default
};

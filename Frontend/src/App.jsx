import { useState, useEffect } from "react";
import { AppContextProvider, useApp } from "./context/AppContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Navbar } from "./components/common/Navbar";
import { ToastContainer } from "./components/common/ToastContainer";
import { DigitalPassModal } from "./components/common/DigitalPassModal";
import { MyPassesModal } from "./components/common/MyPassesModal";
import { MySessionsModal } from "./components/common/MySessionsModal";
import { ContactBoothModal } from "./components/common/ContactBoothModal";
import { AttendeeInquiriesDrawer } from "./components/attendee/AttendeeInquiriesDrawer";
import { ProfileModal } from "./components/common/ProfileModal";
import { FeedbackModal } from "./components/common/FeedbackModal";
import { Sidebar } from "./components/common/Sidebar";
import { AIChatbot } from "./components/common/AIChatbot";
import { LandingPage } from "./components/public/LandingPage";
import { ExpoListing } from "./components/public/ExpoListing";
import { SessionsListing } from "./components/public/SessionsListing";
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
import { BrowseExposView } from "./components/exhibitor/BrowseExposView";
import { ExhibitorSearch } from "./components/attendee/ExhibitorSearch";
import { AttendeeDashboard } from "./components/attendee/AttendeeDashboard";
import { AIMatchmakerModal } from "./components/attendee/AIMatchmakerModal";
import { GetPassModal } from "./components/attendee/GetPassModal";
import { ProfileView } from "./components/common/ProfileView";
import { FeedbackSupportView } from "./components/common/FeedbackSupportView";
import { NotificationsView } from "./components/attendee/NotificationsView";
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
  const [authRole, setAuthRole] = useState("attendee");
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applyExpoId, setApplyExpoId] = useState("expo_1");
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [approvalTargetAppId, setApprovalTargetAppId] = useState(null);
  const [detailModalExpoId, setDetailModalExpoId] = useState(null);
  const [detailModalInitialTab, setDetailModalInitialTab] = useState("overview");
  const [detailModalSelectedBoothId, setDetailModalSelectedBoothId] = useState(null);
  const [getPassExpo, setGetPassExpo] = useState(null);
  const [resetToken, setResetToken] = useState(null);

  // AI Matchmaker Modal state
  const [isAIMatchmakerOpen, setIsAIMatchmakerOpen] = useState(false);
  const [aiMatchmakerQuery, setAiMatchmakerQuery] = useState("");

  // Attendee in-page modals & drawer state
  const [isMyPassesOpen, setIsMyPassesOpen] = useState(false);
  const [isMySessionsOpen, setIsMySessionsOpen] = useState(false);
  const [isInquiriesDrawerOpen, setIsInquiriesDrawerOpen] = useState(false);
  const [isContactBoothModalOpen, setIsContactBoothModalOpen] = useState(false);
  const [contactBoothTarget, setContactBoothTarget] = useState(null);
  const [contactBoothExpoTitle, setContactBoothExpoTitle] = useState("");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleOpenAIMatchmaker = (initialQuery = "") => {
    setAiMatchmakerQuery(initialQuery);
    setIsAIMatchmakerOpen(true);
  };

  const handleLocateBoothFromMatchmaker = (rec) => {
    setIsAIMatchmakerOpen(false);
    const targetExpoId = rec.expo_id || (expos[0] ? (expos[0]._id || expos[0].id) : null);
    if (targetExpoId) {
      setSelectedExpoId(targetExpoId);
      setDetailModalExpoId(targetExpoId);
      setDetailModalInitialTab("floorplan");
      setDetailModalSelectedBoothId(rec.booth_id || rec.booth_number);
    }
  };

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

  const handleOpenAuth = (mode = "login", role = "attendee") => {
    setAuthRole(role);
    setActiveView(mode);
  };

  const handleSelectExpo = (expoId, tab = "overview") => {
    setSelectedExpoId(expoId);
    setDetailModalInitialTab(tab || "overview");
    setDetailModalSelectedBoothId(null);
    setDetailModalExpoId(expoId);
  };

  const handleRegisterPass = (expoId) => {
    if (currentRole === "public" || !currentUser || currentUser?.role === "public") {
      showToast("Authentication Required", "Please sign in to get your summit access pass.", "error");
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

  const handleOpenContactBooth = (exhibitorObj, expoTitle) => {
    if (!currentUser || currentUser.role === "public") {
      showToast("Authentication Required", "Please sign in to contact exhibitors.", "error");
      handleOpenAuth("login", "attendee");
      return;
    }
    setContactBoothTarget(exhibitorObj);
    setContactBoothExpoTitle(expoTitle || "");
    setIsContactBoothModalOpen(true);
  };

  const isAuthPage = activeView === "login" || activeView === "register" || activeView === "forgot-password" || activeView === "reset-password";
  // Sidebar is restricted STRICTLY to Organizers and Exhibitors. Attendees stay on the public site layout.
  const showSidebar = (currentRole === "organizer" || currentRole === "exhibitor") && activeView !== "landing" && !isAuthPage;

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
      return (
        <LandingPage
          onSelectExpo={handleSelectExpo}
          onRegisterPass={handleRegisterPass}
          onApplyExhibitor={handleApplyExhibitor}
          onOpenAuth={handleOpenAuth}
        />
      );
    }
    if (activeView === "expos" && currentRole !== "organizer" && currentRole !== "exhibitor") {
      return (
        <ExpoListing
          onSelectExpo={handleSelectExpo}
          onRegisterPass={handleRegisterPass}
          onApplyExhibitor={handleApplyExhibitor}
        />
      );
    }
    if ((activeView === "sessions" || activeView === "schedule") && currentRole !== "organizer" && currentRole !== "exhibitor") {
      return (
        <SessionsListing
          onSelectExpo={handleSelectExpo}
          onRegisterPass={handleRegisterPass}
        />
      );
    }
    if (activeView === "exhibitors" && currentRole !== "organizer" && currentRole !== "exhibitor") {
      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ExhibitorSearch
            onContactExhibitor={handleOpenContactBooth}
            onMessageExhibitor={(exhibitorId) => {
              handleOpenContactBooth({ _id: exhibitorId });
            }}
            onViewFloorPlan={(expoId) => {
              handleSelectExpo(expoId, "floorplan");
            }}
            onSelectExpo={handleSelectExpo}
            onOpenAIMatchmaker={handleOpenAIMatchmaker}
          />
        </div>
      );
    }

    if ((activeView === "dashboard" || activeView === "attendee-dashboard") && currentRole === "attendee") {
      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AttendeeDashboard
            onNavigate={(v) => setActiveView(v)}
            onOpenPass={(regId) => setActivePassId(regId)}
            onOpenAIMatchmaker={handleOpenAIMatchmaker}
          />
        </div>
      );
    }

    if (currentRole === "organizer") {
      switch (activeView) {
        case "dashboard":
          return (
            <OrganizerDashboard
              onNavigate={(v) => setActiveView(v)}
              onOpenCreateExpo={() => setActiveView("expos")}
              onOpenApproveModal={handleQuickApproveModal}
            />
          );
        case "expos":
          return <ManageExpos />;
        case "floorplan":
          return <FloorPlanManager />;
        case "applications":
          return (
            <ExhibitorApplicationsManager
              selectedAppIdForApproval={approvalTargetAppId}
              onClearApprovalTarget={() => setApprovalTargetAppId(null)}
            />
          );
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
          return (
            <OrganizerDashboard
              onNavigate={(v) => setActiveView(v)}
              onOpenCreateExpo={() => setActiveView("expos")}
              onOpenApproveModal={handleQuickApproveModal}
            />
          );
      }
    }

    if (currentRole === "exhibitor") {
      switch (activeView) {
        case "dashboard":
          return (
            <ExhibitorDashboard
              onNavigate={(v) => setActiveView(v)}
              onOpenApply={() => setIsApplyModalOpen(true)}
            />
          );
        case "my-applications":
          return (
            <MyApplicationsView
              onNavigateToBoothSelection={(expoId) => {
                setApplyExpoId(expoId);
                setActiveView("booth-selection");
              }}
            />
          );
        case "booth-selection":
          return (
            <BoothSelectionView
              initialExpoId={applyExpoId}
              onBookingSuccess={() => setActiveView("dashboard")}
            />
          );
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
          return (
            <BrowseExposView
              onNavigateToBoothSelection={(expoId) => {
                setApplyExpoId(expoId);
                setActiveView("booth-selection");
              }}
              onNavigateToApplications={() => setActiveView("my-applications")}
            />
          );
        default:
          return (
            <ExhibitorDashboard
              onNavigate={(v) => setActiveView(v)}
              onOpenApply={() => setIsApplyModalOpen(true)}
            />
          );
      }
    }

    // Default fallback (Attendees and Guests stay on public homepage)
    return (
      <LandingPage
        onSelectExpo={handleSelectExpo}
        onRegisterPass={handleRegisterPass}
        onApplyExhibitor={handleApplyExhibitor}
        onOpenAuth={handleOpenAuth}
      />
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F172A] text-[#1F2937] dark:text-[#F8FAFC] flex flex-col font-body selection:bg-[#38B2AC] selection:text-white transition-colors duration-200">
      {/* Persistent Role Sidebar (Fixed on left for Organizers and Exhibitors ONLY) */}
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
          onOpenMyPasses={() => setIsMyPassesOpen(true)}
          onOpenMySessions={() => setIsMySessionsOpen(true)}
          onOpenInquiries={() => setIsInquiriesDrawerOpen(true)}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          onOpenAIMatchmaker={handleOpenAIMatchmaker}
        />


        {/* Main View Container */}
        <main className={`flex-1 w-full mx-auto font-body ${showSidebar ? "p-4 sm:p-6 lg:p-8" : ""}`}>
          {renderCurrentView()}
        </main>

        {/* Professional Footer */}
        <footer className="border-t border-[#E5E7EB] dark:border-white/10 bg-white dark:bg-[#0F172A] py-8 text-xs text-[#6B7280] dark:text-[#CBD5E1]/70 mt-auto font-body">
          <div className={`${showSidebar ? "w-full" : "max-w-7xl mx-auto"} px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4`}>
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

      {/* Gemini AI Multi-turn Chatbot Concierge */}
      <AIChatbot />

      {/* Gemini Smart AI Booth Matchmaker Modal */}
      <AIMatchmakerModal
        isOpen={isAIMatchmakerOpen}
        onClose={() => setIsAIMatchmakerOpen(false)}
        initialQuery={aiMatchmakerQuery}
        onLocateBooth={handleLocateBoothFromMatchmaker}
        onMessageExhibitor={(rec) => {
          setIsAIMatchmakerOpen(false);
          handleOpenContactBooth({ _id: rec.exhibitor_id, company_name: rec.company_name }, rec.hall || "");
        }}
      />

      {/* Global Toast Alerts */}
      <ToastContainer />

      {/* Global Expo Detail Modal */}
      {detailModalExpoId && (
        <ExpoDetailModal
          expoId={detailModalExpoId}
          initialTab={detailModalInitialTab || "overview"}
          selectedBoothId={detailModalSelectedBoothId}
          onClose={() => {
            setDetailModalExpoId(null);
            setDetailModalInitialTab("overview");
            setDetailModalSelectedBoothId(null);
          }}
          onRegisterPass={handleRegisterPass}
          onApplyExhibitor={handleApplyExhibitor}
          onOpenRegisterPass={handleRegisterPass}
          onOpenApplyExhibitor={handleApplyExhibitor}
          onOpenContactBooth={(exh) => {
            const currentExpo = expos.find((e) => e._id === detailModalExpoId || e.id === detailModalExpoId);
            handleOpenContactBooth(exh, currentExpo?.title || "");
          }}
        />
      )}

      {/* Global Digital Pass Turnstile QR Modal */}
      {activePassId && (
        <DigitalPassModal
          registrationId={activePassId}
          onClose={() => setActivePassId(null)}
        />
      )}

      {/* Global My Passes Modal */}
      <MyPassesModal
        isOpen={isMyPassesOpen}
        onClose={() => setIsMyPassesOpen(false)}
        onSelectExpo={handleSelectExpo}
        onOpenGetPass={handleRegisterPass}
      />

      {/* Global My Bookmarked Sessions Modal */}
      <MySessionsModal
        isOpen={isMySessionsOpen}
        onClose={() => setIsMySessionsOpen(false)}
        onSelectExpo={handleSelectExpo}
      />

      {/* Global Attendee Inquiries Slide-over Drawer */}
      <AttendeeInquiriesDrawer
        isOpen={isInquiriesDrawerOpen}
        onClose={() => setIsInquiriesDrawerOpen(false)}
      />

      {/* Global Contact Booth Inquiry Modal */}
      <ContactBoothModal
        isOpen={isContactBoothModalOpen}
        onClose={() => {
          setIsContactBoothModalOpen(false);
          setContactBoothTarget(null);
        }}
        exhibitor={contactBoothTarget}
        expoTitle={contactBoothExpoTitle}
      />

      {/* Global Profile Settings Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Global Apply for Expo Modal */}
      {isApplyModalOpen && (
        <ApplyExpoModal
          initialExpoId={applyExpoId}
          onClose={() => setIsApplyModalOpen(false)}
          onSuccess={() => setActiveView("my-applications")}
        />
      )}

      {/* Global Get Pass Modal */}
      {getPassExpo && (
        <GetPassModal
          expo={getPassExpo}
          onClose={() => setGetPassExpo(null)}
          onSuccess={() => {
            setIsMyPassesOpen(true);
          }}
        />
      )}

      {/* Global Feedback Modal */}
      {isFeedbackModalOpen && (
        <FeedbackModal onClose={() => setIsFeedbackModalOpen(false)} />
      )}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContextProvider>
        <MainContent />
      </AppContextProvider>
    </AuthProvider>
  );
}

export default App;

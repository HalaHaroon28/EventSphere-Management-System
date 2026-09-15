import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import { OTPVerificationModal } from "../common/OTPVerificationModal";
import {
  Shield,
  Briefcase,
  Ticket,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  Layers,
  ArrowLeft
} from "lucide-react";

export const LoginPage = ({ initialRole = "organizer" }) => {
  const { loginAs, showToast, setActiveView, setCurrentUser } = useApp();
  const { login, verifyOtp, resendOtp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifyingDirect, setIsVerifyingDirect] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [pendingUserId, setPendingUserId] = useState(null);
  const [devOtpCode, setDevOtpCode] = useState(null);
  const [pendingUserRole, setPendingUserRole] = useState("attendee");
  const [otpModalSubtitle, setOtpModalSubtitle] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      showToast("Validation Error", "Please enter your email and password.", "error");
      return;
    }
    setIsLoading(true);
    try {
      const response = await login(email, password);
      setIsLoading(false);

      if (response.otpRequired) {
        setPendingUserId(response.userId);
        setDevOtpCode(response.devOtpCode);
        setPendingUserRole(response.role || "attendee");
        setOtpModalSubtitle("Your email is not verified yet. Enter the 6-digit code sent to your email to verify and log in.");
        setShowOtpModal(true);
        showToast("Email Verification Required", response.message || "Please verify your email before logging in. A 6-digit OTP code has been sent.", "info");
      } else if (response.success) {
        setCurrentUser(response.user);
        loginAs(response.user);
      }
    } catch (error) {
      setIsLoading(false);
      showToast("Login Failed", error.message || "An error occurred during login.", "error");
    }
  };

  const handleDirectVerifyRequest = async () => {
    if (!email.trim()) {
      showToast("Email Required", "Please enter your email address in the field above to verify your account.", "error");
      return;
    }
    setIsVerifyingDirect(true);
    try {
      const res = await resendOtp(email.trim());
      setIsVerifyingDirect(false);
      setPendingUserId(res.user_id);
      setDevOtpCode(res.dev_otp_code);
      setPendingUserRole(res.role || "attendee");
      setOtpModalSubtitle("Enter the 6-digit code sent to your email to complete your one-time verification.");
      setShowOtpModal(true);
      showToast("Verification Code Sent", "A fresh 6-digit OTP has been sent to your email address.", "info");
    } catch (err) {
      setIsVerifyingDirect(false);
      showToast("Verification Request Failed", err.message || "Could not find an unverified account with this email.", "error");
    }
  };

  const handleOtpSuccess = async (otpCode) => {
    try {
      const response = await verifyOtp(pendingUserId, otpCode);
      setShowOtpModal(false);
      if (response.success) {
        setCurrentUser(response.user);
        loginAs(response.user);
        showToast("Email Verified & Logged In", `Welcome back, ${response.user?.name || "User"}!`, "success");
      }
    } catch (error) {
      showToast("OTP Verification Failed", error.message || "Invalid OTP code.", "error");
      throw error;
    }
  };

  return (
    <div id="login-page-root" className="min-h-[calc(100vh-140px)] flex flex-col justify-center py-4 sm:py-8 md:py-12 px-3 sm:px-6 font-body">
      {/* Back button */}
      <div className="max-w-5xl w-full mx-auto mb-4 sm:mb-6">
        <button
          onClick={() => setActiveView("landing")}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#6B7280] dark:text-[#CBD5E1]/70 hover:text-[#1F2937] dark:hover:text-white transition-colors cursor-pointer py-1.5 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#203748]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
      </div>

      <div className="max-w-5xl w-full mx-auto">
        <div className="bg-white dark:bg-[#1A202C] rounded-2xl sm:rounded-3xl border border-[#E5E7EB] dark:border-white/10 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Left / Top Form Area */}
          <div className="lg:col-span-7 p-5 sm:p-8 md:p-10 lg:p-12 flex flex-col justify-between space-y-6 sm:space-y-8">
            <div className="space-y-5 sm:space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1488A6] dark:bg-[#38B2AC]" />
                    <span className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#CBD5E1]/60">
                      Login Portal
                    </span>
                  </div>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1F2937] dark:text-[#F8FAFC] tracking-tight font-heading">
                  Sign in to your account
                </h1>
                <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#CBD5E1]/80 mt-1">
                  Enter your registered credentials. You will be automatically redirected to your assigned role workspace.
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#1F2937] dark:text-[#CBD5E1] uppercase tracking-wider font-mono mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#CBD5E1]/50" />
                    <input
                      id="login-email-input"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm bg-slate-50 dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#38B2AC] focus:bg-white dark:focus:bg-[#0F172A] transition-all font-sans"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-[#1F2937] dark:text-[#CBD5E1] uppercase tracking-wider font-mono">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setActiveView("forgot-password")}
                      className="text-xs font-bold text-[#1488A6] dark:text-[#38B2AC] hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#CBD5E1]/50" />
                    <input
                      id="login-password-input"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-11 py-2.5 sm:py-3 text-xs sm:text-sm bg-slate-50 dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#38B2AC] focus:bg-white dark:focus:bg-[#0F172A] transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#CBD5E1]/60 hover:text-[#1F2937] dark:hover:text-white p-1 cursor-pointer"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
                  <label className="flex items-center gap-2 text-[#1F2937] dark:text-[#CBD5E1] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-[#E5E7EB] dark:border-white/20 text-[#1488A6] focus:ring-[#38B2AC] w-4 h-4"
                    />
                    <span className="text-xs sm:text-sm">Remember session</span>
                  </label>
                </div>

                <button
                  id="login-submit-btn"
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 sm:py-3.5 px-6 rounded-xl font-bold text-xs sm:text-sm md:text-base text-white btn-teal-primary shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isLoading ? (
                    <span>Authenticating...</span>
                  ) : (
                    <>
                      <span>Login</span>
                      <ArrowRight className="w-4.5 h-4.5" />
                    </>
                  )}
                </button>
              </form>

            </div>

            {/* Switch to Register & Verify Email Link */}
            <div className="pt-4 sm:pt-6 border-t border-[#E5E7EB] dark:border-white/10 space-y-2 text-center text-xs sm:text-sm text-[#6B7280] dark:text-[#CBD5E1]/70">
              <div>
                <span>Don't have an account yet? </span>
                <button
                  type="button"
                  onClick={() => setActiveView("register")}
                  className="font-bold text-[#1488A6] dark:text-[#38B2AC] hover:underline cursor-pointer"
                >
                  Create an account
                </button>
              </div>
            </div>
          </div>

          {/* Right Brand Showcase Panel */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#0F172A] via-[#1A202C] to-[#203748] text-white p-6 sm:p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, rgba(56,178,172,0.4) 1px, transparent 0)`,
                backgroundSize: "20px 20px"
              }}
            />

            <div className="relative z-10 space-y-5 sm:space-y-6">
              <div className="flex items-center gap-2.5">
                <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-xl bg-teal-500/20 text-[#38B2AC] border border-[#38B2AC]/40 flex items-center justify-center shadow-md">
                  <Layers className="w-4 sm:w-5 h-4 sm:h-5 text-[#38B2AC]" />
                </div>
                <span className="text-base sm:text-lg font-bold font-heading">EventSphere Pro</span>
              </div>

              <div className="space-y-2 sm:space-y-3 pt-2 sm:pt-4">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight font-heading leading-snug">
                  One Unified Platform. Three High-Precision Workspaces.
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Switch between organizer management, exhibitor digital showcase coordinates, and attendee instant pass verifications.
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-[#38B2AC] shrink-0 mt-0.5" />
                  <span>Two-Factor OTP authorization for administrative roles</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-[#38B2AC] shrink-0 mt-0.5" />
                  <span>Real-time floor coordinate layout & spatial matrix</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-[#38B2AC] shrink-0 mt-0.5" />
                  <span>Interactive vendor triage with instant booth locking</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-6 border-t border-white/10 text-[11px] sm:text-xs text-slate-400 flex items-center justify-between">
              <span>Enterprise Grade Security</span>
              <span className="font-mono text-[#38B2AC]">v2.6.4</span>
            </div>
          </div>
        </div>
      </div>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <OTPVerificationModal
          isOpen={showOtpModal}
          targetRole={pendingUserRole}
          role={pendingUserRole}
          targetEmail={email}
          email={email}
          pendingUserId={pendingUserId}
          userId={pendingUserId}
          devOtpCode={devOtpCode}
          subtitle={otpModalSubtitle}
          onSuccess={handleOtpSuccess}
          onClose={() => setShowOtpModal(false)}
        />
      )}
    </div>
  );
};

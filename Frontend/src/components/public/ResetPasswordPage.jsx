import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { authService } from "../../services/authService";
import { Lock, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

export const ResetPasswordPage = ({ token }) => {
  const { showToast, setActiveView } = useApp();
  const [manualToken, setManualToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const getEffectiveToken = () => {
    if (token) return token;
    if (manualToken) return manualToken;
    const urlParams = new URLSearchParams(window.location.search);
    const paramToken = urlParams.get("resetToken") || urlParams.get("token");
    if (paramToken) return paramToken;
    const hash = window.location.hash;
    if (hash.includes("token=")) {
      const match = hash.match(/token=([^&]+)/);
      if (match) return match[1];
    }
    return "";
  };

  const activeToken = getEffectiveToken();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeToken) {
      showToast("Missing Reset Token", "Please enter or provide a valid reset token.", "error");
      return;
    }
    if (!password || password.length < 6) {
      showToast("Password Too Short", "Password must be at least 6 characters.", "error");
      return;
    }
    if (password !== confirmPassword) {
      showToast("Password Mismatch", "Passwords do not match.", "error");
      return;
    }
    
    setIsLoading(true);
    try {
      await authService.resetPassword(activeToken, password);
      showToast("Password Reset Successful", "Your password has been updated. You can now log in.", "success");
      setTimeout(() => {
        setActiveView("login");
      }, 1500);
    } catch (error) {
      showToast("Reset Failed", error.message || "Failed to reset password. The token may be invalid or expired.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setActiveView("login");
  };

  return (
    <div id="reset-password-page-root" className="min-h-[calc(100vh-140px)] flex flex-col justify-center py-6 sm:py-12 font-body">
      <div className="max-w-xl w-full mx-auto px-4 sm:px-6 mb-6">
        <button
          onClick={handleBackToLogin}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#6B7280] dark:text-[#CBD5E1]/70 hover:text-[#1F2937] dark:hover:text-white transition-colors cursor-pointer py-1.5 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#203748]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sign In</span>
        </button>
      </div>

      <div className="max-w-xl w-full mx-auto px-4 sm:px-6">
        <div className="bg-white dark:bg-[#1A202C] rounded-3xl border border-[#E5E7EB] dark:border-white/10 shadow-xl p-6 sm:p-10 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1488A6] dark:bg-[#38B2AC]" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#CBD5E1]/60">
                Account Recovery
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] dark:text-[#F8FAFC] tracking-tight font-heading">
              Set New Password
            </h1>
            <p className="text-sm text-[#6B7280] dark:text-[#CBD5E1]/80 mt-1">
              Enter your new password below to complete the password reset process.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!token && (
              <div>
                <label className="block text-xs font-bold text-[#1F2937] dark:text-[#CBD5E1] uppercase tracking-wider font-mono mb-1.5">
                  Reset Token *
                </label>
                <input
                  id="reset-token-input"
                  type="text"
                  required
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  placeholder="Paste your 64-character reset token here"
                  className="w-full px-4 py-3 text-sm font-mono bg-slate-50 dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#38B2AC] focus:bg-white dark:focus:bg-[#0F172A] transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#1F2937] dark:text-[#CBD5E1] uppercase tracking-wider font-mono mb-1.5">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#CBD5E1]/50" />
                <input
                  id="reset-password-input"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password (min 6 characters)"
                  className="w-full pl-10 pr-10 py-3 text-sm bg-slate-50 dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#38B2AC] focus:bg-white dark:focus:bg-[#0F172A] transition-all font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#CBD5E1]/60 hover:text-[#1F2937] dark:hover:text-white p-1 cursor-pointer"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                      <line x1="2" y1="2" x2="22" y2="22"></line>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1F2937] dark:text-[#CBD5E1] uppercase tracking-wider font-mono mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#CBD5E1]/50" />
                <input
                  id="reset-confirm-password-input"
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#38B2AC] focus:bg-white dark:focus:bg-[#0F172A] transition-all font-sans"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-xl btn-teal-primary text-white font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <span>Resetting Password...</span>
              ) : (
                <>
                  <span>Reset Password</span>
                  <ArrowRight className="w-4.5 h-4.5" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-[#E5E7EB] dark:border-white/10 text-center text-xs text-[#6B7280] dark:text-[#CBD5E1]/70">
            <span>Remember your password? </span>
            <button
              type="button"
              onClick={handleBackToLogin}
              className="font-bold text-[#1488A6] dark:text-[#38B2AC] hover:underline cursor-pointer"
            >
              Sign in here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

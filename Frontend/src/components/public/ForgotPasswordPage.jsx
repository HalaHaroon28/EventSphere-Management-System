import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { authService } from "../../services/authService";
import { Mail, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

export const ForgotPasswordPage = ({ onResetTokenGenerated }) => {
  const { showToast, setActiveView } = useApp();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [resetToken, setResetToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast("Validation Error", "Please enter your account email.", "error");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.forgotPassword(email);
      setResetToken(response.reset_token);
      setSubmitted(true);
      if (onResetTokenGenerated) {
        onResetTokenGenerated(response.reset_token);
      }
      showToast("Reset Token Dispatched", "Password reset instructions generated.");
    } catch (error) {
      showToast("Request Failed", error.message || "Failed to send reset instructions.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToReset = () => {
    setActiveView("reset-password");
  };

  return (
    <div id="forgot-password-page-root" className="min-h-[calc(100vh-140px)] flex flex-col justify-center py-6 sm:py-12 font-body">
      <div className="max-w-xl w-full mx-auto px-4 sm:px-6 mb-6">
        <button
          onClick={() => setActiveView("login")}
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
              Reset Your Password
            </h1>
            <p className="text-sm text-[#6B7280] dark:text-[#CBD5E1]/80 mt-1">
              Enter your email address and we'll send you an encrypted token to reset your password.
            </p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1F2937] dark:text-[#CBD5E1] uppercase tracking-wider font-mono mb-1.5">
                  Account Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#CBD5E1]/50" />
                  <input
                    id="forgot-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="elena@eventsphere.io"
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
                  <span>Sending Instructions...</span>
                ) : (
                  <>
                    <span>Generate Recovery Instructions</span>
                    <ArrowRight className="w-4.5 h-4.5" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-4 p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 animate-in fade-in">
              <div className="flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Recovery Token Generated for {email}</span>
              </div>
              <p className="text-xs text-[#6B7280] dark:text-[#CBD5E1]/80 leading-relaxed">
                In this development environment, your password reset token has been generated:
              </p>
              <div className="p-3 bg-white dark:bg-[#0F172A] rounded-xl border border-emerald-300 dark:border-emerald-700 font-mono text-xs text-[#1F2937] dark:text-[#F8FAFC] select-all break-all">
                {resetToken}
              </div>
              <button
                onClick={handleGoToReset}
                className="w-full py-2.5 rounded-xl btn-teal-primary text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Proceed to Reset Password
              </button>
            </div>
          )}

          <div className="pt-4 border-t border-[#E5E7EB] dark:border-white/10 text-center text-xs text-[#6B7280] dark:text-[#CBD5E1]/70">
            <span>Remember your credentials? </span>
            <button
              type="button"
              onClick={() => setActiveView("login")}
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

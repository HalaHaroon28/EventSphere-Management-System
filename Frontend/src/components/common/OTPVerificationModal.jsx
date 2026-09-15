import { useState, useEffect, useRef } from "react";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import {
  Shield,
  Briefcase,
  Ticket,
  Lock,
  Mail,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  X,
  ArrowRight,
  Clock
} from "lucide-react";

export const OTPVerificationModal = ({
  isOpen,
  targetRole = "attendee",
  role,
  targetEmail,
  email,
  pendingUserId,
  userId,
  onSuccess,
  onClose,
  title,
  subtitle,
  devOtpCode
}) => {
  const { currentUser, showToast } = useApp();
  const { resendOtp } = useAuth();
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef([]);

  const effectiveRole = role || targetRole || "attendee";
  const effectiveUserId = pendingUserId || userId;
  const emailDisplay = targetEmail || email || currentUser?.email || "your email address";

  useEffect(() => {
    if (isOpen) {
      setDigits(["", "", "", "", "", ""]);
      setErrorMsg(null);
      setIsSuccess(false);
      setIsVerifying(false);
      setCountdown(60);
      setCanResend(false);
      setIsExpired(false);
      setTimeout(() => {
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }, 150);
    }
  }, [isOpen, targetRole]);

  useEffect(() => {
    if (!isOpen || countdown <= 0) {
      if (countdown <= 0) {
        setCanResend(true);
        setIsExpired(true);
        setErrorMsg("OTP has expired (1 minute limit). Please click Resend Email.");
      }
      return;
    }
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          setIsExpired(true);
          setErrorMsg("OTP has expired (1 minute limit). Please click Resend Email.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, countdown]);

  if (!isOpen) return null;

  const handleDigitChange = (index, value) => {
    if (isExpired) return;
    const cleanVal = value.replace(/[^0-9]/g, "");
    setErrorMsg(null);

    if (cleanVal.length > 1) {
      const newDigits = [...digits];
      const char = cleanVal.slice(-1);
      newDigits[index] = char;
      setDigits(newDigits);
      if (index < 5 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1]?.focus();
      }
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = cleanVal;
    setDigits(newDigits);

    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (cleanVal && index === 5 && newDigits.every((d) => d !== "")) {
      verifyCode(newDigits.join(""));
    }
  };

  const handleKeyDown = (index, e) => {
    if (isExpired) return;
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    if (isExpired) return;
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").trim().replace(/[^0-9]/g, "");
    if (pasteData.length >= 6) {
      const pasteDigits = pasteData.slice(0, 6).split("");
      setDigits(pasteDigits);
      inputRefs.current[5]?.focus();
      verifyCode(pasteDigits.join(""));
    }
  };

  const handleResendCode = async () => {
    if ((!canResend && !isExpired) || isResending) return;
    setIsResending(true);
    setIsVerifying(false);
    try {
      if (effectiveUserId || emailDisplay) {
        await resendOtp(effectiveUserId || emailDisplay);
      }
      setCountdown(60);
      setCanResend(false);
      setIsExpired(false);
      setDigits(["", "", "", "", "", ""]);
      setErrorMsg(null);
      showToast(
        "Fresh OTP Dispatched",
        `A new 6-digit verification code (valid 1 minute) has been sent to ${emailDisplay}.`,
        "info"
      );
      setTimeout(() => {
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }, 100);
    } catch (err) {
      showToast("Resend Failed", err.message || "Could not resend OTP email.", "error");
    } finally {
      setIsResending(false);
    }
  };

  const verifyCode = async (enteredCode) => {
    if (isExpired) {
      setErrorMsg("OTP has expired (1 minute limit). Please click Resend Email.");
      return;
    }
    const codeToVerify = enteredCode || digits.join("");
    if (codeToVerify.length !== 6) {
      setErrorMsg("Please enter all 6 digits of your security code.");
      return;
    }

    setIsVerifying(true);
    setErrorMsg(null);

    try {
      await onSuccess(codeToVerify);
    } catch (err) {
      setErrorMsg(err.message || "Invalid OTP code. Please check and try again.");
      setDigits(["", "", "", "", "", ""]);
      setTimeout(() => {
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }, 100);
    } finally {
      setIsVerifying(false);
    }
  };

  const renderRoleIcon = () => {
    if (effectiveRole === "organizer") {
      return <Shield className="w-6 h-6 text-[#1488A6] dark:text-[#38B2AC]" />;
    } else if (effectiveRole === "exhibitor") {
      return <Briefcase className="w-6 h-6 text-[#1488A6] dark:text-[#38B2AC]" />;
    }
    return <Ticket className="w-6 h-6 text-[#1488A6] dark:text-[#38B2AC]" />;
  };

  return (
    <div
      id="otp-verification-modal"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs p-3 sm:p-6 flex min-h-full items-center justify-center animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md my-auto bg-white dark:bg-[#1A202C] rounded-2xl sm:rounded-3xl border border-[#E5E7EB] dark:border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Top Accent Strip */}
        <div className="h-2 w-full bg-gradient-to-r from-[#1488A6] to-[#38B2AC]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-2 text-[#6B7280] dark:text-[#CBD5E1] hover:text-[#1F2937] dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-[#203748] transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-4 sm:p-6 md:p-7 space-y-4 sm:space-y-5">
          {/* Header Icon & Title */}
          <div className="text-center space-y-1.5">
            <div className="mx-auto w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs ring-4 ring-[#38B2AC]/20 bg-[#1488A6]/10 dark:bg-[#38B2AC]/20">
              {renderRoleIcon()}
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider teal-badge">
                <Lock className="w-3 h-3" />
                SECURITY VERIFICATION (MFA)
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#1F2937] dark:text-[#F8FAFC] tracking-tight font-heading mt-1.5">
                {title || "Email OTP Verification"}
              </h2>
              <p className="text-xs text-[#6B7280] dark:text-[#CBD5E1]/70 mt-0.5 max-w-xs mx-auto">
                {subtitle || "Enter the 6-digit security code sent to your email address (Valid for 1 minute)."}
              </p>
            </div>
          </div>

          {/* Email Delivery Note & Countdown */}
          <div className="p-3 bg-slate-50 dark:bg-[#0F172A] rounded-xl border border-[#E5E7EB] dark:border-white/10 text-center text-xs text-[#6B7280] dark:text-[#CBD5E1]/80 font-sans space-y-1">
            <div className="flex items-center justify-center gap-2">
              <Mail className="w-4 h-4 text-[#1488A6] dark:text-[#38B2AC] shrink-0" />
              <span>
                Code sent to <strong className="text-[#1F2937] dark:text-white font-mono">{emailDisplay}</strong>
              </span>
            </div>
            <div className="flex items-center justify-center gap-1 text-[11px] font-mono text-[#1488A6] dark:text-[#38B2AC]">
              <Clock className="w-3 h-3" />
              <span>OTP Expiry: <strong className={countdown <= 10 ? "text-rose-500 font-bold" : ""}>{countdown}s</strong></span>
            </div>
          </div>

          {/* Expired Warning Banner */}
          {isExpired && (
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-center text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center justify-center gap-1.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>OTP Expired! Click "Resend Email" below for a new code.</span>
            </div>
          )}

          {/* 6 Digit Inputs */}
          <div className="space-y-2">
            <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  disabled={isExpired || isVerifying}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={2}
                  value={digit}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  autoComplete="one-time-code"
                  className={`w-full h-11 sm:h-13 text-center text-lg sm:text-xl font-bold font-mono rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-[#38B2AC] ${isExpired
                      ? "bg-slate-100 dark:bg-[#0F172A]/50 text-slate-400 border-slate-200 dark:border-white/5 cursor-not-allowed"
                      : digit
                        ? "bg-white dark:bg-[#203748] text-[#1F2937] dark:text-[#F8FAFC] border-[#1488A6] dark:border-[#38B2AC] shadow-xs"
                        : "bg-[#F8FAFC] dark:bg-[#0F172A] text-[#1F2937] dark:text-white border-[#E5E7EB] dark:border-white/10"
                    } ${errorMsg && !isExpired ? "border-rose-500 ring-1 ring-rose-500" : ""}`}
                />
              ))}
            </div>

            {/* Error Message */}
            {errorMsg && !isExpired && (
              <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium justify-center animate-in fade-in">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Verify Submit Button */}
          <button
            type="button"
            disabled={isVerifying || isSuccess || isExpired}
            onClick={() => verifyCode()}
            className="w-full py-3 px-5 rounded-xl font-bold text-xs sm:text-sm btn-teal-primary shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isVerifying ? (
              <span>Verifying Code...</span>
            ) : isSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Verification Granted!</span>
              </>
            ) : isExpired ? (
              <span>Code Expired — Resend Below</span>
            ) : (
              <>
                <span>Confirm Security Code</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Resend Code and Timer */}
          <div className="flex items-center justify-between text-xs pt-1 border-t border-[#E5E7EB] dark:border-white/10">
            <span className="text-[#6B7280] dark:text-[#CBD5E1]/70">
              {isExpired ? "Need a new code?" : "Didn't receive the email?"}
            </span>
            {canResend ? (
              <button
                type="button"
                disabled={isResending}
                onClick={handleResendCode}
                className="font-bold text-[#1488A6] dark:text-[#38B2AC] hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className={`w-3 h-3 ${isResending ? "animate-spin" : ""}`} />
                <span>{isResending ? "Sending..." : "Resend Email"}</span>
              </button>
            ) : (
              <span className="font-mono text-[#6B7280] dark:text-[#CBD5E1]/60 text-[11px]">
                Resend in <span className="font-bold text-[#1F2937] dark:text-[#F8FAFC]">{countdown}s</span>
              </span>
            )}
          </div>

          {/* Trust Footer */}
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#6B7280] dark:text-[#CBD5E1]/60 font-mono">
            <Shield className="w-3 h-3" />
            <span>Encrypted Email OTP Verification</span>
          </div>
        </div>
      </div>
    </div>
  );
};

import { useState, useRef } from "react";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/authService";
import { OTPVerificationModal } from "../common/OTPVerificationModal";
import {
  Shield,
  Briefcase,
  Ticket,
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Layers,
  Camera,
  Upload,
  X
} from "lucide-react";

export const RegisterPage = ({ initialRole = "organizer" }) => {
  const { setCurrentUser, loginAs, showToast, setActiveView } = useApp();
  const { register, verifyOtp } = useAuth();
  const [selectedRole, setSelectedRole] = useState(
    initialRole === "public" ? "organizer" : initialRole
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [pfpFile, setPfpFile] = useState(null);
  const [pfpPreview, setPfpPreview] = useState(null);
  const fileInputRef = useRef(null);

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [pendingUserId, setPendingUserId] = useState(null);
  const [devOtpCode, setDevOtpCode] = useState(null);
  const [pendingUserRole, setPendingUserRole] = useState("attendee");

  const handlePfpChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        showToast("Invalid File", "Please select a valid image file (JPG, PNG, WEBP).", "error");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast("File Too Large", "Image size must be less than 5MB.", "error");
        return;
      }
      setPfpFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPfpPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePfp = () => {
    setPfpFile(null);
    setPfpPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      showToast("Validation Error", "Please enter your name and email address.", "error");
      return;
    }
    if (password.length < 6) {
      showToast("Password too short", "Password must be at least 6 characters.", "error");
      return;
    }
    if (password !== confirmPassword) {
      showToast("Password Mismatch", "Passwords do not match. Please verify.", "error");
      return;
    }
    if (!agreeTerms) {
      showToast("Terms Required", "Please accept the EventSphere platform terms to continue.", "error");
      return;
    }

    setIsLoading(true);
    try {
      let photoUrl = selectedRole === "organizer"
        ? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
        : selectedRole === "exhibitor"
          ? "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80"
          : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80";

      const userData = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: selectedRole,
        phone: phone.trim() || "+1 (555) 000-0000",
        profile_photo_base64: pfpPreview || null,
        profile_photo_url: photoUrl
      };

      const response = await register(userData);
      setIsLoading(false);

      if (response.otpRequired) {
        setPendingUserId(response.userId);
        setDevOtpCode(response.devOtpCode);
        setPendingUserRole(response.role || selectedRole);
        setShowOtpModal(true);
        showToast("Verification Required", "We've sent a 6-digit verification code to your email.", "info");
      } else if (response.success) {
        setCurrentUser(response.user);
        loginAs(response.user);
        showToast("Account Created", `Welcome to EventSphere, ${name}!`, "success");
      }
    } catch (error) {
      setIsLoading(false);
      showToast("Registration Failed", error.message || "An error occurred during registration.", "error");
    }
  };

  const handleOtpSuccess = async (otpCode) => {
    try {
      const response = await verifyOtp(pendingUserId, otpCode);
      setShowOtpModal(false);
      if (response.success) {
        setCurrentUser(response.user);
        loginAs(response.user);
        showToast("Email Verified & Signed In", `Welcome to EventSphere, ${response.user?.name || name}!`, "success");
      }
    } catch (error) {
      showToast("Verification Failed", error.message || "Invalid OTP verification code.", "error");
      throw error;
    }
  };

  return (
    <div id="register-page-root" className="min-h-[calc(100vh-140px)] flex flex-col justify-center py-4 sm:py-8 md:py-12 px-3 sm:px-6 font-body">

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

          <div className="lg:col-span-5 bg-gradient-to-br from-[#0F172A] via-[#1A202C] to-[#203748] text-white p-6 sm:p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden order-last lg:order-first">
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
                  Join the Global Expo Intelligence Network
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Whether hosting international convention summits, exhibiting cutting-edge hardware, or attending keynotes, your account gives you instant role privileges.
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-1">
                  <div className="flex items-center gap-2 text-[#38B2AC] font-bold text-xs">
                    <Shield className="w-4 h-4" />
                    <span>Organizers</span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-300">
                    Floor builder, booth pricing, ticket tiers & exhibitor approvals (with 2FA).
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-1">
                  <div className="flex items-center gap-2 text-[#38B2AC] font-bold text-xs">
                    <Briefcase className="w-4 h-4" />
                    <span>Exhibitors</span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-300">
                    Apply to flagships, reserve floor booths & publish digital catalog decks.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-1">
                  <div className="flex items-center gap-2 text-[#38B2AC] font-bold text-xs">
                    <Ticket className="w-4 h-4" />
                    <span>Attendees</span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-300">
                    Get turnstile QR passes, build custom agendas & direct-message vendors.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-6 border-t border-white/10 text-[11px] sm:text-xs text-slate-400 flex items-center justify-between">
              <span>Instant provisioning</span>
              <span className="font-mono text-[#38B2AC]">Zero lock-in</span>
            </div>
          </div>

          <div className="lg:col-span-7 p-5 sm:p-8 md:p-10 lg:p-12 flex flex-col justify-between space-y-6">
            <div className="space-y-5 sm:space-y-6">

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1488A6] dark:bg-[#38B2AC]" />
                  <span className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#CBD5E1]/60">
                    Registration Portal
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1F2937] dark:text-[#F8FAFC] tracking-tight font-heading">
                  Create your Account
                </h1>
                <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#CBD5E1]/80 mt-1">
                  Select your primary role to configure your personalized operations workspace.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] sm:text-xs font-bold text-[#1F2937] dark:text-[#CBD5E1] uppercase tracking-wider font-mono block">
                  Choose Workspace Role
                </label>
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2 p-1.5 bg-slate-100 dark:bg-[#0F172A] rounded-2xl border border-[#E5E7EB] dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setSelectedRole("organizer")}
                    className={`py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl text-xs sm:text-sm font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer ${selectedRole === "organizer"
                      ? "bg-white dark:bg-[#203748] text-[#1488A6] dark:text-[#38B2AC] shadow-xs border border-[#1488A6]/20 dark:border-[#38B2AC]/30"
                      : "text-[#6B7280] dark:text-[#CBD5E1]/70 hover:text-[#1F2937] dark:hover:text-white"
                      }`}
                  >
                    <Shield className="w-4 h-4 text-[#1488A6] dark:text-[#38B2AC] shrink-0" />
                    <span className="text-[11px] sm:text-xs md:text-sm">Organizer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole("exhibitor")}
                    className={`py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl text-xs sm:text-sm font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer ${selectedRole === "exhibitor"
                      ? "bg-white dark:bg-[#203748] text-[#1488A6] dark:text-[#38B2AC] shadow-xs border border-[#1488A6]/20 dark:border-[#38B2AC]/30"
                      : "text-[#6B7280] dark:text-[#CBD5E1]/70 hover:text-[#1F2937] dark:hover:text-white"
                      }`}
                  >
                    <Briefcase className="w-4 h-4 text-[#1488A6] dark:text-[#38B2AC] shrink-0" />
                    <span className="text-[11px] sm:text-xs md:text-sm">Exhibitor</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole("attendee")}
                    className={`py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl text-xs sm:text-sm font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer ${selectedRole === "attendee"
                      ? "bg-white dark:bg-[#203748] text-[#1488A6] dark:text-[#38B2AC] shadow-xs border border-[#1488A6]/20 dark:border-[#38B2AC]/30"
                      : "text-[#6B7280] dark:text-[#CBD5E1]/70 hover:text-[#1F2937] dark:hover:text-white"
                      }`}
                  >
                    <Ticket className="w-4 h-4 text-[#1488A6] dark:text-[#38B2AC] shrink-0" />
                    <span className="text-[11px] sm:text-xs md:text-sm">Attendee</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleRegister} className="space-y-3.5 sm:space-y-4">

                <div className="flex items-center gap-3.5 sm:gap-4 p-3 bg-slate-50 dark:bg-[#0F172A] rounded-2xl border border-[#E5E7EB] dark:border-white/10">
                  <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden shrink-0 bg-slate-200 dark:bg-[#203748] border-2 border-[#1488A6] dark:border-[#38B2AC] flex items-center justify-center">
                    {pfpPreview ? (
                      <img src={pfpPreview} alt="Profile Preview" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-6 h-6 sm:w-7 sm:h-7 text-[#1488A6] dark:text-[#38B2AC]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="block text-[11px] sm:text-xs font-bold text-[#1F2937] dark:text-[#CBD5E1] uppercase tracking-wider font-mono mb-1">
                      Profile Picture
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-[#203748] text-[#1488A6] dark:text-[#38B2AC] border border-[#1488A6]/30 dark:border-[#38B2AC]/30 hover:bg-[#1488A6]/10 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{pfpFile ? "Change Photo" : "Upload Photo"}</span>
                      </button>
                      {pfpFile && (
                        <button
                          type="button"
                          onClick={removePfp}
                          className="p-1.5 rounded-lg text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="Remove Photo"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <span className="text-[10px] text-[#6B7280] dark:text-[#CBD5E1]/60 block mt-0.5 truncate">
                      {pfpFile ? pfpFile.name : "Choose JPG, PNG or WEBP avatar"}
                    </span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePfpChange}
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1F2937] dark:text-[#CBD5E1] uppercase tracking-wider font-mono mb-1.5">
                      Full Name *
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#CBD5E1]/50" />
                      <input
                        id="register-name-input"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Dr. Jordan Hayes"
                        className="w-full pl-9 pr-3 py-2 sm:py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#38B2AC] focus:bg-white dark:focus:bg-[#0F172A] transition-all font-sans"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1F2937] dark:text-[#CBD5E1] uppercase tracking-wider font-mono mb-1.5">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#CBD5E1]/50" />
                      <input
                        id="register-email-input"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="jordan@innovate.org"
                        className="w-full pl-9 pr-3 py-2 sm:py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#38B2AC] focus:bg-white dark:focus:bg-[#0F172A] transition-all font-sans"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F2937] dark:text-[#CBD5E1] uppercase tracking-wider font-mono mb-1.5">
                    Mobile Phone *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#CBD5E1]/50" />
                    <input
                      id="register-phone-input"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 019-2834"
                      className="w-full pl-9 pr-3 py-2 sm:py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#38B2AC] focus:bg-white dark:focus:bg-[#0F172A] transition-all font-sans"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1F2937] dark:text-[#CBD5E1] uppercase tracking-wider font-mono mb-1.5">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#CBD5E1]/50" />
                      <input
                        id="register-password-input"
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        className="w-full pl-9 pr-9 py-2 sm:py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#38B2AC] focus:bg-white dark:focus:bg-[#0F172A] transition-all font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#CBD5E1]/60 hover:text-[#1F2937] dark:hover:text-white p-1 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1F2937] dark:text-[#CBD5E1] uppercase tracking-wider font-mono mb-1.5">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#CBD5E1]/50" />
                      <input
                        id="register-confirm-password-input"
                        type={showPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat password"
                        className="w-full pl-9 pr-3 py-2 sm:py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#38B2AC] focus:bg-white dark:focus:bg-[#0F172A] transition-all font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-1">
                  <label className="flex items-start gap-2.5 text-xs text-[#1F2937] dark:text-[#CBD5E1] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 rounded border-[#E5E7EB] dark:border-white/20 text-[#1488A6] focus:ring-[#38B2AC] w-4 h-4"
                    />
                    <span className="text-[11px] sm:text-xs">
                      I agree to the EventSphere Master Operations Terms of Service and Privacy Policy for {selectedRole} privileges.
                    </span>
                  </label>
                </div>

                <button
                  id="register-submit-btn"
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 sm:py-3.5 px-6 rounded-xl font-bold text-xs sm:text-sm md:text-base text-white btn-teal-primary shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isLoading ? (
                    <span>Authenticating...</span>
                  ) : (
                    <>
                      <span>Continue To OTP Verfication</span>
                      <ArrowRight className="w-4.5 h-4.5" />
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="pt-4 sm:pt-6 border-t border-[#E5E7EB] dark:border-white/10 text-center text-xs sm:text-sm text-[#6B7280] dark:text-[#CBD5E1]/70">
              <span>Already registered? </span>
              <button
                type="button"
                onClick={() => setActiveView("login")}
                className="font-bold text-[#1488A6] dark:text-[#38B2AC] hover:underline cursor-pointer"
              >
                Sign in to your account
              </button>
            </div>
          </div>
        </div>
      </div>

      <OTPVerificationModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        onSuccess={handleOtpSuccess}
        userId={pendingUserId}
        pendingUserId={pendingUserId}
        email={email}
        targetEmail={email}
        devOtpCode={devOtpCode}
        role={pendingUserRole}
        targetRole={pendingUserRole}
      />
    </div>
  );
};

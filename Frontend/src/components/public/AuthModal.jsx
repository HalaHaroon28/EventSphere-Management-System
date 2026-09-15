import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Shield,
  Briefcase,
  Ticket,
  ArrowRight,
  KeyRound
} from "lucide-react";

export const AuthModal = ({ isOpen, onClose, initialMode = "login" }) => {
  const { login, register, resetPassword } = useAuth();
  const { showToast } = useApp();

  const [mode, setMode] = useState(initialMode); // 'login' | 'register' | 'forgot'
  const [selectedRole, setSelectedRole] = useState("organizer"); // 'organizer' | 'exhibitor' | 'attendee'

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [resetTokenGenerated, setResetTokenGenerated] = useState(null);

  if (!isOpen) return null;

  const handleAutofill = (role) => {
    setSelectedRole(role);
    if (role === "organizer") {
      setEmail("eleanor@eventsphere.io");
      setPassword("demo123");
    } else if (role === "exhibitor") {
      setEmail("marcus@quantumdynamics.com");
      setPassword("demo123");
    } else {
      setEmail("sarah.chen@techglobal.com");
      setPassword("demo123");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const success = await login(email, password, selectedRole);
    if (success) {
      showToast("Access Granted", `Welcome back! Signed in as ${selectedRole.toUpperCase()}.`);
      onClose();
    } else {
      showToast("Sign In Failed", "Invalid credentials. Try using one of the demo buttons.", "error");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const success = await register({
      email,
      password,
      name,
      role: selectedRole,
      company_name: selectedRole === "exhibitor" ? companyName : undefined
    });

    if (success) {
      showToast("Account Initialized", `Welcome to EventSphere, ${name}!`);
      onClose();
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    const token = resetPassword(email);
    setResetTokenGenerated(token);
    showToast("Simulated Reset Link", "Password reset token generated and logged for local evaluation.");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#1A202C] rounded-2xl sm:rounded-3xl shadow-2xl border border-[#E5E7EB] dark:border-white/10 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 font-body">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-[#1488A6] to-slate-900 text-white p-5 sm:p-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#38B2AC]" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#38B2AC]">
                {mode === "login" ? "Role Authentication" : mode === "register" ? "Create Account" : "Password Recovery"}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-2 font-heading">
            {mode === "login" ? "Access EventSphere Portal" : mode === "register" ? "Join EventSphere Ecosystem" : "Reset Your Credentials"}
          </h3>
          <p className="text-xs text-[#CBD5E1]/80 mt-1">
            {mode === "login" ? "Select your role or click any demo preset below for instant login." : mode === "register" ? "One unified registration flow with role-specific panel assignment." : "Simulated password recovery link generator."}
          </p>

          {/* Quick 1-Click Persona Pre-fill Bar */}
          {mode === "login" && (
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <span className="text-[10px] text-[#CBD5E1]/70 font-medium shrink-0">Demo Profiles:</span>
              <button
                type="button"
                onClick={() => handleAutofill("organizer")}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition-all shrink-0 cursor-pointer ${
                  selectedRole === "organizer"
                    ? "bg-[#1488A6] text-white border-[#38B2AC]"
                    : "bg-[#0F172A] text-[#CBD5E1] border-white/10 hover:bg-slate-800"
                }`}
              >
                Organizer
              </button>
              <button
                type="button"
                onClick={() => handleAutofill("exhibitor")}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition-all shrink-0 cursor-pointer ${
                  selectedRole === "exhibitor"
                    ? "bg-emerald-600 text-white border-emerald-500"
                    : "bg-[#0F172A] text-[#CBD5E1] border-white/10 hover:bg-slate-800"
                }`}
              >
                Exhibitor
              </button>
              <button
                type="button"
                onClick={() => handleAutofill("attendee")}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition-all shrink-0 cursor-pointer ${
                  selectedRole === "attendee"
                    ? "bg-[#38B2AC] text-white border-[#38B2AC]"
                    : "bg-[#0F172A] text-[#CBD5E1] border-white/10 hover:bg-slate-800"
                }`}
              >
                Attendee
              </button>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 sm:space-y-5">
          {/* Role Selector Tabs (Organizer / Exhibitor / Attendee) */}
          {mode !== "forgot" && (
            <div>
              <label className="block text-xs font-bold uppercase font-mono tracking-wider text-[#6B7280] dark:text-[#CBD5E1]/70 mb-2">
                Target Role / Panel
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRole("organizer")}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    selectedRole === "organizer"
                      ? "border-[#1488A6] dark:border-[#38B2AC] bg-teal-50/80 dark:bg-[#203748] text-[#1488A6] dark:text-[#38B2AC] font-bold shadow-xs"
                      : "border-[#E5E7EB] dark:border-white/10 hover:border-slate-300 text-[#6B7280] dark:text-[#CBD5E1] hover:text-[#1F2937] dark:hover:text-white"
                  }`}
                >
                  <Shield className={`w-4 h-4 mx-auto mb-1 ${selectedRole === "organizer" ? "text-[#1488A6] dark:text-[#38B2AC]" : "text-[#6B7280]"}`} />
                  <span className="text-xs block font-heading">Organizer</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole("exhibitor")}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    selectedRole === "exhibitor"
                      ? "border-emerald-600 dark:border-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/80 text-emerald-950 dark:text-emerald-200 font-bold shadow-xs"
                      : "border-[#E5E7EB] dark:border-white/10 hover:border-slate-300 text-[#6B7280] dark:text-[#CBD5E1] hover:text-[#1F2937] dark:hover:text-white"
                  }`}
                >
                  <Briefcase className={`w-4 h-4 mx-auto mb-1 ${selectedRole === "exhibitor" ? "text-emerald-600 dark:text-emerald-400" : "text-[#6B7280]"}`} />
                  <span className="text-xs block font-heading">Exhibitor</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole("attendee")}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    selectedRole === "attendee"
                      ? "border-[#1488A6] dark:border-[#38B2AC] bg-teal-50/80 dark:bg-[#203748] text-[#1488A6] dark:text-[#38B2AC] font-bold shadow-xs"
                      : "border-[#E5E7EB] dark:border-white/10 hover:border-slate-300 text-[#6B7280] dark:text-[#CBD5E1] hover:text-[#1F2937] dark:hover:text-white"
                  }`}
                >
                  <Ticket className={`w-4 h-4 mx-auto mb-1 ${selectedRole === "attendee" ? "text-[#1488A6] dark:text-[#38B2AC]" : "text-[#6B7280]"}`} />
                  <span className="text-xs block font-heading">Attendee</span>
                </button>
              </div>
            </div>
          )}

          {/* Login Form */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#1F2937] dark:text-[#CBD5E1] mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#CBD5E1]/60" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. eleanor@eventsphere.io"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] placeholder:text-[#6B7280] dark:placeholder:text-[#CBD5E1]/50 focus:outline-none focus:ring-2 focus:ring-[#38B2AC] transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#1F2937] dark:text-[#CBD5E1]">Password</label>
                  <button
                    type="button"
                    onClick={() => setMode("forgot")}
                    className="text-[11px] text-[#1488A6] dark:text-[#38B2AC] hover:underline font-medium cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#CBD5E1]/60" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] placeholder:text-[#6B7280] dark:placeholder:text-[#CBD5E1]/50 focus:outline-none focus:ring-2 focus:ring-[#38B2AC] transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                id="submit-login-btn"
                className="w-full py-2.5 px-4 btn-teal-primary text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                Sign In to {selectedRole.toUpperCase()} Panel <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {/* Register Form */}
          {mode === "register" && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#1F2937] dark:text-[#CBD5E1] mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#CBD5E1]/60" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Full Name"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] placeholder:text-[#6B7280] dark:placeholder:text-[#CBD5E1]/50 focus:outline-none focus:ring-2 focus:ring-[#38B2AC]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F2937] dark:text-[#CBD5E1] mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#CBD5E1]/60" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] placeholder:text-[#6B7280] dark:placeholder:text-[#CBD5E1]/50 focus:outline-none focus:ring-2 focus:ring-[#38B2AC]"
                  />
                </div>
              </div>

              {selectedRole === "exhibitor" && (
                <div>
                  <label className="block text-xs font-semibold text-[#1F2937] dark:text-[#CBD5E1] mb-1">Company / Organization</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Company Name (for booth branding)"
                    className="w-full px-3 py-2 text-xs bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] placeholder:text-[#6B7280] dark:placeholder:text-[#CBD5E1]/50 focus:outline-none focus:ring-2 focus:ring-[#38B2AC]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#1F2937] dark:text-[#CBD5E1] mb-1">Create Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#CBD5E1]/60" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] placeholder:text-[#6B7280] dark:placeholder:text-[#CBD5E1]/50 focus:outline-none focus:ring-2 focus:ring-[#38B2AC]"
                  />
                </div>
              </div>

              <div className="text-[11px] text-[#6B7280] dark:text-[#CBD5E1]/70 leading-relaxed">
                By registering, your account is activated immediately with role permissions.
              </div>

              <button
                type="submit"
                id="submit-register-btn"
                className="w-full py-2.5 px-4 btn-teal-primary text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                Create Account & Enter Portal <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {/* Simulated Forgot Password */}
          {mode === "forgot" && (
            <form onSubmit={handleForgotPassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#1F2937] dark:text-[#CBD5E1] mb-1">Registered Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-3 py-2 text-xs bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] placeholder:text-[#6B7280] dark:placeholder:text-[#CBD5E1]/50 focus:outline-none focus:ring-2 focus:ring-[#38B2AC]"
                />
              </div>

              {resetTokenGenerated && (
                <div className="p-3 bg-teal-50 dark:bg-[#203748] border border-[#1488A6]/20 dark:border-[#38B2AC]/30 rounded-xl space-y-1 text-xs">
                  <div className="font-bold text-[#1488A6] dark:text-[#38B2AC] flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-[#1488A6] dark:text-[#38B2AC]" /> Simulated Password Reset Token
                  </div>
                  <p className="text-[11px] font-mono text-[#1488A6] dark:text-[#38B2AC] break-all bg-white dark:bg-[#0F172A] p-2 rounded border border-[#1488A6]/20 dark:border-[#38B2AC]/20">
                    /api/auth/reset-password/{resetTokenGenerated}
                  </p>
                  <span className="text-[10px] text-[#6B7280] dark:text-[#CBD5E1]/70 block mt-1">
                    Valid for 15 minutes. Password reset simulation ready.
                  </span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 btn-teal-primary text-xs font-semibold rounded-xl cursor-pointer transition-colors"
              >
                Generate Simulated Reset Token
              </button>
            </form>
          )}

          {/* Footer toggle */}
          <div className="pt-3 border-t border-[#E5E7EB] dark:border-white/10 text-center text-xs text-[#6B7280] dark:text-[#CBD5E1]">
            {mode === "login" ? (
              <span>
                Don't have an account yet?{" "}
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className="font-bold text-[#1488A6] dark:text-[#38B2AC] hover:underline cursor-pointer"
                >
                  Register now
                </button>
              </span>
            ) : (
              <span>
                Already registered?{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="font-bold text-[#1488A6] dark:text-[#38B2AC] hover:underline cursor-pointer"
                >
                  Sign in
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;

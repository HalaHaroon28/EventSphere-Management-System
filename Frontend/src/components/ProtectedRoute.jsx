import { useAuth } from "../context/AuthContext";
import { ShieldAlert, ArrowRight, Sparkles } from "lucide-react";
const ProtectedRoute = ({
  children,
  allowedRoles,
  onNavigateToLogin,
  onSwitchRole
}) => {
  const { user, isAuthenticated, role } = useAuth();
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6 font-body">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-[#1A202C] border border-[#E5E7EB] dark:border-white/10 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-[#1488A6]/15 dark:bg-[#38B2AC]/20 border border-[#1488A6]/30 dark:border-[#38B2AC]/40 text-[#1488A6] dark:text-[#38B2AC] flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold font-heading text-[#1F2937] dark:text-[#F8FAFC]">Authentication Required</h3>
          <p className="text-sm text-[#6B7280] dark:text-[#CBD5E1] leading-relaxed">
            You must be signed in with valid credentials to access this secure portal workspace.
          </p>
          <button
            onClick={onNavigateToLogin}
            className="w-full py-3 btn-teal-primary text-white rounded-xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Proceed to Login</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }
  if (allowedRoles && !allowedRoles.includes(role)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6 font-body">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-[#1A202C] border border-[#E5E7EB] dark:border-white/10 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-500 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold font-heading text-[#1F2937] dark:text-[#F8FAFC]">Role Access Restricted</h3>
          <p className="text-sm text-[#6B7280] dark:text-[#CBD5E1] leading-relaxed">
            Your current active role (<span className="text-[#1488A6] dark:text-[#38B2AC] font-bold uppercase">{role}</span>) does not have authorization to view this panel.
          </p>
          <div className="pt-2 space-y-2">
            <p className="text-xs text-[#6B7280] dark:text-[#CBD5E1]/70 font-mono font-bold">Quick Switch Role Workspace:</p>
            <div className="flex justify-center gap-2">
              {allowedRoles.map((targetRole) => (
                <button
                  key={targetRole}
                  onClick={() => onSwitchRole && onSwitchRole(targetRole)}
                  className="px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-[#203748] dark:hover:bg-[#203748]/80 border border-[#1488A6]/30 dark:border-[#38B2AC]/40 text-[#1488A6] dark:text-[#38B2AC] hover:text-[#116982] dark:hover:text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Switch to {targetRole}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  return <>{children}</>;
};
export {
  ProtectedRoute
};

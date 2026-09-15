import { ProfileView } from "./ProfileView";
import { X, User, ShieldCheck } from "lucide-react";
import { useApp } from "../../context/AppContext";

export const ProfileModal = ({ isOpen, onClose }) => {
  const { currentUser } = useApp();

  if (!isOpen) return null;

  const roleLabel = currentUser?.role ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1) : "Account";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200 font-body">
      <div className="bg-white dark:bg-[#1A202C] rounded-3xl shadow-2xl border border-[#E5E7EB] dark:border-white/10 max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden text-[#1F2937] dark:text-[#F8FAFC]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-[#1488A6] to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between shrink-0 relative">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-[#38B2AC] flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-[#38B2AC]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#38B2AC]">
                  Account Settings
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white font-heading">
                My Profile & Credentials
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Manage your verified account identity, contact information, and security password.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          <ProfileView isModal={true} onClose={onClose} />
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;

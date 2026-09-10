import { ProfileView } from "./ProfileView";
import { X, User } from "lucide-react";

export const ProfileModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200 font-body">
      <div className="bg-white dark:bg-[#1A202C] rounded-3xl shadow-2xl border border-[#E5E7EB] dark:border-white/10 max-w-3xl w-full flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-[#1488A6] to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
              <User className="w-5 h-5 text-[#38B2AC]" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#38B2AC] block">
                Account Settings
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white font-heading">
                My Profile & Credentials
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <ProfileView />
        </div>
      </div>
    </div>
  );
};

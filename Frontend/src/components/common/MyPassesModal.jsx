import { useApp } from "../../context/AppContext";
import { generatePassImage } from "../../utils/generatePassImage";
import {
  X,
  Ticket,
  Calendar,
  MapPin,
  Download,
  ExternalLink,
  QrCode,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Plus
} from "lucide-react";

export const MyPassesModal = ({ isOpen, onClose, onSelectExpo, onOpenGetPass }) => {
  const { registrations = [], expos = [], currentUser, setActivePassId, showToast, setActiveView } = useApp();

  if (!isOpen) return null;

  const currentUserId = String(currentUser?._id || currentUser?.user_id || "");
  const userRegistrations = (registrations || []).filter((r) => {
    const regUserId = String(typeof r.user_id === "object" ? r.user_id?._id : r.user_id || "");
    const regEmail = (r.user_email || r.email || "").toLowerCase();
    const userEmail = (currentUser?.email || "").toLowerCase();
    return (regUserId && regUserId === currentUserId) || (userEmail && regEmail === userEmail);
  });

  const handleViewPass = (reg) => {
    setActivePassId(reg._id || reg.id);
  };

  const handleDownload = (reg, expo) => {
    generatePassImage(reg, expo);
    showToast("Badge Saved", "Your official Turnstile QR badge PNG has been generated.", "success");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200 font-body">
      <div className="bg-white dark:bg-[#1A202C] rounded-3xl shadow-2xl border border-[#E5E7EB] dark:border-white/10 max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-[#1488A6] to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
              <Ticket className="w-5 h-5 text-[#38B2AC]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#38B2AC]">
                  Attendee Wallet
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#38B2AC]/20 text-[#38B2AC] border border-[#38B2AC]/30">
                  {userRegistrations.length} Active {userRegistrations.length === 1 ? "Pass" : "Passes"}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white font-heading">
                My Verified Access Passes
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

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {userRegistrations.length === 0 ? (
            <div className="py-12 px-4 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-[#203748] flex items-center justify-center mx-auto text-[#1488A6] dark:text-[#38B2AC]">
                <Ticket className="w-8 h-8 opacity-60" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-[#1F2937] dark:text-[#F8FAFC]">
                  No Access Passes Yet
                </h4>
                <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#CBD5E1]/70 max-w-md mx-auto">
                  Browse our upcoming summits and claim your free digital QR turnstile pass with instant check-in verification.
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  setActiveView("expos");
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 btn-teal-primary text-white text-xs sm:text-sm font-bold rounded-xl shadow-md cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" /> Browse Global Expos
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {userRegistrations.map((reg) => {
                const regExpoId = typeof reg.expo_id === "object" ? reg.expo_id?._id : reg.expo_id;
                const expo = expos.find((e) => e._id === regExpoId || e.id === regExpoId);
                const ticketNo = reg.ticket_number || reg._id?.slice(-8).toUpperCase() || "EVT-PASS";
                const passTier = reg.pass_tier || "Standard Attendee Pass";

                return (
                  <div
                    key={reg._id || reg.id}
                    className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-[#0F172A]/70 border border-[#E5E7EB] dark:border-white/10 hover:border-[#1488A6]/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                  >
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#1488A6]/10 dark:bg-[#38B2AC]/20 text-[#1488A6] dark:text-[#38B2AC] border border-[#1488A6]/30 dark:border-[#38B2AC]/40">
                          {passTier}
                        </span>
                        <span className="text-[10px] font-mono font-semibold text-[#6B7280] dark:text-[#CBD5E1]/60">
                          ID: {ticketNo}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          <ShieldCheck className="w-3 h-3" /> Validated Pass
                        </span>
                      </div>

                      <h4 className="text-sm sm:text-base font-bold text-[#1F2937] dark:text-[#F8FAFC] line-clamp-1 font-heading">
                        {reg.expo_title || expo?.title || "Global Summit 2026"}
                      </h4>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#6B7280] dark:text-[#CBD5E1]/70">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#1488A6] dark:text-[#38B2AC]" />
                          <span>
                            {expo?.date ? new Date(expo.date).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }) : "Scheduled"}
                          </span>
                        </div>
                        {expo?.location && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#1488A6] dark:text-[#38B2AC]" />
                            <span className="truncate max-w-[200px]">{expo.location}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-white/10">
                      <button
                        onClick={() => handleViewPass(reg)}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl btn-teal-primary text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                        title="Display Turnstile QR Code"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>View QR Badge</span>
                      </button>
                      <button
                        onClick={() => handleDownload(reg, expo)}
                        className="p-2 rounded-xl bg-white dark:bg-[#1A202C] hover:bg-slate-100 dark:hover:bg-[#203748] text-[#6B7280] dark:text-[#CBD5E1] border border-[#E5E7EB] dark:border-white/10 transition-colors cursor-pointer"
                        title="Download Pass Image (PNG)"
                        aria-label="Download pass image"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-[#0F172A]/50 border-t border-[#E5E7EB] dark:border-white/10 flex items-center justify-between text-xs text-[#6B7280] dark:text-[#CBD5E1]/60">
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-[#38B2AC]" />
            <span>Turnstile QR check-in ready on any smartphone</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-[#203748] text-[#1F2937] dark:text-white font-bold cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

import { useApp } from "../../context/AppContext";
import { generatePassImage } from "../../utils/generatePassImage";
import {
  X,
  QrCode,
  Download,
  Printer,
  Calendar,
  MapPin,
  ShieldCheck,
  Sparkles
} from "lucide-react";

export const DigitalPassModal = ({ registrationId, onClose }) => {
  const { registrations, expos, showToast } = useApp();
  const registration = registrations.find((r) => r._id === registrationId) || registrations[0];
  const expo = expos.find((e) => e._id === registration?.expo_id);

  if (!registration) return null;

  const ticketNo = registration.ticket_number || registration._id?.slice(-8).toUpperCase() || "PASS-9901";
  const expoTitle = registration.expo_title || expo?.title || "EventSphere Conference 2026";
  const passTier = (registration.pass_tier || "PARTICIPANT").toUpperCase();

  const handleDownloadImage = () => {
    generatePassImage(registration, expo);
    showToast("Badge Image Downloaded", "High-resolution pass image (PNG) saved to your device.", "success");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
      <div className="max-w-md w-full flex flex-col space-y-4">
        
        {/* Top Actions */}
        <div className="flex items-center justify-between px-1 text-white">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#38B2AC] animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#38B2AC]">
              Official Conference Badge
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* VERTICAL CONFERENCE LANYARD BADGE (MATCHING REFERENCE DESIGN) */}
        <div className="relative bg-gradient-to-b from-[#0F0C20] via-[#1D1035] to-[#070E1B] rounded-3xl border border-white/20 shadow-2xl overflow-hidden text-white flex flex-col">
          
          {/* Lanyard Top Acrylic Slot Bar */}
          <div className="bg-white/5 border-b border-white/10 h-10 flex items-center justify-center relative">
            <div className="w-24 h-4 rounded-full bg-[#090614] border border-white/20 flex items-center justify-center">
              <div className="w-16 h-1.5 rounded-full bg-slate-800" />
            </div>
          </div>

          {/* Badge Main Body */}
          <div className="p-6 sm:p-7 text-center space-y-5 relative flex-1">
            
            {/* Top Brand Logo */}
            <div className="flex flex-col items-center space-y-1">
              <div className="grid grid-cols-3 gap-1">
                {[...Array(9)].map((_, i) => (
                  <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#38B2AC]" />
                ))}
              </div>
              <span className="text-xs font-extrabold tracking-widest text-white font-heading mt-1">
                EVENTSPHERE
              </span>
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">
                GLOBAL EVENTS OS
              </span>
            </div>

            {/* Event Category & Title */}
            <div className="space-y-1.5 pt-2">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                {expo?.category || "PRECISION MEDICINE"}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight font-heading leading-tight">
                {expoTitle}
              </h2>
            </div>

            {/* Date Pill Badge */}
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 border border-[#00D2FF]/40 text-[#00D2FF] text-xs font-mono font-bold">
              <Calendar className="w-3.5 h-3.5" />
              {expo?.date ? new Date(expo.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "20 Sep - 22 Sep 2026"}
            </div>

            {/* Passholder Name Section */}
            <div className="pt-2 space-y-1">
              <span className="text-xs font-medium text-slate-400 block">Passholder</span>
              <h3 className="text-2xl font-black text-white font-heading tracking-tight">
                {registration.user_name || "Valued Attendee"}
              </h3>
              <p className="text-xs font-mono text-slate-300">{registration.user_email}</p>
            </div>

            {/* High Contrast Vector QR Code */}
            <div className="flex flex-col items-center pt-2">
              <div className="p-3 bg-white rounded-2xl border-2 border-[#38B2AC]/40 shadow-xl flex flex-col items-center">
                <QrCode className="w-28 h-28 text-slate-900" />
                <span className="text-xs font-mono font-bold text-slate-900 tracking-wider mt-1.5">
                  #{ticketNo}
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 uppercase mt-2 tracking-wider">
                {expo?.venue || "Turnstile Entrance Gate 1"}
              </span>
            </div>
          </div>

          {/* SOLID WHITE BOTTOM PARTICIPANT BANNER (EXACT TO REFERENCE) */}
          <div className="bg-white py-4 px-6 text-center text-slate-950 font-black text-xl tracking-[0.2em] font-heading uppercase border-t border-white/20">
            {passTier}
          </div>
        </div>

        {/* BOTTOM DOWNLOAD PNG BUTTON */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <button
            onClick={handleDownloadImage}
            className="flex-1 py-3 px-5 rounded-2xl btn-teal-primary text-white text-xs sm:text-sm font-bold shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-white" /> Download Badge Image (PNG)
          </button>

          <button
            onClick={handlePrint}
            className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold border border-white/20 transition-all cursor-pointer flex items-center gap-2"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default DigitalPassModal;

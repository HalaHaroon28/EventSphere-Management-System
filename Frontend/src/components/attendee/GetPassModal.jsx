import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { generatePassImage } from "../../utils/generatePassImage";
import {
  X,
  Ticket,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  CheckCircle,
  Download,
  Sparkles,
  ShieldCheck
} from "lucide-react";

export const GetPassModal = ({ expo, onClose, onSuccess }) => {
  const { currentUser, registerForExpo, showToast } = useApp();

  const [name, setName] = useState(currentUser?.name || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [phone, setPhone] = useState(currentUser?.phone || "+92 300 1234567");
  const [passTier, setPassTier] = useState("Standard Attendee Pass");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!expo) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      showToast("Validation Error", "Please provide your name and email address.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      // Register for expo and get registration details
      const registrationData = {
        name,
        email,
        phone,
        pass_tier: passTier
      };

      const newRegistration = await registerForExpo(expo._id, passTier, registrationData);

      // Construct complete registration object
      const passInfo = {
        ...newRegistration,
        user_name: name,
        user_email: email,
        user_phone: phone,
        pass_tier: passTier,
        expo_title: expo.title,
        ticket_number: newRegistration?.ticket_number || `EVT-${Math.floor(100000 + Math.random() * 900000)}`
      };

      // Generate PNG image & trigger download
      generatePassImage(passInfo, expo);

      if (onSuccess) onSuccess(passInfo);
      onClose();
    } catch (err) {
      console.error("Pass generation error:", err);
      showToast("Error", "Could not generate pass. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1A202C] rounded-3xl shadow-2xl border border-[#E5E7EB] dark:border-white/10 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-[#1488A6] to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between shrink-0 relative">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-[#38B2AC] flex items-center justify-center shrink-0">
              <Ticket className="w-5 h-5 text-[#38B2AC]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#38B2AC]">
                  Digital Ticket Access
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#38B2AC]/20 text-[#38B2AC] border border-[#38B2AC]/30 font-mono">
                  100% Free Pass
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white font-heading">
                {expo.title}
              </h3>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-0.5 font-body">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#38B2AC]" />
                  {new Date(expo.date).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#38B2AC]" />
                  {expo.venue || expo.location}
                </span>
              </div>
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

        {/* Prefilled Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 font-body">
          <div className="bg-slate-50 dark:bg-[#0F172A] p-4 rounded-2xl border border-[#E5E7EB] dark:border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-mono font-bold text-[#6B7280] dark:text-[#CBD5E1]/60 block">Exhibition Access</span>
              <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                100% Free Entry
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="w-4 h-4" />
              Instant Verification
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <h4 className="text-xs font-mono font-bold text-[#6B7280] dark:text-[#CBD5E1]/70 uppercase tracking-wider">
              Passholder Information
            </h4>

            {/* Name Field */}
            <div>
              <label className="block text-xs font-semibold text-[#1F2937] dark:text-[#CBD5E1] mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#CBD5E1]/60" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter attendee full name"
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC]"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-[#1F2937] dark:text-[#CBD5E1] mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#CBD5E1]/60" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC]"
                />
              </div>
            </div>

            {/* Phone Number Field */}
            <div>
              <label className="block text-xs font-semibold text-[#1F2937] dark:text-[#CBD5E1] mb-1">
                Contact Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#CBD5E1]/60" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC]"
                />
              </div>
            </div>

            {/* Pass Tier Selector */}
            <div>
              <label className="block text-xs font-semibold text-[#1F2937] dark:text-[#CBD5E1] mb-1">
                Select Pass Category
              </label>
              <select
                value={passTier}
                onChange={(e) => setPassTier(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC]"
              >
                <option value="Standard Attendee Pass">Standard Attendee Pass (Expo Floor & Booth Access)</option>
                <option value="VIP Access Pass">VIP Access Pass (Priority Entry & Keynote Lounges)</option>
                <option value="Summit All-Access Pass">Summit All-Access Pass (Full Workshops & Networking)</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#E5E7EB] dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#E5E7EB] dark:border-white/10 text-xs font-bold text-[#6B7280] dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#203748] transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl btn-teal-primary text-white text-xs sm:text-sm font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>Generating Pass...</>
              ) : (
                <>
                  <Download className="w-4 h-4 text-white" />
                  Generate Pass
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GetPassModal;

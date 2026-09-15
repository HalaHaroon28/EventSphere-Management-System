import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import {
  X,
  Send,
  Building2,
  Mail,
  User,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export const ContactBoothModal = ({
  isOpen,
  onClose,
  exhibitor,
  expoTitle
}) => {
  const { currentUser, sendMessageApi, sendMessage, showToast } = useApp();

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [senderName, setSenderName] = useState(currentUser?.name || "");
  const [senderEmail, setSenderEmail] = useState(currentUser?.email || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setSubject(`Inquiry regarding ${exhibitor?.company_name || exhibitor?.name || "Booth Showcase"}`);
      setMessage("");
      setSenderName(currentUser?.name || "");
      setSenderEmail(currentUser?.email || "");
    }
  }, [isOpen, exhibitor, currentUser]);

  if (!isOpen || !exhibitor) return null;

  const exhibitorId = exhibitor._id || exhibitor.id || exhibitor.exhibitor_id;
  const companyName = exhibitor.company_name || exhibitor.name || "Exhibitor Team";
  const boothNumber = exhibitor.booth_number ? `Booth ${exhibitor.booth_number}` : "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      showToast("Missing Content", "Please enter your message or question.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const fullMessageText = subject.trim()
        ? `[${subject.trim()}]\n\n${message.trim()}`
        : message.trim();

      if (sendMessageApi) {
        await sendMessageApi(exhibitorId, fullMessageText);
      } else if (sendMessage) {
        sendMessage(exhibitorId, fullMessageText);
      }

      setIsSuccess(true);
      showToast("Inquiry Sent!", `Your message was delivered to ${companyName}.`, "success");
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
      }, 1800);
    } catch (err) {
      console.error("Failed to send inquiry:", err);
      showToast("Delivery Error", "Failed to deliver inquiry. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200 font-body">
      <div className="bg-white dark:bg-[#1A202C] rounded-3xl shadow-2xl border border-[#E5E7EB] dark:border-white/10 max-w-lg w-full flex flex-col overflow-hidden">

        <div className="bg-gradient-to-r from-slate-900 via-[#1488A6] to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
              <Building2 className="w-5 h-5 text-[#38B2AC]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#38B2AC]">
                  Direct Vendor Inquiry
                </span>
                {boothNumber && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#38B2AC]/20 text-[#38B2AC] border border-[#38B2AC]/30">
                    {boothNumber}
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-bold tracking-tight text-white font-heading">
                Contact {companyName}
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

        {isSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-bold text-[#1F2937] dark:text-[#F8FAFC]">
                Message Delivered!
              </h4>
              <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#CBD5E1]/80">
                The booth team at <span className="font-semibold text-[#1488A6] dark:text-[#38B2AC]">{companyName}</span> has received your inquiry. Check "My Inquiries" in the top navigation for replies.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
            {expoTitle && (
              <div className="text-[11px] font-mono text-[#6B7280] dark:text-[#CBD5E1]/60 bg-slate-50 dark:bg-[#0F172A] px-3 py-1.5 rounded-xl border border-[#E5E7EB] dark:border-white/5">
                Summit: <span className="text-[#1F2937] dark:text-[#F8FAFC] font-bold">{expoTitle}</span>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider font-mono text-[#1F2937] dark:text-[#CBD5E1] mb-1">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Product pricing, partnership, demo request..."
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-white placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#38B2AC]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider font-mono text-[#1F2937] dark:text-[#CBD5E1] mb-1">
                Message & Questions <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your inquiry or question for the exhibitor team..."
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-white placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#38B2AC]"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E5E7EB] dark:border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold rounded-xl text-[#6B7280] dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#203748] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs sm:text-sm font-bold btn-teal-primary text-white rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Sending...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Inquiry</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

import { useApp } from "../../context/AppContext";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

const ToastContainer = () => {
  const { toasts, removeToast } = useApp();
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3 sm:px-0">
      {toasts.map((toast) => {
        let Icon = CheckCircle2;
        let borderClass = "border-emerald-200 dark:border-emerald-800 bg-white/95 dark:bg-[#1A202C]/95 text-[#1F2937] dark:text-[#F8FAFC] shadow-xl";
        let iconClass = "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80";

        if (toast.type === "error") {
          Icon = AlertCircle;
          borderClass = "border-rose-200 dark:border-rose-800 bg-white/95 dark:bg-[#1A202C]/95 text-[#1F2937] dark:text-[#F8FAFC] shadow-xl";
          iconClass = "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/80";
        } else if (toast.type === "warning") {
          Icon = AlertTriangle;
          borderClass = "border-amber-200 dark:border-amber-800 bg-white/95 dark:bg-[#1A202C]/95 text-[#1F2937] dark:text-[#F8FAFC] shadow-xl";
          iconClass = "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/80";
        } else if (toast.type === "info") {
          Icon = Info;
          borderClass = "border-[#1488A6]/30 dark:border-[#38B2AC]/30 bg-white/95 dark:bg-[#1A202C]/95 text-[#1F2937] dark:text-[#F8FAFC] shadow-xl";
          iconClass = "text-[#1488A6] dark:text-[#38B2AC] bg-[#1488A6]/10 dark:bg-[#38B2AC]/20";
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl border backdrop-blur-md transition-all transform animate-in slide-in-from-bottom-3 duration-200 ${borderClass}`}
          >
            <div className={`p-1.5 rounded-xl shrink-0 ${iconClass}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="text-xs font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading">
                {typeof toast.title === "object" && toast.title !== null
                  ? toast.title.title || JSON.stringify(toast.title)
                  : String(toast.title || "")}
              </h5>
              <p className="text-xs text-[#6B7280] dark:text-[#CBD5E1]/80 mt-0.5 leading-relaxed">
                {typeof toast.message === "object" && toast.message !== null
                  ? toast.message.message || toast.message.text || JSON.stringify(toast.message)
                  : String(toast.message || "")}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#6B7280] hover:text-[#1F2937] dark:text-[#CBD5E1]/60 dark:hover:text-white p-1 rounded-md shrink-0 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export { ToastContainer };

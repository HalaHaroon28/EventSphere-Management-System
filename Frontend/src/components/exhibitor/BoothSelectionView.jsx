import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { FloorPlanView } from "../common/FloorPlanView";
import { Info, Check, AlertTriangle, ShieldCheck, Lock } from "lucide-react";
import { ApplyExpoModal } from "./ApplyExpoModal";

const BoothSelectionView = ({ initialExpoId, onBookingSuccess }) => {
  const {
    expos,
    booths,
    currentUser,
    applications,
    selectBoothForApplication,
    fetchBoothsForExpo,
    fetchApplications,
    showToast
  } = useApp();

  const [selectedExpoId, setSelectedExpoId] = useState(
    initialExpoId || expos[0]?._id || ""
  );
  const [selectedBooth, setSelectedBooth] = useState(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // Sync selectedExpoId if expos load after mount
  useEffect(() => {
    if (expos.length > 0 && (!selectedExpoId || !expos.some(e => e._id === selectedExpoId || String(e._id) === String(selectedExpoId)))) {
      setSelectedExpoId(expos[0]._id);
    }
  }, [expos, selectedExpoId]);

  // Fetch booths dynamically whenever selected expo changes
  useEffect(() => {
    if (selectedExpoId) {
      fetchBoothsForExpo(selectedExpoId);
      fetchApplications();
    }
  }, [selectedExpoId]);

  const currentExpo = expos.find((e) => e._id === selectedExpoId || String(e._id) === String(selectedExpoId)) || expos[0];
  const expoBooths = booths.filter(
    (b) =>
      b.expo_id === selectedExpoId ||
      b.expo_id?._id === selectedExpoId ||
      String(b.expo_id) === String(selectedExpoId) ||
      String(b.expo_id?._id) === String(selectedExpoId)
  );

  // Find user's application for the currently selected expo
  const myAppForExpo = applications.find(
    (a) =>
      (a.expo_id === selectedExpoId || a.expo_id?._id === selectedExpoId || String(a.expo_id) === String(selectedExpoId) || String(a.expo_id?._id) === String(selectedExpoId)) &&
      (a.exhibitor_id === currentUser?._id || a.exhibitor_id?._id === currentUser?._id || String(a.exhibitor_id) === String(currentUser?._id) || String(a.user_id) === String(currentUser?._id))
  );

  const isApproved = myAppForExpo?.status === "approved";
  const isPending = myAppForExpo?.status === "pending";
  const isRejected = myAppForExpo?.status === "rejected";

  // Check if user already applied/selected a booth for this expo
  const hasBoothSelection = Boolean(
    myAppForExpo?.booth_id ||
    myAppForExpo?.booth_status === "selected" ||
    myAppForExpo?.booth_status === "confirmed"
  );

  const myBookedBooth = booths.find(
    (b) =>
      (b.expo_id === selectedExpoId || b.expo_id?._id === selectedExpoId) &&
      ((currentUser?._id && (b.exhibitor_id === currentUser._id || b.exhibitor_id?._id === currentUser._id)) ||
        b._id === (myAppForExpo?.booth_id?._id || myAppForExpo?.booth_id))
  );

  const assignedBoothNumber =
    myBookedBooth?.booth_number ||
    myAppForExpo?.booth_number ||
    (typeof myAppForExpo?.booth_id === "object" ? myAppForExpo?.booth_id?.booth_number : null);

  const handleSelectBoothFromCanvas = (booth) => {
    if (!isApproved) {
      showToast(
        "Approval Required",
        "Only exhibitors with an APPROVED application can select a floor booth space.",
        "error"
      );
      return;
    }
    if (hasBoothSelection) {
      showToast(
        "1 Booth Limit Reached",
        `You have already selected Booth #${assignedBoothNumber || "assigned"} for this expo. Exhibitors can only select 1 booth per expo.`,
        "info"
      );
    }
    setSelectedBooth(booth);
  };

  const handleConfirmReservation = async () => {
    if (!selectedBooth) return;
    if (!isApproved) {
      showToast(
        "Approval Required",
        "You can only select and reserve a booth after your application has been APPROVED by the event organizer.",
        "error"
      );
      return;
    }
    if (hasBoothSelection) {
      showToast(
        "Limit Reached",
        `You already selected Booth #${assignedBoothNumber} for this expo. You cannot select more than 1 booth per expo.`,
        "error"
      );
      return;
    }

    try {
      const res = await selectBoothForApplication(myAppForExpo._id, selectedBooth._id);
      if (res) {
        setSelectedBooth(null);
        if (onBookingSuccess) onBookingSuccess();
      }
    } catch (e) {
      console.error("Booth reservation error:", e);
    }
  };

  return (
    <div id="booth-selection-view" className="space-y-6 font-body">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#1F2937] dark:text-[#F8FAFC] font-heading tracking-tight">
            Choose a Booth Space
          </h2>
          <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#CBD5E1] mt-1">
            Pick your company&apos;s spot on the interactive expo floor plan.
          </p>
        </div>

        {/* Expo Selector */}
        <select
          value={selectedExpoId}
          onChange={(e) => {
            setSelectedExpoId(e.target.value);
            setSelectedBooth(null);
          }}
          className="text-xs bg-white dark:bg-[#1A202C] border border-[#E5E7EB] dark:border-white/10 rounded-xl px-3.5 py-2.5 font-bold text-[#1F2937] dark:text-[#F8FAFC] shadow-xs focus:outline-none focus:ring-2 focus:ring-[#38B2AC]"
        >
          {expos.map((e) => (
            <option key={e._id} value={e._id}>
              {e.title} ({e.city || e.location || "Online"})
            </option>
          ))}
        </select>
      </div>

      {/* Info / Dynamic Status Banner */}
      <div className="bg-[#F8FAFC] dark:bg-[#1A202C] p-4 rounded-2xl border border-[#E5E7EB] dark:border-white/10 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <Info className="w-4 h-4 text-[#1488A6] dark:text-[#38B2AC] shrink-0" />
          <span className="text-[#1F2937] dark:text-[#CBD5E1]">
            {myAppForExpo?.booth_status === "confirmed" ? (
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                Confirmed Booth #{assignedBoothNumber} locked for this expo. (1 booth limit reached)
              </span>
            ) : myAppForExpo?.booth_status === "selected" || hasBoothSelection ? (
              <span className="font-bold text-[#1488A6] dark:text-[#38B2AC]">
                You selected Booth #{assignedBoothNumber}! Awaiting organizer final approval. (1 booth limit reached)
              </span>
            ) : isApproved ? (
              <span className="font-bold text-[#1F2937] dark:text-[#F8FAFC]">
                Application Approved! Click an available booth below to pick your 1 floor spot.
              </span>
            ) : isPending ? (
              <span className="text-amber-600 dark:text-amber-400 font-semibold">
                Application Pending Approval: Your request is currently under organizer review.
              </span>
            ) : isRejected ? (
              <span className="text-rose-600 dark:text-rose-400 font-semibold">
                Application Declined: Your application to exhibit at this summit was declined.
              </span>
            ) : (
              <span className="text-slate-600 dark:text-slate-400 font-semibold">
                No Application Found: You must apply for this expo first before selecting a booth.
              </span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px] font-mono font-semibold text-[#6B7280] dark:text-[#CBD5E1]/80 shrink-0">
          {!myAppForExpo && (
            <button
              onClick={() => setIsApplyModalOpen(true)}
              className="px-3 py-1.5 btn-teal-primary text-white font-bold rounded-lg text-xs cursor-pointer"
            >
              + Apply for Expo
            </button>
          )}
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            Available ({expoBooths.filter((b) => b.status === "available").length})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1488A6] dark:bg-[#38B2AC]" />
            Booked ({expoBooths.filter((b) => b.status === "booked" || b.status === "reserved").length})
          </span>
        </div>
      </div>

      {/* Interactive Floor Plan */}
      <div className="space-y-4">
        <FloorPlanView
          expoId={selectedExpoId}
          onSelectBooth={handleSelectBoothFromCanvas}
          selectedBoothId={selectedBooth?._id}
          isSelectionMode={isApproved && !hasBoothSelection}
        />
      </div>

      {/* Selected Booth Confirmation Drawer/Bar */}
      {selectedBooth && (
        <div className="bg-white dark:bg-[#1A202C] p-5 rounded-2xl border-2 border-[#1488A6] dark:border-[#38B2AC] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-mono font-bold text-[#1488A6] dark:text-[#38B2AC]">
                Selected Floor Space
              </span>
              <span className="text-sm font-black font-mono text-[#1F2937] dark:text-[#F8FAFC]">
                Booth {selectedBooth.booth_number}
              </span>
              <span
                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${selectedBooth.status === "available"
                  ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                  }`}
              >
                {selectedBooth.status}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-[#6B7280] dark:text-[#CBD5E1]/80">
              <span className="capitalize">Tier: {selectedBooth.size}</span>
              <span>Hall: {selectedBooth.hall || "Main Hall"}</span>
              <span className="font-mono font-bold text-[#1F2937] dark:text-[#F8FAFC]">
                Fee: PKR {(selectedBooth.price || selectedBooth.booth_fee || 500).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setSelectedBooth(null)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#6B7280] dark:text-[#CBD5E1]/70 hover:bg-slate-100 dark:hover:bg-[#203748] cursor-pointer transition-colors"
            >
              Cancel
            </button>

            {selectedBooth.status === "available" ? (
              hasBoothSelection ? (
                <button
                  disabled
                  className="px-5 py-2 bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-not-allowed border border-slate-300 dark:border-slate-700"
                >
                  <Lock className="w-4 h-4" /> 1 Booth Limit Reached
                </button>
              ) : isApproved ? (
                <button
                  onClick={handleConfirmReservation}
                  className="px-5 py-2 btn-teal-primary text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Lock & Submit Booth Selection
                </button>
              ) : (
                <button
                  onClick={() =>
                    showToast(
                      "Approval Required",
                      "You can only reserve a booth once the organizer APPROVES your application for this expo.",
                      "error"
                    )
                  }
                  className="px-5 py-2 bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-not-allowed"
                >
                  Awaiting Organizer Approval
                </button>
              )
            ) : (
              <span className="text-xs text-[#6B7280] dark:text-[#CBD5E1]/60 font-medium italic">
                This booth is currently occupied.
              </span>
            )}
          </div>
        </div>
      )}

      {isApplyModalOpen && (
        <ApplyExpoModal onClose={() => setIsApplyModalOpen(false)} />
      )}
    </div>
  );
};

export { BoothSelectionView };


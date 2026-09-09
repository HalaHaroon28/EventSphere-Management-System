import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { FloorPlanView } from "../common/FloorPlanView";
import {
  Plus,
  Trash2,
  X,
  Building2,
  Calendar,
  Layers,
  UserCheck
} from "lucide-react";

export const FloorPlanManager = () => {
  const {
    expos,
    booths,
    addBooth,
    updateBooth,
    deleteBooth,
    currentUser,
    users,
    applications,
    setActiveView,
    fetchBoothsForExpo
  } = useApp();

  // Filter expos for logged-in organizer
  const myExpos = expos.filter((e) => {
    if (!currentUser) return true;
    const orgId = typeof e.organizer_id === "object" ? e.organizer_id?._id : e.organizer_id;
    return (
      orgId === currentUser._id ||
      e.organizer_name === currentUser.name ||
      e.organizer_id === currentUser._id
    );
  });

  const displayExpos = myExpos.length > 0 ? myExpos : expos;

  const [selectedExpoId, setSelectedExpoId] = useState(displayExpos[0]?._id || "");

  useEffect(() => {
    if (displayExpos.length > 0 && (!selectedExpoId || !displayExpos.some(e => e._id === selectedExpoId))) {
      setSelectedExpoId(displayExpos[0]._id);
    }
  }, [displayExpos, selectedExpoId]);

  useEffect(() => {
    if (selectedExpoId && typeof fetchBoothsForExpo === "function") {
      fetchBoothsForExpo(selectedExpoId);
    }
  }, [selectedExpoId]);

  const currentExpo = displayExpos.find((e) => e._id === selectedExpoId || String(e._id) === String(selectedExpoId)) || displayExpos[0];
  const expoBooths = booths.filter(
    (b) =>
      b.expo_id === selectedExpoId ||
      b.expo_id?._id === selectedExpoId ||
      String(b.expo_id) === String(selectedExpoId) ||
      String(b.expo_id?._id) === String(selectedExpoId)
  );

  // List approved exhibitors for assignment (only exhibitors with approved applications for this expo)
  const approvedExhibitors = applications
    .filter((app) => {
      const appExpoId = typeof app.expo_id === "object" ? app.expo_id?._id : app.expo_id;
      return app.status === "approved" && (appExpoId === selectedExpoId || !selectedExpoId);
    })
    .map((app) => {
      const exhUser = (users || []).find((u) => u._id === app.exhibitor_id || u._id === app.user_id);
      return {
        _id: app.exhibitor_id || exhUser?._id || app._id,
        name: app.exhibitor_name || exhUser?.name || app.company_name || "Approved Exhibitor",
        company_name: app.company_name || exhUser?.company_name || app.exhibitor_name || exhUser?.name
      };
    });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBooth, setEditingBooth] = useState(null);
  const [boothNumber, setBoothNumber] = useState("A-01");
  const [posX, setPosX] = useState(20);
  const [posY, setPosY] = useState(20);
  const [size, setSize] = useState("medium");
  const [status, setStatus] = useState("available");
  const [boothFee, setBoothFee] = useState(500);
  const [selectedExhibitorId, setSelectedExhibitorId] = useState("");

  const openAddBoothModal = () => {
    setEditingBooth(null);
    const count = expoBooths.length;
    const rowChar = String.fromCharCode(65 + Math.floor(count / 5)); // A, B, C...
    const colNum = String((count % 5) + 1).padStart(2, "0");
    setBoothNumber(`${rowChar}-${colNum}`);

    // Auto-calculate position on blueprint grid
    const col = count % 5;
    const row = Math.floor(count / 5);
    const autoX = Math.min(88, Math.max(12, 15 + col * 18));
    const autoY = Math.min(85, Math.max(18, 20 + row * 26));

    setPosX(autoX);
    setPosY(autoY);
    setSize("medium");
    setStatus("available");
    setBoothFee(500);
    setSelectedExhibitorId("");
    setIsAddModalOpen(true);
  };

  const handleEditBooth = (booth) => {
    setEditingBooth(booth);
    setBoothNumber(booth.booth_number);
    setPosX(booth.position?.x ?? 50);
    setPosY(booth.position?.y ?? 50);
    setSize(booth.size && ["small", "medium", "large"].includes(booth.size) ? booth.size : "medium");
    setStatus(booth.status || "available");
    setBoothFee(booth.booth_fee ?? booth.price ?? 500);
    setSelectedExhibitorId(booth.exhibitor_id || "");
    setIsAddModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    let assignedExhibitorName = "";
    if (selectedExhibitorId) {
      const exhUser = approvedExhibitors.find((u) => u._id === selectedExhibitorId);
      assignedExhibitorName = exhUser ? exhUser.company_name || exhUser.name : "Assigned Exhibitor";
    }

    const payload = {
      expo_id: selectedExpoId,
      booth_number: boothNumber.trim(),
      position: { x: Number(posX), y: Number(posY) },
      size,
      status: selectedExhibitorId ? "booked" : status,
      price: Number(boothFee),
      booth_fee: Number(boothFee),
      exhibitor_id: selectedExhibitorId || null,
      exhibitor_name: assignedExhibitorName || null
    };

    if (editingBooth) {
      updateBooth(editingBooth._id, payload);
    } else {
      addBooth(payload);
    }
    setIsAddModalOpen(false);
  };

  const bookedCount = expoBooths.filter((b) => b.status === "booked").length;
  const availableCount = expoBooths.filter((b) => b.status === "available").length;
  const reservedCount = expoBooths.filter((b) => b.status === "reserved").length;

  if (displayExpos.length === 0) {
    return (
      <div id="floorplan-manager-empty" className="py-16 text-center bg-white dark:bg-[#1A202C] rounded-3xl border border-[#E5E7EB] dark:border-white/10 p-8 space-y-4 font-body">
        <Building2 className="w-12 h-12 text-[#1488A6] dark:text-[#38B2AC] mx-auto opacity-80" />
        <h3 className="text-xl font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading">No Exhibitions Found</h3>
        <p className="text-sm text-[#6B7280] dark:text-[#CBD5E1]/70 max-w-md mx-auto">
          You haven&apos;t created any exhibitions yet. Please navigate to Manage Expos to launch your first exhibition before customizing floor plans.
        </p>
        <button
          onClick={() => setActiveView("organizer_expos")}
          className="px-5 py-2.5 btn-teal-primary text-xs sm:text-sm font-bold rounded-xl shadow-sm inline-flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Go to Manage Expos
        </button>
      </div>
    );
  }

  return (
    <div id="floorplan-manager-view" className="space-y-6 font-body">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] dark:text-[#F8FAFC] tracking-tight font-heading">
            Floor Plan & Booths
          </h2>
          <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#CBD5E1] mt-0.5">
            Organize event hall maps, manage booth spots, and assign exhibitor spaces.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Expo Selector */}
          <select
            value={selectedExpoId}
            onChange={(e) => setSelectedExpoId(e.target.value)}
            className="text-xs sm:text-sm bg-white dark:bg-[#1A202C] border border-[#E5E7EB] dark:border-white/10 rounded-xl px-3.5 py-2.5 font-bold text-[#1F2937] dark:text-[#F8FAFC] shadow-xs focus:outline-none focus:ring-2 focus:ring-[#38B2AC] cursor-pointer"
          >
            {displayExpos.map((e) => (
              <option key={e._id} value={e._id}>
                {e.title}
              </option>
            ))}
          </select>

          <button
            onClick={openAddBoothModal}
            className="px-4 py-2.5 btn-teal-primary text-xs sm:text-sm font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Place New Booth
          </button>
        </div>
      </div>

      {/* Summary Occupancy Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white dark:bg-[#1A202C] p-4 sm:p-5 rounded-2xl border border-[#E5E7EB] dark:border-white/10 shadow-xs text-xs sm:text-sm">
        <div>
          <span className="text-[10px] sm:text-xs uppercase font-bold text-[#6B7280] dark:text-[#CBD5E1]/70 block font-mono">Total Mapped</span>
          <span className="text-base sm:text-lg font-bold text-[#1F2937] dark:text-[#F8FAFC] font-mono">{expoBooths.length} Booths</span>
        </div>
        <div>
          <span className="text-[10px] sm:text-xs uppercase font-bold text-[#6B7280] dark:text-[#CBD5E1]/70 block font-mono">Available</span>
          <span className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">{availableCount} Units</span>
        </div>
        <div>
          <span className="text-[10px] sm:text-xs uppercase font-bold text-[#6B7280] dark:text-[#CBD5E1]/70 block font-mono">Booked / Reserved</span>
          <span className="text-base sm:text-lg font-bold text-[#1F2937] dark:text-[#F8FAFC] font-mono">{bookedCount} Units</span>
        </div>
        <div>
          <span className="text-[10px] sm:text-xs uppercase font-bold text-[#6B7280] dark:text-[#CBD5E1]/70 block font-mono">Floor Capacity</span>
          <span className="text-base sm:text-lg font-bold text-[#1488A6] dark:text-[#38B2AC] font-mono">
            {Math.round((bookedCount / (expoBooths.length || 1)) * 100)}% Assigned
          </span>
        </div>
      </div>

      {/* Interactive Blueprint Canvas View */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#6B7280] dark:text-[#CBD5E1]/80 gap-1.5 font-mono">
          <span>Active Venue: <strong className="text-[#1F2937] dark:text-[#F8FAFC]">{currentExpo?.location || "Main Convention Center"}</strong></span>
        </div>

        <FloorPlanView
          expoId={selectedExpoId}
          isOrganizerMode={true}
          onEditBooth={handleEditBooth}
        />
      </div>

      {/* Add / Edit Booth Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1A202C] rounded-3xl shadow-2xl border border-[#E5E7EB] dark:border-white/10 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-white/10 pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading">
                  {editingBooth ? `Edit Booth ${editingBooth.booth_number}` : "Place New Booth on Blueprint"}
                </h3>
                <p className="text-xs text-[#6B7280] dark:text-[#CBD5E1]/70 mt-0.5">
                  Configure booth tier, fee, position coordinates, and exhibitor assignment.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-[#6B7280] dark:text-[#CBD5E1] hover:text-[#1F2937] dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Booth Number */}
                <div>
                  <label className="block text-xs font-bold text-[#1F2937] dark:text-[#CBD5E1] uppercase tracking-wider font-mono mb-1">
                    Booth Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={boothNumber}
                    onChange={(e) => setBoothNumber(e.target.value)}
                    placeholder="e.g. A-01"
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC] font-mono"
                  />
                </div>

                {/* Booth Tier (Size) */}
                <div>
                  <label className="block text-xs font-bold text-[#1F2937] dark:text-[#CBD5E1] uppercase tracking-wider font-mono mb-1">
                    Booth Tier (Size) *
                  </label>
                  <select
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC]"
                  >
                    <option value="small">Small Standard</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large Corner</option>
                  </select>
                </div>

                {/* Booth Fee */}
                <div>
                  <label className="block text-xs font-bold text-[#1F2937] dark:text-[#CBD5E1] uppercase tracking-wider font-mono mb-1">
                    Booth Fee (PKR) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={boothFee}
                    onChange={(e) => setBoothFee(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC] font-mono"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-bold text-[#1F2937] dark:text-[#CBD5E1] uppercase tracking-wider font-mono mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC]"
                  >
                    <option value="available">Available</option>
                    <option value="reserved">Reserved</option>
                    <option value="booked">Booked</option>
                  </select>
                </div>

                {/* Position X */}
                <div>
                  <label className="block text-xs font-bold text-[#1F2937] dark:text-[#CBD5E1] uppercase tracking-wider font-mono mb-1">
                    X-Position (% 10-90)
                  </label>
                  <input
                    type="number"
                    required
                    min={5}
                    max={95}
                    value={posX}
                    onChange={(e) => setPosX(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC] font-mono"
                  />
                </div>

                {/* Position Y */}
                <div>
                  <label className="block text-xs font-bold text-[#1F2937] dark:text-[#CBD5E1] uppercase tracking-wider font-mono mb-1">
                    Y-Position (% 10-90)
                  </label>
                  <input
                    type="number"
                    required
                    min={5}
                    max={95}
                    value={posY}
                    onChange={(e) => setPosY(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC] font-mono"
                  />
                </div>

                {/* Assign Approved Exhibitor Dropdown */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#1F2937] dark:text-[#CBD5E1] uppercase tracking-wider font-mono mb-1 flex items-center justify-between">
                    <span>Assign Approved Exhibitor</span>
                    <span className="text-[10px] text-[#1488A6] dark:text-[#38B2AC] normal-case font-normal">(Optional)</span>
                  </label>
                  <select
                    value={selectedExhibitorId}
                    onChange={(e) => setSelectedExhibitorId(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC]"
                  >
                    <option value="">
                      {approvedExhibitors.length === 0
                        ? "None / Available (No approved exhibitors for this expo yet)"
                        : "None / Available (Unassigned)"}
                    </option>
                    {approvedExhibitors.map((exh) => (
                      <option key={exh._id} value={exh._id}>
                        {exh.company_name ? `${exh.company_name} (${exh.name})` : exh.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#E5E7EB] dark:border-white/10">
                {editingBooth ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Remove Booth ${editingBooth.booth_number}?`)) {
                        deleteBooth(editingBooth._id);
                        setIsAddModalOpen(false);
                      }
                    }}
                    className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove Booth
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#6B7280] dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#0F172A] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 btn-teal-primary text-xs sm:text-sm font-bold rounded-xl shadow-xs cursor-pointer"
                  >
                    {editingBooth ? "Save Changes" : "Place Booth"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloorPlanManager;

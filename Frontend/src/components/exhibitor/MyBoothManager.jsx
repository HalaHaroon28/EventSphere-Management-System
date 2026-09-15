import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import {
  Plus,
  Trash2,
  Check,
  Building2,
  Package,
  Users,
  AlertCircle,
  Upload,
  Lock,
  ArrowRight,
  Image as ImageIcon,
  Calendar,
  Store
} from "lucide-react";

const MyBoothManager = () => {
  const {
    currentUser,
    expos = [],
    booths = [],
    fetchBoothsForExpo,
    updateMyBoothDetails,
    uploadBoothProductImage,
    setActiveView,
    showToast
  } = useApp();

  const [selectedExpoId, setSelectedExpoId] = useState(expos[0]?._id || "");

  useEffect(() => {
    if (expos.length > 0 && (!selectedExpoId || !expos.some((e) => e._id === selectedExpoId || String(e._id) === String(selectedExpoId)))) {
      setSelectedExpoId(expos[0]._id);
    }
  }, [expos, selectedExpoId]);

  useEffect(() => {
    if (selectedExpoId) {
      fetchBoothsForExpo(selectedExpoId);
    }
  }, [selectedExpoId]);

  const selectedExpo = expos.find((e) => e._id === selectedExpoId || String(e._id) === String(selectedExpoId)) || expos[0];
  const userId = currentUser?._id || currentUser?.user_id;

  const myBooth = (booths || []).find((b) => {
    const boothExpoId = typeof b.expo_id === "object" ? b.expo_id?._id : b.expo_id;
    const isMatchingExpo = String(boothExpoId) === String(selectedExpoId);
    const boothExhId = typeof b.exhibitor_id === "object" ? b.exhibitor_id?._id : b.exhibitor_id;
    const isMyBooth = String(boothExhId) === String(userId);
    const isBookedOrReserved = b.status === "reserved" || b.status === "booked";
    return isMatchingExpo && isMyBooth && isBookedOrReserved;
  });

  const boothDetails = myBooth?.details || {};

  const [description, setDescription] = useState(boothDetails.description || "");
  const [products, setProducts] = useState(boothDetails.products || []);
  const [staff, setStaff] = useState(boothDetails.staff || []);

  useEffect(() => {
    if (myBooth) {
      setDescription(myBooth.details?.description || "");
      setProducts(myBooth.details?.products || []);
      setStaff(myBooth.details?.staff || []);
    }
  }, [myBooth?._id, JSON.stringify(myBooth?.details), selectedExpoId]);

  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProdName, setNewProdName] = useState("");
  const [newProdCategory, setNewProdCategory] = useState("Hardware");
  const [newProdDesc, setNewProdDesc] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdImg, setNewProdImg] = useState("https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=80");
  const [uploadingImg, setUploadingImg] = useState(false);

  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffRole, setNewStaffRole] = useState("");
  const [newStaffEmail, setNewStaffEmail] = useState("");

  const getMediaUrl = (url, fallback = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=80") => {
    if (!url || typeof url !== "string" || !url.trim()) return fallback;
    const clean = url.trim();
    if (clean.startsWith("http://") || clean.startsWith("https://") || clean.startsWith("data:") || clean.startsWith("blob:")) {
      return clean;
    }
    const cleanPath = clean.startsWith("/") ? clean : `/${clean}`;
    return `http://localhost:5000${cleanPath}`;
  };

  const handleProductImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImg(true);
    const uploadedUrl = await uploadBoothProductImage(file);
    setUploadingImg(false);
    if (uploadedUrl) {
      setNewProdImg(uploadedUrl);
      showToast("Image Uploaded", "Product image uploaded successfully.", "success");
    }
  };

  const handleSaveBoothProfile = async (e) => {
    if (e) e.preventDefault();
    if (!myBooth) return;

    if (products.length < 1) {
      showToast("Minimum 1 Product Required", "Please add at least 1 product to your booth catalog.", "error");
      return;
    }
    if (products.length > 3) {
      showToast("Maximum 3 Products Allowed", "You can showcase a maximum of 3 products.", "error");
      return;
    }

    if (staff.length < 1) {
      showToast("Minimum 1 Attendant Required", "Please register at least 1 booth staff attendant.", "error");
      return;
    }
    if (staff.length > 3) {
      showToast("Maximum 3 Attendants Allowed", "You can register a maximum of 3 booth staff members.", "error");
      return;
    }

    await updateMyBoothDetails(myBooth._id, {
      description,
      products,
      staff
    });
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!newProdName.trim()) return;

    if (products.length >= 3) {
      showToast("Limit Reached", "Maximum of 3 products allowed per booth.", "error");
      return;
    }

    const newP = {
      _id: "prod_" + Date.now(),
      name: newProdName.trim(),
      category: newProdCategory.trim() || "General",
      description: newProdDesc.trim(),
      price: newProdPrice ? Number(newProdPrice) : 0,
      image_url: newProdImg
    };

    setProducts((prev) => [...prev, newP]);
    setIsAddProductOpen(false);
    setNewProdName("");
    setNewProdDesc("");
    setNewProdPrice("");
    setNewProdCategory("Hardware");
    setNewProdImg("https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=80");
    showToast("Product Added", `"${newP.name}" added to booth catalog. `, "info");
  };

  const handleRemoveProduct = (index) => {
    if (products.length <= 1) {
      showToast("Minimum Requirement", "Your booth must have at least 1 featured product.", "error");
      return;
    }
    setProducts((prev) => prev.filter((_, idx) => idx !== index));
    showToast("Product Removed", "Item removed from catalog list.", "info");
  };

  const handleAddStaff = (e) => {
    e.preventDefault();
    if (!newStaffName.trim() || !newStaffRole.trim() || !newStaffEmail.trim()) return;

    if (staff.length >= 3) {
      showToast("Limit Reached", "Maximum of 3 staff attendants allowed per booth.", "error");
      return;
    }

    const newS = {
      _id: "stf_" + Date.now(),
      name: newStaffName.trim(),
      role: newStaffRole.trim(),
      email: newStaffEmail.trim()
    };

    setStaff((prev) => [...prev, newS]);
    setIsAddStaffOpen(false);
    setNewStaffName("");
    setNewStaffRole("");
    setNewStaffEmail("");
    showToast("Attendant Added", `"${newS.name}" added as booth attendant.`, "info");
  };

  const handleRemoveStaff = (index) => {
    if (staff.length <= 1) {
      showToast("Minimum Requirement", "Your booth must have at least 1 registered staff attendant.", "error");
      return;
    }
    setStaff((prev) => prev.filter((_, idx) => idx !== index));
    showToast("Staff Removed", "Attendant removed. Click Save Changes to update DB.", "info");
  };

  return (
    <div id="my-booth-manager-view" className="space-y-6 font-body">

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold text-[#1F2937] dark:text-[#F8FAFC] tracking-tight font-heading whitespace-nowrap">
              My Booth & Catalog Manager
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#CBD5E1] mt-0.5">
            Configure your company booth description, products catalog (1-3 items), and registered attendants (1-3 staff).
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-nowrap">

          <div className="relative w-56 sm:w-64 md:w-72 shrink-0">
            <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#1488A6] dark:text-[#38B2AC] pointer-events-none z-10" />
            <select
              value={selectedExpoId}
              onChange={(e) => setSelectedExpoId(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-white dark:bg-[#1A202C] border border-[#E5E7EB] dark:border-white/10 rounded-xl font-bold text-[#1F2937] dark:text-[#F8FAFC] shadow-xs focus:outline-none focus:ring-2 focus:ring-[#38B2AC] cursor-pointer truncate"
            >
              {expos.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.title}
                </option>
              ))}
            </select>
          </div>

          {myBooth ? (
            <button
              onClick={handleSaveBoothProfile}
              className="py-2 px-4 btn-teal-primary text-white text-xs sm:text-sm font-bold rounded-xl shadow-md hover:shadow-lg flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              <Check className="w-4 h-4" /> Save Changes
            </button>
          ) : (
            <button
              onClick={() => setActiveView("booth-selection")}
              className="py-2 px-4 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-[#1F2937] dark:text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              <Store className="w-4 h-4 text-[#1488A6] dark:text-[#38B2AC]" />
              <span>Choose Booth</span>
            </button>
          )}
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-[#1A202C] p-4 rounded-2xl border border-[#E5E7EB] dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-[#1F2937] dark:text-[#F8FAFC] min-w-0">
          <Store className="w-4 h-4 text-[#1488A6] dark:text-[#38B2AC] shrink-0" />
          <span className="truncate max-w-[280px] sm:max-w-md">
            Active Summit: <strong>{selectedExpo?.title || "Selected Expo"}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2.5 text-[#6B7280] dark:text-[#CBD5E1]/70 font-mono text-[11px] shrink-0">
          {myBooth ? (
            <span className="px-2.5 py-1 rounded-full font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Booth #{myBooth.booth_number} • {myBooth.hall || "Main Hall"} ({myBooth.status.toUpperCase()})
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              No Booth Reserved For This Summit
            </span>
          )}
        </div>
      </div>

      {!myBooth ? (
        <div className="bg-white dark:bg-[#1A202C] rounded-3xl border border-[#E5E7EB] dark:border-white/10 shadow-sm p-6 sm:p-10 font-body space-y-8">
          <div className="max-w-xl mx-auto text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-xs">
              <Lock className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading">
                No Booked Booth for {selectedExpo?.title || "this Expo"}
              </h3>
              <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#CBD5E1]/80 leading-relaxed">
                Exhibitor catalog and staff manager is locked until you select and reserve an available booth space on the interactive floor plan.
              </p>
            </div>

            <button
              onClick={() => setActiveView("booth-selection")}
              className="px-6 py-3 btn-teal-primary text-white text-xs sm:text-sm font-bold rounded-xl shadow-md inline-flex items-center gap-2 cursor-pointer transition-transform hover:scale-105"
            >
              Go to Choose a Booth Map <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-[#E5E7EB] dark:border-white/10 text-left">
            <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/5 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#1488A6]/10 text-[#1488A6] dark:text-[#38B2AC] font-mono font-bold text-xs flex items-center justify-center">1</span>
                <span className="text-xs font-bold text-[#1F2937] dark:text-white">Submit Application</span>
              </div>
              <p className="text-[11px] text-[#6B7280] dark:text-[#CBD5E1]/70">Apply to exhibit at this summit and await organizer approval.</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/5 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#1488A6]/10 text-[#1488A6] dark:text-[#38B2AC] font-mono font-bold text-xs flex items-center justify-center">2</span>
                <span className="text-xs font-bold text-[#1F2937] dark:text-white">Reserve Floor Spot</span>
              </div>
              <p className="text-[11px] text-[#6B7280] dark:text-[#CBD5E1]/70">Pick an available booth coordinate on the interactive blueprint floor plan.</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/5 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#1488A6]/10 text-[#1488A6] dark:text-[#38B2AC] font-mono font-bold text-xs flex items-center justify-center">3</span>
                <span className="text-xs font-bold text-[#1F2937] dark:text-white">Build Catalog & Staff</span>
              </div>
              <p className="text-[11px] text-[#6B7280] dark:text-[#CBD5E1]/70">Upload 1-3 demo products and register booth attendants.</p>
            </div>
          </div>
        </div>
      ) : (
        <>

          <div className="bg-white dark:bg-[#1A202C] p-5 sm:p-6 rounded-2xl border border-[#E5E7EB] dark:border-white/10 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[#E5E7EB] dark:border-white/10 pb-3">
              <Building2 className="w-4.5 h-4.5 text-[#1488A6] dark:text-[#38B2AC]" />
              <h3 className="text-sm font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading">
                Exhibitor Showcase & Mission
              </h3>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider font-mono text-[#6B7280] dark:text-[#CBD5E1]/70 mb-1.5">
                Exhibitor Description & Mission Summary
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your company, flagship technology, and vision for this summit..."
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC] font-sans"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-[#1A202C] p-5 sm:p-6 rounded-2xl border border-[#E5E7EB] dark:border-white/10 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-4.5 h-4.5 text-[#1488A6] dark:text-[#38B2AC]" />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading">
                      Featured Products & Demos ({products.length}/3)
                    </h3>
                    {products.length < 1 && (
                      <span className="text-[10px] bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded font-mono font-bold border border-rose-200 dark:border-rose-800">
                        Min 1 required
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#6B7280] dark:text-[#CBD5E1]/70">
                    Products showcased on your digital profile (Min 1, Max 3).
                  </p>
                </div>
              </div>

              {products.length < 3 ? (
                <button
                  onClick={() => setIsAddProductOpen(true)}
                  className="px-3 py-1.5 btn-teal-primary text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Product
                </button>
              ) : (
                <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
                  Max 3 Reached
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {products.map((p, idx) => (
                <div
                  key={p._id || `product-${idx}`}
                  className="border border-[#E5E7EB] dark:border-white/10 rounded-2xl overflow-hidden bg-[#F8FAFC] dark:bg-[#0F172A] flex flex-col justify-between group"
                >
                  <div className="h-32 bg-[#E2E8F0] dark:bg-[#203748] overflow-hidden relative">
                    <img
                      src={getMediaUrl(p.image_url)}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=80";
                      }}
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-white/90 dark:bg-[#1A202C]/90 text-[#1F2937] dark:text-[#F8FAFC] border border-white/20 font-mono">
                      {p.category || "Hardware"}
                    </span>
                  </div>

                  <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading">
                        {p.name}
                      </h4>
                      <p className="text-[11px] text-[#6B7280] dark:text-[#CBD5E1]/80 mt-1 line-clamp-2 leading-relaxed">
                        {p.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#E5E7EB] dark:border-white/10 flex items-center justify-between">
                      {p.price ? (
                        <span className="text-xs font-mono font-bold text-[#1488A6] dark:text-[#38B2AC]">
                          PKR {Number(p.price).toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-mono uppercase">Showcase</span>
                      )}

                      <button
                        onClick={() => handleRemoveProduct(idx)}
                        className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-[#1A202C] p-5 sm:p-6 rounded-2xl border border-[#E5E7EB] dark:border-white/10 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4.5 h-4.5 text-[#1488A6] dark:text-[#38B2AC]" />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading">
                      Registered Booth Attendants ({staff.length}/3)
                    </h3>
                    {staff.length < 1 && (
                      <span className="text-[10px] bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded font-mono font-bold border border-rose-200 dark:border-rose-800">
                        Min 1 required
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#6B7280] dark:text-[#CBD5E1]/70">
                    Staff members authorized on the exhibition floor with badges (Min 1, Max 3).
                  </p>
                </div>
              </div>

              {staff.length < 3 ? (
                <button
                  onClick={() => setIsAddStaffOpen(true)}
                  className="px-3 py-1.5 btn-teal-primary text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Staff Member
                </button>
              ) : (
                <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
                  Max 3 Reached
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {staff.map((s, idx) => (
                <div
                  key={s._id || `staff-${idx}`}
                  className="p-3.5 rounded-xl border border-[#E5E7EB] dark:border-white/10 bg-[#F8FAFC] dark:bg-[#0F172A] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-[#1488A6] dark:bg-[#38B2AC] text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {(s.name || "St").slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-[#1F2937] dark:text-[#F8FAFC] truncate">
                        {s.name}
                      </h4>
                      <span className="text-[11px] text-[#6B7280] dark:text-[#CBD5E1]/70 block truncate font-mono">
                        {s.role} • {s.email}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveStaff(idx)}
                    className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-[#6B7280] hover:text-rose-600 dark:text-[#CBD5E1]/60 dark:hover:text-rose-400 rounded-lg cursor-pointer transition-colors shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1A202C] rounded-3xl shadow-2xl border border-[#E5E7EB] dark:border-white/10 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 font-body max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading">
              Add Featured Product (Max 3)
            </h3>

            <form onSubmit={handleAddProduct} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider font-mono text-[#6B7280] dark:text-[#CBD5E1]/70 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="e.g. Quantum Industrial Vision Module"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider font-mono text-[#6B7280] dark:text-[#CBD5E1]/70 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    placeholder="e.g. Hardware"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider font-mono text-[#6B7280] dark:text-[#CBD5E1]/70 mb-1">
                    Price (PKR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    placeholder="e.g. 150000"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider font-mono text-[#6B7280] dark:text-[#CBD5E1]/70 mb-1">
                  Product Description
                </label>
                <textarea
                  rows={2}
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  placeholder="Key features, specifications, or application demo summary..."
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider font-mono text-[#6B7280] dark:text-[#CBD5E1]/70 mb-1 flex items-center justify-between">
                  <span>Product Image *</span>
                  {newProdImg && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold font-mono">

                    </span>
                  )}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProductImageUpload}
                    className="hidden"
                    id="booth-product-file-input"
                  />
                  <label
                    htmlFor="booth-product-file-input"
                    className="px-3.5 py-2.5 bg-slate-100 dark:bg-[#0F172A] hover:bg-slate-200 border border-[#E5E7EB] dark:border-white/10 rounded-xl text-xs font-semibold text-[#1F2937] dark:text-[#F8FAFC] flex items-center gap-2 cursor-pointer transition-all shrink-0 shadow-xs"
                  >
                    <Upload className="w-4 h-4 text-[#1488A6] dark:text-[#38B2AC]" />
                    {uploadingImg ? "Uploading Image..." : "Upload Local Image"}
                  </label>

                  {newProdImg && (
                    <div className="w-12 h-12 rounded-xl border-2 border-[#1488A6] dark:border-[#38B2AC] overflow-hidden bg-slate-900 shrink-0 shadow-xs">
                      <img
                        src={getMediaUrl(newProdImg)}
                        alt="Product Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=80";
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E7EB] dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6B7280] dark:text-[#CBD5E1]/70 hover:bg-slate-100 dark:hover:bg-[#203748] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingImg}
                  className="px-4 py-2 btn-teal-primary text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAddStaffOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1A202C] rounded-3xl shadow-2xl border border-[#E5E7EB] dark:border-white/10 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 font-body">
            <h3 className="text-base font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading">
              Add Registered Attendant (Max 3)
            </h3>

            <form onSubmit={handleAddStaff} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider font-mono text-[#6B7280] dark:text-[#CBD5E1]/70 mb-1">
                  Attendant Name *
                </label>
                <input
                  type="text"
                  required
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  placeholder="e.g. Dr. Kaori Tanaka"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider font-mono text-[#6B7280] dark:text-[#CBD5E1]/70 mb-1">
                  Role / Title *
                </label>
                <input
                  type="text"
                  required
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value)}
                  placeholder="e.g. Head of Business Development"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider font-mono text-[#6B7280] dark:text-[#CBD5E1]/70 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  placeholder="kaori@company.ai"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC] font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E7EB] dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddStaffOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6B7280] dark:text-[#CBD5E1]/70 hover:bg-slate-100 dark:hover:bg-[#203748] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 btn-teal-primary text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Add Attendant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export { MyBoothManager };
export default MyBoothManager;

import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { X, Upload, FileText, CheckCircle, Lock, Building2 } from "lucide-react";

const ApplyExpoModal = ({ initialExpoId, onClose, onSuccess }) => {
  const { expos = [], booths = [], applications = [], currentUser, submitApplication, applyForExpo, showToast } = useApp();

  const allExpos = expos || [];
  const [selectedExpoId, setSelectedExpoId] = useState(
    initialExpoId || allExpos[0]?._id || ""
  );

  useEffect(() => {
    if (initialExpoId) {
      setSelectedExpoId(initialExpoId);
    } else if (allExpos[0]?._id && !selectedExpoId) {
      setSelectedExpoId(allExpos[0]._id);
    }
  }, [initialExpoId, allExpos]);

  const [companyName, setCompanyName] = useState(
    currentUser?.company_name || currentUser?.name || ""
  );
  const [contactEmail] = useState(currentUser?.email || "");
  const [productsServices, setProductsServices] = useState("");
  const [boothTier, setBoothTier] = useState("medium");
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [customDocInput, setCustomDocInput] = useState("");
  const [companyImage, setCompanyImage] = useState(currentUser?.profile_photo_url || "");
  const [companyImageFile, setCompanyImageFile] = useState(null);

  const smallPrice = 500;
  const mediumPrice = 1000;
  const largePrice = 1750;

  const selectedExpo = allExpos.find(
    (e) => e && (String(e._id) === String(selectedExpoId) || String(e.id) === String(selectedExpoId))
  ) || allExpos[0];

  // Filter available booths for selected expo
  const expoBooths = (booths || []).filter((b) => {
    if (!b) return false;
    const bExpoId = typeof b.expo_id === "object" ? b.expo_id?._id : b.expo_id;
    return String(bExpoId) === String(selectedExpoId) || (selectedExpo && String(bExpoId) === String(selectedExpo._id));
  });
  const availableBooths = expoBooths.filter((b) => b.status === "available");

  // Group available booths by size/tier
  const availableTiersMap = {};
  availableBooths.forEach((b) => {
    const sizeKey = (b.size || b.tier || "medium").toLowerCase();
    const p = b.price || b.booth_fee || (sizeKey === "small" ? smallPrice : sizeKey === "large" ? largePrice : mediumPrice);
    if (!availableTiersMap[sizeKey]) {
      availableTiersMap[sizeKey] = {
        size: sizeKey,
        price: p,
        count: 1
      };
    } else {
      availableTiersMap[sizeKey].count += 1;
    }
  });

  const availableTierKeys = Object.keys(availableTiersMap);

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (uploadedDocs.length + files.length > 3) {
      showToast("Limit Reached", "You can upload a maximum of 3 documents.", "error");
      return;
    }

    const fileNames = files.map((f) => f.name);
    setUploadedDocs((prev) => [...prev, ...fileNames]);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const handleAddCustomDoc = () => {
    if (!customDocInput.trim()) return;

    if (uploadedDocs.length >= 3) {
      showToast("Limit Reached", "You can upload a maximum of 3 documents.", "error");
      return;
    }

    setUploadedDocs((prev) => [...prev, customDocInput.trim()]);
    setCustomDocInput("");
  };

  const handleRemoveDoc = (index) => {
    setUploadedDocs((prev) => prev.filter((_, i) => i !== index));
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const myUserId = String(currentUser?._id || currentUser?.user_id || "");
  const existingApp = (applications || []).find((a) => {
    if (!a) return false;
    const aExpoId = typeof a.expo_id === "object" ? a.expo_id?._id : a.expo_id;
    const aExhibitorId = typeof a.exhibitor_id === "object" ? a.exhibitor_id?._id : a.exhibitor_id;
    return (
      String(aExpoId) === String(selectedExpoId) &&
      myUserId &&
      String(aExhibitorId) === myUserId
    );
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (existingApp) {
      showToast(
        "Already Applied",
        "You have already submitted an application for this expo. Exhibitors can only apply once per expo.",
        "error"
      );
      return;
    }

    if (!companyName.trim()) {
      showToast("Validation Error", "Please enter your Company / Brand Name.", "error");
      return;
    }

    if (!productsServices.trim()) {
      showToast("Validation Error", "Please describe your products or services showcase.", "error");
      return;
    }

    if (uploadedDocs.length < 1) {
      showToast("Document Required", "Please attach at least 1 supporting credential, pitch deck, or image (1 min, 3 max).", "error");
      return;
    }

    if (uploadedDocs.length > 3) {
      showToast("Limit Exceeded", "You can attach a maximum of 3 supporting documents.", "error");
      return;
    }

    const payload = {
      expo_id: selectedExpoId,
      company_name: companyName.trim(),
      contact_email: contactEmail,
      products_services: productsServices.trim(),
      booth_tier_requested: boothTier,
      documents: uploadedDocs,
      files: selectedFiles
    };

    if (submitApplication) {
      submitApplication(payload);
    } else if (applyForExpo) {
      applyForExpo(payload);
    }

    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200 font-body">
      <div className="bg-white dark:bg-[#1A202C] rounded-3xl shadow-2xl border border-[#E5E7EB] dark:border-white/10 max-w-xl w-full flex flex-col max-h-[90vh] overflow-hidden text-[#1F2937] dark:text-[#F8FAFC]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-[#1488A6] to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between shrink-0 relative">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-[#38B2AC] flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-[#38B2AC]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#38B2AC]">
                  Booth Application
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#38B2AC]/20 text-[#38B2AC] border border-[#38B2AC]/30">
                  Vendor Portal
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white font-heading">
                Apply for Booth Space
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Submit credentials, products outline, and requested floor tier
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

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Target Expo Select */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider font-mono text-[#6B7280] dark:text-[#CBD5E1]/70 mb-1.5">
              Select Target Summit / Expo *
            </label>
            <select
              value={selectedExpoId}
              onChange={(e) => setSelectedExpoId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC] font-semibold cursor-pointer"
            >
              {allExpos.map((e) => {
                if (!e || !e._id) return null;
                const dVal = e.date || e.dates || e.created_at;
                const dStr = dVal && !isNaN(new Date(dVal)) ? new Date(dVal).toLocaleDateString() : "TBD";
                return (
                  <option key={e._id} value={e._id}>
                    {e.title} ({e.location || "Main Hall"} • {dStr})
                  </option>
                );
              })}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Company Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider font-mono text-[#6B7280] dark:text-[#CBD5E1]/70 mb-1.5">
                Company / Brand Name *
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Apex Robotics Dynamics"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC]"
              />
            </div>

            {/* Primary Contact Email - PREFILLED & NON-EDITABLE */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider font-mono text-[#6B7280] dark:text-[#CBD5E1]/70">
                  Primary Contact Email *
                </label>
                <span className="text-[10px] font-mono text-[#6B7280] dark:text-[#CBD5E1]/60 font-bold flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> Locked
                </span>
              </div>
              <input
                type="email"
                disabled
                readOnly
                value={contactEmail}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-100 dark:bg-[#0F172A]/60 border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#6B7280] dark:text-[#CBD5E1] font-mono cursor-not-allowed"
              />
            </div>
          </div>

          {/* Requested Booth Tier - FETCHED FROM AVAILABLE BOOTHS */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider font-mono text-[#6B7280] dark:text-[#CBD5E1]/70 mb-1.5">
              Requested Booth Tier *
            </label>
            <select
              value={boothTier}
              onChange={(e) => setBoothTier(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC] cursor-pointer font-medium"
            >
              {availableTierKeys.length > 0 ? (
                availableTierKeys.map((sizeKey) => {
                  const item = availableTiersMap[sizeKey];
                  const label = sizeKey.charAt(0).toUpperCase() + sizeKey.slice(1);
                  return (
                    <option key={sizeKey} value={sizeKey}>
                      {label} Tier ({item.count} Available) - PKR {item.price.toLocaleString()}
                    </option>
                  );
                })
              ) : (
                <>
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </>
              )}
            </select>
          </div>

          {/* Products & Services Showcased */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider font-mono text-[#6B7280] dark:text-[#CBD5E1]/70 mb-1.5">
              Products, Technologies & Services Showcased *
            </label>
            <textarea
              rows={3}
              required
              value={productsServices}
              onChange={(e) => setProductsServices(e.target.value)}
              placeholder="Detail hardware prototypes, software solutions, live demo plans, and staff sizes..."
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] placeholder-[#6B7280] dark:placeholder-[#CBD5E1]/50 focus:outline-none focus:ring-2 focus:ring-[#38B2AC]"
            />
          </div>

          {/* Supporting Credentials & Pitch Deck - FILE UPLOAD (PDFs, Docs, Images - Min 1, Max 3) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider font-mono text-[#6B7280] dark:text-[#CBD5E1]/70">
                Supporting Credentials, Pitch Deck & Images *
              </label>
              <span className="text-[11px] font-mono font-bold text-[#1488A6] dark:text-[#38B2AC]">
                {uploadedDocs.length} / 3 Attached (Min 1, Max 3)
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              {/* File Upload Input */}
              <label className="flex-1 px-3.5 py-2 bg-slate-50 dark:bg-[#0F172A] border border-dashed border-[#1488A6]/40 dark:border-[#38B2AC]/40 rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:bg-teal-50/50 dark:hover:bg-[#203748]/40 transition-colors">
                <Upload className="w-4 h-4 text-[#1488A6] dark:text-[#38B2AC]" />
                <span className="text-xs font-bold text-[#1488A6] dark:text-[#38B2AC]">Upload PDF / Spec / Image</span>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp,image/*"
                  className="hidden"
                  onChange={handleFileInput}
                  disabled={uploadedDocs.length >= 3}
                />
              </label>

              {/* Or manual filename input */}
              <div className="flex gap-2 sm:w-1/2">
                <button
                  type="button"
                  onClick={handleAddCustomDoc}
                  disabled={uploadedDocs.length >= 3}
                  className="px-3 py-2 bg-[#E2E8F0] dark:bg-[#203748] hover:bg-[#CBD5E1] dark:hover:bg-[#203748]/80 text-[#1F2937] dark:text-[#F8FAFC] text-xs font-semibold rounded-xl flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
                >
                  Attach
                </button>
              </div>
            </div>

            {/* Attached Chips */}
            <div className="flex flex-wrap gap-2 pt-1">
              {uploadedDocs.map((doc, i) => (
                <div
                  key={`doc-${i}`}
                  className="flex items-center gap-1.5 px-3 py-1 bg-teal-50 dark:bg-[#0F172A] border border-[#1488A6]/30 dark:border-[#38B2AC]/40 rounded-lg text-[11px] font-mono text-[#1488A6] dark:text-[#38B2AC]"
                >
                  <FileText className="w-3.5 h-3.5 text-[#1488A6] dark:text-[#38B2AC]" />
                  <span className="font-medium">{doc}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveDoc(i)}
                    className="text-[#6B7280] hover:text-rose-600 dark:text-[#CBD5E1]/60 dark:hover:text-rose-400 ml-1 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-[#6B7280] dark:text-[#CBD5E1]/60 font-mono">
              * Minimum 1 document required. Maximum 3 documents allowed. Accepted formats: PDF, DOC, DOCX, PNG, JPG, JPEG, WEBP.
            </p>
          </div>

          {existingApp && (
            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 rounded-xl text-xs text-amber-900 dark:text-amber-200 font-medium">
              ⚠️ <strong>Application already submitted:</strong> You have already applied for this expo (Status: <span className="uppercase font-mono font-bold text-amber-700 dark:text-amber-300">{existingApp.status}</span>). Exhibitors can only submit one application per expo.
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E7EB] dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6B7280] dark:text-[#CBD5E1]/70 hover:bg-slate-100 dark:hover:bg-[#203748] cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={Boolean(existingApp)}
              className={`px-4 py-2 text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all ${existingApp
                ? "bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                : "btn-teal-primary text-white cursor-pointer"
                }`}
            >
              <CheckCircle className="w-4 h-4" /> {existingApp ? "Already Applied" : "Submit Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export { ApplyExpoModal };

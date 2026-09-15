import { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  Search,
  Download,
  Mail,
  Send,
  X,
  Users,
  MapPin,
  Building2,
  Calendar,
  Layers,
  MessageSquare,
  PackageCheck,
  ChevronDown,
  Sparkles,
  Zap
} from "lucide-react";

export const ExhibitorSearch = ({
  onMessageExhibitor,
  onContactExhibitor,
  onViewFloorPlan,
  onSelectExpo,
  onOpenAIMatchmaker
}) => {
  const {
    showcases = [],
    showcase = [],
    booths = [],
    expos = [],
    applications = [],
    currentUser = {},
    sendMessage,
    showToast,
    setActiveView,
    setSelectedExpoId: setContextSelectedExpoId
  } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExpoId, setSelectedExpoId] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeShowcaseModal, setActiveShowcaseModal] = useState(null);

  const getMediaUrl = (url) => {
    if (!url || typeof url !== "string" || !url.trim()) return null;
    const clean = url.trim();
    if (clean.startsWith("http://") || clean.startsWith("https://") || clean.startsWith("data:") || clean.startsWith("blob:")) {
      return clean;
    }
    const cleanPath = clean.startsWith("/") ? clean : `/${clean}`;
    return `http://localhost:5000${cleanPath}`;
  };

  // Helper function to strictly filter out mock test exhibitors
  const isTestExhibitor = (exhId, companyName, description) => {
    if (!exhId) return true;
    const strId = String(exhId).toLowerCase();
    if (
      strId === "user_exh_1" ||
      strId.startsWith("exh_mock") ||
      strId.startsWith("test_") ||
      strId === "undefined" ||
      strId === "null"
    ) {
      return true;
    }
    const name = (companyName || "").toLowerCase().trim();
    if (
      !name ||
      name === "exhibitor company" ||
      name === "quantum dynamics ai" ||
      name === "quantum dynamics" ||
      name.includes("quantum dynamics")
    ) {
      return true;
    }
    const desc = (description || "").toLowerCase();
    if (desc.includes("quantum dynamics builds autonomous robotic fleets")) {
      return true;
    }
    return false;
  };

  // Filter out static test data from showcases array
  const realDbShowcases = [...(showcases || []), ...(showcase || [])].filter(
    (s) => !isTestExhibitor(s.exhibitor_id, s.company_name, s.description)
  );

  // Map to hold unique real exhibitors from MongoDB
  const exhibitorsMap = {};

  // 1. Process Real Booths from MongoDB (populated with details.products, details.description, details.staff)
  (booths || []).forEach((b) => {
    const isBookedOrReserved = b.status === "booked" || b.status === "reserved" || (b.exhibitor_id && b.exhibitor_id !== null);
    const exhId = typeof b.exhibitor_id === "object" ? b.exhibitor_id?._id : b.exhibitor_id;
    if (!isBookedOrReserved || !exhId) return;

    const exhObj = typeof b.exhibitor_id === "object" ? b.exhibitor_id : null;
    const compName =
      exhObj?.company_profile?.company_name ||
      exhObj?.company_name ||
      exhObj?.name ||
      b.exhibitor_name ||
      "";
    const bDetails = b.details || {};
    const desc =
      bDetails.description ||
      exhObj?.company_profile?.about ||
      exhObj?.company_profile?.description ||
      "";
    const expoId = typeof b.expo_id === "object" ? b.expo_id?._id : b.expo_id;

    if (isTestExhibitor(exhId, compName, desc)) {
      return;
    }

    const key = `${exhId}_${expoId || "default"}`;

    if (!exhibitorsMap[key]) {
      const staffList = (bDetails.staff || []).map((st) => ({
        _id: st._id,
        name: st.name || "Staff Member",
        role: st.role || "Booth Attendant",
        email: st.email || ""
      }));

      const productsList = (bDetails.products || []).map((p) => ({
        _id: p._id || p.id,
        name: p.name || "Product",
        category: p.category || "General",
        price: p.price || 0,
        description: p.description || "",
        image_url: p.image_url || p.imageUrl || ""
      }));

      exhibitorsMap[key] = {
        _id: key,
        exhibitor_id: exhId,
        expo_id: expoId,
        company_name: compName,
        category: b.category || exhObj?.category || "Technology",
        booth_number: b.booth_number,
        hall: b.hall,
        logo_url: exhObj?.company_profile?.logo || exhObj?.profile_photo_url || bDetails?.logo_url || bDetails?.logo || null,
        description: desc,
        products: productsList,
        staff: staffList
      };
    }
  });

  // 2. Process Approved Exhibitor Applications from MongoDB
  (applications || []).forEach((app) => {
    if (app.status === "approved") {
      const exhId = app.exhibitor_id?._id || app.exhibitor_id;
      const expoId = app.expo_id?._id || app.expo_id;
      if (!exhId) return;

      const compName =
        app.company_name ||
        app.exhibitor_name ||
        app.exhibitor_id?.company_profile?.company_name ||
        app.exhibitor_id?.company_name ||
        app.exhibitor_id?.name ||
        "";
      const desc = app.products_services || app.description || "";

      if (isTestExhibitor(exhId, compName, desc)) {
        return;
      }

      const key = `${exhId}_${expoId || "default"}`;

      if (exhibitorsMap[key]) {
        if (!exhibitorsMap[key].company_name || exhibitorsMap[key].company_name === "Exhibitor Company") {
          exhibitorsMap[key].company_name = compName;
        }
        if ((!exhibitorsMap[key].products || exhibitorsMap[key].products.length === 0) && app.products) {
          exhibitorsMap[key].products = app.products;
        }
        if (!exhibitorsMap[key].description && desc) {
          exhibitorsMap[key].description = desc;
        }
      } else {
        exhibitorsMap[key] = {
          _id: app._id,
          exhibitor_id: exhId,
          expo_id: expoId,
          company_name: compName,
          logo_url: app.logo_url || app.exhibitor_id?.company_profile?.logo || app.exhibitor_id?.profile_photo_url || null,
          booth_number: app.booth_number || app.booth_id?.booth_number || "Approved",
          category: app.category || app.booth_tier_requested || "Exhibitor",
          description: desc || `${compName} exhibition booth.`,
          products: app.products || [],
          staff: []
        };
      }
    }
  });

  // 3. Process DB Showcase Records
  realDbShowcases.forEach((sc) => {
    const exhId = sc.exhibitor_id;
    if (!exhId || isTestExhibitor(exhId, sc.company_name, sc.description)) return;
    const expoId = sc.expo_id?._id || sc.expo_id;
    const key = `${exhId}_${expoId || "default"}`;

    if (exhibitorsMap[key]) {
      if (!exhibitorsMap[key].logo_url && sc.logo_url) {
        exhibitorsMap[key].logo_url = sc.logo_url;
      }
      if ((!exhibitorsMap[key].products || exhibitorsMap[key].products.length === 0) && sc.products?.length > 0) {
        exhibitorsMap[key].products = sc.products;
      }
      if ((!exhibitorsMap[key].staff || exhibitorsMap[key].staff.length === 0) && sc.staff?.length > 0) {
        exhibitorsMap[key].staff = sc.staff;
      }
    } else {
      exhibitorsMap[key] = {
        _id: sc._id || key,
        exhibitor_id: exhId,
        expo_id: expoId,
        company_name: sc.company_name,
        category: sc.category || "Technology",
        booth_number: sc.booth_number || "Main Pavilion",
        hall: sc.hall || "Hall A",
        logo_url: sc.logo_url || null,
        description: sc.description,
        products: sc.products || [],
        staff: sc.staff || []
      };
    }
  });

  const dynamicExhibitorsList = Object.values(exhibitorsMap);

  // Extract unique categories from exhibitors list
  const availableCategories = Array.from(
    new Set(
      dynamicExhibitorsList
        .map((s) => s.category)
        .filter((c) => c && typeof c === "string" && c.trim())
    )
  );

  // Filter by selected expo, category, and search query
  const filteredShowcases = dynamicExhibitorsList.filter((s) => {
    // Expo Filter
    if (selectedExpoId !== "all") {
      const sExpoId = s.expo_id?._id || s.expo_id;
      if (String(sExpoId) !== String(selectedExpoId)) return false;
    }
    // Category Filter
    if (selectedCategory !== "all") {
      const sCat = (s.category || "").toLowerCase();
      const targetCat = selectedCategory.toLowerCase();
      if (!sCat.includes(targetCat) && !targetCat.includes(sCat)) return false;
    }
    // Search Query Filter (Matches Company Name, Description, Category, Product Name, or Staff)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchComp = (s.company_name || "").toLowerCase().includes(q);
      const matchDesc = (s.description || "").toLowerCase().includes(q);
      const matchCat = (s.category || "").toLowerCase().includes(q);
      const matchProd = (s.products || []).some(
        (p) => (p.name || "").toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q)
      );
      const matchStaff = (s.staff || []).some(
        (st) => (st.name || "").toLowerCase().includes(q) || (st.role || "").toLowerCase().includes(q)
      );
      if (!matchComp && !matchDesc && !matchCat && !matchProd && !matchStaff) return false;
    }
    return true;
  });

  const handleOpenMessageThread = (targetExhibitor, expoTitle) => {
    if (!currentUser || currentUser.role === "public") {
      showToast("Authentication Required", "Please log in to message exhibitors.", "error");
      setActiveView("login");
      return;
    }
    if (onContactExhibitor) {
      const exhObj = typeof targetExhibitor === "object" ? targetExhibitor : { _id: targetExhibitor };
      onContactExhibitor(exhObj, expoTitle);
    } else if (onMessageExhibitor) {
      const targetId = typeof targetExhibitor === "object" ? (targetExhibitor.exhibitor_id || targetExhibitor._id) : targetExhibitor;
      onMessageExhibitor(targetId);
    } else {
      setActiveView("messages");
    }
  };

  const handleViewFloorPlanAction = (expoId) => {
    const targetExpoId = typeof expoId === "object" ? expoId?._id : expoId;
    if (onViewFloorPlan) {
      onViewFloorPlan(targetExpoId);
    } else if (onSelectExpo) {
      onSelectExpo(targetExpoId, "floorplan");
    } else {
      if (targetExpoId) setContextSelectedExpoId(targetExpoId);
      setActiveView("floorplan");
    }
  };

  return (
    <div id="exhibitor-search-view" className="space-y-8 font-body">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E5E7EB] dark:border-white/10 pb-6">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#1488A6] dark:text-[#38B2AC]">
            Discovery & Vendors
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1F2937] dark:text-[#F8FAFC] tracking-tight mt-1 font-heading">
            Browse Verified Exhibitors & Booths
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#CBD5E1]/80 mt-1.5 max-w-xl leading-relaxed">
            Search verified corporate vendors, explore digital product catalogs, and send direct inquiries to booth attendants.
          </p>
        </div>

        {/* Actions & Count Tab */}
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          {onOpenAIMatchmaker && (
            <button
              onClick={() => onOpenAIMatchmaker(searchQuery || "I want edge computing hardware and IoT sensors")}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#1488A6] to-[#38B2AC] hover:from-[#117690] hover:to-[#2C9A93] text-white shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Booth Matchmaker</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#1A202C] p-1.5 rounded-2xl text-xs border border-[#E5E7EB] dark:border-white/10">
            <span className="px-3.5 py-1.5 rounded-xl font-bold bg-white dark:bg-[#203748] text-[#1488A6] dark:text-[#38B2AC] shadow-xs border border-[#E5E7EB] dark:border-white/10">
              All Exhibitors ({dynamicExhibitorsList.length})
            </span>
          </div>
        </div>
      </div>

      {/* Filter Bar: Search Input + Category Selector + Dynamic Expo Selector */}
      <div className="bg-white dark:bg-[#1A202C] p-4 rounded-2xl border border-[#E5E7EB] dark:border-white/10 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Search Query Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#CBD5E1]/60" />
          <input
            type="text"
            placeholder="Search company name, products, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC]"
          />
        </div>

        {/* Dropdowns: Category Filter & Dynamic Expo Selector */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-semibold text-[#6B7280] dark:text-[#CBD5E1]/80 shrink-0">
              Category:
            </label>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC] cursor-pointer"
              >
                <option value="all">All Categories</option>
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#6B7280] dark:text-[#CBD5E1]/60" />
            </div>
          </div>

          {/* Expo Dropdown */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-semibold text-[#6B7280] dark:text-[#CBD5E1]/80 shrink-0 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#1488A6] dark:text-[#38B2AC]" />
              Expo:
            </label>
            <div className="relative">
              <select
                value={selectedExpoId}
                onChange={(e) => setSelectedExpoId(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC] cursor-pointer max-w-[180px] sm:max-w-[220px] truncate"
              >
                <option value="all">All Exhibitions ({expos.length})</option>
                {expos.map((e) => (
                  <option key={e._id} value={e._id}>
                    {e.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#6B7280] dark:text-[#CBD5E1]/60" />
            </div>
          </div>

          <span className="text-xs font-mono font-bold teal-badge px-2.5 py-1 rounded-lg shrink-0">
            {filteredShowcases.length} Exhibitors
          </span>
        </div>
      </div>

      {/* Exhibitor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredShowcases.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white dark:bg-[#1A202C] rounded-3xl border border-[#E5E7EB] dark:border-white/10 p-6 space-y-2">
            <Building2 className="w-10 h-10 mx-auto text-[#6B7280] dark:text-[#CBD5E1]/40" />
            <h4 className="text-base font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading">
              No registered exhibitors found
            </h4>
            <p className="text-xs text-[#6B7280] dark:text-[#CBD5E1]/70 max-w-sm mx-auto">
              Exhibitors will appear here dynamically once their booth profile or application is approved.
            </p>
          </div>
        ) : (
          filteredShowcases.map((sc) => {
            const exhibitorId = sc.exhibitor_id || sc._id;
            const expoObj = expos.find((e) => String(e._id) === String(sc.expo_id));

            return (
              <div
                key={sc._id || `sc-${exhibitorId}`}
                className="bg-white dark:bg-[#1A202C] rounded-3xl border border-[#E5E7EB] dark:border-white/10 hover:border-[#38B2AC]/50 dark:hover:border-[#38B2AC]/50 shadow-xs hover:shadow-md transition-all flex flex-col justify-between p-6 space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      {sc.logo_url && getMediaUrl(sc.logo_url) ? (
                        <img
                          src={getMediaUrl(sc.logo_url)}
                          alt={sc.company_name}
                          className="w-12 h-12 rounded-2xl object-cover ring-2 ring-[#38B2AC]/40 shrink-0"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            if (e.currentTarget.nextElementSibling) {
                              e.currentTarget.nextElementSibling.style.display = "flex";
                            }
                          }}
                        />
                      ) : null}
                      <div
                        className={`w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-900 to-[#1488A6] text-white ${
                          sc.logo_url && getMediaUrl(sc.logo_url) ? "hidden" : "flex"
                        } items-center justify-center text-base font-bold font-mono group-hover:scale-105 transition-transform border border-white/10 shadow-xs shrink-0`}
                      >
                        {(sc.company_name || "EX").slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading line-clamp-1">
                          {sc.company_name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                          <button
                            type="button"
                            onClick={() => sc.expo_id && handleViewFloorPlanAction(sc.expo_id)}
                            title="View booth on floor plan"
                            className="text-[10px] font-mono font-bold teal-badge px-2 py-0.5 rounded flex items-center gap-1 hover:brightness-110 cursor-pointer"
                          >
                            <MapPin className="w-2.5 h-2.5" />
                            Booth {sc.booth_number || "Main Pavilion"}
                          </button>
                          {expoObj && (
                            <span className="text-[10px] text-[#6B7280] dark:text-[#CBD5E1]/60 font-mono truncate max-w-[120px]">
                              {expoObj.title}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#CBD5E1] line-clamp-3 leading-relaxed">
                    {sc.description || "Leading innovation & industry solution vendor."}
                  </p>

                  {/* Showcased Products Badges */}
                  {sc.products && sc.products.length > 0 ? (
                    <div className="space-y-1.5 pt-2 border-t border-[#E5E7EB] dark:border-white/10">
                      <span className="text-[10px] font-mono font-bold uppercase text-[#6B7280] dark:text-[#CBD5E1]/60 flex items-center gap-1">
                        <PackageCheck className="w-3 h-3 text-[#38B2AC]" /> Product Catalog ({sc.products.length}):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {sc.products.slice(0, 3).map((p, idx) => (
                          <span
                            key={p._id || p.id || `p-${idx}`}
                            className="px-2 py-0.5 bg-slate-100 dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded text-[10px] font-semibold text-[#1F2937] dark:text-[#CBD5E1]"
                          >
                            {p.name}
                          </span>
                        ))}
                        {sc.products.length > 3 && (
                          <span className="text-[10px] text-[#38B2AC] font-bold self-center">
                            +{sc.products.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-[#E5E7EB] dark:border-white/10 text-[11px] text-slate-400 italic">
                      Catalog pending configuration by exhibitor.
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-[#E5E7EB] dark:border-white/10 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setActiveShowcaseModal(sc)}
                    className="flex-1 py-2 rounded-xl border border-[#E5E7EB] dark:border-white/10 hover:bg-slate-100 dark:hover:bg-[#203748] text-[#1F2937] dark:text-[#CBD5E1] text-xs font-bold transition-colors cursor-pointer text-center"
                  >
                    View Catalog
                  </button>
                  {sc.expo_id && (
                    <button
                      onClick={() => handleViewFloorPlanAction(sc.expo_id)}
                      title="View booth location on interactive floor plan"
                      className="flex-1 py-2 rounded-xl border border-[#1488A6]/30 dark:border-[#38B2AC]/30 hover:bg-[#38B2AC]/10 text-[#1488A6] dark:text-[#38B2AC] text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Floor Plan</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CATALOG & FULL SHOWCASE MODAL */}
      {activeShowcaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200 font-body">
          <div className="bg-white dark:bg-[#1A202C] rounded-3xl shadow-2xl border border-[#E5E7EB] dark:border-white/10 max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden text-[#1F2937] dark:text-[#F8FAFC]">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 via-[#1488A6] to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between shrink-0 relative">
              <div className="flex items-center gap-3">
                {activeShowcaseModal.logo_url && getMediaUrl(activeShowcaseModal.logo_url) ? (
                  <img
                    src={getMediaUrl(activeShowcaseModal.logo_url)}
                    alt={activeShowcaseModal.company_name}
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-[#38B2AC]/40 shrink-0"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      if (e.currentTarget.nextElementSibling) {
                        e.currentTarget.nextElementSibling.style.display = "flex";
                      }
                    }}
                  />
                ) : null}
                <div
                  className={`w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md text-[#38B2AC] border border-white/20 ${
                    activeShowcaseModal.logo_url && getMediaUrl(activeShowcaseModal.logo_url) ? "hidden" : "flex"
                  } items-center justify-center font-mono font-bold text-sm shrink-0`}
                >
                  {(activeShowcaseModal.company_name || "EX").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#38B2AC]">
                      Exhibitor Showcase
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#38B2AC]/20 text-[#38B2AC] border border-[#38B2AC]/30">
                      Booth {activeShowcaseModal.booth_number || "Main Pavilion"}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white font-heading">
                    {activeShowcaseModal.company_name}
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {activeShowcaseModal.category || "Technology & Enterprise Solutions"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveShowcaseModal(null)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
              <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#CBD5E1] leading-relaxed">
                {activeShowcaseModal.description}
              </p>

            {/* Products Catalog List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#1F2937] dark:text-[#F8FAFC] uppercase tracking-wider font-heading flex items-center gap-1.5">
                <PackageCheck className="w-4 h-4 text-[#38B2AC]" /> Showcased Product Catalog
              </h4>
              
              {activeShowcaseModal.products && activeShowcaseModal.products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeShowcaseModal.products.map((p, idx) => (
                    <div
                      key={p._id || p.id || `prod-${idx}`}
                      className="p-3.5 bg-slate-50 dark:bg-[#0F172A] rounded-2xl border border-[#E5E7EB] dark:border-white/10 flex gap-3"
                    >
                      <img
                        src={getMediaUrl(p.image_url) || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=80"}
                        alt={p.name}
                        className="w-16 h-16 rounded-xl object-cover shrink-0 border border-[#E5E7EB] dark:border-white/10"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=80";
                        }}
                      />
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <span className="text-[10px] font-bold text-[#1488A6] dark:text-[#38B2AC] block font-mono uppercase">
                          {p.category || "General"}
                        </span>
                        <h5 className="text-xs font-bold text-[#1F2937] dark:text-[#F8FAFC] truncate font-heading">{p.name}</h5>
                        {p.price > 0 && (
                          <span className="text-[11px] font-mono font-bold text-[#1488A6] dark:text-[#38B2AC] block">
                            PKR {Number(p.price).toLocaleString()}
                          </span>
                        )}
                        <p className="text-[11px] text-[#6B7280] dark:text-[#CBD5E1]/70 line-clamp-2">
                          {p.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-slate-400 bg-slate-50 dark:bg-[#0F172A] rounded-2xl border border-dashed border-[#E5E7EB] dark:border-white/10">
                  No products configured for this booth catalog yet.
                </div>
              )}
            </div>

            {/* Staff Attendants */}
            {activeShowcaseModal.staff && activeShowcaseModal.staff.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-[#E5E7EB] dark:border-white/10">
                <h4 className="text-xs font-bold text-[#1F2937] dark:text-[#F8FAFC] uppercase tracking-wider font-heading flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#38B2AC]" /> Booth Staff Attendants
                </h4>
                <div className="flex flex-wrap gap-2">
                  {activeShowcaseModal.staff.map((st, idx) => (
                    <div
                      key={st._id || st.id || `st-${idx}`}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-xs flex items-center gap-2 text-[#1F2937] dark:text-[#CBD5E1]"
                    >
                      <Users className="w-3.5 h-3.5 text-[#1488A6] dark:text-[#38B2AC]" />
                      <span className="font-semibold">{st.name}</span>
                      {st.role && <span className="text-[#6B7280] dark:text-[#CBD5E1]/60">({st.role})</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="pt-4 border-t border-[#E5E7EB] dark:border-white/10 flex items-center justify-between gap-3">
              {activeShowcaseModal.expo_id && (
                <button
                  onClick={() => {
                    const targetExpo = activeShowcaseModal.expo_id;
                    setActiveShowcaseModal(null);
                    handleViewFloorPlanAction(targetExpo);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-[#1488A6]/30 dark:border-[#38B2AC]/30 hover:bg-[#38B2AC]/10 text-[#1488A6] dark:text-[#38B2AC] text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-[#38B2AC]" /> View Booth on Floor Plan
                </button>
              )}
              <button
                onClick={() => setActiveShowcaseModal(null)}
                className="px-4 py-2.5 rounded-xl border border-[#E5E7EB] dark:border-white/10 hover:bg-slate-100 dark:hover:bg-[#203748] text-[#1F2937] dark:text-[#CBD5E1] text-xs font-bold transition-colors cursor-pointer ml-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
  );
};

export default ExhibitorSearch;

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
  PackageCheck
} from "lucide-react";

export const ExhibitorSearch = ({ onMessageExhibitor }) => {
  const {
    showcases = [],
    showcase = [],
    booths = [],
    expos = [],
    applications = [],
    currentUser = {},
    sendMessage,
    showToast,
    setActiveView
  } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExpoId, setSelectedExpoId] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeShowcaseModal, setActiveShowcaseModal] = useState(null);

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

    exhibitorsMap[key] = {
      _id: b._id,
      exhibitor_id: exhId,
      expo_id: expoId,
      company_name: compName,
      logo_url: exhObj?.company_profile?.logo || exhObj?.profile_photo_url || null,
      booth_number: b.booth_number || "Assigned Booth",
      category: b.category || exhObj?.company_profile?.industry || "Technology",
      description: desc || `${compName} exhibition booth.`,
      products: (bDetails.products && Array.isArray(bDetails.products)) ? bDetails.products : [],
      staff: (bDetails.staff && Array.isArray(bDetails.staff)) ? bDetails.staff : []
    };
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
    const expoId = sc.expo_id;
    if (!exhId) return;

    if (isTestExhibitor(exhId, sc.company_name, sc.description)) return;

    const key = `${exhId}_${expoId || "default"}`;
    if (exhibitorsMap[key]) {
      exhibitorsMap[key] = {
        ...exhibitorsMap[key],
        company_name: sc.company_name || exhibitorsMap[key].company_name,
        description: sc.description || exhibitorsMap[key].description,
        products: (sc.products && sc.products.length > 0) ? sc.products : exhibitorsMap[key].products,
        staff: (sc.staff && sc.staff.length > 0) ? sc.staff : exhibitorsMap[key].staff
      };
    } else {
      exhibitorsMap[key] = {
        _id: sc._id,
        exhibitor_id: exhId,
        expo_id: expoId,
        company_name: sc.company_name,
        logo_url: sc.logo_url || null,
        booth_number: sc.booth_number || "Main Pavilion",
        category: sc.category || "Exhibitor",
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

  const handleOpenMessageThread = (targetExhibitorId) => {
    if (!currentUser || currentUser.role === "public") {
      showToast("Authentication Required", "Please log in to message exhibitors.", "error");
      setActiveView("login");
      return;
    }
    if (onMessageExhibitor) {
      onMessageExhibitor(targetExhibitorId);
    } else {
      setActiveView("messages");
    }
  };

  return (
    <div id="exhibitor-search-view" className="space-y-6 font-body">
      {/* Top Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#1F2937] dark:text-[#F8FAFC] tracking-tight font-heading">
          Exhibitor Search & Directory
        </h2>
        <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#CBD5E1] mt-0.5">
          Search and filter exhibitors based on categories, products, or keywords.
        </p>
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
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC] cursor-pointer"
            >
              <option value="all">All Categories</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Expo Dropdown */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-semibold text-[#6B7280] dark:text-[#CBD5E1]/80 shrink-0 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#1488A6] dark:text-[#38B2AC]" />
              Expo:
            </label>
            <select
              value={selectedExpoId}
              onChange={(e) => setSelectedExpoId(e.target.value)}
              className="px-3 py-2 text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38B2AC] cursor-pointer"
            >
              <option value="all">All Exhibitions ({expos.length})</option>
              {expos.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.title}
                </option>
              ))}
            </select>
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
                      {sc.logo_url ? (
                        <img
                          src={sc.logo_url}
                          alt={sc.company_name}
                          className="w-12 h-12 rounded-2xl object-cover ring-2 ring-[#38B2AC]/40 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-900 to-[#1488A6] text-white flex items-center justify-center text-base font-bold font-mono group-hover:scale-105 transition-transform border border-white/10 shadow-xs">
                          {(sc.company_name || "EX").slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading line-clamp-1">
                          {sc.company_name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] font-mono font-bold teal-badge px-2 py-0.5 rounded">
                            Booth {sc.booth_number || "Main Pavilion"}
                          </span>
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
                    className="px-3.5 py-2 rounded-xl border border-[#E5E7EB] dark:border-white/10 hover:bg-slate-100 dark:hover:bg-[#203748] text-[#1F2937] dark:text-[#CBD5E1] text-xs font-bold transition-colors cursor-pointer"
                  >
                    View Catalog
                  </button>

                  <button
                    onClick={() => handleOpenMessageThread(exhibitorId)}
                    className="px-3.5 py-2 rounded-xl btn-teal-primary text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-white" /> Message Booth
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CATALOG & FULL SHOWCASE MODAL */}
      {activeShowcaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1A202C] rounded-3xl shadow-2xl border border-[#E5E7EB] dark:border-white/10 max-w-2xl w-full p-6 space-y-5 my-auto max-h-[90vh] overflow-y-auto text-[#1F2937] dark:text-[#F8FAFC]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-white/10 pb-4">
              <div className="flex items-center gap-3">
                {activeShowcaseModal.logo_url ? (
                  <img
                    src={activeShowcaseModal.logo_url}
                    alt={activeShowcaseModal.company_name}
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-[#38B2AC]/40"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-900 to-[#1488A6] text-white flex items-center justify-center font-mono font-bold text-base border border-white/10 shadow-xs">
                    {(activeShowcaseModal.company_name || "EX").slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="text-base sm:text-lg font-bold font-heading">
                    {activeShowcaseModal.company_name}
                  </h3>
                  <span className="text-xs font-mono font-bold teal-badge px-2 py-0.5 rounded">
                    Booth {activeShowcaseModal.booth_number || "Main Pavilion"}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setActiveShowcaseModal(null)}
                className="p-1.5 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-[#6B7280] dark:text-[#CBD5E1] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

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
                        src={p.image_url || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=80"}
                        alt={p.name}
                        className="w-16 h-16 rounded-xl object-cover shrink-0 border border-[#E5E7EB] dark:border-white/10"
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
              <button
                onClick={() => {
                  const targetId = activeShowcaseModal.exhibitor_id || activeShowcaseModal._id;
                  setActiveShowcaseModal(null);
                  handleOpenMessageThread(targetId);
                }}
                className="w-full py-2.5 rounded-xl btn-teal-primary text-white text-xs sm:text-sm font-bold shadow-md flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-white" /> Start Direct Chat with {activeShowcaseModal.company_name}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExhibitorSearch;

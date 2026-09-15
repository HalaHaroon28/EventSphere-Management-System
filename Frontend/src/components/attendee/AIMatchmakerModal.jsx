import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import {
  Search,
  X,
  MapPin,
  MessageSquare,
  Building2,
  Calendar,
  ChevronRight,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  HelpCircle,
  Layers,
  ArrowUpRight
} from "lucide-react";

const SUGGESTED_PROMPTS = [
  { label: "Edge Computing & IoT", query: "I want edge computing hardware and IoT sensors" },
  { label: "AI & Neural Vision", query: "Looking for computer vision models, neural accelerators, and AI cameras" },
  { label: "Zero-Trust Cybersecurity", query: "Enterprise zero-trust network security, firewalls, and cyber defense" },
  { label: "CleanTech & Smart Grid", query: "Renewable energy tracking, smart grid micro-sensors, and eco IoT" },
  { label: "Digital Twins & 3D Spatial", query: "Industrial digital twins, AR headsets, and spatial 3D mapping" }
];

export const AIMatchmakerModal = ({
  isOpen,
  onClose,
  initialQuery = "",
  onLocateBooth,
  onMessageExhibitor
}) => {
  const { booths = [], expos = [], applications = [], setSelectedExpoId, setActiveView, showToast } = useApp();

  const [query, setQuery] = useState(initialQuery);
  const [selectedExpo, setSelectedExpo] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [loadingStep, setLoadingStep] = useState(0);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    let interval;
    if (isLoading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < 2 ? prev + 1 : prev));
      }, 700);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isOpen) return null;

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

  const buildCatalog = () => {
    const catalog = [];
    const seenBooths = new Set();

    (booths || []).forEach((b) => {
      const bExpoId = typeof b.expo_id === "object" ? b.expo_id?._id : b.expo_id;

      if (selectedExpo !== "all" && String(bExpoId) !== String(selectedExpo)) {
        return;
      }

      const isOccupied = b.status === "booked" || b.status === "reserved" || (b.exhibitor_id && b.exhibitor_id !== null);
      const exhId = typeof b.exhibitor_id === "object" ? b.exhibitor_id?._id : b.exhibitor_id;
      if (!isOccupied || !exhId) return;

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

      if (isTestExhibitor(exhId, compName, desc)) return;

      const num = b.booth_number || "A-01";
      if (seenBooths.has(num)) return;
      seenBooths.add(num);

      const productNames = [];
      if (bDetails.products && Array.isArray(bDetails.products)) {
        bDetails.products.forEach((p) => {
          if (p?.name) productNames.push(p.name);
        });
      }

      const hallLetter = num.charAt(0).toUpperCase();
      let hallName = b.hall || `Hall ${hallLetter}`;
      if (!b.hall) {
        if (hallLetter === "A") hallName = "Hall A (Main Tech)";
        else if (hallLetter === "B") hallName = "Hall B (Robotics & AI)";
        else if (hallLetter === "C") hallName = "Hall C (Innovation & Startups)";
      }

      const expoObj = expos.find((e) => String(e._id) === String(bExpoId) || String(e.id) === String(bExpoId));
      const expoTitle = expoObj?.title || b.expo_id?.title || (expos.length > 0 ? expos[0]?.title : "EventSphere Tech Summit");

      catalog.push({
        booth_id: b._id,
        booth_number: num,
        company_name: compName,
        category: b.category || exhObj?.category || (b.size === "large" ? "Enterprise Solutions" : "Technology & Hardware"),
        description: desc || `Exhibitor located at Booth ${num}`,
        products: productNames.length > 0 ? productNames : ["Enterprise Technology Solution", "Hardware Demo"],
        hall: hallName,
        exhibitor_id: exhId,
        expo_id: bExpoId,
        expo_title: expoTitle
      });
    });

    (applications || []).forEach((app) => {
      if (app.status === "approved") {
        const exhId = app.exhibitor_id?._id || app.exhibitor_id;
        const expoId = app.expo_id?._id || app.expo_id;
        if (!exhId) return;

        if (selectedExpo !== "all" && String(expoId) !== String(selectedExpo)) return;

        const compName = app.company_name || app.company_profile?.company_name || "";
        const desc = app.description || app.products_services || "";

        if (isTestExhibitor(exhId, compName, desc)) return;

        const boothNumber = app.booth_id?.booth_number || app.booth_number || "Main Floor";
        if (seenBooths.has(boothNumber)) return;
        seenBooths.add(boothNumber);

        const productNames = [];
        if (Array.isArray(app.products)) {
          app.products.forEach((p) => {
            if (p?.name) productNames.push(p.name);
          });
        } else if (app.products_services) {
          productNames.push(app.products_services);
        }

        const expoObj = expos.find((e) => String(e._id) === String(expoId) || String(e.id) === String(expoId));
        const expoTitle = expoObj?.title || app.expo_id?.title || (expos.length > 0 ? expos[0]?.title : "EventSphere Tech Summit");

        catalog.push({
          booth_id: app.booth_id?._id || app.booth_id,
          booth_number: boothNumber,
          company_name: compName,
          category: app.category || "Technology",
          description: desc || `Verified Exhibitor at Booth ${boothNumber}`,
          products: productNames.length > 0 ? productNames : ["Enterprise Solutions", "Product Demo"],
          hall: app.hall || "Main Exhibition Floor",
          exhibitor_id: exhId,
          expo_id: expoId,
          expo_title: expoTitle
        });
      }
    });

    return catalog;
  };

  const handleMatch = async (searchPrompt = query) => {
    const promptToUse = (searchPrompt || "").trim();
    if (!promptToUse) {
      if (showToast) showToast("Query Required", "Please enter what you are looking for at the expo.", "warning");
      return;
    }

    setIsLoading(true);
    setError(null);

    const catalog = buildCatalog();
    const currentExpoObj = expos.find((e) => String(e._id) === String(selectedExpo));

    if (catalog.length === 0) {
      setResults({
        ai_summary: selectedExpo !== "all"
          ? `No active exhibitor booths are registered for "${currentExpoObj?.title || 'this summit'}" yet.`
          : "No active exhibitor booths are registered yet.",
        modelUsed: "database-query",
        recommendations: []
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/ai/match-booths", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: promptToUse,
          expoId: selectedExpo !== "all" ? selectedExpo : undefined,
          expoTitle: currentExpoObj?.title || "EventSphere Global Tech Expo",
          catalog: catalog,
          model: "gemini-2.5-flash"
        })
      });

      if (!response.ok) {
        throw new Error(`Matchmaker service responded with status ${response.status}`);
      }

      const data = await response.json();
      if (data.success && Array.isArray(data.recommendations)) {
        const enriched = data.recommendations.map((rec) => {
          const matchInCatalog = catalog.find(
            (c) =>
              c.booth_number?.toLowerCase() === rec.booth_number?.toLowerCase() ||
              c.company_name?.toLowerCase().includes(rec.company_name?.toLowerCase()) ||
              rec.company_name?.toLowerCase().includes(c.company_name?.toLowerCase())
          );
          return {
            ...rec,
            booth_id: matchInCatalog?.booth_id,
            exhibitor_id: matchInCatalog?.exhibitor_id,
            expo_id: matchInCatalog?.expo_id || (selectedExpo !== "all" ? selectedExpo : expos[0]?._id),
            expo_title: matchInCatalog?.expo_title || currentExpoObj?.title || (expos[0]?.title || "EventSphere Tech Summit")
          };
        });

        setResults({
          ai_summary: data.ai_summary,
          modelUsed: data.modelUsed || "gemini-2.5-flash",
          recommendations: enriched
        });
      } else {
        throw new Error(data.error || "Failed to parse recommendations");
      }
    } catch (err) {
      console.error("Matchmaker API error:", err);
      setError("Unable to connect to Gemini Matchmaker service. Please try again or refine your query.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPrompt = (promptText) => {
    setQuery(promptText);
    handleMatch(promptText);
  };

  const handleNavigateToBooth = (rec) => {
    onClose();
    if (onLocateBooth) {
      onLocateBooth(rec);
    } else {
      if (rec.expo_id && setSelectedExpoId) {
        setSelectedExpoId(rec.expo_id);
      }
      if (setActiveView) {
        setActiveView("floorplan");
      }
    }
  };

  const handleMessage = (rec) => {
    onClose();
    if (onMessageExhibitor) {
      onMessageExhibitor(rec);
    } else if (setActiveView) {
      setActiveView("messages");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200 font-body">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-white dark:bg-[#1A202C] rounded-3xl border border-[#E5E7EB] dark:border-white/10 shadow-2xl overflow-hidden text-[#1F2937] dark:text-[#F8FAFC]">

        <div className="bg-gradient-to-r from-slate-900 via-[#1488A6] to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between shrink-0 relative">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-[#38B2AC] flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-[#38B2AC]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#38B2AC]">
                  AI Matchmaker
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white font-heading">
                Smart Booth Recommendations
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Match your technical needs and purchasing criteria with active summit exhibitors
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-5">

          <div className="p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3.5">
            <div className="flex flex-col sm:flex-row gap-3">

              <div className="sm:w-1/3">
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                  Summit / Expo
                </label>
                <div className="relative">
                  <select
                    value={selectedExpo}
                    onChange={(e) => setSelectedExpo(e.target.value)}
                    className="w-full text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2.5 text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none pr-8"
                  >
                    <option value="all">All Active Summits ({expos.length})</option>
                    {expos.map((exp) => (
                      <option key={exp._id} value={exp._id}>
                        {exp.title}
                      </option>
                    ))}
                  </select>
                  <ChevronRight className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none rotate-90" />
                </div>
              </div>

              <div className="sm:w-2/3">
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                  What are you looking for?
                </label>
                <div className="relative flex items-center">
                  <Search className="w-4 h-4 absolute left-3 text-slate-400" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleMatch();
                    }}
                    placeholder="e.g., edge computing hardware, IoT telemetry, cyber security..."
                    className="w-full pl-9 pr-24 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                  />
                  <button
                    onClick={() => handleMatch()}
                    disabled={isLoading || !query.trim()}
                    className="absolute right-1.5 px-3.5 py-1.5 rounded-md bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <span>Search</span>
                    )}
                  </button>
                </div>
              </div>

            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Suggested:
              </span>
              {SUGGESTED_PROMPTS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPrompt(item.query)}
                  className="px-2.5 py-1 rounded text-xs font-medium bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </div>

          </div>

          {isLoading && (
            <div className="py-12 px-6 rounded-xl bg-slate-900 text-white border border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
              <RefreshCw className="w-7 h-7 text-teal-400 animate-spin" />
              <div className="space-y-1">
                <h4 className="text-sm sm:text-base font-semibold text-white">
                  Synthesizing Exhibitor Recommendations
                </h4>
                <p className="text-xs text-slate-400 font-mono max-w-md">
                  {loadingStep === 0 && "Evaluating inquiry against verified catalog and booth profiles..."}
                  {loadingStep === 1 && "Analyzing product specifications, floor plans, and technical focus..."}
                  {loadingStep === 2 && "Finalizing top relevance matches..."}
                </p>
              </div>
            </div>
          )}

          {error && !isLoading && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs sm:text-sm flex items-center justify-between gap-3">
              <p>{error}</p>
              <button
                onClick={() => handleMatch()}
                className="px-3 py-1 bg-rose-600 text-white rounded-md text-xs font-semibold hover:bg-rose-700 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {results && !isLoading && (
            <div className="space-y-4 animate-fadeIn">

              <div className="p-3.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-teal-900 dark:text-teal-200 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                  <span>{results.ai_summary}</span>
                </div>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 shrink-0">
                  Target: "{query}"
                </span>
              </div>

              {results.recommendations.length === 0 ? (
                <div className="py-12 px-6 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-center space-y-2">
                  <Building2 className="w-8 h-8 mx-auto text-slate-400" />
                  <h4 className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200">
                    No Matching Exhibitor Booths Found
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    There are currently no active exhibitor booths matching your inquiry registered for this summit.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {results.recommendations.map((rec, index) => {
                    const rankBadgeLabel = index === 0 ? "Top Match" : `Match #${index + 1}`;
                    const score = rec.match_score || 95 - index * 4;

                    return (
                      <div
                        key={index}
                        className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-teal-500/40 dark:hover:border-teal-500/40 transition-all space-y-4"
                      >

                        <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">

                          <div className="flex flex-wrap items-center gap-2">

                            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                              {rankBadgeLabel}
                            </span>

                            <span className="px-2.5 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                              <span className="text-slate-500 dark:text-slate-400 font-semibold">Expo:</span>
                              <strong className="font-semibold text-slate-900 dark:text-white">{rec.expo_title}</strong>
                            </span>

                            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                              Booth {rec.booth_number} • {rec.hall || "Main Floor"}
                            </span>
                          </div>

                          <span className="text-xs font-mono font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded border border-teal-200 dark:border-teal-800">
                            {score}% Match
                          </span>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                              {rec.company_name}
                            </h4>
                            {rec.category && (
                              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                                Sector: {rec.category}
                              </p>
                            )}
                          </div>

                          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border-l-4 border-l-teal-600 dark:border-l-teal-400 border-y border-r border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                            <span className="font-bold text-teal-800 dark:text-teal-300">Why Visit: </span>
                            {rec.why_visit}
                          </div>

                          {rec.key_highlights && rec.key_highlights.length > 0 && (
                            <div className="space-y-1.5 pt-1">
                              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Key Technologies & Products:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {rec.key_highlights.map((prod, pIdx) => (
                                  <span
                                    key={pIdx}
                                    className="px-2.5 py-1 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                                  >
                                    {prod}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {rec.suggested_questions && rec.suggested_questions.length > 0 && (
                            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                              <HelpCircle className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                              <div className="space-y-0.5">
                                <span className="font-semibold text-slate-800 dark:text-slate-200">Recommended Inquiry for Staff:</span>
                                <p className="italic text-slate-700 dark:text-slate-300">"{rec.suggested_questions[0]}"</p>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <button
                            onClick={() => handleMessage(rec)}
                            className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                            <span>Message Exhibitor</span>
                          </button>

                          <button
                            onClick={() => handleNavigateToBooth(rec)}
                            className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <MapPin className="w-3.5 h-3.5" />
                            <span>Locate Booth {rec.booth_number} on Floor Plan</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

          {!results && !isLoading && (
            <div className="py-10 px-4 text-center rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
              <Building2 className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200">
                Database Exhibitor Matchmaking
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Enter your technology criteria above or choose a suggested topic to find the top 3 booths registered tailored to your requirements.
              </p>
            </div>
          )}

        </div>

        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 shrink-0">
          <span className="font-mono text-[11px]">EventSphere Intelligence Engine</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default AIMatchmakerModal;

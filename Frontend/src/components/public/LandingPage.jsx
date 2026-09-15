import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { getExpoImage, EXPO_IMAGE_PRESETS } from "../../utils/expoImages";
import {
  Calendar,
  Grid,
  Building2,
  Ticket,
  Clock,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Shield,
  Zap,
  Users,
  ChevronDown,
  Mail,
  Phone,
  MapPin,
  Send,
  Star,
  Layers,
  Sparkles,
  TrendingUp,
  Award,
  Globe,
  Sliders,
  Check,
  QrCode,
  Compass,
  ArrowUpRight,
  Play
} from "lucide-react";

export const LandingPage = ({
  onSelectExpo,
  onRegisterPass,
  onApplyExhibitor,
  onOpenAuth
}) => {
  const { expos = [], loginAs, setActiveView, showToast, submitFeedback } = useApp();

  const [activeHeroIndex, setActiveHeroIndex] = useState(0);

  const [openFaq, setOpenFaq] = useState(0);

  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    company: "",
    expo_id: "",
    inquiryType: "enterprise",
    message: ""
  });
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const heroShowcaseList = expos.length > 0
    ? expos.slice(0, 4).map((e, i) => ({
      id: e._id || e.id,
      title: e.title || "Global Technology Summit",
      category: e.category || "Technology",
      venue: e.venue || "Moscone Center",
      location: e.location || "San Francisco, CA",
      date: e.date ? new Date(e.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "Upcoming",
      image: getExpoImage(e, i),
      booths: e.total_booths || 48,
      description: e.description || "The premier annual technology exhibition connecting global pioneers, enterprise vendors, and visionary founders."
    }))
    : EXPO_IMAGE_PRESETS.slice(0, 4).map((p, i) => ({
      id: `featured_${i}`,
      title: p.title,
      category: p.category.toUpperCase(),
      venue: "Convention Center",
      location: p.location,
      date: "Oct 15 - 18, 2026",
      image: p.url,
      booths: 60,
      description: "Experience breakthrough innovations, interactive corporate showcases, and keynotes from industry leaders."
    }));

  const activeHero = heroShowcaseList[activeHeroIndex] || heroShowcaseList[0];

  useEffect(() => {
    if (heroShowcaseList.length <= 1) return;
    const interval = setInterval(() => {
      setActiveHeroIndex((prev) => (prev + 1) % heroShowcaseList.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroShowcaseList.length]);

  useEffect(() => {
    if (expos.length > 0 && !contactForm.expo_id) {
      setContactForm((prev) => ({ ...prev, expo_id: expos[0]._id }));
    }
  }, [expos]);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      showToast("Missing Information", "Please fill in your name, email, and message.", "error");
      return;
    }

    const selectedExpoId = contactForm.expo_id || (expos.length > 0 ? expos[0]._id : null);
    if (!selectedExpoId) {
      showToast("No Expo Available", "Please wait for expos to load or select an expo.", "error");
      return;
    }

    setIsSubmittingContact(true);
    try {
      const res = await submitFeedback({
        name: contactForm.name.trim(),
        email: contactForm.email.trim(),
        company: contactForm.company.trim(),
        expo_id: selectedExpoId,
        inquiryType: contactForm.inquiryType,
        type: contactForm.inquiryType,
        content: contactForm.message.trim(),
        comments: contactForm.message.trim(),
        message: contactForm.message.trim()
      });

      if (res) {
        setContactSubmitted(true);
        setContactForm({
          name: "",
          email: "",
          company: "",
          expo_id: expos.length > 0 ? expos[0]._id : "",
          inquiryType: "enterprise",
          message: ""
        });
      }
    } catch (err) {
      console.error("Error submitting contact inquiry:", err);
    } finally {
      setIsSubmittingContact(false);
    }
  };

  const statistics = [
    { label: "Global Expos", value: "120+", subtext: "Across 42 countries", icon: Globe },
    { label: "Active Exhibitors", value: "340+", subtext: "Enterprise showcases", icon: Building2 },
    { label: "Verified Attendees", value: "1,200+", subtext: "Digital passes issued", icon: Users },
    { label: "Stage Keynotes", value: "1,300+", subtext: "Synchronized schedules", icon: Clock }
  ];

  const testimonials = [
    {
      quote: "EventSphere replaced four disconnected tools for our annual summit. The interactive floor matrix and instant exhibitor approval pipeline cut our operational overhead by over 40%.",
      author: "Marcus Vance",
      title: "VP of Global Events",
      company: "Apex Enterprise Summits",
      rating: 5,
      event: "Global Tech Nexus 2026"
    },
    {
      quote: "As an exhibitor at over 20 expos a year, EventSphere's booth booking and digital catalog manager are the smoothest in the industry. Lead generation began days before the doors even opened.",
      author: "Elena Rostova",
      title: "Head of Growth & Partnerships",
      company: "NeuroSynthetix Robotics",
      rating: 5,
      event: "AI World Congress"
    },
    {
      quote: "Checking in 14,000 attendees with EventSphere QR passes took under 45 minutes on morning one. The real-time telemetry dashboard gave our board immediate clarity.",
      author: "David K. Chen",
      title: "Executive Director",
      company: "CleanEnergy World Forum",
      rating: 5,
      event: "EcoHorizon Summit"
    }
  ];

  const faqs = [
    {
      q: "How does the interactive floor plan coordinate grid work?",
      a: "Organizers configure booth spaces across Hall A and Hall B on a live coordinate matrix. When exhibitors apply and select a booth, the system automatically locks the space to prevent double bookings in real time."
    },
    {
      q: "Can attendees save digital passes to Apple Wallet or mobile devices?",
      a: "Yes. Every registered attendee receives a high-fidelity digital pass equipped with a cryptographic holographic turnstile QR code, venue map coordinates, and instant PDF/image download capabilities."
    },
    {
      q: "What role portals are included with EventSphere?",
      a: "EventSphere includes dedicated, permission-isolated environments for Event Organizers (full operations suite), Exhibitors (applications, booth booking, catalogs, inquiry inbox), and Attendees (expo discovery, personalized agendas, digital wallet passes)."
    },
    {
      q: "How does the exhibitor approval pipeline function?",
      a: "Exhibitors submit company credentials and showcase summaries. Organizers review applications with 1-click approve/reject actions, automatically sending notifications and unlocking booth reservation privileges upon approval."
    },
    {
      q: "Can we export analytics and registration reports?",
      a: "Yes. All attendance telemetry, revenue totals, booth foot-traffic metrics, and registration manifests can be audited in real-time or exported directly from the Organizer Analytics hub."
    }
  ];

  return (
    <div id="landing-page-root" className="space-y-20 sm:space-y-28 pb-20 font-body">

      <section id="hero-section" className="relative pt-6 sm:pt-10 pb-12 sm:pb-20 overflow-hidden">

        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] sm:w-[900px] h-[350px] bg-gradient-to-r from-[#1488A6]/20 via-[#38B2AC]/15 to-[#F97316]/10 dark:from-[#1488A6]/25 dark:via-[#38B2AC]/20 dark:to-[#F97316]/15 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-[#38B2AC]/10 rounded-full blur-2xl pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 sm:space-y-8">
          <br /> <br />

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#1F2937] dark:text-[#F8FAFC] tracking-tight leading-[1.15] font-heading max-w-4xl mx-auto">

            Orchestrate, Exhibit & Attend{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#1488A6] via-[#0D9488] to-[#38B2AC]">
              World-Class <br /> Global Expos
            </span>
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-[#6B7280] dark:text-[#CBD5E1]/90 leading-relaxed max-w-2xl mx-auto">
            The all-in-one platform for international conventions, technology summits, and trade exhibitions.
            Experience real-time interactive floor plan matrices, cryptographic QR turnstiles, and synchronized keynote agendas.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              id="hero-explore-expos-btn"
              onClick={() => setActiveView("expos")}
              className="w-full sm:w-auto py-3.5 px-8 rounded-2xl btn-teal-primary text-white font-black tracking-wide text-sm sm:text-base shadow-xl shadow-[#1488A6]/25 hover:shadow-2xl hover:scale-[1.02] transition-all duration-200 cursor-pointer flex items-center justify-center gap-3 group"
            >
              <span>EXPLORE LIVE EXPOS</span>
              <ArrowRight className="w-4 h-4 text-teal-200 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => {
                if (onSelectExpo && activeHero?.id && !activeHero.id.startsWith("featured_")) {
                  onSelectExpo(activeHero.id);
                } else {
                  setActiveView("expos");
                }
              }}
              className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-white dark:bg-[#1A202C] hover:bg-slate-50 dark:hover:bg-[#203748] text-[#1F2937] dark:text-white font-bold text-sm border border-[#E5E7EB] dark:border-white/10 shadow-xs hover:border-[#38B2AC]/40 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Ticket className="w-4 h-4 text-[#1488A6] dark:text-[#38B2AC]" />
              <span>Get Pass / Floor Plan</span>
            </button>
          </div>
        </div>
      </section>

      <section id="featured-expos-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] dark:text-[#F8FAFC] tracking-tight font-heading">
              Featured Global Summits
            </h2>
            <p className="text-[#6B7280] dark:text-[#CBD5E1]/80 text-xs sm:text-sm mt-1 max-w-xl">
              Discover industry conventions, inspect interactive coordinate floor plans, and secure your verified attendee pass.
            </p>
          </div>

          <button
            onClick={() => setActiveView("expos")}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1A202C] dark:hover:bg-[#203748] text-[#1F2937] dark:text-white font-bold text-xs border border-[#E5E7EB] dark:border-white/10 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <span>View All Summits</span>
            <ArrowRight className="w-4 h-4 text-[#1488A6] dark:text-[#38B2AC]" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {(expos.length > 0 ? expos.slice(0, 3) : heroShowcaseList.slice(0, 3)).map((expo, idx) => {
            const expoId = expo._id || expo.id;
            const imgSrc = getExpoImage(expo, idx);
            const dateStr = expo.date ? new Date(expo.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "Upcoming";

            return (
              <div
                key={expoId || idx}
                className="saas-card saas-card-hover rounded-3xl overflow-hidden flex flex-col justify-between group border border-[#E5E7EB] dark:border-white/10 shadow-sm"
              >
                <div>

                  <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-900">
                    <img
                      src={imgSrc}
                      alt={expo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-950/80 backdrop-blur-md text-[#38B2AC] border border-[#38B2AC]/40">
                        {expo.category || "Technology"}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-950/80 backdrop-blur-md text-emerald-300 border border-emerald-500/40">
                        {expo.status || "Upcoming"}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-4 text-xs font-mono font-medium text-slate-200 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#38B2AC]" />
                      <span>{dateStr}</span>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6 space-y-3">
                    <h3
                      onClick={() => onSelectExpo && expoId && onSelectExpo(expoId)}
                      className="text-base sm:text-lg font-bold font-heading text-[#1F2937] dark:text-[#F8FAFC] group-hover:text-[#1488A6] dark:group-hover:text-[#38B2AC] transition-colors line-clamp-1 cursor-pointer"
                    >
                      {expo.title}
                    </h3>

                    <p className="text-xs text-[#6B7280] dark:text-[#CBD5E1]/80 line-clamp-2 leading-relaxed">
                      {expo.description}
                    </p>

                    <div className="pt-2 border-t border-[#E5E7EB] dark:border-white/10 space-y-1.5 text-xs text-[#6B7280] dark:text-[#CBD5E1]/70">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#38B2AC] shrink-0" />
                        <span className="truncate">{expo.venue ? `${expo.venue}, ${expo.location}` : (expo.location || "Global Convention Hall")}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-[#38B2AC] shrink-0" />
                        <span className="font-mono text-[#1F2937] dark:text-[#CBD5E1]">{expo.total_booths || 40} Exhibition Booths</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-6 pt-0 flex items-center justify-between border-t border-[#E5E7EB] dark:border-white/10 mt-auto">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Free Attendee Pass
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (onRegisterPass && expoId) {
                          onRegisterPass(expoId);
                        } else {
                          setActiveView("expos");
                        }
                      }}
                      className="px-3.5 py-2 rounded-xl btn-teal-primary text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      <span>Get Pass</span>
                    </button>

                    <button
                      onClick={() => onSelectExpo && expoId && onSelectExpo(expoId)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#203748] dark:hover:bg-[#203748]/80 text-[#1F2937] dark:text-[#CBD5E1] transition-colors cursor-pointer border border-[#E5E7EB] dark:border-white/10"
                      title="View Details"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section id="pillars-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#1F2937] dark:text-[#F8FAFC] tracking-tight font-heading">
            Tailored Experiences Across The Convention Lifecycle
          </h2>
          <p className="text-[#6B7280] dark:text-[#CBD5E1]/80 text-xs sm:text-base leading-relaxed">
            Whether you are coordinating multi-hall staging, exhibiting cutting-edge hardware, or attending keynotes, EventSphere powers your workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">

          <div className="saas-card rounded-3xl p-6 sm:p-8 space-y-5 saas-card-hover flex flex-col justify-between border border-[#E5E7EB] dark:border-white/10">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#1488A6]/10 text-[#1488A6] dark:bg-slate-800 dark:text-[#38B2AC] flex items-center justify-center shadow-xs">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading">
                For Event Organizers
              </h3>
              <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#CBD5E1]/80 leading-relaxed">
                Full lifecycle summit command. Design interactive coordinate floor plans, manage exhibitor review pipelines, and monitor live turnstile telemetry.
              </p>
              <ul className="space-y-2.5 text-xs text-[#6B7280] dark:text-[#CBD5E1]/80 pt-2 border-t border-[#E5E7EB] dark:border-white/10">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1488A6] dark:text-[#38B2AC] shrink-0" />
                  <span>Interactive Hall A/B floor coordinate matrix</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1488A6] dark:text-[#38B2AC] shrink-0" />
                  <span>1-Click exhibitor vetting & booth confirmations</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1488A6] dark:text-[#38B2AC] shrink-0" />
                  <span>Real-time check-in velocity telemetry</span>
                </li>
              </ul>
            </div>
            <div className="pt-4">
              <button
                onClick={() => onOpenAuth && onOpenAuth("login", "organizer")}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1A202C] dark:hover:bg-[#203748] text-[#1F2937] dark:text-white font-bold text-xs border border-[#E5E7EB] dark:border-white/10 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Organizer Suite</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#1488A6] dark:text-[#38B2AC]" />
              </button>
            </div>
          </div>

          <div className="saas-card rounded-3xl p-6 sm:p-8 space-y-5 saas-card-hover flex flex-col justify-between border-2 border-[#1488A6] dark:border-[#38B2AC] relative shadow-lg">
            <div className="absolute -top-3 left-6">
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#1488A6]/10 text-[#1488A6] dark:bg-slate-800 dark:text-[#38B2AC] flex items-center justify-center shadow-xs">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading">
                For Corporate Exhibitors
              </h3>
              <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#CBD5E1]/80 leading-relaxed">
                Maximize corporate presence. Reserve prime floor positions, publish digital hardware catalogs, and engage attendees with direct lead inboxes.
              </p>
              <ul className="space-y-2.5 text-xs text-[#6B7280] dark:text-[#CBD5E1]/80 pt-2 border-t border-[#E5E7EB] dark:border-white/10">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1488A6] dark:text-[#38B2AC] shrink-0" />
                  <span>Instant visual booth selection & locks</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1488A6] dark:text-[#38B2AC] shrink-0" />
                  <span>Rich digital showcase & catalog publisher</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1488A6] dark:text-[#38B2AC] shrink-0" />
                  <span>Direct attendee inquiry messaging inbox</span>
                </li>
              </ul>
            </div>
            <div className="pt-4">
              <button
                onClick={() => onOpenAuth && onOpenAuth("login", "exhibitor")}
                className="w-full py-2.5 px-4 rounded-xl btn-teal-primary text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Exhibitor Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="saas-card rounded-3xl p-6 sm:p-8 space-y-5 saas-card-hover flex flex-col justify-between border border-[#E5E7EB] dark:border-white/10">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#1488A6]/10 text-[#1488A6] dark:bg-slate-800 dark:text-[#38B2AC] flex items-center justify-center shadow-xs">
                <Ticket className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading">
                For Summit Attendees
              </h3>
              <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#CBD5E1]/80 leading-relaxed">
                Frictionless convention navigation. Claim digital QR passes, bookmark keynote tracks, browse vendor catalogs, and locate booths in real time.
              </p>
              <ul className="space-y-2.5 text-xs text-[#6B7280] dark:text-[#CBD5E1]/80 pt-2 border-t border-[#E5E7EB] dark:border-white/10">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1488A6] dark:text-[#38B2AC] shrink-0" />
                  <span>Holographic digital wallet turnstile QR pass</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1488A6] dark:text-[#38B2AC] shrink-0" />
                  <span>Personalized keynote & workshop agenda builder</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1488A6] dark:text-[#38B2AC] shrink-0" />
                  <span>Interactive booth directory & vendor chats</span>
                </li>
              </ul>
            </div>
            <div className="pt-4">
              <button
                onClick={() => onOpenAuth && onOpenAuth("login", "attendee")}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1A202C] dark:hover:bg-[#203748] text-[#1F2937] dark:text-white font-bold text-xs border border-[#E5E7EB] dark:border-white/10 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Attendee Hub</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#1488A6] dark:text-[#38B2AC]" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="statistics-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="saas-card rounded-3xl p-8 sm:p-12 border border-[#E5E7EB] dark:border-white/10 shadow-sm">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center divide-y sm:divide-y-0 sm:divide-x divide-[#E5E7EB] dark:divide-white/10">
            {statistics.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className={`space-y-2 ${idx > 0 ? "pt-6 sm:pt-0" : ""}`}>
                  <div className="w-10 h-10 mx-auto rounded-xl bg-teal-50 dark:bg-[#203748] text-[#1488A6] dark:text-[#38B2AC] flex items-center justify-center mb-3 shadow-xs">
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-3xl sm:text-4xl font-extrabold text-[#1F2937] dark:text-[#F8FAFC] tracking-tight font-heading">
                    {stat.value}
                  </p>
                  <h4 className="text-xs sm:text-sm font-bold text-[#1F2937] dark:text-[#CBD5E1] font-heading">
                    {stat.label}
                  </h4>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#CBD5E1]/60 font-mono">
                    {stat.subtext}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="testimonials-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] dark:text-[#F8FAFC] tracking-tight font-heading">
            Trusted by Commercial Organizers Worldwide
          </h2>
          <p className="text-[#6B7280] dark:text-[#CBD5E1]/80 text-xs sm:text-sm leading-relaxed">
            See how international summit directors and enterprise exhibitors rely on EventSphere.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="saas-card rounded-3xl p-6 sm:p-8 space-y-4 flex flex-col justify-between saas-card-hover border border-[#E5E7EB] dark:border-white/10"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-[#1488A6] dark:text-[#38B2AC]">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#1488A6] dark:fill-[#38B2AC]" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-[#1F2937] dark:text-[#CBD5E1]/90 leading-relaxed italic">
                  "{t.quote}"
                </p>
              </div>

              <div className="pt-4 border-t border-[#E5E7EB] dark:border-white/10 space-y-0.5">
                <h4 className="text-xs sm:text-sm font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading">
                  {t.author}
                </h4>
                <p className="text-[11px] text-[#6B7280] dark:text-[#CBD5E1]/70">
                  {t.title} · <span className="font-semibold text-[#1F2937] dark:text-[#CBD5E1]">{t.company}</span>
                </p>
                <p className="text-[10px] text-[#1488A6] dark:text-[#38B2AC] font-mono font-medium pt-1">
                  Summit: {t.event}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="faq-section" className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-12 space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] dark:text-[#F8FAFC] tracking-tight font-heading">
            Frequently Asked Questions
          </h2>
          <p className="text-[#6B7280] dark:text-[#CBD5E1]/80 text-xs sm:text-sm">
            Everything you need to know about setting up, exhibiting, and attending summits on EventSphere.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="saas-card rounded-2xl border border-[#E5E7EB] dark:border-white/10 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 focus:outline-none cursor-pointer"
                >
                  <span className="font-bold text-xs sm:text-sm text-[#1F2937] dark:text-[#F8FAFC] font-heading">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 text-[#1488A6] dark:text-[#38B2AC]" : ""
                      }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-0 text-xs sm:text-sm text-[#6B7280] dark:text-[#CBD5E1]/80 leading-relaxed border-t border-[#E5E7EB] dark:border-white/10 mt-1">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section id="contact-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="saas-card rounded-3xl p-8 sm:p-12 border border-[#E5E7EB] dark:border-white/10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-3">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] dark:text-[#F8FAFC] tracking-tight font-heading">
                  Speak with an Event Specialist
                </h2>
                <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#CBD5E1]/80 leading-relaxed">
                  Planning a commercial summit or exploring enterprise expo infrastructure? Contact our solutions engineering team for custom floor plan setups, volume ticketing, or tailored integrations.
                </p>
              </div>

              <div className="space-y-4 pt-2 text-xs sm:text-sm text-[#6B7280] dark:text-[#CBD5E1]/80">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-[#1488A6] dark:text-[#38B2AC] flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#1F2937] dark:text-[#F8FAFC]">Email Inquiries</p>
                    <p className="text-[#6B7280] dark:text-[#CBD5E1]/70 font-mono text-xs">solutions@eventsphere.global</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-[#1488A6] dark:text-[#38B2AC] flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#1F2937] dark:text-[#F8FAFC]">Direct Line</p>
                    <p className="text-[#6B7280] dark:text-[#CBD5E1]/70 font-mono text-xs">+1 (800) 412-EXPO</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-[#1488A6] dark:text-[#38B2AC] flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#1F2937] dark:text-[#F8FAFC]">Global Operations Hub</p>
                    <p className="text-[#6B7280] dark:text-[#CBD5E1]/70 text-xs">500 Howard Street, Suite 1400, San Francisco, CA</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 bg-slate-50 dark:bg-[#0F172A]/60 p-6 sm:p-8 rounded-2xl border border-[#E5E7EB] dark:border-white/10">
              {contactSubmitted ? (
                <div className="text-center py-8 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading">Inquiry Transmitted</h4>
                  <p className="text-xs text-[#6B7280] dark:text-[#CBD5E1]/80 max-w-sm mx-auto">
                    Thank you for reaching out. An EventSphere enterprise specialist will review your request and respond within 24 business hours.
                  </p>
                  <button
                    onClick={() => setContactSubmitted(false)}
                    className="px-4 py-2 rounded-xl btn-teal-primary text-white text-xs font-semibold cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#1F2937] dark:text-[#CBD5E1]">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        placeholder="e.g. Sarah Jenkins"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1A202C] border border-[#E5E7EB] dark:border-white/10 text-xs sm:text-sm text-[#1F2937] dark:text-white focus-ring"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#1F2937] dark:text-[#CBD5E1]">
                        Work Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        placeholder="s.jenkins@company.com"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1A202C] border border-[#E5E7EB] dark:border-white/10 text-xs sm:text-sm text-[#1F2937] dark:text-white focus-ring"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#1F2937] dark:text-[#CBD5E1]">
                        Organization / Company
                      </label>
                      <input
                        type="text"
                        value={contactForm.company}
                        onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                        placeholder="Enterprise Summits LLC"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1A202C] border border-[#E5E7EB] dark:border-white/10 text-xs sm:text-sm text-[#1F2937] dark:text-white focus-ring"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#1F2937] dark:text-[#CBD5E1]">
                        Inquiry Scope
                      </label>
                      <select
                        value={contactForm.inquiryType}
                        onChange={(e) => setContactForm({ ...contactForm, inquiryType: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1A202C] border border-[#E5E7EB] dark:border-white/10 text-xs sm:text-sm text-[#1F2937] dark:text-white focus-ring cursor-pointer"
                      >
                        <option value="enterprise">Enterprise Expo Hosting (1,000+ attendees)</option>
                        <option value="exhibitor">Corporate Exhibitor Inquiries</option>
                        <option value="custom">Custom Floor Plan & Staging</option>
                        <option value="partnership">Technology & API Partnerships</option>
                        <option value="general">General Summit Inquiries</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#1F2937] dark:text-[#CBD5E1]">
                      Target Expo / Summit *
                    </label>
                    <select
                      required
                      value={contactForm.expo_id}
                      onChange={(e) => setContactForm({ ...contactForm, expo_id: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1A202C] border border-[#E5E7EB] dark:border-white/10 text-xs sm:text-sm text-[#1F2937] dark:text-white focus-ring cursor-pointer"
                    >
                      {expos.map((expo) => (
                        <option key={expo._id} value={expo._id}>
                          {expo.title} {expo.location ? `(${expo.location})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#1F2937] dark:text-[#CBD5E1]">
                      Message / Requirements *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      placeholder="Describe your upcoming event, expected dates, attendee volume, or specific floor plan requirements..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1A202C] border border-[#E5E7EB] dark:border-white/10 text-xs sm:text-sm text-[#1F2937] dark:text-white focus-ring"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingContact}
                    className="w-full py-3 px-6 rounded-xl btn-teal-primary text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmittingContact ? "Transmitting..." : "Submit Enterprise Inquiry"}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

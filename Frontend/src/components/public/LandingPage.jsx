import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
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
  Check
} from "lucide-react";

export const LandingPage = ({
  onSelectExpo,
  onRegisterPass,
  onApplyExhibitor,
  onOpenAuth
}) => {
  const { expos = [], loginAs, setActiveView, showToast, submitFeedback } = useApp();

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(0);

  // Contact Form State
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

  // Sync first expo if available
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

  const coreFeatures = [
    {
      icon: Calendar,
      title: "Expo Management",
      badge: "Multi-Track",
      description:
        "Comprehensive summit configuration with multi-hall staging, attendance limits, ticketing tiers, and live event monitoring.",
      highlights: ["Multi-venue staging & hall configuration", "Custom ticketing tiers & capacity rules", "Centralized summit publishing hub"]
    },
    {
      icon: Grid,
      title: "Booth Management",
      badge: "Spatial Engine",
      description:
        "Interactive architectural floor plan grid with real-time coordinate plotting, booth tiers, dimensions, and live reservation locks.",
      highlights: ["Coordinate-based floor matrix", "Automated double-booking prevention", "Custom square footage & power tags"]
    },
    {
      icon: Building2,
      title: "Exhibitor Management",
      badge: "Vendor Suite",
      description:
        "Full vendor onboarding pipeline with document verification, customizable digital product showcases, and attendee lead inboxes.",
      highlights: ["Streamlined application review pipeline", "Digital product catalog & team profiles", "Direct attendee inquiry routing"]
    },
    {
      icon: Ticket,
      title: "Attendee Registration",
      badge: "Turnstile QR",
      description:
        "Frictionless ticketing with instant digital passes, Apple Wallet-style rendering, unique cryptographic QR badges, and fast turnstile verification.",
      highlights: ["Instant digital wallet passes", "Cryptographic turnstile QR validation", "Automated attendee confirmation workflows"]
    },
    {
      icon: Clock,
      title: "Schedule Management",
      badge: "Timeline Sync",
      description:
        "Synchronized keynote scheduling across multiple stages with speaker profiles, room designations, and personalized attendee itineraries.",
      highlights: ["Multi-room agenda timeline", "Speaker bio & slide integration", "1-click attendee agenda bookmarks"]
    },
    {
      icon: BarChart3,
      title: "Analytics & Reporting",
      badge: "Live Telemetry",
      description:
        "Executive telemetry tracking attendance velocity, booth foot-traffic density, ticket revenue, and exportable post-summit intelligence.",
      highlights: ["Real-time check-in telemetry", "Booth foot-traffic & lead metrics", "Comprehensive revenue audit trails"]
    }
  ];

  const whyChooseItems = [
    {
      icon: Zap,
      title: "99.99% Operational Reliability",
      description: "Mission-critical cloud infrastructure designed to handle peak turnstile rushes and simultaneous exhibitor bookings with zero latency."
    },
    {
      icon: Sliders,
      title: "Unified Multi-Stakeholder Architecture",
      description: "Seamless synchronization between Organizers, Exhibitors, and Attendees on a single, coherent operating system."
    },
    {
      icon: Shield,
      title: "Enterprise-Grade Security & Verification",
      description: "Cryptographic QR pass validation, role-based access control, and encrypted transaction logging for complete auditability."
    },
    {
      icon: TrendingUp,
      title: "Actionable Real-Time Telemetry",
      description: "Live floor density heatmaps, registration velocities, and booth engagement metrics available to organizers instantly."
    }
  ];

  const statistics = [
    { label: "Events Managed", value: "120+", subtext: "Across 42 countries", icon: Globe },
    { label: "Exhibitors", value: "340+", subtext: "Active corporate showcases", icon: Building2 },
    { label: "Attendees", value: "1200+", subtext: "Seamlessly checked in", icon: Users },
    { label: "Sessions", value: "1300+", subtext: "Keynotes & workshops hosted", icon: Clock }
  ];

  const testimonials = [
    {
      quote: "EventSphere replaced four disconnected tools for our annual summit. The interactive floor plan and instant exhibitor approval pipeline cut our operational overhead by over 40%.",
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
      a: "Organizers can place, size, and price booth spaces across Hall A and Hall B on a live coordinate matrix. When exhibitors apply and select a booth, the system automatically locks the space to prevent double bookings in real time."
    },
    {
      q: "Can attendees save their digital passes to Apple Wallet or mobile devices?",
      a: "Yes. Every registered attendee receives a high-fidelity digital pass equipped with a unique holographic turnstile QR code, venue map coordinates, and instant print/download capabilities."
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
    <div id="landing-page-root" className="space-y-20 sm:space-y-28 pb-16 font-body">
      {/* 1. HERO SECTION */}
      <section id="hero-section" className="relative min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center pt-8 pb-16 sm:py-24 overflow-hidden">
        {/* Sleek Concentric Halo & Backdrop Rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[540px] md:w-[680px] h-[340px] sm:h-[540px] md:h-[680px] rounded-full border border-slate-200/60 dark:border-slate-800/80 pointer-events-none -z-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] sm:w-[380px] md:w-[480px] h-[240px] sm:h-[380px] md:h-[480px] rounded-full border border-teal-500/10 dark:border-[#38B2AC]/15 pointer-events-none -z-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 sm:w-[420px] h-80 sm:h-[420px] bg-gradient-to-tr from-[#1488A6]/20 via-[#EA580C]/10 to-[#38B2AC]/15 dark:from-[#1488A6]/25 dark:via-[#F97316]/15 dark:to-[#38B2AC]/20 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="w-full max-w-4xl mx-auto text-center space-y-8 sm:space-y-10 px-4 sm:px-6">
          {/* Clean Headline & Subtitle */}
          <div className="space-y-5 max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#1F2937] dark:text-[#F8FAFC] tracking-tight leading-[1.15] font-heading">
              Plan, Exhibit & Attend <br className="hidden sm:inline" />
              <span className="text-[#1488A6] dark:text-[#38B2AC]">Global Exhibitions</span>
            </h1>
            <p className="text-base sm:text-lg text-[#6B7280] dark:text-[#CBD5E1] leading-relaxed max-w-2xl mx-auto">
              The all-in-one exhibition platform for event organizers, corporate exhibitors, and attendees. Book floor booths, get instant digital QR passes, and explore live schedules.
            </p>
          </div>

          {/* Prominent EXPLORE EXPOS CTA Button */}
          <div className="flex flex-col items-center justify-center gap-4 pt-2">
            <button
              id="hero-explore-expos-btn"
              onClick={() => setActiveView("expos")}
              className="w-full sm:w-80 py-4 px-8 rounded-2xl bg-gradient-to-r from-[#0F4C5C] via-[#1488A6] to-[#0D9488] hover:from-[#0D3B47] hover:to-[#0F766E] text-white font-black tracking-wider text-base sm:text-lg shadow-xl shadow-[#1488A6]/25 dark:shadow-teal-950/60 hover:shadow-2xl hover:scale-[1.02] transition-all duration-200 cursor-pointer flex items-center justify-center gap-3 border border-teal-300/30"
            >
              <span>EXPLORE EXPOS</span>
              <ArrowRight className="w-5 h-5 text-teal-200" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. ABOUT EVENTSPHERE */}
      <section id="about-section" className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] dark:text-[#F8FAFC] tracking-tight font-heading">
            About EventSphere
          </h2>
          <p className="text-[#6B7280] dark:text-[#CBD5E1]/80 text-sm sm:text-base leading-relaxed">
            EventSphere is engineered to eliminate friction from commercial conventions, summits, and trade exhibitions through intelligent orchestration and role-tailored tooling.
          </p>
        </div>

        {/* 3 Stakeholder Value Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Organizers */}
          <div className="saas-card rounded-2xl p-6 sm:p-8 space-y-4 saas-card-hover">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-[#38B2AC] dark:bg-slate-800 flex items-center justify-center shadow-xs">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading">For Event Organizers</h3>
            <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#CBD5E1]/80 leading-relaxed">
              Complete command of event life cycles. Manage floor plans, approve exhibitor applications, orchestrate multi-stage agendas, and monitor live turnstile check-ins.
            </p>
            <ul className="space-y-2 text-xs text-[#6B7280] dark:text-[#CBD5E1]/80 pt-2 border-t border-[#E5E7EB] dark:border-white/10">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1488A6] dark:text-[#38B2AC] shrink-0" />
                <span>Interactive floor matrix configuration</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1488A6] dark:text-[#38B2AC] shrink-0" />
                <span>Automated application review workflows</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1488A6] dark:text-[#38B2AC] shrink-0" />
                <span>Live attendee attendance telemetry</span>
              </li>
            </ul>
          </div>

          {/* Exhibitors */}
          <div className="saas-card rounded-2xl p-6 sm:p-8 space-y-4 saas-card-hover border-t-2 border-t-[#1488A6] dark:border-t-[#38B2AC]">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-[#38B2AC] dark:bg-slate-800 flex items-center justify-center shadow-xs">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading">For Corporate Exhibitors</h3>
            <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#CBD5E1]/80 leading-relaxed">
              Streamline summit participation from application to teardown. Lock prime floor positions, curate digital product showcases, and capture attendee leads.
            </p>
            <ul className="space-y-2 text-xs text-[#6B7280] dark:text-[#CBD5E1]/80 pt-2 border-t border-[#E5E7EB] dark:border-white/10">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1488A6] dark:text-[#38B2AC] shrink-0" />
                <span>Instant visual booth selection</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1488A6] dark:text-[#38B2AC] shrink-0" />
                <span>Rich digital showcase & catalog publisher</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1488A6] dark:text-[#38B2AC] shrink-0" />
                <span>Direct attendee inquiry messaging</span>
              </li>
            </ul>
          </div>

          {/* Attendees */}
          <div className="saas-card rounded-2xl p-6 sm:p-8 space-y-4 saas-card-hover">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-[#38B2AC] dark:bg-slate-800 flex items-center justify-center shadow-xs">
              <Ticket className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading">For Attendees</h3>
            <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#CBD5E1]/80 leading-relaxed">
              Frictionless convention navigation. Claim digital QR passes, bookmark keynote sessions, browse exhibitor catalogs, and navigate venue floor plans.
            </p>
            <ul className="space-y-2 text-xs text-[#6B7280] dark:text-[#CBD5E1]/80 pt-2 border-t border-[#E5E7EB] dark:border-white/10">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1488A6] dark:text-[#38B2AC] shrink-0" />
                <span>Holographic digital wallet turnstile pass</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1488A6] dark:text-[#38B2AC] shrink-0" />
                <span>Personalized keynote agenda builder</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1488A6] dark:text-[#38B2AC] shrink-0" />
                <span>Interactive floor map & booth finder</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3. CORE FEATURES */}
      <section id="features-section" className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold teal-badge font-mono">
            <Layers className="w-3.5 h-3.5 text-[#1488A6] dark:text-[#38B2AC]" />
            <span>Platform Capabilities</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] dark:text-[#F8FAFC] tracking-tight font-heading">
            Comprehensive Event Infrastructure
          </h2>
          <p className="text-[#6B7280] dark:text-[#CBD5E1]/80 text-sm sm:text-base leading-relaxed">
            Six foundational modules designed for high-density trade exhibitions and enterprise technology summits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {coreFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="saas-card rounded-2xl p-6 sm:p-7 space-y-4 saas-card-hover flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-[#38B2AC] flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md teal-badge">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading">
                    {feat.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#CBD5E1]/80 leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#E5E7EB] dark:border-white/10 space-y-1.5">
                  {feat.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-[#6B7280] dark:text-[#CBD5E1]/80">
                      <Check className="w-3.5 h-3.5 text-[#1488A6] dark:text-[#38B2AC] shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. WHY CHOOSE EVENTSPHERE */}
      <section id="why-choose-section" className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-slate-900 dark:bg-slate-900/90 text-white rounded-3xl p-8 sm:p-12 lg:p-16 border border-[#1488A6]/20 shadow-xl relative overflow-hidden">
          {/* Subtle teal glow corner */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#1488A6]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#1488A6]/20 text-[#38B2AC] border border-[#38B2AC]/30 font-mono">
                <Award className="w-3.5 h-3.5" />
                <span>Enterprise Grade</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight text-white font-heading">
                Why Industry Leaders Choose EventSphere
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Traditional expo management is plagued by manual spreadsheets, double bookings, and registration bottlenecks. EventSphere brings modern SaaS precision to convention floors.
              </p>
              <div className="pt-4">
                <button
                  onClick={() => setActiveView("expos")}
                  className="px-6 py-3 rounded-xl btn-teal-primary text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Browse Current Expos</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {whyChooseItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2.5"
                  >
                    <div className="w-9 h-9 rounded-lg bg-[#1488A6]/20 text-[#38B2AC] flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-white font-heading">{item.title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 5. STATISTICS SECTION */}
      <section id="statistics-section" className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="saas-card rounded-3xl p-8 sm:p-12 border border-[#E5E7EB] dark:border-white/10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center divide-y sm:divide-y-0 sm:divide-x divide-[#E5E7EB] dark:divide-white/10">
            {statistics.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className={`space-y-2 ${idx > 0 ? "pt-6 sm:pt-0" : ""}`}>
                  <div className="w-10 h-10 mx-auto rounded-xl bg-teal-50 dark:bg-[#203748] text-[#1488A6] dark:text-[#38B2AC] flex items-center justify-center mb-3">
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

      {/* 6. TESTIMONIALS */}
      <section id="testimonials-section" className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] dark:text-[#F8FAFC] tracking-tight font-heading">
            Trusted by Commercial Organizers Worldwide
          </h2>
          <p className="text-[#6B7280] dark:text-[#CBD5E1]/80 text-sm sm:text-base leading-relaxed">
            Read how global event producers and enterprise exhibitors rely on EventSphere to deliver flawless summits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="saas-card rounded-2xl p-6 sm:p-8 space-y-4 flex flex-col justify-between saas-card-hover"
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
                  Event: {t.event}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. FAQ SECTION */}
      <section id="faq-section" className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-12 space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] dark:text-[#F8FAFC] tracking-tight font-heading">
            Frequently Asked Questions
          </h2>
          <p className="text-[#6B7280] dark:text-[#CBD5E1]/80 text-sm sm:text-base">
            Everything you need to know about setting up, exhibiting, and attending summits on EventSphere.
          </p>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="saas-card rounded-xl border border-[#E5E7EB] dark:border-white/10 overflow-hidden transition-all"
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

      {/* 8. CONTACT US */}
      <section id="contact-section" className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="saas-card rounded-3xl p-8 sm:p-12 border border-[#E5E7EB] dark:border-white/10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Left: Business Info */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold teal-badge font-mono">
                  <Mail className="w-3.5 h-3.5 text-[#1488A6] dark:text-[#38B2AC]" />
                  <span>Get in Touch</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] dark:text-[#F8FAFC] tracking-tight font-heading">
                  Speak with an Enterprise Event Specialist
                </h2>
                <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#CBD5E1]/80 leading-relaxed">
                  Planning a summit or exploring enterprise expo infrastructure? Contact our solutions engineering team for custom floor plan setups, volume ticketing, or tailored integrations.
                </p>
              </div>

              <div className="space-y-4 pt-2 text-xs sm:text-sm text-[#6B7280] dark:text-[#CBD5E1]/80">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-[#38B2AC] flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#1F2937] dark:text-[#F8FAFC]">Email Inquiries</p>
                    <p className="text-[#6B7280] dark:text-[#CBD5E1]/70 font-mono text-xs">solutions@eventsphere.global</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-[#38B2AC] flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#1F2937] dark:text-[#F8FAFC]">Direct Line</p>
                    <p className="text-[#6B7280] dark:text-[#CBD5E1]/70 font-mono text-xs">+1 (800) 412-EXPO</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-[#38B2AC] flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#1F2937] dark:text-[#F8FAFC]">Global Headquarters</p>
                    <p className="text-[#6B7280] dark:text-[#CBD5E1]/70 text-xs">500 Howard Street, Suite 1400, San Francisco, CA</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Contact Form */}
            <div className="lg:col-span-7 bg-slate-50 dark:bg-[#0F172A]/50 p-6 sm:p-8 rounded-2xl border border-[#E5E7EB] dark:border-white/10">
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
                    className="px-4 py-2 rounded-lg btn-teal-primary text-white text-xs font-semibold cursor-pointer"
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
                      Message / Project Details *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      placeholder="Describe your upcoming event, expected dates, attendee count, or specific feature requirements..."
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

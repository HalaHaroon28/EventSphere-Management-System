import React from "react";

export const EventSphereLogo = ({
  size = "md", // "xs", "sm", "md", "lg", "xl", "hero"
  showText = true,
  showTagline = true,
  className = "",
  interactive = false
}) => {
  // Dimension presets for scalable rendering
  const sizeMap = {
    xs: { icon: 26, text: "text-sm", tag: "text-[8px]", h: 28 },
    sm: { icon: 34, text: "text-base", tag: "text-[9px]", h: 36 },
    md: { icon: 40, text: "text-lg", tag: "text-[10px]", h: 42 },
    lg: { icon: 48, text: "text-xl", tag: "text-[11px]", h: 50 },
    xl: { icon: 58, text: "text-2xl", tag: "text-xs", h: 62 },
    hero: { icon: 72, text: "text-3xl", tag: "text-sm", h: 78 }
  };

  const config = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`inline-flex items-center gap-2.5 sm:gap-3 select-none ${className} ${interactive ? "group cursor-pointer" : ""
        }`}
    >
      {/* Dynamic Geometric 3D Sphere Emblem */}
      <div
        className="relative shrink-0 flex items-center justify-center transition-transform duration-200 group-hover:scale-105"
        style={{ width: config.icon, height: config.icon }}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Vibrant Cyan-to-Teal Gradient */}
            <linearGradient id="esTealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2DD4BF" />
              <stop offset="50%" stopColor="#0D9488" />
              <stop offset="100%" stopColor="#0F766E" />
            </linearGradient>

            {/* Radiant Indigo/Cyan Orbit Gradient */}
            <linearGradient id="esCyanGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0284C7" />
              <stop offset="50%" stopColor="#0EA5E9" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>

            {/* Energetic Coral/Amber Accent Gradient */}
            <linearGradient id="esAmberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDBA74" />
              <stop offset="45%" stopColor="#FB923C" />
              <stop offset="100%" stopColor="#EA580C" />
            </linearGradient>

            {/* Platinum Sheen Highlight */}
            <linearGradient id="esGleam" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>

            {/* Ambient Core Glow */}
            <radialGradient id="esCoreGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0F172A" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Background Ambient Core */}
          <circle cx="50" cy="50" r="44" fill="url(#esCoreGlow)" />

          {/* Outer Orbital Ring (Deep Cyan/Sky) */}
          <ellipse
            cx="50"
            cy="50"
            rx="42"
            ry="20"
            transform="rotate(-28 50 50)"
            stroke="url(#esCyanGrad)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="180 30"
          />

          {/* Main Dynamic Ribbon 1: Front Swirling Teal Arc */}
          <path
            d="M 20 62 C 16 42 32 20 54 18 C 76 16 88 32 84 52 C 80 70 62 82 44 80 C 30 78 24 68 26 56 C 28 44 40 36 52 38 C 62 40 68 48 64 56 C 62 62 54 64 48 62"
            stroke="url(#esTealGrad)"
            strokeWidth="7"
            strokeLinecap="round"
            fill="none"
          />

          {/* Interlocking Secondary Ribbon 2: Amber/Coral Power Curve */}
          <path
            d="M 80 38 C 84 58 68 80 46 82 C 24 84 12 68 16 48 C 20 30 38 18 56 20 C 70 22 76 32 74 44 C 72 56 60 64 48 62 C 38 60 32 52 36 44"
            stroke="url(#esAmberGrad)"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Central Pulse / Connection Node */}
          <circle cx="50" cy="50" r="6" fill="#FFFFFF" />
          <circle cx="50" cy="50" r="4" fill="#0D9488" />
          <circle cx="50" cy="50" r="1.5" fill="#FFFFFF" />

          {/* Satellite Spark Nodes */}
          <circle cx="30" cy="24" r="2.5" fill="#38BDF8" />
          <circle cx="74" cy="72" r="2.2" fill="#FB923C" />
          <circle cx="78" cy="28" r="1.8" fill="#FFFFFF" />

          {/* Gloss Sheen Edge */}
          <path
            d="M 28 32 C 36 22 48 18 60 20"
            stroke="url(#esGleam)"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>

      {/* High-Contrast Typographic Brand Title */}
      {showText && (
        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-center tracking-tight">
            <span
              className={`font-heading font-black tracking-tight text-[#0F172A] dark:text-[#F8FAFC] ${config.text}`}
            >
              Event
            </span>
            <span
              className={`font-heading font-black tracking-tight text-[#0D9488] dark:text-[#2DD4BF] ${config.text}`}
            >
              Sphere
            </span>
            <span className="text-[#F97316] font-black text-sm sm:text-base leading-none ml-0.5">
              .
            </span>
          </div>

          {showTagline && (
            <span
              className={`font-mono font-bold uppercase tracking-[0.22em] text-[#64748B] dark:text-[#94A3B8] mt-1 ${config.tag}`}
            >
              Global Events OS
            </span>
          )}
        </div>
      )}
    </div>
  );
};

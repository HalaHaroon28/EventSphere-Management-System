import React from "react";

export const EventSphereLogo = ({
  size = "md",
  showText = true,
  showTagline = true,
  taglineClassName = "",
  className = "",
  interactive = false
}) => {

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

            <linearGradient id="esTealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2DD4BF" />
              <stop offset="50%" stopColor="#0D9488" />
              <stop offset="100%" stopColor="#0F766E" />
            </linearGradient>

            <linearGradient id="esCyanGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0284C7" />
              <stop offset="50%" stopColor="#0EA5E9" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>

            <linearGradient id="esAmberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDBA74" />
              <stop offset="45%" stopColor="#FB923C" />
              <stop offset="100%" stopColor="#EA580C" />
            </linearGradient>

            <linearGradient id="esGleam" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>

            <filter id="esSoftGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <circle
            cx="50"
            cy="50"
            r="36"
            fill="url(#esTealGrad)"
            opacity="0.12"
            filter="url(#esSoftGlow)"
          />

          <ellipse
            cx="50"
            cy="50"
            rx="40"
            ry="18"
            transform="rotate(-28 50 50)"
            stroke="url(#esTealGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray="180 30"
          />

          <ellipse
            cx="50"
            cy="50"
            rx="38"
            ry="16"
            transform="rotate(35 50 50)"
            stroke="url(#esCyanGrad)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="160 40"
          />

          <ellipse
            cx="50"
            cy="50"
            rx="26"
            ry="12"
            transform="rotate(-65 50 50)"
            stroke="url(#esAmberGrad)"
            strokeWidth="2.8"
            strokeLinecap="round"
          />

          <circle cx="50" cy="50" r="7.5" fill="url(#esTealGrad)" />
          <circle cx="50" cy="50" r="4" fill="url(#esCyanGrad)" />
          <circle cx="50" cy="50" r="1.5" fill="#FFFFFF" />

          <circle cx="30" cy="24" r="2.5" fill="#38BDF8" />
          <circle cx="74" cy="72" r="2.2" fill="#FB923C" />
        </svg>
      </div>

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
              className={`font-mono font-bold uppercase tracking-[0.22em] text-[#64748B] dark:text-[#94A3B8] mt-1 ${config.tag} ${taglineClassName}`}
            >
              Global Events OS
            </span>
          )}
        </div>
      )}
    </div>
  );
};

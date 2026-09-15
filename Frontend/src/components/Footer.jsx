import { Layers, ArrowUpRight } from "lucide-react";

const Footer = ({ onNavigate, onSwitchRole }) => {
  return (
    <footer className="bg-[#0F172A] border-t border-white/10 text-[#CBD5E1] text-xs mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12 mb-12">

          <div className="space-y-4 md:col-span-2">
            <div
              onClick={() => onNavigate && onNavigate("landing")}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1488A6] to-[#38B2AC] text-white flex items-center justify-center shadow-xs">
                <Layers className="w-4 h-4" />
              </div>
              <span className="font-heading font-extrabold text-base text-[#F8FAFC] tracking-tight">
                EventSphere<span className="text-[#38B2AC]">.</span>
              </span>
            </div>
            <p className="text-xs text-[#CBD5E1]/80 leading-relaxed max-w-sm">
              Enterprise exhibition, summit, and trade show operating system. Unifying organizers, global exhibitors, and attendees in a synchronized cloud architecture.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-mono text-[#CBD5E1]/60">
              <span className="w-2 h-2 rounded-full bg-[#38B2AC] animate-pulse" />
              <span>Production Nodes Active (v2.6 LTS)</span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-heading font-bold text-[#F8FAFC] text-xs uppercase tracking-wider">
              Role Portals
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => {
                    if (onSwitchRole) onSwitchRole("organizer");
                    if (onNavigate) onNavigate("dashboard");
                  }}
                  className="hover:text-[#38B2AC] transition-colors flex items-center gap-1 cursor-pointer text-[#CBD5E1]/90"
                >
                  <span>Organizer Suite</span>
                  <ArrowUpRight className="w-3 h-3 text-[#CBD5E1]/50" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    if (onSwitchRole) onSwitchRole("exhibitor");
                    if (onNavigate) onNavigate("dashboard");
                  }}
                  className="hover:text-[#38B2AC] transition-colors flex items-center gap-1 cursor-pointer text-[#CBD5E1]/90"
                >
                  <span>Exhibitor Portal</span>
                  <ArrowUpRight className="w-3 h-3 text-[#CBD5E1]/50" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    if (onSwitchRole) onSwitchRole("attendee");
                    if (onNavigate) onNavigate("dashboard");
                  }}
                  className="hover:text-[#38B2AC] transition-colors flex items-center gap-1 cursor-pointer text-[#CBD5E1]/90"
                >
                  <span>Attendee Hub</span>
                  <ArrowUpRight className="w-3 h-3 text-[#CBD5E1]/50" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate && onNavigate("expos")}
                  className="hover:text-[#38B2AC] transition-colors cursor-pointer text-[#CBD5E1]/90"
                >
                  All Flagship Expos
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-heading font-bold text-[#F8FAFC] text-xs uppercase tracking-wider">
              Architecture
            </h4>
            <ul className="space-y-2 text-[#CBD5E1]/80">
              <li>
                <span>Interactive Floor Plan Matrix</span>
              </li>
              <li>
                <span>Dynamic QR Digital Wallet</span>
              </li>
              <li>
                <span>Real-Time Turnstile Telemetry</span>
              </li>
              <li>
                <span>Exhibitor Lead Inquiries</span>
              </li>
              <li>
                <span>Multi-Track Agenda Timeline</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-heading font-bold text-[#F8FAFC] text-xs uppercase tracking-wider">
              Security & SLA
            </h4>
            <p className="text-xs text-[#CBD5E1]/80 leading-relaxed">
              SOC-2 aligned protocols, AES-256 encrypted digital passes, and 99.99% cloud uptime.
            </p>
            <div className="p-3 rounded-xl bg-[#1A202C] border border-white/10 space-y-1.5 text-[11px] font-mono text-[#CBD5E1]/80">
              <div className="flex justify-between">
                <span>Encryption</span>
                <span className="text-[#38B2AC] font-bold">AES-256 GCM</span>
              </div>
              <div className="flex justify-between">
                <span>Turnstile Latency</span>
                <span className="text-emerald-400 font-bold">&lt; 120ms</span>
              </div>
              <div className="flex justify-between">
                <span>Cloud Uptime</span>
                <span className="text-[#1488A6] font-bold">99.99%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[#CBD5E1]/60 text-xs">
          <p>© {new Date().getFullYear()} EventSphere Management Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white transition-colors cursor-pointer">Terms of Service</span>
            <span className="hover:text-white transition-colors cursor-pointer">Security Overview</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export { Footer };

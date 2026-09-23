import { NavLink, useLocation } from "react-router-dom";
import React, { useState, useRef, useEffect } from "react";
import { 
  Home, 
  Briefcase, 
  Image as ImageIcon, 
  MessageSquare,
  MoreHorizontal,
  User,
  Award,
  Sparkles,
  Waves,
  Activity,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useBackground } from "../../features/background/BackgroundContext";

// Primary navigation links for the bottom dock
const NAV_LINKS = [
  { label: "Home", path: "/", icon: <Home /> },
  { label: "Projects", path: "/projects", icon: <Briefcase /> },
  { label: "Art Gallery", path: "/gallery", icon: <ImageIcon /> },
  { label: "Comments", path: "/comments", icon: <MessageSquare /> },
];

// Secondary navigation links stored inside the three-dots button
const SECONDARY_LINKS = [
  { id: "about", label: "About Me", path: "/about", icon: <User size={16} /> },
  { id: "certificates", label: "Certificate", path: "/certificates", icon: <Award size={16} /> },
  { id: "commission", label: "Commission", path: "/commission", icon: <Sparkles size={16} /> },
];

export function Navigation() {
  const { backgroundType, setBackgroundType } = useBackground();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Monitor window scroll to activate progressive gradient blur when scrolled down
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check if any secondary link is currently active
  const isSecondaryActive = SECONDARY_LINKS.some(
    (link) => location.pathname === link.path || (link.id === "certificates" && location.pathname === "/certificate")
  );

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Handle click outside & escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      {/* 1cm Progressive Gradient Blur at Header Region (activates when scrolled) */}
      <div 
        id="header-gradient-blur"
        className={`header-gradient-blur ${
          isScrolled ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
        }`}
        aria-hidden="true"
      />

      {/* Three-Dots Menu Button (Replaces Moon Button) */}
      <div ref={menuRef} className="fixed top-4 right-4 sm:top-5 sm:right-6 z-50">
        <button 
          id="theme-toggle-btn"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`ios-glass-icon w-10 h-10 cursor-pointer flex items-center justify-center transition-all duration-200 relative ${
            isOpen 
              ? "bg-[rgba(255,255,255,0.22)] border-[rgba(140,190,255,0.55)] shadow-[0_0_16px_rgba(120,170,255,0.35)] text-white" 
              : isSecondaryActive
              ? "border-[rgba(120,170,255,0.45)] bg-[rgba(12,22,38,0.7)] shadow-[0_0_12px_rgba(120,170,255,0.2)] text-[#7DB3FF]"
              : "text-text-secondary hover:text-white hover:border-[rgba(140,190,255,0.4)]"
          }`}
          aria-label="Menu navigasi tambahan"
          aria-expanded={isOpen}
          title="More options"
        >
          <MoreHorizontal size={20} className="transition-transform duration-200" />
          
          {/* Active indicator dot when inside a secondary page */}
          {isSecondaryActive && !isOpen && (
            <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#7DB3FF] shadow-[0_0_6px_#7DB3FF]" />
          )}
        </button>

        {/* Dropdown Popover Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              id="more-menu-dropdown"
              initial={{ opacity: 0, scale: 0.92, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: -6 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="absolute top-12 right-0 sm:top-14 w-60 sm:w-64 bg-[rgba(10,20,38,0.55)] border border-[rgba(255,255,255,0.22)] rounded-2xl p-2 backdrop-blur-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.45),inset_0_1.5px_0_rgba(255,255,255,0.42),0_0_24px_rgba(100,165,255,0.12)] z-50 flex flex-col gap-1.5 overflow-hidden"
              style={{ WebkitBackdropFilter: "blur(40px) saturate(200%)" }}
            >
              {/* Glossy Liquid Specular Sheen on Top of Popover */}
              <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white/20 via-white/5 to-transparent pointer-events-none rounded-t-2xl" />

              <div className="flex flex-col gap-1.5 relative z-10">
                {SECONDARY_LINKS.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    id={`menu-item-${link.id}`}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      `liquid-glass-item ${isActive ? "active" : ""}`
                    }
                  >
                    <span className="p-1.5 rounded-lg bg-gradient-to-b from-white/25 via-white/10 to-white/5 border border-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_2px_6px_rgba(0,0,0,0.25)] text-[#7DB3FF] shrink-0">
                      {link.icon}
                    </span>
                    <span className="truncate">{link.label}</span>
                  </NavLink>
                ))}

                {/* Subtle Divider */}
                <div className="h-px bg-white/10 my-1 mx-1" />

                {/* Section Header */}
                <div className="px-2 pt-0.5 pb-0.5 flex items-center justify-between">
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-[#7DB3FF]/80">
                    Background
                  </span>
                  <span className="text-[9.5px] font-mono text-white/40">WebGL</span>
                </div>

                {/* Background Option 1: Molten Metal */}
                <button
                  id="bg-select-molten"
                  type="button"
                  onClick={() => setBackgroundType('molten')}
                  className={`liquid-glass-item w-full text-left justify-between cursor-pointer ${
                    backgroundType === 'molten' ? 'active' : ''
                  }`}
                  title="Aktifkan latar belakang Molten Metal"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="p-1.5 rounded-lg bg-gradient-to-b from-white/25 via-white/10 to-white/5 border border-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_2px_6px_rgba(0,0,0,0.25)] text-[#7DB3FF] shrink-0">
                      <Waves size={16} />
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[13px] font-medium leading-tight truncate">Molten Metal</span>
                      <span className="text-[10px] text-text-secondary leading-tight truncate">Fluid liquid shader</span>
                    </div>
                  </div>
                  {backgroundType === 'molten' && (
                    <span className="shrink-0 w-4 h-4 rounded-full bg-[#7DB3FF]/25 border border-[#7DB3FF]/70 flex items-center justify-center text-[#7DB3FF] ml-1.5 shadow-[0_0_8px_rgba(125,179,255,0.4)]">
                      <Check size={11} strokeWidth={2.5} />
                    </span>
                  )}
                </button>

                {/* Background Option 2: Ghost Fibers */}
                <button
                  id="bg-select-ghost-fibers"
                  type="button"
                  onClick={() => setBackgroundType('ghost-fibers')}
                  className={`liquid-glass-item w-full text-left justify-between cursor-pointer ${
                    backgroundType === 'ghost-fibers' ? 'active' : ''
                  }`}
                  title="Aktifkan latar belakang Ghost Fibers"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="p-1.5 rounded-lg bg-gradient-to-b from-white/25 via-white/10 to-white/5 border border-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_2px_6px_rgba(0,0,0,0.25)] text-[#7DB3FF] shrink-0">
                      <Activity size={16} />
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[13px] font-medium leading-tight truncate">Ghost Fibers</span>
                      <span className="text-[10px] text-text-secondary leading-tight truncate">Luminous spectral waves</span>
                    </div>
                  </div>
                  {backgroundType === 'ghost-fibers' && (
                    <span className="shrink-0 w-4 h-4 rounded-full bg-[#7DB3FF]/25 border border-[#7DB3FF]/70 flex items-center justify-center text-[#7DB3FF] ml-1.5 shadow-[0_0_8px_rgba(125,179,255,0.4)]">
                      <Check size={11} strokeWidth={2.5} />
                    </span>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Glass Capsule Dock for Bottom Navigation: Home, Projects, Gallery, QnA */}
      <div className="fixed z-50 left-1/2 -translate-x-1/2 pointer-events-none w-[calc(100%-24px)] max-w-[340px] xs:max-w-[370px] sm:max-w-[420px] bottom-3 sm:bottom-4 md:bottom-6 pb-[max(0px,env(safe-area-inset-bottom))]">
        <nav 
          id="main-navigation-dock"
          className="menu w-full overflow-x-auto no-scrollbar justify-between sm:justify-center pointer-events-auto"
        >
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              id={`nav-item-${link.label.toLowerCase()}`}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
}

import { NavLink, useLocation, useNavigate } from "react-router-dom";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { 
  Home, 
  Briefcase, 
  Image as ImageIcon, 
  MessageSquare, 
  MoreHorizontal,
  X,
  User,
  Award,
  Sparkles,
  Waves,
  Activity,
  Zap,
  Check,
  Boxes
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useBackground } from "../../features/background/BackgroundContext";

// Primary navigation links for the liquid glass bottom dock
const NAV_LINKS = [
  { id: "home", label: "Home", path: "/", icon: <Home /> },
  { id: "projects", label: "Projects", path: "/projects", icon: <Briefcase /> },
  { id: "gallery", label: "Gallery", path: "/gallery", icon: <ImageIcon /> },
  { id: "features", label: "Feature", path: "/features", icon: <Boxes /> },
  { id: "comments", label: "Comments", path: "/comments", icon: <MessageSquare /> },
];

// Secondary navigation links stored inside the three-dots button
const SECONDARY_LINKS = [
  { id: "about", label: "About Me", path: "/about", icon: <User size={14} /> },
  { id: "certificates", label: "Certificate", path: "/certificates", icon: <Award size={14} /> },
];

export function Navigation() {
  const { backgroundType, setBackgroundType } = useBackground();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Find index of current primary route for horizontal slide transitions
  const currentPrimaryIndex = NAV_LINKS.findIndex((link) => link.path === location.pathname);

  // Check if any secondary link is currently active
  const isSecondaryActive = SECONDARY_LINKS.some(
    (link) => location.pathname === link.path || (link.id === "certificates" && location.pathname === "/certificate")
  );

  // 1. Vertical Scroll Adaptation: Auto-compact on scroll down, expand on scroll up / near top
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;
          const deltaY = currentY - lastScrollY.current;

          // Header blur veil threshold
          setIsScrolled(currentY > 8);

          // Liquid glass navigation compacting behavior
          if (currentY < 32) {
            setIsCompact(false);
          } else if (deltaY > 5) {
            // Scrolling down -> compact mode
            setIsCompact(true);
          } else if (deltaY < -6) {
            // Scrolling up -> expand mode
            setIsCompact(false);
          }

          lastScrollY.current = currentY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 2. Horizontal Slide / Swipe Gesture Adaptation (slide kesamping antar halaman utama)
  const handleTouchStart = useCallback((e: TouchEvent) => {
    // Only track single touch points
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now()
      };
    }
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchStartRef.current || e.changedTouches.length !== 1) return;

    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
      time: Date.now()
    };

    const deltaX = touchEnd.x - touchStartRef.current.x;
    const deltaY = touchEnd.y - touchStartRef.current.y;
    const duration = touchEnd.time - touchStartRef.current.time;

    // Check if touch originated from an interactive element like textarea, input, or horizontal scrollable container
    const target = e.target as HTMLElement | null;
    const isInteractive = target?.closest('textarea, input, [data-prevent-swipe], .scrollable-carousel, .no-swipe');

    if (!isInteractive && duration < 450 && Math.abs(deltaX) > 65 && Math.abs(deltaY) < 50) {
      // Horizontal swipe detected
      if (currentPrimaryIndex !== -1) {
        if (deltaX < 0 && currentPrimaryIndex < NAV_LINKS.length - 1) {
          // Swipe Left -> Navigate to next tab
          navigate(NAV_LINKS[currentPrimaryIndex + 1].path);
        } else if (deltaX > 0 && currentPrimaryIndex > 0) {
          // Swipe Right -> Navigate to previous tab
          navigate(NAV_LINKS[currentPrimaryIndex - 1].path);
        }
      }
    }

    touchStartRef.current = null;
  }, [currentPrimaryIndex, navigate]);

  useEffect(() => {
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchEnd]);

  // Center active item in scroll track when path changes
  useEffect(() => {
    if (trackRef.current) {
      const activeEl = trackRef.current.querySelector(".lg-item.active, .lg-item.is-active") as HTMLElement | null;
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }
  }, [location.pathname]);

  // Close more menu when route changes
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
      {/* 1.7cm Progressive Header Glass Veil */}
      <div 
        id="header-gradient-blur"
        className={`header-glass-veil transition-opacity duration-300 ${
          isScrolled ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      >
        <div className="header-glass-base" />
        <div className="header-glass-diffusion" />
        <div className="header-glass-specular" />
      </div>

      {/* Three-Dots Menu Button with tactile open/close animation */}
      <div ref={menuRef} className="fixed top-4 right-4 sm:top-5 sm:right-6 z-50">
        <motion.button 
          id="theme-toggle-btn"
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.88 }}
          transition={{ type: "spring", stiffness: 450, damping: 22 }}
          className={`ios-glass-icon w-9 h-9 sm:w-10 sm:h-10 cursor-pointer flex items-center justify-center relative ${
            isOpen 
              ? "bg-[rgba(255,255,255,0.12)] border-[rgba(140,190,255,0.45)] shadow-[0_0_12px_rgba(120,170,255,0.25)] text-white" 
              : isSecondaryActive
              ? "border-[rgba(120,170,255,0.30)] bg-[rgba(6,15,35,0.22)] text-[#7DB3FF]"
              : "bg-[rgba(6,15,35,0.18)] text-text-secondary hover:text-white hover:border-[rgba(140,190,255,0.35)] hover:bg-[rgba(255,255,255,0.08)]"
          }`}
          aria-label="Menu navigasi tambahan"
          aria-expanded={isOpen}
          title={isOpen ? "Tutup menu" : "Buka menu"}
        >
          {/* Animated Icon: Rotates & Morphs between MoreHorizontal and X */}
          <motion.div
            key={isOpen ? "open-icon" : "close-icon"}
            initial={{ rotate: isOpen ? -90 : 90, opacity: 0, scale: 0.7 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: isOpen ? 90 : -90, opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-center"
          >
            {isOpen ? (
              <X size={18} strokeWidth={2.4} />
            ) : (
              <MoreHorizontal size={18} strokeWidth={2.2} />
            )}
          </motion.div>
          
          {/* Active indicator dot when inside a secondary page */}
          {isSecondaryActive && !isOpen && (
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#7DB3FF] shadow-[0_0_6px_#7DB3FF]" />
          )}
        </motion.button>

        {/* Liquid Glass Dropdown Popover Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              id="more-menu-dropdown"
              initial={{ opacity: 0, scale: 0.35, y: -12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ 
                opacity: 0, 
                scale: 0.35, 
                y: -10, 
                transition: { duration: 0.2, ease: [0.32, 0, 0.67, 0] } 
              }}
              transition={{ 
                type: "spring", 
                stiffness: 440, 
                damping: 26, 
                mass: 0.75 
              }}
              className="more-menu-dropdown absolute top-11 right-0 sm:top-12 w-[185px] sm:w-[195px] rounded-xl p-1.5 z-50 flex flex-col gap-1 origin-top-right"
            >
              {/* Universal Self-Rendering Glass Surface */}
              <div className="glass-surface-base" aria-hidden="true" />
              <div className="glass-surface-diffusion" aria-hidden="true" />
              <div className="glass-surface-highlight" aria-hidden="true" />
              <div className="glass-surface-border" aria-hidden="true" />

              {/* Interactive Menu Content */}
              <div className="relative z-10 flex flex-col gap-0.5">
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
                    <span className="p-1 rounded-md bg-white/[0.08] border border-white/15 text-[#7DB3FF] shrink-0">
                      {link.icon}
                    </span>
                    <span className="truncate text-[12px] font-medium">{link.label}</span>
                  </NavLink>
                ))}

                {/* Ultra-Subtle Divider */}
                <div className="h-px bg-white/10 my-0.5 mx-1" />

                {/* Section Header */}
                <div className="px-1.5 pt-0.5 pb-0.5 flex items-center">
                  <span className="text-[9px] font-semibold tracking-wider uppercase text-[#7DB3FF]/80">
                    Background
                  </span>
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
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="p-1 rounded-md bg-white/[0.08] border border-white/15 text-[#7DB3FF] shrink-0">
                      <Waves size={14} />
                    </span>
                    <span className="text-[12px] font-medium leading-tight truncate">Molten Metal</span>
                  </div>
                  {backgroundType === 'molten' && (
                    <span className="shrink-0 w-3.5 h-3.5 rounded-full bg-[#7DB3FF]/25 border border-[#7DB3FF]/70 flex items-center justify-center text-[#7DB3FF] ml-1 shadow-[0_0_6px_rgba(125,179,255,0.4)]">
                      <Check size={9} strokeWidth={2.5} />
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
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="p-1 rounded-md bg-white/[0.08] border border-white/15 text-[#7DB3FF] shrink-0">
                      <Activity size={14} />
                    </span>
                    <span className="text-[12px] font-medium leading-tight truncate">Ghost Fibers</span>
                  </div>
                  {backgroundType === 'ghost-fibers' && (
                    <span className="shrink-0 w-3.5 h-3.5 rounded-full bg-[#7DB3FF]/25 border border-[#7DB3FF]/70 flex items-center justify-center text-[#7DB3FF] ml-1 shadow-[0_0_6px_rgba(125,179,255,0.4)]">
                      <Check size={9} strokeWidth={2.5} />
                    </span>
                  )}
                </button>

                {/* Background Option 3: Light Pillar */}
                <button
                  id="bg-select-light-pillar"
                  type="button"
                  onClick={() => setBackgroundType('light-pillar')}
                  className={`liquid-glass-item w-full text-left justify-between cursor-pointer ${
                    backgroundType === 'light-pillar' ? 'active' : ''
                  }`}
                  title="Aktifkan latar belakang Light Pillar"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="p-1 rounded-md bg-white/[0.08] border border-white/15 text-[#7DB3FF] shrink-0">
                      <Zap size={14} />
                    </span>
                    <span className="text-[12px] font-medium leading-tight truncate">Light Pillar</span>
                  </div>
                  {backgroundType === 'light-pillar' && (
                    <span className="shrink-0 w-3.5 h-3.5 rounded-full bg-[#7DB3FF]/25 border border-[#7DB3FF]/70 flex items-center justify-center text-[#7DB3FF] ml-1 shadow-[0_0_6px_rgba(125,179,255,0.4)]">
                      <Check size={9} strokeWidth={2.5} />
                    </span>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Liquid Glass Navigation Dock: Responsive to both vertical scrolling & horizontal sliding */}
      <nav 
        id="main-navigation-dock"
        aria-label="Navigasi utama"
        className={`liquid-glass-nav ${isCompact ? "is-compact" : ""}`}
      >
        {/* Scroll / Slide Track for seamless touch swiping and equal-width tabs */}
        <div ref={trackRef} className="lg-scroll-track">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              id={`nav-item-${link.id}`}
              className={({ isActive }) => `lg-item ${isActive ? "active is-active" : ""}`}
            >
              {/* Melt-in Active Highlight Layer */}
              <span className="lg-highlight" aria-hidden="true" />
              {link.icon}
              <span className="lg-label">{link.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}


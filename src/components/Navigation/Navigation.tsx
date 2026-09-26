import { NavLink, useLocation, useNavigate } from "react-router-dom";
import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
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
import { useNavigationCustomization } from "../../features/navigation/NavigationCustomizationContext";
import { hexToRgba, buildNavBoxShadow } from "../../features/navigation/colorUtils";

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
  const { config } = useNavigationCustomization();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Hold & Drag Left-Right Free Glass Navigation State
  const [isHolding, setIsHolding] = useState(false);
  const [heldIndex, setHeldIndex] = useState<number | null>(null);
  const [dragGlassX, setDragGlassX] = useState<number>(0);
  const [dragGlassWidth, setDragGlassWidth] = useState<number>(0);
  
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const rafRef = useRef<number | null>(null);
  const cachedLayoutRef = useRef<{
    trackLeft: number;
    trackWidth: number;
    items: { index: number; left: number; width: number; centerX: number }[];
  } | null>(null);

  const handlePointerDown = useCallback((index: number, e: React.PointerEvent) => {
    startPosRef.current = { x: e.clientX, y: e.clientY };
    setHeldIndex(index);
    setIsHolding(true);

    const target = e.currentTarget as HTMLElement;
    try {
      target.setPointerCapture(e.pointerId);
    } catch {
      // Ignore if setPointerCapture fails on older browsers
    }

    if (trackRef.current) {
      const trackRect = trackRef.current.getBoundingClientRect();
      const itemElems = Array.from(trackRef.current.querySelectorAll<HTMLElement>(".lg-item"));
      
      const items = itemElems.map((item, idx) => {
        const r = item.getBoundingClientRect();
        return {
          index: idx,
          left: r.left - trackRect.left,
          width: r.width,
          centerX: r.left + r.width / 2,
        };
      });

      cachedLayoutRef.current = {
        trackLeft: trackRect.left,
        trackWidth: trackRect.width,
        items,
      };

      if (items[index]) {
        setDragGlassX(items[index].left);
        setDragGlassWidth(items[index].width);
      }
    }
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!cachedLayoutRef.current) return;

    const layout = cachedLayoutRef.current;
    const clientX = e.clientX;
    const cursorRelativeX = clientX - layout.trackLeft;

    // Fast O(N) lookup from cached item centers without calling getBoundingClientRect()
    let closestIndex = 0;
    let minDistance = Infinity;
    for (let i = 0; i < layout.items.length; i++) {
      const dist = Math.abs(clientX - layout.items[i].centerX);
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = i;
      }
    }

    const targetItem = layout.items[closestIndex];
    const targetWidth = targetItem ? targetItem.width : 60;

    // Calculate clamped continuous position
    const rawLeft = cursorRelativeX - targetWidth / 2;
    const clampedLeft = Math.max(0, Math.min(layout.trackWidth - targetWidth, rawLeft));

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      setHeldIndex(closestIndex);
      setDragGlassWidth(targetWidth);
      setDragGlassX(clampedLeft);
    });
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    const target = e.currentTarget as HTMLElement;
    try {
      if (target.hasPointerCapture(e.pointerId)) {
        target.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore
    }

    if (isHolding && heldIndex !== null) {
      const targetLink = NAV_LINKS[heldIndex];
      if (targetLink && targetLink.path !== location.pathname) {
        navigate(targetLink.path);
      }
    }

    setIsHolding(false);
    setHeldIndex(null);
    startPosRef.current = null;
    cachedLayoutRef.current = null;
  }, [isHolding, heldIndex, location.pathname, navigate]);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Find index of current primary route for horizontal slide transitions
  const currentPrimaryIndex = NAV_LINKS.findIndex((link) => link.path === location.pathname);

  // Check if any secondary link is currently active
  const isSecondaryActive = SECONDARY_LINKS.some(
    (link) => location.pathname === link.path || (link.id === "certificates" && location.pathname === "/certificate")
  );

  // 1. Vertical Scroll Adaptation: Update header blur veil threshold (keep navigation dock size stable)
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;
          // Header blur veil threshold
          setIsScrolled(currentY > 8);
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

  // Compute live dynamic inline styles for the bottom liquid glass dock
  const dockStyle = useMemo<React.CSSProperties>(() => {
    const useMobile = isMobile && config.mobileCustomEnabled;

    const bgOpacity = (useMobile ? config.mobileBgOpacity : config.bgOpacity) / 100;
    const bgColor = useMobile ? config.mobileBgColor : config.bgColor;
    const backdropBlur = useMobile ? config.mobileBackdropBlur : config.backdropBlur;
    const borderEnabled = useMobile ? config.mobileBorderEnabled : config.borderEnabled;
    const borderColor = useMobile ? config.mobileBorderColor : config.borderColor;
    const borderOpacity = (useMobile ? config.mobileBorderOpacity : config.borderOpacity) / 100;
    const borderRadius = useMobile ? config.mobileRadius : config.borderRadius;
    const paddingY = useMobile ? config.mobilePaddingY : config.verticalPadding;
    const paddingX = useMobile ? config.mobilePaddingX : config.horizontalPadding;
    const maxWidth = useMobile ? config.mobileMaxWidth : config.maxWidth;

    // Background generation
    let background = "";
    if (config.bgType === "color") {
      background = hexToRgba(bgColor, bgOpacity);
    } else if (config.bgGradientEnabled) {
      background = `linear-gradient(180deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.03) 100%), linear-gradient(${config.bgGradientDirection}, ${hexToRgba(config.bgGradientStart, bgOpacity)}, ${hexToRgba(config.bgGradientEnd, bgOpacity)})`;
    } else {
      background = `linear-gradient(180deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.03) 100%), ${hexToRgba(bgColor, bgOpacity)}`;
    }

    if (config.bgImageUrl) {
      background = `url("${config.bgImageUrl}") center/cover no-repeat, ${background}`;
    }

    // Border generation
    const border = borderEnabled 
      ? `${config.borderWidth}px ${config.borderStyle} ${hexToRgba(borderColor, borderOpacity)}`
      : "none";

    // Shadow generation
    const boxShadow = buildNavBoxShadow(config);

    return {
      background,
      backdropFilter: `blur(${backdropBlur}px) saturate(${config.saturation}%) brightness(${config.brightness}%) contrast(${config.contrast}%)`,
      WebkitBackdropFilter: `blur(${backdropBlur}px) saturate(${config.saturation}%) brightness(${config.brightness}%) contrast(${config.contrast}%)`,
      border,
      borderRadius: `${borderRadius}px`,
      boxShadow,
      padding: `${paddingY}px ${paddingX}px`,
      bottom: `${config.bottomOffset}px`,
      maxWidth: `min(92vw, ${maxWidth}px)`,
      transition: `box-shadow 0.4s ease, border 0.3s ease, background 0.3s ease`,
    };
  }, [config, isMobile]);

  // Compute dynamic highlight pill style for active item (Strictly inner light rim - NO outer glow/shadow bleeds)
  const highlightStyle = useMemo<React.CSSProperties>(() => {
    const activeBgColor = hexToRgba(config.activeBgColor, config.activeBgOpacity / 100);
    return {
      background: `linear-gradient(165deg, ${activeBgColor}, ${hexToRgba(config.activeBgColor, (config.activeBgOpacity * 0.6) / 100)})`,
      border: `1px solid ${hexToRgba("#ffffff", 0.35)}`,
      boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.35)",
      borderRadius: `${config.activeIndicatorRadius}px`,
      opacity: config.activeIndicatorEnabled ? (config.activeIndicatorOpacity / 100) : 0,
      display: config.activeIndicatorEnabled ? "block" : "none",
    };
  }, [config]);

  // Item style
  const itemStyle = useMemo<React.CSSProperties>(() => {
    return {
      padding: `${config.itemPaddingY}px ${config.itemPaddingX}px`,
      borderRadius: `${config.itemBorderRadius}px`,
      gap: `${config.iconSpacing}px`,
      transition: `color ${config.transitionSpeed}ms ease, background ${config.transitionSpeed}ms ease`,
    };
  }, [config]);

  const labelStyle = useMemo<React.CSSProperties>(() => {
    return {
      fontSize: `${config.fontSize}px`,
      fontWeight: config.fontWeight,
      letterSpacing: `${config.letterSpacing}em`,
    };
  }, [config]);

  // Compute dynamic styles for More Menu Dropdown Popover (Completely separate from Nav Dock)
  const dropdownContainerStyle = useMemo<React.CSSProperties>(() => {
    const bgOpacity = config.dropdownBgOpacity / 100;
    const borderOpacity = config.dropdownBorderOpacity / 100;

    let background = "";
    if (config.dropdownBgType === "color") {
      background = hexToRgba(config.dropdownBgColor, bgOpacity);
    } else if (config.dropdownBgType === "gradient") {
      background = `linear-gradient(${config.dropdownBgGradientDirection}, ${hexToRgba(config.dropdownBgGradientStart, bgOpacity)}, ${hexToRgba(config.dropdownBgGradientEnd, bgOpacity)})`;
    } else {
      background = `linear-gradient(180deg, rgba(255, 255, 255, 0.10) 0%, rgba(255, 255, 255, 0.02) 100%), ${hexToRgba(config.dropdownBgColor, bgOpacity)}`;
    }

    const border = config.dropdownBorderEnabled 
      ? `${config.dropdownBorderWidth}px ${config.dropdownBorderStyle} ${hexToRgba(config.dropdownBorderColor, borderOpacity)}`
      : "none";

    const shadowY = Math.round(config.dropdownShadowBlur / 2.5);
    const boxShadow = `0 ${shadowY}px ${config.dropdownShadowBlur}px ${hexToRgba(config.dropdownShadowColor, config.dropdownShadowOpacity / 100)}`;

    return {
      background,
      backdropFilter: `blur(${config.dropdownBackdropBlur}px)`,
      WebkitBackdropFilter: `blur(${config.dropdownBackdropBlur}px)`,
      border,
      borderRadius: `${config.dropdownBorderRadius}px`,
      boxShadow,
    };
  }, [config]);

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
          whileTap={{ opacity: 0.85 }}
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
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6, transition: { duration: 0.18, ease: "easeInOut" } }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              style={dropdownContainerStyle}
              className="more-menu-dropdown absolute top-11 right-0 sm:top-12 w-[190px] sm:w-[205px] rounded-2xl p-1.5 z-50 flex flex-col gap-1 origin-top-right overflow-hidden"
            >
              {/* Universal Self-Rendering Glass Surface Highlight */}
              <div className="glass-surface-highlight pointer-events-none" aria-hidden="true" />

              {/* Interactive Menu Content */}
              <div className="relative z-10 flex flex-col gap-1">
                {SECONDARY_LINKS.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    id={`menu-item-${link.id}`}
                    onClick={() => setIsOpen(false)}
                    style={({ isActive }) => ({
                      borderRadius: `${Math.min(12, config.dropdownBorderRadius)}px`,
                      color: isActive ? config.dropdownActiveTextColor : hexToRgba(config.dropdownTextColor, config.dropdownTextOpacity / 100),
                      background: isActive 
                        ? `linear-gradient(165deg, ${hexToRgba(config.dropdownActiveBgColor, config.dropdownActiveBgOpacity / 100)}, ${hexToRgba(config.dropdownActiveBgColor, (config.dropdownActiveBgOpacity * 0.6) / 100)})`
                        : undefined,
                      borderColor: isActive ? hexToRgba("#ffffff", 0.3) : undefined,
                    })}
                    className={({ isActive }) =>
                      `liquid-glass-item ${isActive ? "active" : ""}`
                    }
                  >
                    <span 
                      style={{
                        background: "rgba(255, 255, 255, 0.08)",
                        borderColor: "rgba(255, 255, 255, 0.15)",
                        color: config.dropdownActiveIconColor,
                      }}
                      className="p-1 rounded-md border shrink-0"
                    >
                      {link.icon}
                    </span>
                    <span 
                      style={{
                        fontSize: `${config.dropdownFontSize}px`,
                        fontWeight: 500,
                      }}
                      className="truncate"
                    >
                      {link.label}
                    </span>
                  </NavLink>
                ))}

                {/* Ultra-Subtle Divider */}
                <div className="h-px bg-white/10 my-0.5 mx-1" />

                {/* Section Header */}
                <div className="px-1.5 pt-0.5 pb-0.5 flex items-center">
                  <span 
                    style={{
                      color: config.dropdownActiveTextColor,
                      opacity: 0.8,
                    }}
                    className="text-[9px] font-semibold uppercase tracking-wider"
                  >
                    Background
                  </span>
                </div>

                {/* Background Option 1: Molten Metal */}
                <button
                  id="bg-select-molten"
                  type="button"
                  onClick={() => setBackgroundType('molten')}
                  style={{
                    borderRadius: `${Math.min(12, config.dropdownBorderRadius)}px`,
                    color: backgroundType === 'molten' ? config.dropdownActiveTextColor : hexToRgba(config.dropdownTextColor, config.dropdownTextOpacity / 100),
                    background: backgroundType === 'molten'
                      ? `linear-gradient(165deg, ${hexToRgba(config.dropdownActiveBgColor, config.dropdownActiveBgOpacity / 100)}, ${hexToRgba(config.dropdownActiveBgColor, (config.dropdownActiveBgOpacity * 0.6) / 100)})`
                      : undefined,
                    borderColor: backgroundType === 'molten' ? hexToRgba("#ffffff", 0.3) : undefined,
                  }}
                  className={`liquid-glass-item w-full text-left justify-between cursor-pointer ${
                    backgroundType === 'molten' ? 'active' : ''
                  }`}
                  title="Aktifkan latar belakang Molten Metal"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span 
                      style={{ color: config.dropdownActiveIconColor }}
                      className="p-1 rounded-md bg-white/[0.08] border border-white/15 shrink-0"
                    >
                      <Waves size={14} />
                    </span>
                    <span 
                      style={{
                        fontSize: `${config.dropdownFontSize}px`,
                        fontWeight: 500,
                      }}
                      className="leading-tight truncate"
                    >
                      Molten Metal
                    </span>
                  </div>
                  {backgroundType === 'molten' && (
                    <span 
                      style={{
                        backgroundColor: hexToRgba(config.dropdownActiveBgColor, 0.35),
                        borderColor: hexToRgba(config.dropdownActiveBgColor, 0.8),
                        color: config.dropdownActiveTextColor,
                      }}
                      className="shrink-0 w-3.5 h-3.5 rounded-full border flex items-center justify-center ml-1 shadow-sm"
                    >
                      <Check size={9} strokeWidth={2.5} />
                    </span>
                  )}
                </button>

                {/* Background Option 2: Ghost Fibers */}
                <button
                  id="bg-select-ghost-fibers"
                  type="button"
                  onClick={() => setBackgroundType('ghost-fibers')}
                  style={{
                    borderRadius: `${Math.min(12, config.dropdownBorderRadius)}px`,
                    color: backgroundType === 'ghost-fibers' ? config.dropdownActiveTextColor : hexToRgba(config.dropdownTextColor, config.dropdownTextOpacity / 100),
                    background: backgroundType === 'ghost-fibers'
                      ? `linear-gradient(165deg, ${hexToRgba(config.dropdownActiveBgColor, config.dropdownActiveBgOpacity / 100)}, ${hexToRgba(config.dropdownActiveBgColor, (config.dropdownActiveBgOpacity * 0.6) / 100)})`
                      : undefined,
                    borderColor: backgroundType === 'ghost-fibers' ? hexToRgba("#ffffff", 0.3) : undefined,
                  }}
                  className={`liquid-glass-item w-full text-left justify-between cursor-pointer ${
                    backgroundType === 'ghost-fibers' ? 'active' : ''
                  }`}
                  title="Aktifkan latar belakang Ghost Fibers"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span 
                      style={{ color: config.dropdownActiveIconColor }}
                      className="p-1 rounded-md bg-white/[0.08] border border-white/15 shrink-0"
                    >
                      <Activity size={14} />
                    </span>
                    <span 
                      style={{
                        fontSize: `${config.dropdownFontSize}px`,
                        fontWeight: 500,
                      }}
                      className="leading-tight truncate"
                    >
                      Ghost Fibers
                    </span>
                  </div>
                  {backgroundType === 'ghost-fibers' && (
                    <span 
                      style={{
                        backgroundColor: hexToRgba(config.dropdownActiveBgColor, 0.35),
                        borderColor: hexToRgba(config.dropdownActiveBgColor, 0.8),
                        color: config.dropdownActiveTextColor,
                      }}
                      className="shrink-0 w-3.5 h-3.5 rounded-full border flex items-center justify-center ml-1 shadow-sm"
                    >
                      <Check size={9} strokeWidth={2.5} />
                    </span>
                  )}
                </button>

                {/* Background Option 3: Light Pillar */}
                <button
                  id="bg-select-light-pillar"
                  type="button"
                  onClick={() => setBackgroundType('light-pillar')}
                  style={{
                    borderRadius: `${Math.min(12, config.dropdownBorderRadius)}px`,
                    color: backgroundType === 'light-pillar' ? config.dropdownActiveTextColor : hexToRgba(config.dropdownTextColor, config.dropdownTextOpacity / 100),
                    background: backgroundType === 'light-pillar'
                      ? `linear-gradient(165deg, ${hexToRgba(config.dropdownActiveBgColor, config.dropdownActiveBgOpacity / 100)}, ${hexToRgba(config.dropdownActiveBgColor, (config.dropdownActiveBgOpacity * 0.6) / 100)})`
                      : undefined,
                    borderColor: backgroundType === 'light-pillar' ? hexToRgba("#ffffff", 0.3) : undefined,
                  }}
                  className={`liquid-glass-item w-full text-left justify-between cursor-pointer ${
                    backgroundType === 'light-pillar' ? 'active' : ''
                  }`}
                  title="Aktifkan latar belakang Light Pillar"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span 
                      style={{ color: config.dropdownActiveIconColor }}
                      className="p-1 rounded-md bg-white/[0.08] border border-white/15 shrink-0"
                    >
                      <Zap size={14} />
                    </span>
                    <span 
                      style={{
                        fontSize: `${config.dropdownFontSize}px`,
                        fontWeight: 500,
                      }}
                      className="leading-tight truncate"
                    >
                      Light Pillar
                    </span>
                  </div>
                  {backgroundType === 'light-pillar' && (
                    <span 
                      style={{
                        backgroundColor: hexToRgba(config.dropdownActiveBgColor, 0.35),
                        borderColor: hexToRgba(config.dropdownActiveBgColor, 0.8),
                        color: config.dropdownActiveTextColor,
                      }}
                      className="shrink-0 w-3.5 h-3.5 rounded-full border flex items-center justify-center ml-1 shadow-sm"
                    >
                      <Check size={9} strokeWidth={2.5} />
                    </span>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Glass Tooltip Badge during Hold & Drag Gesture */}
      <AnimatePresence>
        {isHolding && heldIndex !== null && NAV_LINKS[heldIndex] && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 450, damping: 30 }}
            className="fixed z-50 pointer-events-none px-4 py-2 rounded-2xl bg-slate-950/80 border border-white/30 text-white text-xs font-semibold backdrop-blur-2xl shadow-[0_12px_36px_rgba(0,0,0,0.6)] flex items-center gap-2.5"
            style={{
              bottom: `${config.bottomOffset + 68}px`,
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa] animate-pulse" />
            <span className="text-white/90">Lepas untuk pindah ke <strong className="text-blue-300 font-bold">{NAV_LINKS[heldIndex].label}</strong></span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Liquid Glass Navigation Dock: Stable and responsive */}
      <nav 
        id="main-navigation-dock"
        aria-label="Navigasi utama"
        className={`liquid-glass-nav select-none touch-none ${isHolding ? "overflow-visible" : ""}`}
        style={dockStyle}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Scroll / Slide Track for seamless touch swiping and equal-width tabs */}
        <div 
          ref={trackRef} 
          className={`lg-scroll-track relative ${isHolding ? "overflow-visible" : ""}`}
          style={{ gap: `${isMobile && config.mobileCustomEnabled ? config.mobileItemSpacing : config.itemSpacing}px` }}
        >
          {/* Continuous Smooth Fluid Glass Horizontal Capsule Indicator with Outward Extension on Hold */}
          <AnimatePresence>
            {isHolding && dragGlassWidth > 0 && (
              <motion.div
                key="fluid-hold-glass-capsule"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  x: dragGlassX - 14,
                  width: dragGlassWidth + 28,
                }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{
                  x: { type: "spring", stiffness: 650, damping: 38, mass: 0.35 },
                  width: { type: "spring", stiffness: 650, damping: 38 },
                  scale: { type: "spring", stiffness: 550, damping: 32 },
                  opacity: { duration: 0.12 },
                }}
                className="absolute -top-1.5 -bottom-1.5 pointer-events-none z-10 overflow-hidden shadow-[0_0_35px_rgba(59,130,246,0.65),0_8px_24px_rgba(0,0,0,0.45)] backdrop-blur-2xl rounded-full"
                style={{
                  background: `linear-gradient(165deg, ${hexToRgba(config.activeBgColor, 0.85)}, ${hexToRgba(config.activeBgColor, 0.40)})`,
                  border: "1.5px solid rgba(255, 255, 255, 0.90)",
                  borderRadius: "9999px",
                }}
              >
                {/* Specular Glare Lines & Refraction Glow for Sleek Horizontal 3D Glass Capsule */}
                <div className="absolute inset-x-0 top-0 h-[2.5px] bg-gradient-to-r from-transparent via-white to-transparent opacity-95" />
                <div className="absolute inset-0 bg-gradient-to-tr from-white/25 via-transparent to-blue-300/25 pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-blue-400/30 to-transparent blur-[1px]" />
              </motion.div>
            )}
          </AnimatePresence>

          {NAV_LINKS.map((link, index) => {
            const isActive = location.pathname === link.path || (link.id === "certificates" && (location.pathname === "/certificate" || location.pathname.startsWith("/certificate")));
            const isTargetHeld = isHolding && heldIndex === index;

            return (
              <NavLink
                key={link.path}
                to={link.path}
                id={`nav-item-${link.id}`}
                onPointerDown={(e) => handlePointerDown(index, e)}
                onClick={(e) => {
                  if (isHolding) {
                    e.preventDefault();
                  }
                }}
                onDragStart={(e) => e.preventDefault()}
                style={{
                  ...itemStyle,
                  color: (isActive || isTargetHeld) 
                    ? config.activeTextColor 
                    : hexToRgba(config.textColor, config.textOpacity / 100),
                  transform: isTargetHeld ? "scale(1.08)" : "scale(1)",
                  transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), color 0.2s ease",
                }}
                className={`lg-item relative z-20 ${isActive ? "active is-active" : ""} ${isTargetHeld ? "held-target" : ""}`}
              >
                {/* Single Gliding Active Highlight Shape */}
                {isActive && !isHolding && (
                  <motion.div
                    layoutId="active-nav-shape"
                    className="lg-highlight"
                    style={highlightStyle}
                    transition={{
                      type: "spring",
                      stiffness: 420,
                      damping: 35,
                      mass: 0.8,
                    }}
                    aria-hidden="true"
                  />
                )}

                {React.cloneElement(link.icon as React.ReactElement<{ size?: number; style?: React.CSSProperties }>, {
                  size: config.iconSize,
                  style: {
                    opacity: (isActive || isTargetHeld) ? 1 : config.iconOpacity / 100,
                    stroke: (isActive || isTargetHeld) ? config.activeIconColor : config.iconColor,
                    color: (isActive || isTargetHeld) ? config.activeIconColor : config.iconColor,
                    transform: isTargetHeld ? "scale(1.18)" : "scale(1)",
                    transition: "transform 0.2s ease, opacity 0.2s ease",
                  }
                })}
                <span className="lg-label" style={labelStyle}>{link.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
}


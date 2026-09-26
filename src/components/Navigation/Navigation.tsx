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
  const [isPressed, setIsPressed] = useState(false);
  const [heldIndex, setHeldIndex] = useState<number | null>(null);
  const [dragGlassX, setDragGlassX] = useState<number>(0);
  const [dragGlassWidth, setDragGlassWidth] = useState<number>(0);
  const [dragGlassHeight, setDragGlassHeight] = useState<number>(0);
  const [trackHeight, setTrackHeight] = useState<number>(38);
  const [navCenterY, setNavCenterY] = useState<number>(19);
  const [activeRect, setActiveRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [isGliding, setIsGliding] = useState(false);
  
  const startPosRef = useRef<{ x: number; y: number; time: number; index: number } | null>(null);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const rafRef = useRef<number | null>(null);
  const navDockRef = useRef<HTMLElement | null>(null);
  const cachedLayoutRef = useRef<{
    trackLeft: number;
    trackTop: number;
    trackWidth: number;
    trackHeight: number;
    items: { index: number; left: number; top: number; width: number; height: number; centerX: number }[];
  } | null>(null);

  // Helper to build track layout cache
  const prepareLayoutCache = useCallback(() => {
    if (!trackRef.current) return null;
    const navElem = trackRef.current.closest("nav") || trackRef.current;
    const navRect = navElem.getBoundingClientRect();
    const trackRect = trackRef.current.getBoundingClientRect();
    setTrackHeight(trackRect.height);
    setNavCenterY((navRect.top - trackRect.top) + (navRect.height / 2));
    const itemElems = Array.from(trackRef.current.querySelectorAll<HTMLElement>(".lg-item"));
    
    const items = itemElems.map((item, idx) => {
      const r = item.getBoundingClientRect();
      return {
        index: idx,
        left: r.left - trackRect.left,
        top: r.top - trackRect.top,
        width: r.width,
        height: r.height,
        centerX: r.left + r.width / 2,
      };
    });

    const layout = {
      trackLeft: trackRect.left,
      trackTop: trackRect.top,
      trackWidth: trackRect.width,
      trackHeight: trackRect.height,
      items,
    };
    cachedLayoutRef.current = layout;
    return layout;
  }, []);

  const handlePointerDown = useCallback((index: number, e: React.PointerEvent) => {
    startPosRef.current = { x: e.clientX, y: e.clientY, time: Date.now(), index };
    setIsPressed(true);
    
    // Capture pointer on the nav dock container to receive all global move events
    const navElem = e.currentTarget.closest("nav") || (e.currentTarget as HTMLElement);
    navDockRef.current = navElem;
    try {
      navElem.setPointerCapture(e.pointerId);
    } catch {
      // Fallback
    }

    const layout = prepareLayoutCache();
    if (layout && layout.items[index]) {
      setHeldIndex(index);
      setDragGlassX(layout.items[index].left);
      setDragGlassWidth(layout.items[index].width);
      setDragGlassHeight(layout.items[index].height);
    }

    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    holdTimerRef.current = setTimeout(() => {
      setIsHolding(true);
    }, 70);
  }, [prepareLayoutCache]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!startPosRef.current) return;

    if (!cachedLayoutRef.current) {
      prepareLayoutCache();
    }
    const layout = cachedLayoutRef.current;
    if (!layout) return;

    const clientX = e.clientX;
    const dist = Math.hypot(clientX - startPosRef.current.x, e.clientY - startPosRef.current.y);

    // If dragged more than 4px, immediately activate hold mode
    if (dist > 4 && !isHolding) {
      setIsHolding(true);
    }

    const cursorRelativeX = clientX - layout.trackLeft;

    // Fast O(N) lookup from cached item centers
    let closestIndex = 0;
    let minDistance = Infinity;
    for (let i = 0; i < layout.items.length; i++) {
      const d = Math.abs(clientX - layout.items[i].centerX);
      if (d < minDistance) {
        minDistance = d;
        closestIndex = i;
      }
    }

    const targetItem = layout.items[closestIndex];
    const targetWidth = targetItem ? targetItem.width : 60;
    const targetHeight = targetItem ? targetItem.height : 36;

    // Calculate clamped continuous position
    const rawLeft = cursorRelativeX - targetWidth / 2;
    const clampedLeft = Math.max(0, Math.min(layout.trackWidth - targetWidth, rawLeft));

    setHeldIndex(closestIndex);
    setDragGlassWidth(targetWidth);
    setDragGlassHeight(targetHeight);
    setDragGlassX(clampedLeft);
  }, [isHolding, prepareLayoutCache]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (navDockRef.current) {
      try {
        if (navDockRef.current.hasPointerCapture(e.pointerId)) {
          navDockRef.current.releasePointerCapture(e.pointerId);
        }
      } catch {
        // Ignore
      }
      navDockRef.current = null;
    }

    if (heldIndex !== null) {
      if (cachedLayoutRef.current && cachedLayoutRef.current.items[heldIndex]) {
        const targetItem = cachedLayoutRef.current.items[heldIndex];
        setActiveRect({
          x: targetItem.left,
          y: targetItem.top,
          width: targetItem.width,
          height: targetItem.height,
        });
      }
      const targetLink = NAV_LINKS[heldIndex];
      if (targetLink && targetLink.path !== location.pathname) {
        navigate(targetLink.path);
      }
    }

    setIsHolding(false);
    setIsPressed(false);
    setHeldIndex(null);
    startPosRef.current = null;
    cachedLayoutRef.current = null;
    setIsGliding(false);
  }, [heldIndex, location.pathname, navigate]);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Update active item geometry for continuous smooth glass capsule gliding on click
  useEffect(() => {
    setIsGliding(true);
    const glideTimer = setTimeout(() => setIsGliding(false), 450);

    const updateActiveRect = () => {
      if (!trackRef.current) return;
      const navElem = trackRef.current.closest("nav") || trackRef.current;
      const navRect = navElem.getBoundingClientRect();
      const trackRect = trackRef.current.getBoundingClientRect();
      setTrackHeight(trackRect.height);
      setNavCenterY((navRect.top - trackRect.top) + (navRect.height / 2));
      const activeIndex = NAV_LINKS.findIndex(link => 
        location.pathname === link.path || (link.id === "certificates" && (location.pathname === "/certificate" || location.pathname.startsWith("/certificate")))
      );
      const itemElems = Array.from(trackRef.current.querySelectorAll<HTMLElement>(".lg-item"));
      if (activeIndex !== -1 && itemElems[activeIndex]) {
        const itemRect = itemElems[activeIndex].getBoundingClientRect();
        setActiveRect({
          x: itemRect.left - trackRect.left,
          y: itemRect.top - trackRect.top,
          width: itemRect.width,
          height: itemRect.height,
        });
      }
    };

    updateActiveRect();
    const raf = requestAnimationFrame(updateActiveRect);
    window.addEventListener("resize", updateActiveRect);
    return () => {
      clearTimeout(glideTimer);
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", updateActiveRect);
    };
  }, [location.pathname, config.verticalPadding, config.itemPaddingY, config.fontSize]);

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

  // Compute dynamic 3D glass capsule highlight style for active item
  const highlightStyle = useMemo<React.CSSProperties>(() => {
    const activeBgColor = hexToRgba(config.activeBgColor, config.activeBgOpacity / 100);
    return {
      background: `linear-gradient(165deg, ${activeBgColor}, ${hexToRgba(config.activeBgColor, (config.activeBgOpacity * 0.5) / 100)})`,
      border: "1.5px solid rgba(255, 255, 255, 0.85)",
      boxShadow: "0 0 24px rgba(59, 130, 246, 0.50), inset 0 1px 2px rgba(255, 255, 255, 0.80)",
      borderRadius: "9999px",
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

      {/* Liquid Glass Navigation Dock: Stable and responsive */}
      <nav 
        id="main-navigation-dock"
        aria-label="Navigasi utama"
        className={`liquid-glass-nav select-none touch-none ${isHolding ? "overflow-visible" : ""}`}
        style={dockStyle}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Scroll / Slide Track for seamless touch swiping and equal-width tabs */}
        <div 
          ref={trackRef} 
          className={`lg-scroll-track relative ${isHolding ? "overflow-visible" : ""}`}
          style={{ gap: `${isMobile && config.mobileCustomEnabled ? config.mobileItemSpacing : config.itemSpacing}px` }}
        >
          {/* Unified Dynamic Living Glass Capsule Indicator (Floating centered vertically in the nav dock) */}
          {activeRect && (() => {
            const isExpandedState = isHolding || isPressed;
            const extraW = isExpandedState ? (config.capsuleExtraWidth ?? 24) : 0;
            const extraH = isExpandedState ? (config.capsuleExtraHeight ?? 3) : 0;

            const targetW = isHolding 
              ? dragGlassWidth + extraW 
              : activeRect.width + extraW;

            const targetH = isHolding 
              ? (dragGlassHeight || activeRect.height) + extraH 
              : activeRect.height + extraH;

            const targetX = isHolding 
              ? dragGlassX - (extraW / 2) 
              : activeRect.x - (extraW / 2);

            // Floating vertically centered and aligned directly with the nav dock at all times:
            const targetY = navCenterY - (targetH / 2);

            // Dynamic normalized horizontal shift for moving refraction light (0 to 100%)
            const trackWidthEst = cachedLayoutRef.current?.trackWidth || 360;
            const progressRatio = Math.min(1, Math.max(0, targetX / Math.max(1, trackWidthEst - targetW)));
            const lightShiftPercent = Math.round(18 + progressRatio * 64); // 18% to 82%
            const lightAngleDeg = Math.round(115 + (progressRatio - 0.5) * 60); // Angle shifts smoothly as you drag

            return (
              <motion.div
                key="living-glass-capsule"
                initial={false}
                animate={{ 
                  x: targetX,
                  y: targetY,
                  width: targetW,
                  height: targetH,
                }}
                transition={isHolding ? {
                  x: { type: "spring", stiffness: 2800, damping: 80, mass: 0.01 },
                  width: { type: "spring", stiffness: 2000, damping: 70, mass: 0.01 },
                  height: { type: "spring", stiffness: 2000, damping: 70, mass: 0.01 },
                  y: { type: "spring", stiffness: 2000, damping: 70, mass: 0.01 },
                } : {
                  x: { type: "spring", stiffness: 380, damping: 32, mass: 0.6 },
                  y: { type: "spring", stiffness: 380, damping: 32, mass: 0.6 },
                  width: { type: "spring", stiffness: 380, damping: 32, mass: 0.6 },
                  height: { type: "spring", stiffness: 380, damping: 32, mass: 0.6 },
                }}
                className={`absolute pointer-events-none rounded-full transition-all duration-300 ${
                  isExpandedState ? "z-30" : "z-10"
                }`}
                style={{
                  top: 0,
                  left: 0,
                  isolation: "isolate",
                  WebkitBackfaceVisibility: "hidden",
                  borderRadius: `${config.activeIndicatorRadius || 9999}px`,
                  boxShadow: isExpandedState
                    ? `0 20px 42px -4px rgba(0, 0, 0, 0.65), 0 8px 18px -2px rgba(0, 0, 0, 0.45), 0 2px 4px rgba(0, 0, 0, 0.35), 0 0 ${Math.round(20 * ((config.capsuleGlowIntensity ?? 60) / 100))}px ${hexToRgba(config.activeBgColor, 0.30 * ((config.capsuleGlowIntensity ?? 60) / 100))}`
                    : `0 2px 8px rgba(0, 0, 0, 0.22)`,
                  transition: "box-shadow 0.28s ease",
                }}
              >
                {/* Layer 1: Ambient Occlusion & Expanding Bloom Under Glass (Active only on hold/click) */}
                <motion.div
                  className="absolute -inset-1 rounded-full pointer-events-none"
                  animate={{
                    scale: isExpandedState ? 1.15 : 0.95,
                    opacity: isExpandedState ? 0.9 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  style={{
                    borderRadius: `${config.activeIndicatorRadius || 9999}px`,
                    background: `radial-gradient(ellipse at ${lightShiftPercent}% 50%, ${hexToRgba(config.activeBgColor, 0.40 * ((config.capsuleGlowIntensity ?? 60) / 100))} 0%, ${hexToRgba(config.activeBgColor, 0.08 * ((config.capsuleGlowIntensity ?? 60) / 100))} 55%, transparent 75%)`,
                    filter: `blur(${Math.round(10 * ((config.capsuleGlowIntensity ?? 60) / 100) + 3)}px)`,
                    WebkitFilter: `blur(${Math.round(10 * ((config.capsuleGlowIntensity ?? 60) / 100) + 3)}px)`,
                    transform: "translate3d(0, 0, 0)",
                    WebkitTransform: "translate3d(0, 0, 0)",
                  }}
                />

                {/* Layer 2: Capsule Body: Clean regular shape when static -> Crystal 3D Liquid Glass when held/clicked */}
                <div 
                  className="absolute inset-0 rounded-full overflow-hidden"
                  style={{
                    borderRadius: `${config.activeIndicatorRadius || 9999}px`,
                    backdropFilter: isExpandedState 
                      ? "blur(0.5px) saturate(220%) brightness(108%) contrast(104%)" 
                      : "none",
                    WebkitBackdropFilter: isExpandedState 
                      ? "blur(0.5px) saturate(220%) brightness(108%) contrast(104%)" 
                      : "none",
                    background: isExpandedState
                      ? `linear-gradient(${lightAngleDeg}deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.01) 45%, ${hexToRgba(config.activeBgColor, 0.08)} 100%)`
                      : `linear-gradient(165deg, ${hexToRgba(config.activeBgColor, (config.activeBgOpacity ?? 30) / 100 * 1.5)}, ${hexToRgba(config.activeBgColor, (config.activeBgOpacity ?? 30) / 100 * 0.85)})`,
                    border: isExpandedState 
                      ? "1.2px solid rgba(255, 255, 255, 0.65)"
                      : `1px solid ${hexToRgba("#ffffff", 0.16)}`,
                    boxShadow: isExpandedState
                      ? "inset 0 2px 2.5px rgba(255, 255, 255, 0.90), inset 0 -2px 3px rgba(0, 0, 0, 0.35), inset 0 0 0 1px rgba(255, 255, 255, 0.25)"
                      : "inset 0 1px 1px rgba(255, 255, 255, 0.20)",
                    transition: "background 0.28s ease, border 0.28s ease, box-shadow 0.28s ease",
                  }}
                >
                  {/* Expanding & Gliding Caustic Light Flare (Only in Glass State) */}
                  <motion.div 
                    animate={{
                      scale: isExpandedState ? 1.25 : 0.9,
                      opacity: isExpandedState ? 0.95 : 0,
                    }}
                    transition={{ type: "spring", stiffness: 350, damping: 26 }}
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                      background: `radial-gradient(ellipse 65% 55% at ${lightShiftPercent}% 30%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.08) 40%, transparent 70%)`,
                    }}
                  />

                  {/* Soft Optical Refraction Dispersion (Only in Glass State) */}
                  {(config.capsuleChromaticEnabled ?? true) && (
                    <motion.div 
                      animate={{
                        opacity: isExpandedState ? 0.35 : 0,
                        scale: isExpandedState ? 1.12 : 0.9,
                      }}
                      transition={{ type: "spring", stiffness: 350, damping: 26 }}
                      className="absolute inset-0 rounded-full pointer-events-none"
                      style={{
                        padding: "1.2px",
                        borderRadius: "9999px",
                        background: `conic-gradient(from ${lightAngleDeg}deg at ${lightShiftPercent}% 50%, rgba(56,189,248,0.45), rgba(74,222,128,0.35) 25%, rgba(251,191,36,0.30) 50%, rgba(244,63,94,0.38) 75%, rgba(56,189,248,0.45))`,
                        WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                        WebkitMaskComposite: "xor",
                        maskComposite: "exclude",
                        filter: "blur(1.5px)",
                        WebkitFilter: "blur(1.5px)",
                      }}
                    />
                  )}

                  {/* Glossy Upper Meniscus Curve (Only in Glass State) */}
                  <motion.div 
                    animate={{
                      opacity: isExpandedState ? 1 : 0,
                    }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-x-0.5 top-0 h-[52%] rounded-t-full pointer-events-none"
                    style={{
                      background: "linear-gradient(180deg, rgba(255, 255, 255, 0.42) 0%, rgba(255, 255, 255, 0.06) 45%, transparent 100%)",
                    }}
                  />

                  {/* Dynamic Moving Glint on Upper Ridge (Only in Glass State) */}
                  <motion.div 
                    animate={{
                      scaleX: isExpandedState ? 1.15 : 0.9,
                      opacity: isExpandedState ? 1 : 0,
                    }}
                    transition={{ type: "spring", stiffness: 350, damping: 26 }}
                    className="absolute inset-x-3 top-[1px] h-[1.5px] pointer-events-none"
                    style={{
                      background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) ${Math.max(0, lightShiftPercent - 30)}%, rgba(255,255,255,0.98) ${lightShiftPercent}%, rgba(255,255,255,0.2) ${Math.min(100, lightShiftPercent + 30)}%, transparent 100%)`,
                      filter: "blur(0.2px)",
                    }}
                  />

                  {/* Deep 3D Chamfered Glass Bevel Edge (Only in Glass State) */}
                  <motion.div 
                    animate={{
                      opacity: isExpandedState ? 1 : 0,
                    }}
                    transition={{ duration: 0.22 }}
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                      borderRadius: `${config.activeIndicatorRadius || 9999}px`,
                      boxShadow: "inset 0 0 0 1.5px rgba(255, 255, 255, 0.20), inset 0 2px 3px rgba(255, 255, 255, 0.65), inset 0 -2px 3px rgba(0, 0, 0, 0.25)",
                    }}
                  />

                  {/* Dynamic Moving Caustic Bottom Internal Reflection Light (Only in Glass State) */}
                  <motion.div 
                    animate={{ 
                      opacity: isExpandedState ? 0.85 : 0,
                    }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-x-4 bottom-[1px] h-[1.5px] pointer-events-none"
                    style={{
                      background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) ${Math.max(0, lightShiftPercent - 25)}%, rgba(255,255,255,0.85) ${lightShiftPercent}%, rgba(255,255,255,0.15) ${Math.min(100, lightShiftPercent + 25)}%, transparent 100%)`,
                      filter: "blur(0.3px)",
                    }}
                  />
                </div>
              </motion.div>
            );
          })()}

          {NAV_LINKS.map((link, index) => {
            const isActive = location.pathname === link.path || (link.id === "certificates" && (location.pathname === "/certificate" || location.pathname.startsWith("/certificate")));
            const isTargetHeld = isHolding && heldIndex === index;

            return (
              <NavLink
                key={link.path}
                to={link.path}
                id={`nav-item-${link.id}`}
                draggable={false}
                onPointerDown={(e) => handlePointerDown(index, e)}
                onContextMenu={(e) => e.preventDefault()}
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
                  transform: isTargetHeld ? "scale(1.14)" : (isActive ? "scale(1.05)" : "scale(1)"),
                  transition: isHolding 
                    ? "transform 0.08s ease-out, color 0.08s ease-out"
                    : "transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), color 0.22s ease",
                }}
                className={`lg-item relative z-20 ${isActive ? "active is-active" : ""} ${isTargetHeld ? "held-target" : ""}`}
              >
                {React.cloneElement(link.icon as React.ReactElement<{ size?: number; style?: React.CSSProperties }>, {
                  size: config.iconSize,
                  style: {
                    opacity: (isActive || isTargetHeld) ? 1 : config.iconOpacity / 100,
                    stroke: (isActive || isTargetHeld) ? config.activeIconColor : config.iconColor,
                    color: (isActive || isTargetHeld) ? config.activeIconColor : config.iconColor,
                    transform: isTargetHeld ? "scale(1.22)" : (isActive ? "scale(1.08)" : "scale(1)"),
                    transition: isHolding ? "transform 0.08s ease, opacity 0.08s ease" : "transform 0.2s ease, opacity 0.2s ease",
                    position: "relative",
                    zIndex: 10,
                  }
                })}
                <span className="lg-label relative z-10" style={labelStyle}>{link.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
}


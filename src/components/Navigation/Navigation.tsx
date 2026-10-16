import { NavLink, useLocation, useNavigate } from "react-router-dom";
import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { 
  MoreHorizontal,
  X,
  Sparkles,
  Waves,
  Activity,
  Zap,
  Check
} from "lucide-react";
import { 
  IOSHomeIcon, 
  IOSProjectsIcon, 
  IOSGalleryIcon, 
  IOSFeaturesIcon, 
  IOSCommentsIcon,
  IOSUserIcon,
  IOSAwardIcon 
} from "./IOSNavIcons";
import { motion, AnimatePresence } from "motion/react";
import { useBackground } from "../../features/background/BackgroundContext";
import { useNavigationCustomization } from "../../features/navigation/NavigationCustomizationContext";
import { hexToRgba, buildNavBoxShadow } from "../../features/navigation/colorUtils";

// Primary navigation links for the liquid glass bottom dock (iOS 26 Style)
const NAV_LINKS = [
  { id: "home", label: "Home", path: "/", icon: <IOSHomeIcon /> },
  { id: "projects", label: "Projects", path: "/projects", icon: <IOSProjectsIcon /> },
  { id: "gallery", label: "Gallery", path: "/gallery", icon: <IOSGalleryIcon /> },
  { id: "features", label: "Feature", path: "/features", icon: <IOSFeaturesIcon /> },
  { id: "comments", label: "Comments", path: "/comments", icon: <IOSCommentsIcon /> },
];

// Secondary navigation links stored inside the three-dots button
const SECONDARY_LINKS = [
  { id: "about", label: "About Me", path: "/about", icon: <IOSUserIcon size={14} /> },
  { id: "certificates", label: "Certificate", path: "/certificates", icon: <IOSAwardIcon size={14} /> },
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
  const location = useLocation();
  const navigate = useNavigate();

  // Hold & Drag Left-Right Free Glass Navigation State
  const [isHolding, setIsHolding] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isGliding, setIsGliding] = useState(false);
  const [heldIndex, setHeldIndex] = useState<number | null>(null);
  const [dragGlassX, setDragGlassX] = useState<number>(0);
  const [dragGlassWidth, setDragGlassWidth] = useState<number>(0);
  const [dragGlassHeight, setDragGlassHeight] = useState<number>(0);
  const [trackHeight, setTrackHeight] = useState<number>(38);
  const [navCenterY, setNavCenterY] = useState<number>(19);
  const [activeRect, setActiveRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  // Dynamic Liquid Fluid Morphing State (Governed by Continuum Mechanics & Hydrodynamics)
  const [dragSpeed, setDragSpeed] = useState<number>(0);
  const [dragVelocityX, setDragVelocityX] = useState<number>(0);
  const [isMoving, setIsMoving] = useState<boolean>(false);
  const [isFastStop, setIsFastStop] = useState<boolean>(false);
  const lastPointerPosRef = useRef<{ x: number; time: number }>({ x: 0, time: 0 });
  const lastSpeedRef = useRef<number>(0);
  const lastDirectionRef = useRef<"left" | "right">("right");
  const wasDraggingRef = useRef<boolean>(false);
  const justDraggedRef = useRef<boolean>(false);
  const velocityDecayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fastStopTimerRef = useRef<NodeJS.Timeout | null>(null);
  const glideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const prevPathnameRef = useRef<string>(location.pathname);
  const glideFromRef = useRef<{ width: number; height: number } | null>(null);
  const [glideDuration, setGlideDuration] = useState<number>(0.26);
  const lastGlideTimeRef = useRef<number>(0);
  
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
    wasDraggingRef.current = false;

    // Cache layout for immediate lookup
    if (!cachedLayoutRef.current) {
      prepareLayoutCache();
    }

    lastPointerPosRef.current = { x: e.clientX, time: performance.now() };
    setDragSpeed(0);
    setIsMoving(false);
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

    // Dynamic velocity calculation for liquid fluid morphing
    const now = performance.now();
    const dt = Math.max(1, now - (lastPointerPosRef.current.time || now));
    const dx = clientX - (lastPointerPosRef.current.x || clientX);
    const instantaneousSpeed = Math.abs(dx) / dt; // pixels per ms
    const instantaneousVelocityX = dx / dt; // directional velocity
    lastPointerPosRef.current = { x: clientX, time: now };

    // Rolling exponential smoothed velocity (avoids erratic jumps)
    const smoothedSpeed = lastSpeedRef.current * 0.35 + instantaneousSpeed * 0.65;
    lastSpeedRef.current = smoothedSpeed;

    if (instantaneousVelocityX > 0.12) {
      lastDirectionRef.current = "right";
    } else if (instantaneousVelocityX < -0.12) {
      lastDirectionRef.current = "left";
    }

    setDragSpeed(Math.min(smoothedSpeed * 1.2, 3.0));
    setDragVelocityX(Math.max(-2.5, Math.min(2.5, instantaneousVelocityX)));
    setIsMoving(true);

    if (velocityDecayTimerRef.current) {
      clearTimeout(velocityDecayTimerRef.current);
    }
    velocityDecayTimerRef.current = setTimeout(() => {
      // Trigger subtle vertical hydraulic surge only if braking abruptly from brisk velocity
      if (lastSpeedRef.current > 1.1) {
        setIsFastStop(true);
        if (fastStopTimerRef.current) clearTimeout(fastStopTimerRef.current);
        fastStopTimerRef.current = setTimeout(() => {
          setIsFastStop(false);
        }, 280);
      } else {
        setIsFastStop(false);
      }
      lastSpeedRef.current = 0;
      setDragVelocityX(0);
      setIsMoving(false);
      setDragSpeed(0);
    }, 95);

    // If dragged more than 4px, activate drag & hold mode
    if (dist > 4) {
      if (!wasDraggingRef.current) {
        wasDraggingRef.current = true;
        setIsHolding(true);
        if (glideTimerRef.current) {
          clearTimeout(glideTimerRef.current);
          glideTimerRef.current = null;
        }
        setIsGliding(false);

        // Capture pointer so dragging is tracked continuously across the viewport
        const navElem = e.currentTarget.closest("nav") || (e.currentTarget as HTMLElement);
        navDockRef.current = navElem;
        try {
          navElem.setPointerCapture(e.pointerId);
        } catch {
          // Fallback
        }
      }
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
    const defaultInsetMm = 0.4;
    const staticPadX = config.capsuleStaticPaddingX !== undefined ? config.capsuleStaticPaddingX : defaultInsetMm;
    const staticPadY = config.capsuleStaticPaddingY !== undefined ? config.capsuleStaticPaddingY : defaultInsetMm;
    const targetWidth = targetItem ? Math.max(32, targetItem.width - (staticPadX * 2)) : 60;
    const targetHeight = targetItem ? Math.max(28, targetItem.height - (staticPadY * 2)) : 36;

    // Calculate clamped continuous position centered on cursor
    const rawLeft = cursorRelativeX - targetWidth / 2;
    const clampedLeft = Math.max(0, Math.min(layout.trackWidth - targetWidth, rawLeft));

    setHeldIndex(closestIndex);
    setDragGlassWidth(targetWidth);
    setDragGlassHeight(targetHeight);
    setDragGlassX(clampedLeft);
  }, [config.capsuleStaticPaddingX, config.capsuleStaticPaddingY, prepareLayoutCache]);

  // Floating Glide Trigger for tactile click & tab transitions (Synchronized with hold physics)
  const triggerGlide = useCallback((targetIndex: number, sourceIndex?: number) => {
    let fromIdx = sourceIndex;
    if (fromIdx === undefined) {
      fromIdx = NAV_LINKS.findIndex(link => 
        location.pathname === link.path || (link.id === "certificates" && (location.pathname === "/certificate" || location.pathname.startsWith("/certificate")))
      );
    }
    const dist = (fromIdx !== -1 && fromIdx !== undefined) ? Math.abs(targetIndex - fromIdx) : 1;
    if (dist === 0) return;

    // In-flight transit duration before arrival fusion: perfectly matched to spring travel time
    const travelTimeMs = Math.round(100 + Math.min(dist, 4) * 28);

    setIsGliding(true);
    if (glideTimerRef.current) {
      clearTimeout(glideTimerRef.current);
    }
    glideTimerRef.current = setTimeout(() => {
      setIsGliding(false);
      glideTimerRef.current = null;
    }, travelTimeMs);
  }, [location.pathname]);

  // Unified tab glide transition for click and tap events
  const performGlideToTab = useCallback((targetIndex: number, path: string) => {
    const now = Date.now();
    if (now - lastGlideTimeRef.current < 160) return;
    lastGlideTimeRef.current = now;

    if (path === location.pathname) return;

    const currentIdx = NAV_LINKS.findIndex(link => 
      location.pathname === link.path || (link.id === "certificates" && (location.pathname === "/certificate" || location.pathname.startsWith("/certificate")))
    );
    if (currentIdx === targetIndex) return;

    if (!cachedLayoutRef.current) {
      prepareLayoutCache();
    }
    const layout = cachedLayoutRef.current;
    if (layout && layout.items[targetIndex]) {
      const targetItem = layout.items[targetIndex];
      const sourceItem = currentIdx !== -1 && layout.items[currentIdx] ? layout.items[currentIdx] : null;

      const defaultInsetMm = 0.4;
      const staticPadX = config.capsuleStaticPaddingX !== undefined ? config.capsuleStaticPaddingX : defaultInsetMm;
      const staticPadY = config.capsuleStaticPaddingY !== undefined ? config.capsuleStaticPaddingY : defaultInsetMm;

      const fromW = sourceItem ? Math.max(32, sourceItem.width - (staticPadX * 2)) : (activeRect ? activeRect.width - (staticPadX * 2) : 60);
      const fromH = sourceItem ? Math.max(28, sourceItem.height - (staticPadY * 2)) : (activeRect ? activeRect.height - (staticPadY * 2) : 34);
      glideFromRef.current = { width: fromW, height: fromH };

      triggerGlide(targetIndex, currentIdx);

      setActiveRect({
        x: targetItem.left,
        y: targetItem.top,
        width: targetItem.width,
        height: targetItem.height,
      });
    }

    navigate(path);
  }, [config.capsuleStaticPaddingX, config.capsuleStaticPaddingY, activeRect, location.pathname, navigate, prepareLayoutCache, triggerGlide]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }

    if (velocityDecayTimerRef.current) {
      clearTimeout(velocityDecayTimerRef.current);
      velocityDecayTimerRef.current = null;
    }
    if (fastStopTimerRef.current) {
      clearTimeout(fastStopTimerRef.current);
      fastStopTimerRef.current = null;
    }
    setDragSpeed(0);
    setIsMoving(false);
    setIsFastStop(false);
    lastSpeedRef.current = 0;

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

    if (wasDraggingRef.current) {
      justDraggedRef.current = true;
      setTimeout(() => {
        justDraggedRef.current = false;
      }, 120);

      let targetItem = null;
      if (heldIndex !== null && cachedLayoutRef.current && cachedLayoutRef.current.items[heldIndex]) {
        targetItem = cachedLayoutRef.current.items[heldIndex];
      } else if (cachedLayoutRef.current && cachedLayoutRef.current.items.length > 0) {
        const currentCenterX = dragGlassX + (dragGlassWidth / 2);
        let closest = cachedLayoutRef.current.items[0];
        let minDist = Infinity;
        for (const item of cachedLayoutRef.current.items) {
          const d = Math.abs(currentCenterX - item.centerX);
          if (d < minDist) {
            minDist = d;
            closest = item;
          }
        }
        targetItem = closest;
      }

      if (targetItem) {
        const targetLink = NAV_LINKS[targetItem.index];
        if (targetLink) {
          performGlideToTab(targetItem.index, targetLink.path);
        } else {
          setActiveRect({
            x: targetItem.left,
            y: targetItem.top,
            width: targetItem.width,
            height: targetItem.height,
          });
        }
      }

      if (glideTimerRef.current) {
        clearTimeout(glideTimerRef.current);
        glideTimerRef.current = null;
      }
      setIsGliding(false);
    } else {
      // Tap without drag
      const clickedIdx = startPosRef.current?.index;
      if (clickedIdx !== undefined && clickedIdx !== null) {
        const targetLink = NAV_LINKS[clickedIdx];
        if (targetLink && targetLink.path !== location.pathname) {
          performGlideToTab(clickedIdx, targetLink.path);
        }
      }
    }

    setIsHolding(false);
    setIsPressed(false);
    setHeldIndex(null);
    startPosRef.current = null;
    cachedLayoutRef.current = null;
    wasDraggingRef.current = false;
  }, [dragGlassWidth, dragGlassX, heldIndex, location.pathname, navigate, performGlideToTab]);

  const handleNavClick = useCallback((index: number, path: string, e: React.MouseEvent) => {
    if (justDraggedRef.current || wasDraggingRef.current) {
      e.preventDefault();
      return;
    }
    if (path === location.pathname) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    performGlideToTab(index, path);
  }, [location.pathname, performGlideToTab]);

  // Clean up glide timer on unmount
  useEffect(() => {
    return () => {
      if (glideTimerRef.current) {
        clearTimeout(glideTimerRef.current);
      }
    };
  }, []);

  // Synchronize floating glide when route changes externally (e.g., browser back/forward)
  useEffect(() => {
    if (prevPathnameRef.current !== location.pathname) {
      const prevIdx = NAV_LINKS.findIndex(l => l.path === prevPathnameRef.current);
      const nextIdx = NAV_LINKS.findIndex(l => l.path === location.pathname);
      prevPathnameRef.current = location.pathname;
      const now = Date.now();
      if (now - lastGlideTimeRef.current > 350) {
        if (prevIdx !== -1 && nextIdx !== -1 && prevIdx !== nextIdx && !wasDraggingRef.current && !isHolding) {
          triggerGlide(nextIdx, prevIdx);
        }
      }
    }
  }, [location.pathname, isHolding, triggerGlide]);

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
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", updateActiveRect);
    };
  }, [location.pathname, config.verticalPadding, config.itemPaddingY, config.fontSize]);

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
                    transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
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
                    transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
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
                    transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
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
        className="liquid-glass-nav select-none touch-none !overflow-visible"
        style={dockStyle}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Scroll / Slide Track for seamless touch swiping and equal-width tabs */}
        <div 
          ref={trackRef} 
          className="lg-scroll-track relative !overflow-visible"
          style={{ gap: `${isMobile && config.mobileCustomEnabled ? config.mobileItemSpacing : config.itemSpacing}px` }}
        >
          {/* Unified Dynamic Living Glass Capsule Indicator (Floating centered vertically in the nav dock) */}
          {activeRect && (() => {
            const isInteractive = isHolding || isPressed || isGliding;
            const isExpandedState = isInteractive;

            // In static state, precisely inset 0.1mm (~0.38px - 0.4px) inside the nav bounds
            const defaultInsetMm = 0.4; // 0.1 mm in standard screen pixels (~0.38px)
            const staticPadX = config.capsuleStaticPaddingX !== undefined ? config.capsuleStaticPaddingX : defaultInsetMm;
            const staticPadY = config.capsuleStaticPaddingY !== undefined ? config.capsuleStaticPaddingY : defaultInsetMm;

            const restingW = Math.max(32, activeRect.width - (staticPadX * 2));
            const restingH = Math.max(28, activeRect.height - (staticPadY * 2));


            // While sliding/holding or gliding on click: expand capsule ("membesar saat geser / klik bergeser")
            const extraW = config.capsuleExtraWidth ?? 24;
            const extraH = config.capsuleExtraHeight ?? 3;

            const heldItem = (isHolding && heldIndex !== null && cachedLayoutRef.current?.items[heldIndex])
              ? cachedLayoutRef.current.items[heldIndex]
              : null;

            const baseW = heldItem
              ? Math.max(32, heldItem.width - (staticPadX * 2))
              : restingW;

            const baseH = heldItem
              ? Math.max(28, heldItem.height - (staticPadY * 2))
              : restingH;

            // When dragging (isHolding) or gliding on click (isGliding): capsule is enlarged by extraW and extraH
            const isExpanded = isHolding || isGliding;
            const currentExtraW = isExpanded ? extraW : 0;
            const currentExtraH = isExpanded ? extraH : 0;

            const activeW = baseW + currentExtraW;
            const activeH = baseH + currentExtraH;

            // X Position: Follow finger directly while holding, centered on target tab during glide and resting
            const targetX = isHolding 
              ? (dragGlassX - extraW / 2) 
              : (activeRect.x + (activeRect.width - activeW) / 2);

            // Y Position: Perfectly consistent vertical center throughout sliding, gliding, and resting
            const targetY = activeRect.y + (activeRect.height - activeH) / 2;

            // Unified critically damped fluid physics spring (Zero bounce, instant fusion, perfectly matched across click & hold)
            const fluidPhysicsSpring = {
              type: "spring" as const,
              stiffness: 480,
              damping: 42,
              mass: 0.18,
              bounce: 0,
              restSpeed: 0.05,
              restDelta: 0.05,
            };

            const directTouchTrackingSpring = {
              type: "spring" as const,
              stiffness: 580,
              damping: 45,
              mass: 0.1,
            };

            // Dynamic normalized horizontal shift for moving refraction light (0 to 100%)
            const trackWidthEst = cachedLayoutRef.current?.trackWidth || 360;
            const progressRatio = Math.min(1, Math.max(0, targetX / Math.max(1, trackWidthEst - activeW)));
            const lightShiftPercent = Math.round(18 + progressRatio * 64); // 18% to 82%
            const lightAngleDeg = Math.round(115 + (progressRatio - 0.5) * 60); // Angle shifts smoothly as you drag

            // True Capsule Pill: ALWAYS pure continuous pill curvature (9999px)
            const fluidBorderRadius = "9999px";

            return (
              <motion.div
                key="living-glass-capsule"
                initial={false}
                animate={{ 
                  x: targetX,
                  y: targetY,
                  width: activeW,
                  height: activeH,
                  scaleX: 1,
                  scaleY: 1,
                  skewX: 0,
                  borderRadius: fluidBorderRadius,
                }}
                transition={isHolding ? {
                  // Direct touch tracking while dragging
                  x: directTouchTrackingSpring,
                  y: directTouchTrackingSpring,
                  width: fluidPhysicsSpring,
                  height: fluidPhysicsSpring,
                } : {
                  // High-speed, smooth tactile glide and instant fusion upon arrival: 100% synchronized with hold method
                  x: fluidPhysicsSpring,
                  y: fluidPhysicsSpring,
                  width: fluidPhysicsSpring,
                  height: fluidPhysicsSpring,
                  scaleX: { duration: 0 },
                  scaleY: { duration: 0 },
                  borderRadius: { duration: 0 },
                }}
                className="absolute pointer-events-none z-10"
                style={{
                  top: 0,
                  left: 0,
                  isolation: "isolate",
                  WebkitBackfaceVisibility: "hidden",
                  borderRadius: fluidBorderRadius,
                  boxShadow: isExpandedState
                    ? `0 4px 14px -2px rgba(0, 0, 0, 0.35), 0 0 ${Math.round(18 * ((config.capsuleGlowIntensity ?? 60) / 100))}px ${hexToRgba(config.activeBgColor, 0.25 * ((config.capsuleGlowIntensity ?? 60) / 100))}`
                    : `0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)`,
                }}
              >
                {/* Layer 1: Ambient Drop Shadow & Under-Glow */}
                <motion.div
                  className="absolute -inset-1 pointer-events-none"
                  animate={{
                    scale: 1.0,
                    opacity: isExpandedState ? 0.75 : 0,
                  }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  style={{
                    borderRadius: fluidBorderRadius,
                    background: `radial-gradient(ellipse at ${lightShiftPercent}% 50%, ${hexToRgba(config.activeBgColor, 0.35 * ((config.capsuleGlowIntensity ?? 60) / 100))} 0%, transparent 70%)`,
                    filter: "blur(4px)",
                    WebkitFilter: "blur(4px)",
                    transform: "translate3d(0, 0, 0)",
                    WebkitTransform: "translate3d(0, 0, 0)",
                  }}
                />

                {/* Layer 2: Capsule Base Body */}
                <div 
                  className="absolute inset-0 overflow-hidden"
                  style={{
                    borderRadius: fluidBorderRadius,
                    backdropFilter: "none",
                    WebkitBackdropFilter: "none",
                    background: `linear-gradient(180deg, ${hexToRgba(config.activeBgColor, (config.activeBgOpacity ?? 30) / 100 * (isExpandedState ? 1.2 : 1.15))}, ${hexToRgba(config.activeBgColor, (config.activeBgOpacity ?? 30) / 100 * (isExpandedState ? 0.9 : 0.80))})`,
                    border: isExpandedState 
                      ? "1px solid rgba(255, 255, 255, 0.38)"
                      : `1px solid ${hexToRgba("#ffffff", 0.25)}`,
                    boxShadow: isExpandedState
                      ? "inset 0 1.5px 2px rgba(255, 255, 255, 0.35), inset 0 -1.5px 2px rgba(255, 255, 255, 0.20), 0 2px 8px rgba(0, 0, 0, 0.12)"
                      : "inset 0 1px 1.5px rgba(255, 255, 255, 0.35), inset 0 -1px 1px rgba(0, 0, 0, 0.04)",
                    transition: "border 0.28s ease, box-shadow 0.28s ease",
                  }}
                >
                  {/* Subtle Soft Optical Ambient Glow */}
                  <motion.div 
                    animate={{
                      opacity: isExpandedState ? 0.35 : 0,
                    }}
                    transition={{ duration: 0.22 }}
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      borderRadius: fluidBorderRadius,
                      background: `radial-gradient(ellipse at ${lightShiftPercent}% 50%, rgba(255, 255, 255, 0.22) 0%, transparent 75%)`,
                    }}
                  />

                  {/* Soft Optical Refraction Dispersion */}
                  {(config.capsuleChromaticEnabled ?? true) && (
                    <motion.div 
                      animate={{
                        opacity: isExpandedState ? 0.25 : 0,
                        scale: 1.0,
                      }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        padding: "1px",
                        borderRadius: fluidBorderRadius,
                        background: `conic-gradient(from ${lightAngleDeg}deg at ${lightShiftPercent}% 50%, rgba(56,189,248,0.30), rgba(74,222,128,0.25) 25%, rgba(251,191,36,0.20) 50%, rgba(244,63,94,0.25) 75%, rgba(56,189,248,0.30))`,
                        WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                        WebkitMaskComposite: "xor",
                        maskComposite: "exclude",
                        filter: "blur(1.5px)",
                        WebkitFilter: "blur(1.5px)",
                      }}
                    />
                  )}
                </div>
              </motion.div>
            );
          })()}

          {NAV_LINKS.map((link, index) => {
            const isActive = location.pathname === link.path || (link.id === "certificates" && (location.pathname === "/certificate" || location.pathname.startsWith("/certificate")));
            const isCurrentFocus = isHolding ? (heldIndex === index) : isActive;

            return (
              <NavLink
                key={link.path}
                to={link.path}
                id={`nav-item-${link.id}`}
                draggable={false}
                onPointerDown={(e) => handlePointerDown(index, e)}
                onContextMenu={(e) => e.preventDefault()}
                onClick={(e) => {
                  handleNavClick(index, link.path, e);
                }}
                onDragStart={(e) => e.preventDefault()}
                style={{
                  ...itemStyle,
                  color: isCurrentFocus 
                    ? config.activeTextColor 
                    : hexToRgba(config.textColor, config.textOpacity / 100),
                  transform: isActive ? "scale(1.02)" : "scale(1)",
                  transition: "transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), color 0.25s ease",
                }}
                className={`lg-item relative z-20 ${isActive ? "active is-active" : ""} ${isHolding && heldIndex === index ? "held-target" : ""}`}
              >
                {React.cloneElement(link.icon as React.ReactElement<{ size?: number; filled?: boolean; style?: React.CSSProperties }>, {
                  size: config.iconSize,
                  filled: isCurrentFocus,
                  style: {
                    opacity: isCurrentFocus ? 1 : config.iconOpacity / 100,
                    stroke: isCurrentFocus ? config.activeIconColor : config.iconColor,
                    color: isCurrentFocus ? config.activeIconColor : config.iconColor,
                    transform: isActive ? "scale(1.04)" : "scale(1)",
                    transition: "transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.25s ease, opacity 0.25s ease",
                    position: "relative",
                    zIndex: 10,
                  }
                })}
                <span 
                  className="lg-label relative z-10" 
                  style={{
                    ...labelStyle,
                    color: isCurrentFocus 
                      ? config.activeTextColor 
                      : hexToRgba(config.textColor, config.textOpacity / 100),
                    transition: (isHolding || isGliding) 
                      ? "color 0.12s ease-out" 
                      : "color 0.38s ease",
                  }}
                >
                  {link.label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
}


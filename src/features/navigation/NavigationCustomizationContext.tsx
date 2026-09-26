import React, { createContext, useContext, useState, useEffect } from "react";
import { hexToRgba } from "./colorUtils";

export interface NavigationConfig {
  // Background
  bgType: "color" | "gradient" | "glass";
  bgColor: string;
  bgOpacity: number; // 0 - 100 (%)
  bgGradientEnabled: boolean;
  bgGradientStart: string;
  bgGradientEnd: string;
  bgGradientDirection: string; // '180deg' | '135deg' | '90deg' | '45deg' | 'to bottom right'
  bgImageUrl: string;
  backdropBlur: number; // 0 - 40 (px)
  backgroundBlur: number; // 0 - 40 (px)
  saturation: number; // 50 - 250 (%)
  brightness: number; // 50 - 150 (%)
  contrast: number; // 50 - 150 (%)

  // Border
  borderEnabled: boolean;
  borderColor: string;
  borderOpacity: number; // 0 - 100 (%)
  borderWidth: number; // 0 - 8 (px)
  borderRadius: number; // 0 - 999 (px)
  borderStyle: "solid" | "dashed" | "dotted" | "double";

  // Glass & Blur Effect
  glassPreset: "none" | "glass" | "frosted" | "heavy" | "transparent" | "dark-glass" | "luxury" | "custom";
  glassTint: string;
  glassOpacity: number; // 0 - 100 (%)

  // Shadow
  shadowEnabled: boolean;
  shadowColor: string;
  shadowOpacity: number; // 0 - 100 (%)
  shadowBlur: number; // 0 - 60 (px)
  shadowSpread: number; // -10 - 25 (px)
  shadowX: number; // -30 - 30 (px)
  shadowY: number; // -30 - 40 (px)
  shadowPreset: "none" | "soft" | "medium" | "strong" | "floating" | "custom";

  // Navigation Items
  textColor: string;
  textOpacity: number; // 0 - 100 (%)
  hoverTextColor: string;
  activeTextColor: string;
  activeBgColor: string;
  activeBgOpacity: number; // 0 - 100 (%)
  hoverBgColor: string;
  hoverBgOpacity: number; // 0 - 100 (%)
  fontSize: number; // 8 - 18 (px)
  fontWeight: number; // 300 - 800
  letterSpacing: number; // -0.05 to 0.25 (em)
  itemSpacing: number; // 0 - 24 (px)
  itemPaddingY: number; // 2 - 16 (px)
  itemPaddingX: number; // 2 - 20 (px)
  itemBorderRadius: number; // 0 - 999 (px)
  hoverAnimation: "none" | "scale" | "glow" | "lift";
  activeAnimation: "none" | "melt" | "scale" | "pulse";
  transitionSpeed: number; // 100 - 800 (ms)
  hoverScale: number; // 0.90 - 1.20
  hoverGlow: boolean;
  hoverGlowIntensity: number; // 0 - 100 (%)

  // Icon
  iconColor: string;
  iconSize: number; // 14 - 32 (px)
  iconOpacity: number; // 0 - 100 (%)
  activeIconColor: string;
  hoverIconColor: string;
  iconSpacing: number; // 0 - 12 (px)

  // Position & Size
  maxWidth: number; // 240 - 700 (px)
  bottomOffset: number; // 0 - 60 (px)
  horizontalPadding: number; // 4 - 24 (px)
  verticalPadding: number; // 4 - 20 (px)

  // Animation & Effects
  animationEnabled: boolean;
  animationType: "smooth" | "fade" | "scale" | "slide" | "glow" | "none";
  transitionDuration: number; // 150 - 1000 (ms)
  easing: "spring" | "ease" | "ease-out" | "linear";
  activeIndicatorEnabled: boolean;
  activeIndicatorRadius: number; // 0 - 999 (px)
  activeIndicatorOpacity: number; // 0 - 100 (%)
  activeIndicatorGlow: boolean;

  // Mobile Navigation
  mobileCustomEnabled: boolean;
  mobileBgColor: string;
  mobileBgOpacity: number;
  mobileBackdropBlur: number;
  mobileBorderEnabled: boolean;
  mobileBorderColor: string;
  mobileBorderOpacity: number;
  mobileRadius: number;
  mobilePaddingY: number;
  mobilePaddingX: number;
  mobileItemSpacing: number;
  mobileMaxWidth: number;
}

export const DEFAULT_NAVIGATION_CONFIG: NavigationConfig = {
  // Background
  bgType: "glass",
  bgColor: "#0e1c38",
  bgOpacity: 35,
  bgGradientEnabled: true,
  bgGradientStart: "#0e1c38",
  bgGradientEnd: "#040a18",
  bgGradientDirection: "180deg",
  bgImageUrl: "",
  backdropBlur: 13,
  backgroundBlur: 0,
  saturation: 145,
  brightness: 100,
  contrast: 100,

  // Border
  borderEnabled: true,
  borderColor: "#ffffff",
  borderOpacity: 18,
  borderWidth: 1,
  borderRadius: 999,
  borderStyle: "solid",

  // Glass & Blur Effect
  glassPreset: "glass",
  glassTint: "#7db3ff",
  glassOpacity: 25,

  // Shadow
  shadowEnabled: true,
  shadowColor: "#000000",
  shadowOpacity: 35,
  shadowBlur: 36,
  shadowSpread: 0,
  shadowX: 0,
  shadowY: 12,
  shadowPreset: "medium",

  // Navigation Items
  textColor: "#ffffff",
  textOpacity: 65,
  hoverTextColor: "#ffffff",
  activeTextColor: "#ffffff",
  activeBgColor: "#8cafef",
  activeBgOpacity: 30,
  hoverBgColor: "#ffffff",
  hoverBgOpacity: 8,
  fontSize: 10.5,
  fontWeight: 600,
  letterSpacing: 0.01,
  itemSpacing: 2,
  itemPaddingY: 7,
  itemPaddingX: 4,
  itemBorderRadius: 999,
  hoverAnimation: "glow",
  activeAnimation: "melt",
  transitionSpeed: 380,
  hoverScale: 1,
  hoverGlow: true,
  hoverGlowIntensity: 40,

  // Icon
  iconColor: "#ffffff",
  iconSize: 20,
  iconOpacity: 80,
  activeIconColor: "#ffffff",
  hoverIconColor: "#ffffff",
  iconSpacing: 3,

  // Position & Size
  maxWidth: 430,
  bottomOffset: 16,
  horizontalPadding: 8,
  verticalPadding: 6,

  // Animation & Effects
  animationEnabled: true,
  animationType: "smooth",
  transitionDuration: 520,
  easing: "spring",
  activeIndicatorEnabled: true,
  activeIndicatorRadius: 999,
  activeIndicatorOpacity: 100,
  activeIndicatorGlow: true,

  // Mobile Navigation
  mobileCustomEnabled: false,
  mobileBgColor: "#0e1c38",
  mobileBgOpacity: 45,
  mobileBackdropBlur: 14,
  mobileBorderEnabled: true,
  mobileBorderColor: "#ffffff",
  mobileBorderOpacity: 20,
  mobileRadius: 999,
  mobilePaddingY: 6,
  mobilePaddingX: 6,
  mobileItemSpacing: 1,
  mobileMaxWidth: 390,
};

export interface CustomPreset {
  id: string;
  name: string;
  createdAt: string;
  config: NavigationConfig;
}

export const PRESET_CONFIGS: Record<string, Partial<NavigationConfig>> = {
  default: DEFAULT_NAVIGATION_CONFIG,
  minimal: {
    bgType: "color",
    bgColor: "#090d16",
    bgOpacity: 60,
    bgGradientEnabled: false,
    backdropBlur: 8,
    borderEnabled: true,
    borderColor: "#ffffff",
    borderOpacity: 12,
    borderWidth: 1,
    borderRadius: 999,
    shadowEnabled: true,
    shadowOpacity: 20,
    shadowBlur: 20,
    activeBgColor: "#ffffff",
    activeBgOpacity: 18,
    textColor: "#ffffff",
    textOpacity: 55,
    activeTextColor: "#ffffff",
    hoverGlow: false,
    glassPreset: "none",
  },
  glass: {
    bgType: "glass",
    bgColor: "#0c1832",
    bgOpacity: 28,
    bgGradientEnabled: true,
    bgGradientStart: "#0e1c38",
    bgGradientEnd: "#040a18",
    bgGradientDirection: "180deg",
    backdropBlur: 14,
    saturation: 155,
    borderEnabled: true,
    borderColor: "#ffffff",
    borderOpacity: 22,
    borderWidth: 1,
    borderRadius: 999,
    activeBgColor: "#8cb4ff",
    activeBgOpacity: 35,
    activeTextColor: "#ffffff",
    shadowEnabled: true,
    shadowOpacity: 40,
    shadowBlur: 35,
    glassPreset: "glass",
  },
  frosted: {
    bgType: "glass",
    bgColor: "#ffffff",
    bgOpacity: 14,
    bgGradientEnabled: true,
    bgGradientStart: "rgba(255,255,255,0.22)",
    bgGradientEnd: "rgba(255,255,255,0.06)",
    bgGradientDirection: "180deg",
    backdropBlur: 24,
    saturation: 180,
    borderEnabled: true,
    borderColor: "#ffffff",
    borderOpacity: 35,
    borderWidth: 1.5,
    borderRadius: 999,
    activeBgColor: "#ffffff",
    activeBgOpacity: 28,
    textColor: "#ffffff",
    textOpacity: 75,
    activeTextColor: "#ffffff",
    shadowEnabled: true,
    shadowOpacity: 35,
    shadowBlur: 40,
    glassPreset: "frosted",
  },
  "dark-glass": {
    bgType: "gradient",
    bgColor: "#030712",
    bgOpacity: 75,
    bgGradientEnabled: true,
    bgGradientStart: "#060e22",
    bgGradientEnd: "#02040a",
    bgGradientDirection: "180deg",
    backdropBlur: 18,
    saturation: 160,
    borderEnabled: true,
    borderColor: "#38bdf8",
    borderOpacity: 30,
    borderWidth: 1,
    borderRadius: 999,
    activeBgColor: "#0284c7",
    activeBgOpacity: 45,
    textColor: "#94a3b8",
    textOpacity: 80,
    activeTextColor: "#38bdf8",
    hoverTextColor: "#bae6fd",
    shadowEnabled: true,
    shadowColor: "#0284c7",
    shadowOpacity: 30,
    shadowBlur: 30,
    glassPreset: "dark-glass",
  },
  transparent: {
    bgType: "color",
    bgColor: "#000000",
    bgOpacity: 0,
    bgGradientEnabled: false,
    backdropBlur: 0,
    borderEnabled: false,
    borderRadius: 999,
    shadowEnabled: false,
    activeBgColor: "#ffffff",
    activeBgOpacity: 20,
    textColor: "#ffffff",
    textOpacity: 70,
    activeTextColor: "#ffffff",
    hoverGlow: false,
    glassPreset: "transparent",
  },
  luxury: {
    bgType: "gradient",
    bgColor: "#0b0c10",
    bgOpacity: 70,
    bgGradientEnabled: true,
    bgGradientStart: "#1a1610",
    bgGradientEnd: "#080705",
    bgGradientDirection: "135deg",
    backdropBlur: 16,
    saturation: 150,
    borderEnabled: true,
    borderColor: "#fbbf24",
    borderOpacity: 35,
    borderWidth: 1,
    borderRadius: 999,
    activeBgColor: "#d97706",
    activeBgOpacity: 40,
    textColor: "#fef3c7",
    textOpacity: 75,
    activeTextColor: "#fde68a",
    hoverTextColor: "#fef08a",
    shadowEnabled: true,
    shadowColor: "#f59e0b",
    shadowOpacity: 25,
    shadowBlur: 32,
    glassPreset: "luxury",
  },
};

const STORAGE_KEY = "bp_navigation_config_v1";
const PRESETS_STORAGE_KEY = "bp_navigation_saved_presets_v1";

interface NavigationCustomizationContextType {
  config: NavigationConfig;
  updateConfig: (updates: Partial<NavigationConfig>) => void;
  resetConfig: () => void;
  applyPreset: (presetName: string) => void;
  savedPresets: CustomPreset[];
  saveCustomPreset: (name: string) => void;
  deleteCustomPreset: (id: string) => void;
  loadCustomPreset: (preset: CustomPreset) => void;
  activePresetKey: string;
}

const NavigationCustomizationContext = createContext<NavigationCustomizationContextType | undefined>(undefined);

export const NavigationCustomizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<NavigationConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_NAVIGATION_CONFIG, ...parsed };
      }
    } catch (e) {
      console.error("Failed to load navigation config from localStorage", e);
    }
    return DEFAULT_NAVIGATION_CONFIG;
  });

  const [activePresetKey, setActivePresetKey] = useState<string>("default");

  const [savedPresets, setSavedPresets] = useState<CustomPreset[]>(() => {
    try {
      const saved = localStorage.getItem(PRESETS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load custom presets from localStorage", e);
    }
    return [];
  });

  // Apply CSS Variables to Document Root for immediate reactive styling everywhere
  useEffect(() => {
    const root = document.documentElement;
    
    // Background vars
    const bgOpacityFrac = (config.bgOpacity / 100).toFixed(2);
    root.style.setProperty("--nav-bg-color", config.bgColor);
    root.style.setProperty("--nav-bg-opacity", bgOpacityFrac);
    root.style.setProperty("--nav-backdrop-blur", `${config.backdropBlur}px`);
    root.style.setProperty("--nav-saturation", `${config.saturation}%`);
    root.style.setProperty("--nav-brightness", `${config.brightness}%`);
    root.style.setProperty("--nav-contrast", `${config.contrast}%`);

    // Border vars
    const borderOpacityFrac = (config.borderOpacity / 100).toFixed(2);
    root.style.setProperty("--nav-border-enabled", config.borderEnabled ? "1" : "0");
    root.style.setProperty("--nav-border-color", config.borderColor);
    root.style.setProperty("--nav-border-opacity", borderOpacityFrac);
    root.style.setProperty("--nav-border-width", `${config.borderWidth}px`);
    root.style.setProperty("--nav-border-radius", `${config.borderRadius}px`);
    root.style.setProperty("--nav-border-style", config.borderStyle);

    // Shadow vars
    const shadowOpacityFrac = (config.shadowOpacity / 100).toFixed(2);
    root.style.setProperty("--nav-shadow-enabled", config.shadowEnabled ? "1" : "0");
    root.style.setProperty("--nav-shadow-color", config.shadowColor);
    root.style.setProperty("--nav-shadow-opacity", shadowOpacityFrac);
    root.style.setProperty("--nav-shadow-blur", `${config.shadowBlur}px`);
    root.style.setProperty("--nav-shadow-spread", `${config.shadowSpread}px`);
    root.style.setProperty("--nav-shadow-x", `${config.shadowX}px`);
    root.style.setProperty("--nav-shadow-y", `${config.shadowY}px`);

    // Item Typography & Colors
    const textOpacityFrac = config.textOpacity / 100;
    root.style.setProperty("--nav-text-color", hexToRgba(config.textColor, textOpacityFrac));
    root.style.setProperty("--nav-text-opacity", textOpacityFrac.toFixed(2));
    root.style.setProperty("--nav-hover-text-color", config.hoverTextColor);
    root.style.setProperty("--nav-active-text-color", config.activeTextColor);
    root.style.setProperty("--nav-active-bg-color", hexToRgba(config.activeBgColor, config.activeBgOpacity / 100));
    root.style.setProperty("--nav-active-bg-opacity", (config.activeBgOpacity / 100).toFixed(2));
    root.style.setProperty("--nav-hover-bg-color", hexToRgba(config.hoverBgColor, config.hoverBgOpacity / 100));
    root.style.setProperty("--nav-hover-bg-opacity", (config.hoverBgOpacity / 100).toFixed(2));
    root.style.setProperty("--nav-font-size", `${config.fontSize}px`);
    root.style.setProperty("--nav-font-weight", `${config.fontWeight}`);
    root.style.setProperty("--nav-letter-spacing", `${config.letterSpacing}em`);
    root.style.setProperty("--nav-item-spacing", `${config.itemSpacing}px`);
    root.style.setProperty("--nav-item-padding-y", `${config.itemPaddingY}px`);
    root.style.setProperty("--nav-item-padding-x", `${config.itemPaddingX}px`);
    root.style.setProperty("--nav-item-radius", `${config.itemBorderRadius}px`);

    // Icon vars
    root.style.setProperty("--nav-icon-color", hexToRgba(config.iconColor, config.iconOpacity / 100));
    root.style.setProperty("--nav-icon-size", `${config.iconSize}px`);
    root.style.setProperty("--nav-icon-opacity", (config.iconOpacity / 100).toFixed(2));
    root.style.setProperty("--nav-active-icon-color", config.activeIconColor);
    root.style.setProperty("--nav-hover-icon-color", config.hoverIconColor);
    root.style.setProperty("--nav-icon-spacing", `${config.iconSpacing}px`);

    // Position & Dimension vars
    root.style.setProperty("--nav-max-width", `${config.maxWidth}px`);
    root.style.setProperty("--nav-bottom-offset", `${config.bottomOffset}px`);
    root.style.setProperty("--nav-padding-x", `${config.horizontalPadding}px`);
    root.style.setProperty("--nav-padding-y", `${config.verticalPadding}px`);

    // Animation & Transition
    root.style.setProperty("--nav-transition-duration", `${config.transitionDuration}ms`);
    root.style.setProperty("--nav-transition-speed", `${config.transitionSpeed}ms`);
    root.style.setProperty("--nav-hover-scale", "1");

    // Persist to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
      console.error("Failed to save navigation config to localStorage", e);
    }
  }, [config]);

  const updateConfig = (updates: Partial<NavigationConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
    setActivePresetKey("custom");
  };

  const resetConfig = () => {
    setConfig(DEFAULT_NAVIGATION_CONFIG);
    setActivePresetKey("default");
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
  };

  const applyPreset = (presetName: string) => {
    if (PRESET_CONFIGS[presetName]) {
      setConfig((prev) => ({ ...prev, ...PRESET_CONFIGS[presetName] }));
      setActivePresetKey(presetName);
    }
  };

  const saveCustomPreset = (name: string) => {
    const newPreset: CustomPreset = {
      id: `preset_${Date.now()}`,
      name: name.trim() || `Preset ${savedPresets.length + 1}`,
      createdAt: new Date().toISOString(),
      config: { ...config },
    };
    const updated = [newPreset, ...savedPresets];
    setSavedPresets(updated);
    try {
      localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const deleteCustomPreset = (id: string) => {
    const updated = savedPresets.filter((p) => p.id !== id);
    setSavedPresets(updated);
    try {
      localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const loadCustomPreset = (preset: CustomPreset) => {
    setConfig(preset.config);
    setActivePresetKey(`custom_${preset.id}`);
  };

  return (
    <NavigationCustomizationContext.Provider
      value={{
        config,
        updateConfig,
        resetConfig,
        applyPreset,
        savedPresets,
        saveCustomPreset,
        deleteCustomPreset,
        loadCustomPreset,
        activePresetKey,
      }}
    >
      {children}
    </NavigationCustomizationContext.Provider>
  );
};

export const useNavigationCustomization = (): NavigationCustomizationContextType => {
  const context = useContext(NavigationCustomizationContext);
  if (!context) {
    throw new Error("useNavigationCustomization must be used within a NavigationCustomizationProvider");
  }
  return context;
};

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Sliders, 
  Palette, 
  Layers, 
  Sparkles, 
  Box, 
  Type, 
  Smartphone, 
  RotateCcw, 
  Save, 
  Trash2, 
  Eye, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck,
  Sun,
  Moon,
  Compass,
  Zap,
  Layout,
  HelpCircle,
  AlertTriangle,
  Move
} from "lucide-react";
import { 
  useNavigationCustomization, 
  PRESET_CONFIGS, 
  CustomPreset,
  NavigationConfig 
} from "../../features/navigation/NavigationCustomizationContext";
import { hexToRgba, buildNavBoxShadow } from "../../features/navigation/colorUtils";
import { Home, Briefcase, Image as ImageIcon, MessageSquare, Boxes, Waves } from "lucide-react";

// Mock links for Live Preview
const PREVIEW_LINKS = [
  { id: "home", label: "Home", icon: <Home /> },
  { id: "projects", label: "Projects", icon: <Briefcase /> },
  { id: "gallery", label: "Gallery", icon: <ImageIcon /> },
  { id: "features", label: "Feature", icon: <Boxes /> },
  { id: "comments", label: "Comments", icon: <MessageSquare /> },
];

export function NavigationCustomizationView() {
  const {
    config,
    updateConfig,
    resetConfig,
    applyPreset,
    savedPresets,
    saveCustomPreset,
    deleteCustomPreset,
    loadCustomPreset,
    activePresetKey,
  } = useNavigationCustomization();

  // Collapsible section states
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    background: false,
    glass: false,
    border: false,
    shadow: false,
    items: false,
    icons: false,
    position: false,
    animation: false,
    mobile: true, // Collapsed by default
  });

  // UI state
  const [previewComponentMode, setPreviewComponentMode] = useState<"dock" | "dropdown">("dock");
  const [previewActiveTab, setPreviewActiveTab] = useState<string>("home");
  const [previewDropdownLink, setPreviewDropdownLink] = useState<string>("qna");
  const [previewDropdownBg, setPreviewDropdownBg] = useState<string>("molten");
  const [previewBgTheme, setPreviewBgTheme] = useState<"molten" | "dark" | "cyber" | "light">("molten");
  const [presetNameInput, setPresetNameInput] = useState("");
  const [showSavePresetModal, setShowSavePresetModal] = useState(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleSavePreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!presetNameInput.trim()) return;
    saveCustomPreset(presetNameInput.trim());
    setPresetNameInput("");
    setShowSavePresetModal(false);
    setSavedSuccessMsg("Preset berhasil disimpan!");
    setTimeout(() => setSavedSuccessMsg(null), 3000);
  };

  const handleReset = () => {
    resetConfig();
    setShowResetConfirmModal(false);
    setSavedSuccessMsg("Pengaturan navigasi telah direset ke default.");
    setTimeout(() => setSavedSuccessMsg(null), 3000);
  };

  // Compute live preview dock style
  const previewDockStyle: React.CSSProperties = {
    background: config.bgType === "color"
      ? hexToRgba(config.bgColor, config.bgOpacity / 100)
      : config.bgGradientEnabled
      ? `linear-gradient(180deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.03) 100%), linear-gradient(${config.bgGradientDirection}, ${hexToRgba(config.bgGradientStart, config.bgOpacity / 100)}, ${hexToRgba(config.bgGradientEnd, config.bgOpacity / 100)})`
      : `linear-gradient(180deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.03) 100%), ${hexToRgba(config.bgColor, config.bgOpacity / 100)}`,
    backdropFilter: `blur(${config.backdropBlur}px) saturate(${config.saturation}%) brightness(${config.brightness}%) contrast(${config.contrast}%)`,
    WebkitBackdropFilter: `blur(${config.backdropBlur}px) saturate(${config.saturation}%) brightness(${config.brightness}%) contrast(${config.contrast}%)`,
    border: config.borderEnabled 
      ? `${config.borderWidth}px ${config.borderStyle} ${hexToRgba(config.borderColor, config.borderOpacity / 100)}` 
      : "none",
    borderRadius: `${config.borderRadius}px`,
    boxShadow: buildNavBoxShadow(config),
    padding: `${config.verticalPadding}px ${config.horizontalPadding}px`,
    maxWidth: `${config.maxWidth}px`,
    width: "100%",
  };

  const previewHighlightStyle: React.CSSProperties = {
    background: `linear-gradient(165deg, ${hexToRgba(config.activeBgColor, config.activeBgOpacity / 100)}, ${hexToRgba(config.activeBgColor, (config.activeBgOpacity * 0.6) / 100)})`,
    border: `1px solid ${hexToRgba("#ffffff", 0.35)}`,
    boxShadow: config.activeIndicatorGlow 
      ? `0 4px 14px ${hexToRgba(config.activeBgColor, 0.35)}, inset 0 1px 1px rgba(255, 255, 255, 0.45)`
      : "inset 0 1px 1px rgba(255, 255, 255, 0.35)",
    borderRadius: `${config.activeIndicatorRadius}px`,
    opacity: config.activeIndicatorEnabled ? (config.activeIndicatorOpacity / 100) : 0,
    display: config.activeIndicatorEnabled ? "block" : "none",
  };

  const previewItemStyle: React.CSSProperties = {
    padding: `${config.itemPaddingY}px ${config.itemPaddingX}px`,
    borderRadius: `${config.itemBorderRadius}px`,
    gap: `${config.iconSpacing}px`,
    color: hexToRgba(config.textColor, config.textOpacity / 100),
  };

  const previewLabelStyle: React.CSSProperties = {
    fontSize: `${config.fontSize}px`,
    fontWeight: config.fontWeight,
    letterSpacing: `${config.letterSpacing}em`,
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Top Banner / Info */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-purple-950/20 border border-blue-500/20 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
            <Sliders size={20} />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-white tracking-tight flex items-center gap-2">
              <span>Navigation Real-time Customizer</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300">
                Live Synced
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary mt-0.5 max-w-2xl">
              Ubah tampilan, warna, transparansi, blur, bayangan, tipografi, dan animasi bilah navigasi secara langsung. Perubahan langsung aktif di seluruh website tanpa perlu reload halaman.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setShowResetConfirmModal(true)}
            className="ios-glass-btn px-3.5 py-2 text-xs font-semibold rounded-xl text-rose-300 hover:text-rose-200 border-rose-500/20 hover:border-rose-500/40 flex items-center gap-1.5 cursor-pointer transition-all"
            title="Kembalikan semua pengaturan navigasi ke default"
          >
            <RotateCcw size={14} />
            <span>Reset Default</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSavePresetModal(true)}
            className="ios-glass-btn ios-glass-primary px-4 py-2 text-xs font-semibold rounded-xl text-white flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
            title="Simpan konfigurasi saat ini sebagai preset kustom"
          >
            <Save size={14} />
            <span>Simpan Preset</span>
          </button>
        </div>
      </div>

      {savedSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Check size={16} className="shrink-0" />
          <span>{savedSuccessMsg}</span>
        </div>
      )}

      {/* STICKY / INTERACTIVE LIVE PREVIEW CARD */}
      <div className="sticky top-16 z-30 p-5 rounded-2xl bg-[rgba(8,16,36,0.85)] border border-blue-500/25 backdrop-blur-xl shadow-2xl flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Eye size={16} className="text-[#7DB3FF]" />
              <span className="text-xs sm:text-sm font-semibold text-white tracking-wide uppercase">
                Live Preview
              </span>
            </div>

            {/* Target Component Mode Selector */}
            <div className="flex items-center p-0.5 rounded-lg bg-white/5 border border-white/10">
              <button
                type="button"
                onClick={() => setPreviewComponentMode("dock")}
                className={`px-2.5 py-1 text-xs rounded-md font-medium cursor-pointer transition-all ${
                  previewComponentMode === "dock"
                    ? "bg-blue-600/40 text-white border border-blue-400/40 shadow-sm"
                    : "text-text-secondary hover:text-white"
                }`}
              >
                Bottom Dock
              </button>
              <button
                type="button"
                onClick={() => setPreviewComponentMode("dropdown")}
                className={`px-2.5 py-1 text-xs rounded-md font-medium cursor-pointer transition-all ${
                  previewComponentMode === "dropdown"
                    ? "bg-blue-600/40 text-white border border-blue-400/40 shadow-sm"
                    : "text-text-secondary hover:text-white"
                }`}
              >
                More Menu Popover
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-text-secondary text-[11px] hidden sm:inline">Latar Preview:</span>
            <button
              type="button"
              onClick={() => setPreviewBgTheme("molten")}
              className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all ${
                previewBgTheme === "molten" 
                  ? "bg-blue-600/40 text-blue-300 border border-blue-400/40" 
                  : "bg-white/5 text-text-secondary hover:text-white"
              }`}
            >
              Molten
            </button>
            <button
              type="button"
              onClick={() => setPreviewBgTheme("cyber")}
              className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all ${
                previewBgTheme === "cyber" 
                  ? "bg-cyan-600/40 text-cyan-300 border border-cyan-400/40" 
                  : "bg-white/5 text-text-secondary hover:text-white"
              }`}
            >
              Cyber Neon
            </button>
            <button
              type="button"
              onClick={() => setPreviewBgTheme("dark")}
              className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all ${
                previewBgTheme === "dark" 
                  ? "bg-slate-700/60 text-slate-200 border border-slate-500/40" 
                  : "bg-white/5 text-text-secondary hover:text-white"
              }`}
            >
              Dark Void
            </button>
          </div>
        </div>

        {/* Preview Canvas Stage */}
        <div 
          className={`relative rounded-xl p-6 sm:p-10 flex items-center justify-center overflow-hidden transition-all min-h-[170px] border border-white/10 ${
            previewBgTheme === "molten"
              ? "bg-gradient-to-tr from-[#05060d] via-[#101b3d] to-[#0a122c]"
              : previewBgTheme === "cyber"
              ? "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/60 via-purple-950/40 to-black"
              : "bg-black"
          }`}
        >
          {/* Animated decorative shapes in background to clearly demonstrate blur & translucency */}
          <div className="absolute top-3 left-10 w-24 h-24 rounded-full bg-blue-500/30 filter blur-xl pointer-events-none animate-pulse" />
          <div className="absolute bottom-2 right-12 w-32 h-32 rounded-full bg-purple-500/30 filter blur-2xl pointer-events-none" />
          <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent top-1/2 pointer-events-none" />

          {previewComponentMode === "dock" ? (
            /* Rendered Live Navigation Bar */
            <div className="relative z-10 w-full flex justify-center">
              <nav className="liquid-glass-nav-preview" style={previewDockStyle}>
                <div 
                  className="flex items-center justify-between w-full"
                  style={{ gap: `${config.itemSpacing}px` }}
                >
                  {PREVIEW_LINKS.map((link) => {
                    const isActive = previewActiveTab === link.id;
                    return (
                      <button
                        key={link.id}
                        type="button"
                        onClick={() => setPreviewActiveTab(link.id)}
                        style={{
                          ...previewItemStyle,
                          color: isActive 
                            ? config.activeTextColor 
                            : hexToRgba(config.textColor, config.textOpacity / 100),
                        }}
                        className="relative flex-1 min-w-0 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 border border-transparent select-none group"
                      >
                        {/* Single Shared Gliding Active Shape */}
                        {isActive && (
                          <motion.div 
                            layoutId="preview-active-nav-shape"
                            style={previewHighlightStyle} 
                            className="absolute inset-0 z-0 pointer-events-none"
                            transition={{
                              type: "spring",
                              stiffness: 420,
                              damping: 35,
                              mass: 0.8,
                            }}
                            aria-hidden="true" 
                          />
                        )}
                        
                        <span className="relative z-10 shrink-0 transition-opacity">
                          {React.cloneElement(link.icon as React.ReactElement<{ size?: number; style?: React.CSSProperties }>, {
                            size: config.iconSize,
                            style: {
                              opacity: isActive ? 1 : config.iconOpacity / 100,
                              stroke: isActive ? config.activeIconColor : config.iconColor,
                              color: isActive ? config.activeIconColor : config.iconColor,
                              filter: isActive && config.hoverGlow ? `drop-shadow(0 1px 4px ${hexToRgba(config.activeBgColor, 0.5)})` : "none"
                            }
                          })}
                        </span>
                        
                        <span 
                          className="relative z-10 truncate w-full text-center mt-0.5" 
                          style={previewLabelStyle}
                        >
                          {link.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </nav>
            </div>
          ) : (
            /* Rendered Live More Menu Dropdown Popover */
            <div className="relative z-10 flex justify-center">
              <div 
                style={{
                  ...previewDockStyle,
                  maxWidth: "205px",
                  padding: "6px",
                  borderRadius: "16px",
                }}
                className="flex flex-col gap-1 shadow-2xl relative overflow-hidden"
              >
                <div className="glass-surface-highlight pointer-events-none" aria-hidden="true" />
                
                <div className="relative z-10 flex flex-col gap-1">
                  {[
                    { id: "qna", label: "Tanya & Jawab (QnA)", icon: <MessageSquare size={14} /> },
                    { id: "certificate", label: "Sertifikat Keaslian", icon: <ShieldCheck size={14} /> },
                  ].map((item) => {
                    const isActive = previewDropdownLink === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setPreviewDropdownLink(item.id)}
                        style={{
                          borderRadius: `${Math.min(12, config.itemBorderRadius)}px`,
                          color: isActive ? config.activeTextColor : hexToRgba(config.textColor, config.textOpacity / 100),
                          background: isActive 
                            ? `linear-gradient(165deg, ${hexToRgba(config.activeBgColor, config.activeBgOpacity / 100)}, ${hexToRgba(config.activeBgColor, (config.activeBgOpacity * 0.6) / 100)})`
                            : undefined,
                          borderColor: isActive ? hexToRgba("#ffffff", 0.3) : "transparent",
                          fontSize: `${config.fontSize + 0.5}px`,
                          fontWeight: config.fontWeight,
                        }}
                        className="p-1.5 flex items-center gap-2 text-left cursor-pointer border transition-all text-xs"
                      >
                        <span 
                          style={{
                            background: "rgba(255, 255, 255, 0.08)",
                            borderColor: "rgba(255, 255, 255, 0.15)",
                            color: config.activeIconColor,
                          }}
                          className="p-1 rounded-md border shrink-0"
                        >
                          {item.icon}
                        </span>
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}

                  <div className="h-px bg-white/10 my-0.5 mx-1" />

                  <div className="px-1.5 pt-0.5 pb-0.5 flex items-center">
                    <span 
                      style={{
                        color: config.activeTextColor,
                        opacity: 0.8,
                        letterSpacing: `${config.letterSpacing + 0.04}em`,
                      }}
                      className="text-[9px] font-semibold uppercase"
                    >
                      Background
                    </span>
                  </div>

                  {[
                    { id: "molten", label: "Molten Metal", icon: <Waves size={14} /> },
                    { id: "ghost-fibers", label: "Ghost Fibers", icon: <Compass size={14} /> },
                    { id: "light-pillar", label: "Light Pillar", icon: <Zap size={14} /> },
                  ].map((bg) => {
                    const isActive = previewDropdownBg === bg.id;
                    return (
                      <button
                        key={bg.id}
                        type="button"
                        onClick={() => setPreviewDropdownBg(bg.id)}
                        style={{
                          borderRadius: `${Math.min(12, config.itemBorderRadius)}px`,
                          color: isActive ? config.activeTextColor : hexToRgba(config.textColor, config.textOpacity / 100),
                          background: isActive
                            ? `linear-gradient(165deg, ${hexToRgba(config.activeBgColor, config.activeBgOpacity / 100)}, ${hexToRgba(config.activeBgColor, (config.activeBgOpacity * 0.6) / 100)})`
                            : undefined,
                          borderColor: isActive ? hexToRgba("#ffffff", 0.3) : "transparent",
                          fontSize: `${config.fontSize + 0.5}px`,
                          fontWeight: config.fontWeight,
                        }}
                        className="p-1.5 flex items-center justify-between text-left cursor-pointer border transition-all text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span 
                            style={{ color: config.activeIconColor }}
                            className="p-1 rounded-md bg-white/[0.08] border border-white/15 shrink-0"
                          >
                            {bg.icon}
                          </span>
                          <span className="truncate">{bg.label}</span>
                        </div>
                        {isActive && (
                          <span 
                            style={{
                              backgroundColor: hexToRgba(config.activeBgColor, 0.35),
                              borderColor: hexToRgba(config.activeBgColor, 0.8),
                              color: config.activeTextColor,
                            }}
                            className="shrink-0 w-3.5 h-3.5 rounded-full border flex items-center justify-center ml-1"
                          >
                            <Check size={9} strokeWidth={2.5} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PRESETS SECTION */}
      <div className="p-5 rounded-2xl bg-[rgba(6,15,35,0.4)] border border-white/10 backdrop-blur-md flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-amber-400" />
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Preset Desain Navigasi
            </h3>
          </div>
          <span className="text-xs text-text-secondary">Pilih preset instan atau buat gaya kustom</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
          {Object.entries({
            default: "Default Liquid",
            glass: "Crystal Glass",
            frosted: "Frosted Glass",
            "dark-glass": "Dark Neon",
            minimal: "Minimal Clean",
            transparent: "Transparent",
            luxury: "Luxury Gold",
          }).map(([key, label]) => {
            const isActive = activePresetKey === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => applyPreset(key)}
                className={`px-3 py-2.5 rounded-xl text-xs font-medium cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 border ${
                  isActive
                    ? "bg-blue-600/30 border-blue-400 text-white shadow-[0_0_12px_rgba(59,130,246,0.3)]"
                    : "bg-white/[0.04] border-white/10 text-text-secondary hover:text-white hover:bg-white/[0.08]"
                }`}
              >
                <span>{label}</span>
                {isActive && <Check size={12} className="text-blue-400" />}
              </button>
            );
          })}
        </div>

        {/* Custom saved presets list */}
        {savedPresets.length > 0 && (
          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            <span className="text-xs text-text-secondary font-medium">Preset Kustom Anda:</span>
            <div className="flex flex-wrap gap-2">
              {savedPresets.map((preset) => (
                <div 
                  key={preset.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs text-purple-200"
                >
                  <button
                    type="button"
                    onClick={() => loadCustomPreset(preset)}
                    className="hover:text-white cursor-pointer font-medium"
                  >
                    {preset.name}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteCustomPreset(preset.id)}
                    className="text-rose-400 hover:text-rose-300 p-0.5 rounded cursor-pointer ml-1"
                    title="Hapus preset ini"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* DETAILED ACCORDION CONTROL SECTIONS */}
      <div className="flex flex-col gap-4">

        {/* 1. BACKGROUND CONTROLS */}
        <div className="rounded-2xl bg-[rgba(6,15,35,0.4)] border border-white/10 backdrop-blur-md overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection("background")}
            className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-400/30 flex items-center justify-center text-blue-400">
                <Palette size={16} />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-white">1. Background & Warna</h3>
                <p className="text-xs text-text-secondary">Warna dasar, transparansi opasitas, gradien, arah, dan kecerahan.</p>
              </div>
            </div>
            {collapsedSections.background ? <ChevronDown size={18} className="text-text-secondary" /> : <ChevronUp size={18} className="text-text-secondary" />}
          </button>

          {!collapsedSections.background && (
            <div className="p-4 sm:p-5 pt-0 border-t border-white/5 flex flex-col gap-6">
              
              {/* Type selector */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => updateConfig({ bgType: "glass" })}
                  className={`p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all flex items-center justify-center gap-2 ${
                    config.bgType === "glass" 
                      ? "bg-blue-600/25 border-blue-400 text-white" 
                      : "bg-white/5 border-white/10 text-text-secondary hover:text-white"
                  }`}
                >
                  <span>Liquid Glass Substrate</span>
                </button>
                <button
                  type="button"
                  onClick={() => updateConfig({ bgType: "gradient", bgGradientEnabled: true })}
                  className={`p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all flex items-center justify-center gap-2 ${
                    config.bgType === "gradient" 
                      ? "bg-blue-600/25 border-blue-400 text-white" 
                      : "bg-white/5 border-white/10 text-text-secondary hover:text-white"
                  }`}
                >
                  <span>Linear Gradient</span>
                </button>
                <button
                  type="button"
                  onClick={() => updateConfig({ bgType: "color", bgGradientEnabled: false })}
                  className={`p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all flex items-center justify-center gap-2 ${
                    config.bgType === "color" 
                      ? "bg-blue-600/25 border-blue-400 text-white" 
                      : "bg-white/5 border-white/10 text-text-secondary hover:text-white"
                  }`}
                >
                  <span>Solid / Tinted Color</span>
                </button>
              </div>

              {/* Background Color & Opacity Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Background Base Color */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-text-secondary flex justify-between">
                    <span>Background Base Color</span>
                    <span className="font-mono text-white">{config.bgColor}</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={config.bgColor.startsWith("#") ? config.bgColor : "#0e1c38"}
                      onChange={(e) => updateConfig({ bgColor: e.target.value })}
                      className="w-10 h-10 rounded-lg cursor-pointer border border-white/20 bg-transparent p-0.5"
                    />
                    <input
                      type="text"
                      value={config.bgColor}
                      onChange={(e) => updateConfig({ bgColor: e.target.value })}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-400"
                    />
                  </div>
                </div>

                {/* Opacity Slider */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-xs font-medium text-text-secondary">
                    <span>Background Opacity (Transparansi)</span>
                    <span className="font-mono text-blue-400 font-semibold">{config.bgOpacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={config.bgOpacity}
                    onChange={(e) => updateConfig({ bgOpacity: Number(e.target.value) })}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-text-secondary">
                    <span>0% (Full Transparan)</span>
                    <span>50%</span>
                    <span>100% (Solid Pekat)</span>
                  </div>
                </div>
              </div>

              {/* Gradient Settings (if gradient enabled) */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white flex items-center gap-2">
                    <span>Gradient Options</span>
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.bgGradientEnabled}
                      onChange={(e) => updateConfig({ bgGradientEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {config.bgGradientEnabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] text-text-secondary">Gradient Start Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={config.bgGradientStart.startsWith("#") ? config.bgGradientStart : "#0e1c38"}
                          onChange={(e) => updateConfig({ bgGradientStart: e.target.value })}
                          className="w-8 h-8 rounded-md cursor-pointer border border-white/20 bg-transparent p-0.5"
                        />
                        <input
                          type="text"
                          value={config.bgGradientStart}
                          onChange={(e) => updateConfig({ bgGradientStart: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] text-text-secondary">Gradient End Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={config.bgGradientEnd.startsWith("#") ? config.bgGradientEnd : "#040a18"}
                          onChange={(e) => updateConfig({ bgGradientEnd: e.target.value })}
                          className="w-8 h-8 rounded-md cursor-pointer border border-white/20 bg-transparent p-0.5"
                        />
                        <input
                          type="text"
                          value={config.bgGradientEnd}
                          onChange={(e) => updateConfig({ bgGradientEnd: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] text-text-secondary">Gradient Direction</label>
                      <select
                        value={config.bgGradientDirection}
                        onChange={(e) => updateConfig({ bgGradientDirection: e.target.value })}
                        className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                      >
                        <option value="180deg" className="bg-slate-900">180° (Top to Bottom)</option>
                        <option value="135deg" className="bg-slate-900">135° (Diagonal Down-Right)</option>
                        <option value="90deg" className="bg-slate-900">90° (Left to Right)</option>
                        <option value="45deg" className="bg-slate-900">45° (Diagonal Up-Right)</option>
                        <option value="0deg" className="bg-slate-900">0° (Bottom to Top)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 2. GLASS & BLUR CONTROLS */}
        <div className="rounded-2xl bg-[rgba(6,15,35,0.4)] border border-white/10 backdrop-blur-md overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection("glass")}
            className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
                <Sparkles size={16} />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-white">2. Blur & Efek Kaca (Glass / Backdrop Blur)</h3>
                <p className="text-xs text-text-secondary">Backdrop blur, saturasi warna kaca, kontras, dan tingkat kejernihan refraksi.</p>
              </div>
            </div>
            {collapsedSections.glass ? <ChevronDown size={18} className="text-text-secondary" /> : <ChevronUp size={18} className="text-text-secondary" />}
          </button>

          {!collapsedSections.glass && (
            <div className="p-4 sm:p-5 pt-0 border-t border-white/5 flex flex-col gap-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Backdrop Blur */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-xs font-medium text-text-secondary">
                    <span>Backdrop Blur</span>
                    <span className="font-mono text-cyan-400 font-semibold">{config.backdropBlur}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={config.backdropBlur}
                    onChange={(e) => updateConfig({ backdropBlur: Number(e.target.value) })}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-text-secondary">
                    <span>0px (Jernih)</span>
                    <span>13px (Pas)</span>
                    <span>40px (Milky Frosted)</span>
                  </div>
                </div>

                {/* Saturation */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-xs font-medium text-text-secondary">
                    <span>Saturation (Ketajaman Warna)</span>
                    <span className="font-mono text-cyan-400 font-semibold">{config.saturation}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="250"
                    value={config.saturation}
                    onChange={(e) => updateConfig({ saturation: Number(e.target.value) })}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-text-secondary">
                    <span>50%</span>
                    <span>145% (Apple Glass)</span>
                    <span>250%</span>
                  </div>
                </div>

                {/* Brightness */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-xs font-medium text-text-secondary">
                    <span>Brightness</span>
                    <span className="font-mono text-cyan-400 font-semibold">{config.brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={config.brightness}
                    onChange={(e) => updateConfig({ brightness: Number(e.target.value) })}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-text-secondary">
                    <span>50%</span>
                    <span>100%</span>
                    <span>150%</span>
                  </div>
                </div>

                {/* Contrast */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-xs font-medium text-text-secondary">
                    <span>Contrast</span>
                    <span className="font-mono text-cyan-400 font-semibold">{config.contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={config.contrast}
                    onChange={(e) => updateConfig({ contrast: Number(e.target.value) })}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-text-secondary">
                    <span>50%</span>
                    <span>100%</span>
                    <span>150%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. BORDER CONTROLS */}
        <div className="rounded-2xl bg-[rgba(6,15,35,0.4)] border border-white/10 backdrop-blur-md overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection("border")}
            className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
                <Box size={16} />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-white">3. Border & Rim Highlight Kaca</h3>
                <p className="text-xs text-text-secondary">Ketebalan garis tepi, warna, opasitas, radius pembulatan sudut (capsule/pill).</p>
              </div>
            </div>
            {collapsedSections.border ? <ChevronDown size={18} className="text-text-secondary" /> : <ChevronUp size={18} className="text-text-secondary" />}
          </button>

          {!collapsedSections.border && (
            <div className="p-4 sm:p-5 pt-0 border-t border-white/5 flex flex-col gap-6">
              
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">Aktifkan Border</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.borderEnabled}
                    onChange={(e) => updateConfig({ borderEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {config.borderEnabled && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  
                  {/* Border Color */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-text-secondary flex justify-between">
                      <span>Border Color</span>
                      <span className="font-mono text-white">{config.borderColor}</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={config.borderColor.startsWith("#") ? config.borderColor : "#ffffff"}
                        onChange={(e) => updateConfig({ borderColor: e.target.value })}
                        className="w-9 h-9 rounded-lg cursor-pointer border border-white/20 bg-transparent p-0.5"
                      />
                      <input
                        type="text"
                        value={config.borderColor}
                        onChange={(e) => updateConfig({ borderColor: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-mono text-white"
                      />
                    </div>
                  </div>

                  {/* Border Opacity */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-xs font-medium text-text-secondary">
                      <span>Border Opacity</span>
                      <span className="font-mono text-indigo-400 font-semibold">{config.borderOpacity}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={config.borderOpacity}
                      onChange={(e) => updateConfig({ borderOpacity: Number(e.target.value) })}
                      className="w-full accent-indigo-400 cursor-pointer"
                    />
                  </div>

                  {/* Border Width */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-xs font-medium text-text-secondary">
                      <span>Border Width</span>
                      <span className="font-mono text-indigo-400 font-semibold">{config.borderWidth}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="6"
                      step="0.5"
                      value={config.borderWidth}
                      onChange={(e) => updateConfig({ borderWidth: Number(e.target.value) })}
                      className="w-full accent-indigo-400 cursor-pointer"
                    />
                  </div>

                  {/* Border Radius */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-xs font-medium text-text-secondary">
                      <span>Border Radius</span>
                      <span className="font-mono text-indigo-400 font-semibold">{config.borderRadius}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="999"
                      step="4"
                      value={config.borderRadius}
                      onChange={(e) => updateConfig({ borderRadius: Number(e.target.value) })}
                      className="w-full accent-indigo-400 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-text-secondary">
                      <span>0px (Kotak)</span>
                      <span>16px (Rounded)</span>
                      <span>999px (Capsule/Pill)</span>
                    </div>
                  </div>

                </div>
              )}
            </div>
          )}
        </div>

        {/* 4. SHADOW CONTROLS */}
        <div className="rounded-2xl bg-[rgba(6,15,35,0.4)] border border-white/10 backdrop-blur-md overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection("shadow")}
            className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-400/30 flex items-center justify-center text-purple-400">
                <Layers size={16} />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-white">4. Shadow & Kedalaman Ambient</h3>
                <p className="text-xs text-text-secondary">Bayangan bawah, blur radius, spread, dan posisi X/Y untuk efek floating.</p>
              </div>
            </div>
            {collapsedSections.shadow ? <ChevronDown size={18} className="text-text-secondary" /> : <ChevronUp size={18} className="text-text-secondary" />}
          </button>

          {!collapsedSections.shadow && (
            <div className="p-4 sm:p-5 pt-0 border-t border-white/5 flex flex-col gap-6">
              
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">Aktifkan Shadow</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.shadowEnabled}
                    onChange={(e) => updateConfig({ shadowEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {config.shadowEnabled && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  
                  {/* Shadow Color */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-text-secondary flex justify-between">
                      <span>Shadow Color</span>
                      <span className="font-mono text-white">{config.shadowColor}</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={config.shadowColor.startsWith("#") ? config.shadowColor : "#000000"}
                        onChange={(e) => updateConfig({ shadowColor: e.target.value })}
                        className="w-9 h-9 rounded-lg cursor-pointer border border-white/20 bg-transparent p-0.5"
                      />
                      <input
                        type="text"
                        value={config.shadowColor}
                        onChange={(e) => updateConfig({ shadowColor: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-mono text-white"
                      />
                    </div>
                  </div>

                  {/* Shadow Opacity */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-xs font-medium text-text-secondary">
                      <span>Shadow Opacity</span>
                      <span className="font-mono text-purple-400 font-semibold">{config.shadowOpacity}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={config.shadowOpacity}
                      onChange={(e) => updateConfig({ shadowOpacity: Number(e.target.value) })}
                      className="w-full accent-purple-400 cursor-pointer"
                    />
                  </div>

                  {/* Shadow Blur */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-xs font-medium text-text-secondary">
                      <span>Shadow Blur</span>
                      <span className="font-mono text-purple-400 font-semibold">{config.shadowBlur}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="60"
                      value={config.shadowBlur}
                      onChange={(e) => updateConfig({ shadowBlur: Number(e.target.value) })}
                      className="w-full accent-purple-400 cursor-pointer"
                    />
                  </div>

                  {/* Shadow Y Position */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-xs font-medium text-text-secondary">
                      <span>Shadow Y (Offset Vertikal)</span>
                      <span className="font-mono text-purple-400 font-semibold">{config.shadowY}px</span>
                    </div>
                    <input
                      type="range"
                      min="-20"
                      max="40"
                      value={config.shadowY}
                      onChange={(e) => updateConfig({ shadowY: Number(e.target.value) })}
                      className="w-full accent-purple-400 cursor-pointer"
                    />
                  </div>

                </div>
              )}
            </div>
          )}
        </div>

        {/* 5. NAVIGATION ITEMS & TYPOGRAPHY */}
        <div className="rounded-2xl bg-[rgba(6,15,35,0.4)] border border-white/10 backdrop-blur-md overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection("items")}
            className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                <Type size={16} />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-white">5. Navigation Items & Tipografi</h3>
                <p className="text-xs text-text-secondary">Ukuran font, bobot teks, warna hover/aktif, padding item, dan efek highlight.</p>
              </div>
            </div>
            {collapsedSections.items ? <ChevronDown size={18} className="text-text-secondary" /> : <ChevronUp size={18} className="text-text-secondary" />}
          </button>

          {!collapsedSections.items && (
            <div className="p-4 sm:p-5 pt-0 border-t border-white/5 flex flex-col gap-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Active Highlight Color */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-text-secondary flex justify-between">
                    <span>Active Highlight Color</span>
                    <span className="font-mono text-white">{config.activeBgColor}</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.activeBgColor.startsWith("#") ? config.activeBgColor : "#8cb4ff"}
                      onChange={(e) => updateConfig({ activeBgColor: e.target.value })}
                      className="w-9 h-9 rounded-lg cursor-pointer border border-white/20 bg-transparent p-0.5"
                    />
                    <input
                      type="text"
                      value={config.activeBgColor}
                      onChange={(e) => updateConfig({ activeBgColor: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-mono text-white"
                    />
                  </div>
                </div>

                {/* Active Highlight Opacity */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-xs font-medium text-text-secondary">
                    <span>Active Highlight Opacity</span>
                    <span className="font-mono text-emerald-400 font-semibold">{config.activeBgOpacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={config.activeBgOpacity}
                    onChange={(e) => updateConfig({ activeBgOpacity: Number(e.target.value) })}
                    className="w-full accent-emerald-400 cursor-pointer"
                  />
                </div>

                {/* Font Size */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-xs font-medium text-text-secondary">
                    <span>Font Size (Ukuran Teks)</span>
                    <span className="font-mono text-emerald-400 font-semibold">{config.fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="16"
                    step="0.5"
                    value={config.fontSize}
                    onChange={(e) => updateConfig({ fontSize: Number(e.target.value) })}
                    className="w-full accent-emerald-400 cursor-pointer"
                  />
                </div>

                {/* Font Weight */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-xs font-medium text-text-secondary">
                    <span>Font Weight (Ketebalan)</span>
                    <span className="font-mono text-emerald-400 font-semibold">{config.fontWeight}</span>
                  </div>
                  <select
                    value={config.fontWeight}
                    onChange={(e) => updateConfig({ fontWeight: Number(e.target.value) })}
                    className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="400" className="bg-slate-900">400 (Regular)</option>
                    <option value="500" className="bg-slate-900">500 (Medium)</option>
                    <option value="600" className="bg-slate-900">600 (Semi Bold)</option>
                    <option value="700" className="bg-slate-900">700 (Bold)</option>
                  </select>
                </div>

              </div>

              {/* Item Spacing & Padding Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-xs font-medium text-text-secondary">
                    <span>Item Spacing (Gap Antar Tab)</span>
                    <span className="font-mono text-emerald-400 font-semibold">{config.itemSpacing}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="16"
                    value={config.itemSpacing}
                    onChange={(e) => updateConfig({ itemSpacing: Number(e.target.value) })}
                    className="w-full accent-emerald-400 cursor-pointer"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-xs font-medium text-text-secondary">
                    <span>Item Padding Vertikal</span>
                    <span className="font-mono text-emerald-400 font-semibold">{config.itemPaddingY}px</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="14"
                    value={config.itemPaddingY}
                    onChange={(e) => updateConfig({ itemPaddingY: Number(e.target.value) })}
                    className="w-full accent-emerald-400 cursor-pointer"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-xs font-medium text-text-secondary">
                    <span>Item Padding Horizontal</span>
                    <span className="font-mono text-emerald-400 font-semibold">{config.itemPaddingX}px</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="16"
                    value={config.itemPaddingX}
                    onChange={(e) => updateConfig({ itemPaddingX: Number(e.target.value) })}
                    className="w-full accent-emerald-400 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 6. ICON CONTROLS */}
        <div className="rounded-2xl bg-[rgba(6,15,35,0.4)] border border-white/10 backdrop-blur-md overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection("icons")}
            className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-400">
                <Zap size={16} />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-white">6. Ikon Navigasi</h3>
                <p className="text-xs text-text-secondary">Ukuran ikon, warna, opasitas, dan jarak antara ikon dan label teks.</p>
              </div>
            </div>
            {collapsedSections.icons ? <ChevronDown size={18} className="text-text-secondary" /> : <ChevronUp size={18} className="text-text-secondary" />}
          </button>

          {!collapsedSections.icons && (
            <div className="p-4 sm:p-5 pt-0 border-t border-white/5 flex flex-col gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                
                {/* Icon Size */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-xs font-medium text-text-secondary">
                    <span>Ukuran Ikon</span>
                    <span className="font-mono text-amber-400 font-semibold">{config.iconSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="14"
                    max="28"
                    value={config.iconSize}
                    onChange={(e) => updateConfig({ iconSize: Number(e.target.value) })}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>

                {/* Icon Opacity */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-xs font-medium text-text-secondary">
                    <span>Opasitas Ikon (Inaktif)</span>
                    <span className="font-mono text-amber-400 font-semibold">{config.iconOpacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={config.iconOpacity}
                    onChange={(e) => updateConfig({ iconOpacity: Number(e.target.value) })}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>

                {/* Icon Spacing */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-xs font-medium text-text-secondary">
                    <span>Jarak Ikon ke Label</span>
                    <span className="font-mono text-amber-400 font-semibold">{config.iconSpacing}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={config.iconSpacing}
                    onChange={(e) => updateConfig({ iconSpacing: Number(e.target.value) })}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>

              </div>
            </div>
          )}
        </div>

        {/* 7. POSITION & SIZE */}
        <div className="rounded-2xl bg-[rgba(6,15,35,0.4)] border border-white/10 backdrop-blur-md overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection("position")}
            className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-pink-500/15 border border-pink-400/30 flex items-center justify-center text-pink-400">
                <Move size={16} />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-white">7. Posisi & Dimensi Dock</h3>
                <p className="text-xs text-text-secondary">Lebar maksimal kapsul, jarak dari bawah layar (bottom offset), dan padding.</p>
              </div>
            </div>
            {collapsedSections.position ? <ChevronDown size={18} className="text-text-secondary" /> : <ChevronUp size={18} className="text-text-secondary" />}
          </button>

          {!collapsedSections.position && (
            <div className="p-4 sm:p-5 pt-0 border-t border-white/5 flex flex-col gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                
                {/* Max Width */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-xs font-medium text-text-secondary">
                    <span>Lebar Maksimal (Max Width)</span>
                    <span className="font-mono text-pink-400 font-semibold">{config.maxWidth}px</span>
                  </div>
                  <input
                    type="range"
                    min="280"
                    max="650"
                    step="10"
                    value={config.maxWidth}
                    onChange={(e) => updateConfig({ maxWidth: Number(e.target.value) })}
                    className="w-full accent-pink-400 cursor-pointer"
                  />
                </div>

                {/* Bottom Offset */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-xs font-medium text-text-secondary">
                    <span>Bottom Offset (Jarak Bawah)</span>
                    <span className="font-mono text-pink-400 font-semibold">{config.bottomOffset}px</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="48"
                    value={config.bottomOffset}
                    onChange={(e) => updateConfig({ bottomOffset: Number(e.target.value) })}
                    className="w-full accent-pink-400 cursor-pointer"
                  />
                </div>

                {/* Transition Duration */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-xs font-medium text-text-secondary">
                    <span>Durasi Transisi Smooth</span>
                    <span className="font-mono text-pink-400 font-semibold">{config.transitionDuration}ms</span>
                  </div>
                  <input
                    type="range"
                    min="200"
                    max="800"
                    step="20"
                    value={config.transitionDuration}
                    onChange={(e) => updateConfig({ transitionDuration: Number(e.target.value) })}
                    className="w-full accent-pink-400 cursor-pointer"
                  />
                </div>

              </div>
            </div>
          )}
        </div>

        {/* 8. MOBILE NAVIGATION SPECIFIC CONTROLS */}
        <div className="rounded-2xl bg-[rgba(6,15,35,0.4)] border border-white/10 backdrop-blur-md overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection("mobile")}
            className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-500/15 border border-teal-400/30 flex items-center justify-center text-teal-400">
                <Smartphone size={16} />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-white">8. Mobile Navigation Override (Khusus HP/Tablet)</h3>
                <p className="text-xs text-text-secondary">Pengaturan khusus saat situs dibuka di layar ponsel &lt; 640px.</p>
              </div>
            </div>
            {collapsedSections.mobile ? <ChevronDown size={18} className="text-text-secondary" /> : <ChevronUp size={18} className="text-text-secondary" />}
          </button>

          {!collapsedSections.mobile && (
            <div className="p-4 sm:p-5 pt-0 border-t border-white/5 flex flex-col gap-6">
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-white block">Aktifkan Pengaturan Khusus Mobile</span>
                  <span className="text-[11px] text-text-secondary">Jika dimatikan, mobile akan otomatis mengikuti pengaturan desktop.</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.mobileCustomEnabled}
                    onChange={(e) => updateConfig({ mobileCustomEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>

              {config.mobileCustomEnabled && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-xs font-medium text-text-secondary">
                      <span>Mobile Background Opacity</span>
                      <span className="font-mono text-teal-400 font-semibold">{config.mobileBgOpacity}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={config.mobileBgOpacity}
                      onChange={(e) => updateConfig({ mobileBgOpacity: Number(e.target.value) })}
                      className="w-full accent-teal-400 cursor-pointer"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-xs font-medium text-text-secondary">
                      <span>Mobile Backdrop Blur</span>
                      <span className="font-mono text-teal-400 font-semibold">{config.mobileBackdropBlur}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      value={config.mobileBackdropBlur}
                      onChange={(e) => updateConfig({ mobileBackdropBlur: Number(e.target.value) })}
                      className="w-full accent-teal-400 cursor-pointer"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-xs font-medium text-text-secondary">
                      <span>Mobile Max Width</span>
                      <span className="font-mono text-teal-400 font-semibold">{config.mobileMaxWidth}px</span>
                    </div>
                    <input
                      type="range"
                      min="260"
                      max="430"
                      value={config.mobileMaxWidth}
                      onChange={(e) => updateConfig({ mobileMaxWidth: Number(e.target.value) })}
                      className="w-full accent-teal-400 cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* SAVE PRESET MODAL */}
      {showSavePresetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-[rgba(10,20,45,0.95)] border border-blue-500/30 p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center gap-2.5 text-white font-semibold text-base">
              <Save size={18} className="text-blue-400" />
              <span>Simpan Preset Navigasi Kustom</span>
            </div>
            <p className="text-xs text-text-secondary">
              Simpan semua nilai warna, blur, border, dan bayangan saat ini ke dalam preset yang dapat Anda muat kapan saja.
            </p>

            <form onSubmit={handleSavePreset} className="flex flex-col gap-4 mt-2">
              <input
                type="text"
                required
                placeholder="Contoh: Neon Glass Theme v2"
                value={presetNameInput}
                onChange={(e) => setPresetNameInput(e.target.value)}
                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-400"
                autoFocus
              />

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSavePresetModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-text-secondary hover:text-white cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow-lg"
                >
                  Simpan Preset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET CONFIRMATION MODAL */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-[rgba(20,10,15,0.95)] border border-rose-500/30 p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center gap-2.5 text-rose-400 font-semibold text-base">
              <AlertTriangle size={18} />
              <span>Konfirmasi Reset Navigasi</span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Apakah Anda yakin ingin mengembalikan semua kustomisasi navigasi ke konfigurasi default pabrik? Seluruh nilai warna, blur, dan bayangan kustom yang belum disimpan sebagai preset akan direset.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirmModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-text-secondary hover:text-white cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white cursor-pointer shadow-lg"
              >
                Ya, Reset Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

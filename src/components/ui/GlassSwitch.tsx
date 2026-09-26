import React from "react";
import { motion } from "motion/react";
import { cn } from "../../utils/cn";
import { LiquidGooSwitch } from "./LiquidGooSwitch";

export interface GlassSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  variant?: "glass" | "liquid-goo";
  disabled?: boolean;
  activeColor?: "blue" | "teal" | "amber" | "emerald" | "purple";
  className?: string;
  id?: string;
}

export const GlassSwitch: React.FC<GlassSwitchProps> = ({
  checked,
  onChange,
  label,
  description,
  size = "md",
  variant = "liquid-goo",
  disabled = false,
  activeColor = "blue",
  className,
  id,
}) => {
  const hueMap = {
    emerald: 144,
    blue: 215,
    purple: 270,
    amber: 38,
    teal: 175,
  };

  if (variant === "liquid-goo") {
    return (
      <LiquidGooSwitch
        id={id}
        checked={checked}
        onChange={onChange}
        label={label}
        description={description}
        hue={hueMap[activeColor] || 215}
        size={size}
        disabled={disabled}
        className={className}
      />
    );
  }
  const activeColorClasses = {
    blue: {
      trackBg: "bg-blue-600/40 border-blue-400/50 shadow-[0_0_15px_rgba(59,130,246,0.35)]",
      knobBg: "bg-gradient-to-tr from-blue-200 via-white to-blue-100 text-blue-900",
      glow: "bg-blue-500/20",
    },
    teal: {
      trackBg: "bg-teal-600/40 border-teal-400/50 shadow-[0_0_15px_rgba(20,184,166,0.35)]",
      knobBg: "bg-gradient-to-tr from-teal-200 via-white to-teal-100 text-teal-900",
      glow: "bg-teal-500/20",
    },
    amber: {
      trackBg: "bg-amber-600/40 border-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.35)]",
      knobBg: "bg-gradient-to-tr from-amber-200 via-white to-amber-100 text-amber-900",
      glow: "bg-amber-500/20",
    },
    emerald: {
      trackBg: "bg-emerald-600/40 border-emerald-400/50 shadow-[0_0_15px_rgba(16,185,129,0.35)]",
      knobBg: "bg-gradient-to-tr from-emerald-200 via-white to-emerald-100 text-emerald-900",
      glow: "bg-emerald-500/20",
    },
    purple: {
      trackBg: "bg-purple-600/40 border-purple-400/50 shadow-[0_0_15px_rgba(168,85,247,0.35)]",
      knobBg: "bg-gradient-to-tr from-purple-200 via-white to-purple-100 text-purple-900",
      glow: "bg-purple-500/20",
    },
  }[activeColor];

  const dimensions = {
    sm: { track: "w-9 h-5 rounded-full p-[2px]", knob: "w-4 h-4", translate: 16 },
    md: { track: "w-11 h-6 rounded-full p-[2.5px]", knob: "w-5 h-5", translate: 20 },
    lg: { track: "w-14 h-7.5 rounded-full p-[3px]", knob: "w-6 h-6", translate: 26 },
  }[size];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      onChange(!checked);
    }
  };

  return (
    <div className={cn("inline-flex items-center justify-between gap-3 select-none", disabled && "opacity-50 pointer-events-none", className)}>
      {(label || description) && (
        <div className="flex flex-col text-left">
          {label && <span className="text-xs sm:text-sm font-semibold text-white tracking-wide">{label}</span>}
          {description && <span className="text-[11px] text-text-secondary leading-tight mt-0.5">{description}</span>}
        </div>
      )}

      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && onChange(!checked)}
        onKeyDown={handleKeyDown}
        className={cn(
          "relative shrink-0 cursor-pointer overflow-hidden backdrop-blur-xl border transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/80",
          dimensions.track,
          checked
            ? activeColorClasses.trackBg
            : "bg-white/10 border-white/20 shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)] hover:border-white/30"
        )}
      >
        {/* Specular Highlight Refraction Line */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

        {/* Ambient Glow */}
        {checked && (
          <div className={cn("absolute inset-0 blur-md pointer-events-none transition-opacity duration-300", activeColorClasses.glow)} />
        )}

        {/* Glass Thumb Knob */}
        <motion.div
          className={cn(
            "relative rounded-full shadow-md backdrop-blur-md flex items-center justify-center border border-white/60",
            dimensions.knob,
            checked ? activeColorClasses.knobBg : "bg-gradient-to-b from-white/90 to-white/70 text-slate-700"
          )}
          animate={{ x: checked ? dimensions.translate : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          {/* Knob Specular Highlight */}
          <div className="absolute top-0.5 left-0.5 right-0.5 h-[30%] rounded-t-full bg-white/60 blur-[0.5px]" />
        </motion.div>
      </button>
    </div>
  );
};

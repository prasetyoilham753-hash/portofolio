import React, { useState, useRef, useEffect } from "react";
import { cn } from "../../utils/cn";

export interface LiquidGooSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: React.ReactNode;
  hue?: number; // 0 to 360, default 144 (emerald green) or 215 (blue)
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
  id?: string;
}

export const LiquidGooSwitch: React.FC<LiquidGooSwitchProps> = ({
  checked,
  onChange,
  label,
  description,
  hue = 144,
  size = "md",
  disabled = false,
  className,
  id,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [dragProgress, setDragProgress] = useState<number | null>(null);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const startXRef = useRef<number>(0);
  const initialCheckedRef = useRef<boolean>(checked);

  const completeValue = dragProgress !== null ? dragProgress : checked ? 100 : 0;

  // Size scale factors
  const sizeStyles = {
    sm: { transform: "scale(0.75)", transformOrigin: "left center" },
    md: { transform: "scale(0.9)", transformOrigin: "left center" },
    lg: { transform: "scale(1.1)", transformOrigin: "left center" },
  }[size];

  // Pointer Drag Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    buttonRef.current?.setPointerCapture(e.pointerId);
    setIsActive(true);
    setIsDragging(false);
    startXRef.current = e.clientX;
    initialCheckedRef.current = checked;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isActive || disabled) return;
    const deltaX = e.clientX - startXRef.current;
    if (Math.abs(deltaX) > 4) {
      setIsDragging(true);
      const buttonWidth = buttonRef.current?.getBoundingClientRect().width || 110;
      const initialProgress = initialCheckedRef.current ? 100 : 0;
      const progressDelta = (deltaX / (buttonWidth * 0.5)) * 100;
      const newProgress = Math.max(0, Math.min(100, initialProgress + progressDelta));
      setDragProgress(newProgress);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isActive || disabled) return;
    try {
      buttonRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore release pointer errors
    }

    setIsActive(false);

    if (isDragging && dragProgress !== null) {
      const finalChecked = dragProgress >= 50;
      onChange(finalChecked);
    } else {
      // Tap toggle
      onChange(!checked);
    }

    setDragProgress(null);
    setIsDragging(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      onChange(!checked);
    }
  };

  return (
    <div
      className={cn(
        "inline-flex items-center justify-between gap-3 select-none",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
    >
      {(label || description) && (
        <div className="flex flex-col text-left">
          {label && <span className="text-xs sm:text-sm font-semibold text-white tracking-wide">{label}</span>}
          {description && <span className="text-[11px] text-text-secondary leading-tight mt-0.5">{description}</span>}
        </div>
      )}

      <div style={sizeStyles} className="shrink-0 py-1">
        <button
          ref={buttonRef}
          id={id}
          type="button"
          role="switch"
          aria-checked={checked}
          tabIndex={disabled ? -1 : 0}
          data-active={isActive || isDragging ? "true" : "false"}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onKeyDown={handleKeyDown}
          style={{
            ["--complete" as string]: completeValue,
            ["--hue" as string]: hue,
          }}
          className="liquid-toggle group"
        >
          {/* Knockout Layer */}
          <div className="liquid-toggle-knockout">
            <div className="liquid-toggle-indicator-masked">
              <div className="liquid-toggle-mask" />
            </div>
          </div>

          {/* Liquid Goo Track & Shadow Layer */}
          <div className="liquid-toggle-wrapper">
            <div className="liquid-toggle-liquids">
              <div className="liquid-toggle-liquid-shadow" />
              <div className="liquid-toggle-liquid-track" />
            </div>
          </div>

          {/* Top Interactive Indicator Knob */}
          <div className="liquid-toggle-indicator-liquid">
            <div className="liquid-toggle-shadow" />
            <div className="liquid-toggle-cover" />
          </div>
        </button>
      </div>
    </div>
  );
};

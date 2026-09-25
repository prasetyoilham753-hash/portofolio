export function hexToRgba(hex: string, opacity: number = 1): string {
  if (!hex) return `rgba(255, 255, 255, ${opacity})`;
  
  // If already rgba or rgb
  if (hex.startsWith("rgb")) {
    if (hex.startsWith("rgba")) {
      return hex.replace(/[\d\.]+\)$/g, `${opacity})`);
    }
    return hex.replace("rgb", "rgba").replace(")", `, ${opacity})`);
  }

  let cleanHex = hex.replace("#", "");
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split("")
      .map((c) => c + c)
      .join("");
  }

  const num = parseInt(cleanHex, 16);
  if (isNaN(num)) return `rgba(255, 255, 255, ${opacity})`;

  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;

  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, opacity))})`;
}

export function buildNavBoxShadow(config: {
  shadowEnabled: boolean;
  shadowColor: string;
  shadowOpacity: number;
  shadowBlur: number;
  shadowSpread: number;
  shadowX: number;
  shadowY: number;
}): string {
  if (!config.shadowEnabled) return "none";
  const color = hexToRgba(config.shadowColor, config.shadowOpacity / 100);
  const mainShadow = `${config.shadowX}px ${config.shadowY}px ${config.shadowBlur}px ${config.shadowSpread}px ${color}`;
  const ambientShadow = `0 2px 10px rgba(0, 0, 0, ${(config.shadowOpacity * 0.6) / 100})`;
  const innerTopHighlight = `inset 0 1px 1px rgba(255, 255, 255, 0.45)`;
  const innerBottomShadow = `inset 0 -1px 2px rgba(0, 0, 0, 0.2)`;
  return `${mainShadow}, ${ambientShadow}, ${innerTopHighlight}, ${innerBottomShadow}`;
}

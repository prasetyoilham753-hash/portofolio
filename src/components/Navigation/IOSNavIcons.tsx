import React from "react";

export interface IOSIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  filled?: boolean;
}

/**
 * iOS 26 Minimalist & Modern Home Icon
 * Geometric continuous stroke SF Symbol with smooth apex curvature and solid fill
 */
export function IOSHomeIcon({ size = 16, filled = false, style, ...props }: IOSIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0.5 : 1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transition: "all 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
        ...style,
      }}
      {...props}
    >
      {filled ? (
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12.75 3.9C12.32 3.52 11.68 3.52 11.25 3.9L3.75 10.5C3.28 10.91 3 11.51 3 12.14V19C3 20.1 3.9 21 5 21H8.8C9.35 21 9.8 20.55 9.8 20V15.75C9.8 14.78 10.58 14 11.55 14H12.45C13.42 14 14.2 14.78 14.2 15.75V20C14.2 20.55 14.65 21 15.2 21H19C20.1 21 21 20.1 21 19V12.14C21 11.51 20.72 10.91 20.25 10.5L12.75 3.9Z"
        />
      ) : (
        <path d="M3.75 10.5L11.25 3.9C11.68 3.52 12.32 3.52 12.75 3.9L20.25 10.5C20.72 10.91 21 11.51 21 12.14V19C21 20.1 20.1 21 19 21H15.2C14.65 21 14.2 20.55 14.2 20V15.75C14.2 14.78 13.42 14 12.45 14H11.55C10.58 14 9.8 14.78 9.8 15.75V20C9.8 20.55 9.35 21 8.8 21H5C3.9 21 3 20.1 3 19V12.14C3 11.51 3.28 10.91 3.75 10.5Z" />
      )}
    </svg>
  );
}

/**
 * iOS 26 Minimalist Projects Icon (SF Symbols briefcase.fill / Portfolio Case)
 * Squircle portfolio case with luminous white seam and lock accent when filled
 */
export function IOSProjectsIcon({ size = 16, filled = false, style, ...props }: IOSIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0.5 : 1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transition: "all 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
        ...style,
      }}
      {...props}
    >
      {filled ? (
        <g>
          {/* Solid Case Body */}
          <rect x="3" y="6.5" width="18" height="14" rx="3.5" fill="currentColor" stroke="none" />
          {/* Handle */}
          <path d="M8.5 6.5V5C8.5 3.9 9.4 3 10.5 3H13.5C14.6 3 15.5 3.9 15.5 5V6.5" stroke="currentColor" strokeWidth={1.8} fill="none" />
          {/* Luminous Seam Line & Center Lock */}
          <line x1="3" y1="12" x2="21" y2="12" stroke="#ffffff" strokeWidth={1.5} opacity={0.65} />
          <rect x="10.5" y="10.75" width="3" height="2.5" rx="0.8" fill="#ffffff" stroke="none" />
        </g>
      ) : (
        <g>
          <rect x="3" y="6.5" width="18" height="14" rx="3.5" />
          <path d="M8.5 6.5V5C8.5 3.9 9.4 3 10.5 3H13.5C14.6 3 15.5 3.9 15.5 5V6.5" />
          <line x1="3" y1="12" x2="21" y2="12" strokeWidth={1.4} opacity={0.6} />
          <rect x="10.5" y="10.75" width="3" height="2.5" rx="0.8" strokeWidth={1.4} />
        </g>
      )}
    </svg>
  );
}

/**
 * iOS 26 Minimalist Gallery / Photos Icon (SF Symbols photo / photo.fill)
 * Single squircle photo canvas with clean solar iris and landscape horizon (Zero archive look)
 */
export function IOSGalleryIcon({ size = 16, filled = false, style, ...props }: IOSIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0.5 : 1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transition: "all 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
        ...style,
      }}
      {...props}
    >
      {filled ? (
        <g>
          {/* Single Solid Photo Canvas Frame */}
          <rect x="3" y="4.5" width="18" height="15" rx="4" fill="currentColor" stroke="none" />
          {/* Luminous Sun & Landscape Contours */}
          <circle cx="8" cy="9.5" r="1.5" fill="#ffffff" />
          <path
            d="M3.5 16.5L8.2 11.8C8.7 11.3 9.4 11.3 9.9 11.8L14.2 16.5"
            stroke="#ffffff"
            strokeWidth={1.75}
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M12.5 14.8L15.3 12C15.8 11.5 16.5 11.5 17 12L20.5 15.5"
            stroke="#ffffff"
            strokeWidth={1.75}
            strokeLinecap="round"
            fill="none"
          />
        </g>
      ) : (
        <g>
          <rect x="3" y="4.5" width="18" height="15" rx="4" />
          <circle cx="8" cy="9.5" r="1.5" />
          <path d="M3.5 16.5L8.2 11.8C8.7 11.3 9.4 11.3 9.9 11.8L14.2 16.5" />
          <path d="M12.5 14.8L15.3 12C15.8 11.5 16.5 11.5 17 12L20.5 15.5" />
        </g>
      )}
    </svg>
  );
}

/**
 * iOS 26 Spatial App Grid / Feature Matrix Icon
 * Clean 2x2 squircle modular tiles with solid fill transition
 */
export function IOSFeaturesIcon({ size = 16, filled = false, style, ...props }: IOSIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0.5 : 1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transition: "all 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
        ...style,
      }}
      {...props}
    >
      <rect x="3.5" y="3.5" width="7" height="7" rx={filled ? 2.6 : 2.2} fill={filled ? "currentColor" : "none"} stroke={filled ? "none" : "currentColor"} />
      <rect x="13.5" y="3.5" width="7" height="7" rx={filled ? 2.6 : 2.2} fill={filled ? "currentColor" : "none"} stroke={filled ? "none" : "currentColor"} />
      <rect x="3.5" y="13.5" width="7" height="7" rx={filled ? 2.6 : 2.2} fill={filled ? "currentColor" : "none"} stroke={filled ? "none" : "currentColor"} />
      <rect x="13.5" y="13.5" width="7" height="7" rx={filled ? 2.6 : 2.2} fill={filled ? "currentColor" : "none"} stroke={filled ? "none" : "currentColor"} />
    </svg>
  );
}

/**
 * iOS 26 Minimalist Messages / Comments Icon
 * Smooth continuous speech bubble with solid fill morphing
 */
export function IOSCommentsIcon({ size = 16, filled = false, style, ...props }: IOSIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0.5 : 1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transition: "all 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
        ...style,
      }}
      {...props}
    >
      <path
        fill={filled ? "currentColor" : "none"}
        stroke={filled ? "currentColor" : "currentColor"}
        d="M12 3C6.75 3 2.5 6.92 2.5 11.75C2.5 14.15 3.53 16.32 5.25 17.85C5.05 19.35 4.3 20.45 3.4 21.2C3.15 21.4 3.3 21.8 3.65 21.75C6.1 21.4 8.1 20.35 9.25 19.55C10.12 19.85 11.04 20 12 20C17.25 20 21.5 16.08 21.5 11.75C21.5 6.92 17.25 3 12 3Z"
      />
    </svg>
  );
}

/**
 * iOS 26 Minimalist User / Profile Icon
 */
export function IOSUserIcon({ size = 14, filled = false, style, ...props }: IOSIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0.5 : 1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transition: "all 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
        ...style,
      }}
      {...props}
    >
      <circle cx="12" cy="7.5" r="4.25" fill={filled ? "currentColor" : "none"} />
      <path
        d="M4.5 20.5C4.5 16.36 7.86 13 12 13C16.14 13 19.5 16.36 19.5 20.5"
        fill={filled ? "currentColor" : "none"}
      />
    </svg>
  );
}

/**
 * iOS 26 Minimalist Certificate / Award Icon
 */
export function IOSAwardIcon({ size = 14, filled = false, style, ...props }: IOSIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0.5 : 1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transition: "all 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
        ...style,
      }}
      {...props}
    >
      <circle cx="12" cy="8.5" r="5.5" fill={filled ? "currentColor" : "none"} />
      <path d="M8.2 13.5L7 21.5L12 18.5L17 21.5L15.8 13.5" fill={filled ? "currentColor" : "none"} />
      <circle cx="12" cy="8.5" r={filled ? 2.2 : 1.75} fill={filled ? "#ffffff" : "none"} opacity={filled ? 0.45 : 1} />
    </svg>
  );
}

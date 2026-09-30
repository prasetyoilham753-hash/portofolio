import React from "react";

export interface IOSIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  filled?: boolean;
}

/**
 * iOS 26 Minimalist & Modern Home Icon
 * Geometric continuous stroke SF Symbol with crisp internal door knockout when solid
 */
export function IOSHomeIcon({ size = 26, filled = false, style, ...props }: IOSIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        ...style,
      }}
      {...props}
    >
      {filled ? (
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12.65 2.85C12.28 2.5 11.72 2.5 11.35 2.85L2.85 10.35C2.45 10.7 2.25 11.2 2.25 11.72V19.5C2.25 20.6 3.15 21.5 4.25 21.5H8.75C9.3 21.5 9.75 21.05 9.75 20.5V15.5C9.75 14.95 10.2 14.5 10.75 14.5H13.25C13.8 14.5 14.25 14.95 14.25 15.5V20.5C14.25 21.05 14.7 21.5 15.25 21.5H19.75C20.85 21.5 21.75 20.6 21.75 19.5V11.72C21.75 11.2 21.55 10.7 21.15 10.35L12.65 2.85Z"
        />
      ) : (
        <path d="M3.75 10.5L11.25 3.9C11.68 3.52 12.32 3.52 12.75 3.9L20.25 10.5C20.72 10.91 21 11.51 21 12.14V19C21 20.1 20.1 21 19 21H15.2C14.65 21 14.2 20.55 14.2 20V15.75C14.2 14.78 13.42 14 12.45 14H11.55C10.58 14 9.8 14.78 9.8 15.75V20C9.8 20.55 9.35 21 8.8 21H5C3.9 21 3 20.1 3 19V12.14C3 11.51 3.28 10.91 3.75 10.5Z" />
      )}
    </svg>
  );
}

/**
 * iOS 26 Minimalist Projects Icon (SF Symbols briefcase.fill / Portfolio Case)
 * Squircle portfolio case with crisp handle opening, horizontal seam, and lock knockout
 */
export function IOSProjectsIcon({ size = 26, filled = false, style, ...props }: IOSIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        ...style,
      }}
      {...props}
    >
      {filled ? (
        <g>
          {/* Solid Case Body with Handle Opening & Latch Knockouts */}
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M8.5 4.5C8.5 3.4 9.4 2.5 10.5 2.5H13.5C14.6 2.5 15.5 3.4 15.5 4.5V6H19.5C20.88 6 22 7.12 22 8.5V18.5C22 19.88 20.88 21 19.5 21H4.5C3.12 21 2 19.88 2 18.5V8.5C2 7.12 3.12 6 4.5 6H8.5V4.5ZM10 4.5V6H14V4.5H10ZM10.5 11.2C10.5 10.65 10.95 10.2 11.5 10.2H12.5C13.05 10.2 13.5 10.65 13.5 11.2V13.8C13.5 14.35 13.05 14.8 12.5 14.8H11.5C10.95 14.8 10.5 14.35 10.5 13.8V11.2Z"
          />
          {/* Subtle horizontal seam line */}
          <line x1="3" y1="12.5" x2="9.5" y2="12.5" stroke="#000000" strokeWidth={1.2} opacity={0.35} />
          <line x1="14.5" y1="12.5" x2="21" y2="12.5" stroke="#000000" strokeWidth={1.2} opacity={0.35} />
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
 * iOS 26 Minimalist Gallery / Photos Icon (SF Symbols photo.fill)
 * Single squircle photo canvas with crisp solar circle and landscape mountain knockout
 */
export function IOSGalleryIcon({ size = 26, filled = false, style, ...props }: IOSIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        ...style,
      }}
      {...props}
    >
      {filled ? (
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M3 7.5C3 5.57 4.57 4 6.5 4H17.5C19.43 4 21 5.57 21 7.5V16.5C21 18.43 19.43 20 17.5 20H6.5C4.57 20 3 18.43 3 16.5V7.5ZM8.5 6.5C7.4 6.5 6.5 7.4 6.5 8.5C6.5 9.6 7.4 10.5 8.5 10.5C9.6 10.5 10.5 9.6 10.5 8.5C10.5 7.4 9.6 6.5 8.5 6.5ZM4.8 17.5L8.5 12.8C8.9 12.3 9.6 12.3 10 12.8L12.8 16.2L14.7 13.8C15.1 13.3 15.8 13.3 16.2 13.8L19.2 17.5H4.8Z"
        />
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
 * Clean 2x2 squircle modular tiles
 */
export function IOSFeaturesIcon({ size = 26, filled = false, style, ...props }: IOSIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        ...style,
      }}
      {...props}
    >
      <rect x="3.5" y="3.5" width="7" height="7" rx={filled ? 2.5 : 2.2} fill={filled ? "currentColor" : "none"} stroke={filled ? "none" : "currentColor"} />
      <rect x="13.5" y="3.5" width="7" height="7" rx={filled ? 2.5 : 2.2} fill={filled ? "currentColor" : "none"} stroke={filled ? "none" : "currentColor"} />
      <rect x="3.5" y="13.5" width="7" height="7" rx={filled ? 2.5 : 2.2} fill={filled ? "currentColor" : "none"} stroke={filled ? "none" : "currentColor"} />
      <rect x="13.5" y="13.5" width="7" height="7" rx={filled ? 2.5 : 2.2} fill={filled ? "currentColor" : "none"} stroke={filled ? "none" : "currentColor"} />
    </svg>
  );
}

/**
 * iOS 26 Minimalist Messages / Comments Icon
 * Smooth continuous speech bubble with internal knockout 3 dots
 */
export function IOSCommentsIcon({ size = 26, filled = false, style, ...props }: IOSIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        ...style,
      }}
      {...props}
    >
      {filled ? (
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 3C6.75 3 2.5 6.92 2.5 11.75C2.5 14.15 3.53 16.32 5.25 17.85C5.05 19.35 4.3 20.45 3.4 21.2C3.15 21.4 3.3 21.8 3.65 21.75C6.1 21.4 8.1 20.35 9.25 19.55C10.12 19.85 11.04 20 12 20C17.25 20 21.5 16.08 21.5 11.75C21.5 6.92 17.25 3 12 3ZM8 12.75C7.31 12.75 6.75 12.19 6.75 11.5C6.75 10.81 7.31 10.25 8 10.25C8.69 10.25 9.25 10.81 9.25 11.5C9.25 12.19 8.69 12.75 8 12.75ZM12 12.75C11.31 12.75 10.75 12.19 10.75 11.5C10.75 10.81 11.31 10.25 12 10.25C12.69 10.25 13.25 10.81 13.25 11.5C13.25 12.19 12.69 12.75 12 12.75ZM16 12.75C15.31 12.75 14.75 12.19 14.75 11.5C14.75 10.81 15.31 10.25 16 10.25C16.69 10.25 17.25 10.81 17.25 11.5C17.25 12.19 16.69 12.75 16 12.75Z"
        />
      ) : (
        <path d="M12 3C6.75 3 2.5 6.92 2.5 11.75C2.5 14.15 3.53 16.32 5.25 17.85C5.05 19.35 4.3 20.45 3.4 21.2C3.15 21.4 3.3 21.8 3.65 21.75C6.1 21.4 8.1 20.35 9.25 19.55C10.12 19.85 11.04 20 12 20C17.25 20 21.5 16.08 21.5 11.75C21.5 6.92 17.25 3 12 3Z" />
      )}
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
      strokeWidth={filled ? 0 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        ...style,
      }}
      {...props}
    >
      {filled ? (
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 12C14.48 12 16.5 9.98 16.5 7.5C16.5 5.02 14.48 3 12 3C9.52 3 7.5 5.02 7.5 7.5C7.5 9.98 9.52 12 12 12ZM4.5 20.5C4.5 16.36 7.86 13 12 13C16.14 13 19.5 16.36 19.5 20.5V21H4.5V20.5Z"
        />
      ) : (
        <g>
          <circle cx="12" cy="7.5" r="4.25" />
          <path d="M4.5 20.5C4.5 16.36 7.86 13 12 13C16.14 13 19.5 16.36 19.5 20.5" />
        </g>
      )}
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
      strokeWidth={filled ? 0 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        ...style,
      }}
      {...props}
    >
      {filled ? (
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 3C8.96 3 6.5 5.46 6.5 8.5C6.5 10.3 7.37 11.89 8.7 12.9L7.5 21L12 18.5L16.5 21L15.3 12.9C16.63 11.89 17.5 10.3 17.5 8.5C17.5 5.46 15.04 3 12 3ZM12 6.5C13.1 6.5 14 7.4 14 8.5C14 9.6 13.1 10.5 12 10.5C10.9 10.5 10 9.6 10 8.5C10 7.4 10.9 6.5 12 6.5Z"
        />
      ) : (
        <g>
          <circle cx="12" cy="8.5" r="5.5" />
          <path d="M8.2 13.5L7 21.5L12 18.5L17 21.5L15.8 13.5" />
          <circle cx="12" cy="8.5" r={1.75} />
        </g>
      )}
    </svg>
  );
}

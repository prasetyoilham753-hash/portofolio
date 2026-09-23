import React from "react";
import { Link } from "react-router-dom";
import { cn } from "../../utils/cn";

export interface GlassTactileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "default";
  children: React.ReactNode;
  wrapClassName?: string;
}

export const GlassTactileButton = React.forwardRef<HTMLButtonElement, GlassTactileButtonProps>(
  ({ variant = "default", children, className, wrapClassName, disabled, ...props }, ref) => {
    return (
      <div className={cn("inline-flex items-center justify-center", disabled && "opacity-50 pointer-events-none", wrapClassName)}>
        <button
          ref={ref}
          disabled={disabled}
          className={cn(
            "ios-glass-btn",
            variant === "primary" && "ios-glass-primary",
            className
          )}
          {...props}
        >
          <span className="flex items-center justify-center gap-2">{children}</span>
        </button>
      </div>
    );
  }
);
GlassTactileButton.displayName = "GlassTactileButton";

export interface GlassTactileLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to?: string;
  href?: string;
  variant?: "primary" | "secondary" | "default";
  children: React.ReactNode;
  wrapClassName?: string;
}

export const GlassTactileLink: React.FC<GlassTactileLinkProps> = ({
  to,
  href,
  variant = "default",
  children,
  className,
  wrapClassName,
  ...props
}) => {
  const content = (
    <span className="w-full h-full flex items-center justify-center gap-2">{children}</span>
  );

  const buttonClasses = cn(
    "ios-glass-btn",
    variant === "primary" && "ios-glass-primary",
    className
  );

  return (
    <div className={cn("inline-flex items-center justify-center", wrapClassName)}>
      {to ? (
        <Link to={to} className={buttonClasses} {...(props as any)}>
          {content}
        </Link>
      ) : (
        <a href={href} className={buttonClasses} {...props}>
          {content}
        </a>
      )}
    </div>
  );
};

export interface GlassTactileIconProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  wrapClassName?: string;
  as?: "button" | "a";
  href?: string;
  target?: string;
  rel?: string;
}

export const GlassTactileIcon: React.FC<GlassTactileIconProps> = ({
  children,
  className,
  wrapClassName,
  as = "button",
  href,
  target,
  rel,
  disabled,
  ...props
}) => {
  return (
    <div className={cn("inline-flex items-center justify-center", disabled && "opacity-50 pointer-events-none", wrapClassName)}>
      {as === "a" && href ? (
        <a
          href={href}
          target={target}
          rel={rel}
          className={cn("ios-glass-icon", className)}
          {...(props as any)}
        >
          <span className="flex items-center justify-center">{children}</span>
        </a>
      ) : (
        <button
          disabled={disabled}
          className={cn("ios-glass-icon", className)}
          {...props}
        >
          <span className="flex items-center justify-center">{children}</span>
        </button>
      )}
    </div>
  );
};

// Aliases for Apple iOS Glass UI
export const GlassButton = GlassTactileButton;
export const GlassLink = GlassTactileLink;
export const GlassIcon = GlassTactileIcon;


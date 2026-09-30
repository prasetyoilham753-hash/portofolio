import React, { useState, useEffect, useRef, ReactNode, ErrorInfo } from "react";
import { 
  AlertTriangle, 
  RefreshCw, 
  Sparkles, 
  Terminal, 
  Maximize2, 
  Minimize2,
  Code2
} from "lucide-react";
import { getPrecompiledComponent } from "../../features/components_library/precompiledRegistry";

// Robust Error Boundary to isolate component runtime errors
interface ErrorBoundaryProps {
  fallbackTitle?: string;
  children: ReactNode;
  resetKey?: string | number;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ComponentErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { hasError: false, error: null };

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn("[DynamicComponentRunner] Runtime Error:", error, errorInfo);
  }

  override componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-6 text-center bg-rose-950/30 border border-rose-500/30 rounded-2xl w-full h-full min-h-[160px] text-rose-200 gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <AlertTriangle size={20} />
          </div>
          <div className="flex flex-col gap-1 max-w-md">
            <p className="text-xs font-mono uppercase tracking-wider text-rose-400 font-semibold">
              {this.props.fallbackTitle || "Component Runtime Error"}
            </p>
            <p className="text-xs text-rose-300/90 font-mono bg-rose-900/40 p-2.5 rounded-lg border border-rose-500/20 text-left overflow-x-auto break-words whitespace-pre-wrap">
              {this.state.error?.message || "Terjadi error saat me-render komponen."}
            </p>
          </div>
          <p className="text-[11px] text-rose-300/60">
            Periksa kembali sintaks JSX, hooks, atau dependency yang digunakan.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

interface DynamicComponentRunnerProps {
  code: string;
  css?: string;
  className?: string;
  minHeight?: string;
  showControls?: boolean;
  componentName?: string;
}

export function DynamicComponentRunner({
  code,
  css,
  className = "",
  minHeight = "min-h-[220px]",
  showControls = false,
  componentName = "Component"
}: DynamicComponentRunnerProps) {
  const [RenderedComponent, setRenderedComponent] = useState<React.ComponentType | null>(null);
  const [isCustomUncompiled, setIsCustomUncompiled] = useState(false);
  const [resetKey, setResetKey] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const styleRef = useRef<HTMLStyleElement | null>(null);
  const uniqueStyleId = useRef<string>(`style-${Math.random().toString(36).substring(2, 9)}`);

  // Inject custom CSS safely if provided
  useEffect(() => {
    if (!css || !css.trim()) {
      if (styleRef.current) {
        styleRef.current.remove();
        styleRef.current = null;
      }
      return;
    }

    if (!styleRef.current) {
      const style = document.createElement("style");
      style.id = uniqueStyleId.current;
      document.head.appendChild(style);
      styleRef.current = style;
    }

    styleRef.current.textContent = css;

    return () => {
      if (styleRef.current) {
        styleRef.current.remove();
        styleRef.current = null;
      }
    };
  }, [css]);

  // Resolve precompiled component without eval/new Function (100% CSP compliant)
  useEffect(() => {
    if (!code || !code.trim()) {
      setRenderedComponent(null);
      setIsCustomUncompiled(false);
      return;
    }

    const Precompiled = getPrecompiledComponent(componentName, code);
    if (Precompiled) {
      setRenderedComponent(() => Precompiled);
      setIsCustomUncompiled(false);
    } else {
      // For custom user-written code not in precompiled registry:
      // In production under strict CSP (no 'unsafe-eval'), we safely avoid running eval/new Function
      setRenderedComponent(null);
      setIsCustomUncompiled(true);
    }
  }, [code, componentName]);

  const handleReset = () => {
    setResetKey(prev => prev + 1);
  };

  return (
    <div 
      className={`relative w-full rounded-2xl overflow-hidden flex flex-col bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[rgba(14,28,54,0.7)] via-[rgba(6,15,35,0.6)] to-[rgba(3,8,20,0.85)] border border-[rgba(120,170,255,0.2)] backdrop-blur-xl shadow-[0_12px_32px_rgba(0,0,0,0.35)] transition-all ${
        isFullscreen ? "fixed inset-4 z-[99999] m-auto max-w-5xl max-h-[90vh]" : ""
      } ${className}`}
    >
      {/* Background Grid Pattern Accent */}
      <div 
        className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #7DB3FF 1px, transparent 1px), linear-gradient(to bottom, #7DB3FF 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Header bar with controls */}
      {showControls && (
        <div className="relative z-10 flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-black/20 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono font-medium text-[#7DB3FF] uppercase tracking-wider">
              Live Preview
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleReset}
              className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Reset / Replay Component"
            >
              <RefreshCw size={13} />
            </button>
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title={isFullscreen ? "Keluar Fullscreen" : "Fullscreen Preview"}
            >
              {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            </button>
          </div>
        </div>
      )}

      {/* Canvas Area */}
      <div className={`relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 overflow-hidden ${minHeight}`}>
        {isCustomUncompiled ? (
          <div className="flex flex-col items-center justify-center p-6 text-center bg-blue-950/25 border border-blue-500/25 rounded-2xl w-full max-w-lg text-blue-200 gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-[#7DB3FF]">
              <Code2 size={20} />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-xs font-mono uppercase tracking-wider text-[#7DB3FF] font-semibold">
                Custom Component Sandbox Notice
              </p>
              <p className="text-xs text-[#C8DCF0] leading-relaxed">
                Live dynamic JSX execution is restricted under strict production Content Security Policy (zero <code className="text-amber-300 font-mono">'unsafe-eval'</code>).
              </p>
            </div>
            <p className="text-[11px] text-blue-200/70 bg-blue-900/30 px-3 py-1.5 rounded-lg border border-blue-400/20">
              Komponen kustom ini valid dan seluruh kode JSX siap disalin menggunakan tombol <strong>Copy Code</strong> di atas.
            </p>
          </div>
        ) : RenderedComponent ? (
          <ComponentErrorBoundary resetKey={resetKey} fallbackTitle={`Error in ${componentName}`}>
            <div key={resetKey} className="w-full h-full flex items-center justify-center">
              <RenderedComponent />
            </div>
          </ComponentErrorBoundary>
        ) : (
          <div className="flex items-center gap-2 text-xs text-[#A8B8CC]/60 font-light">
            <Sparkles size={14} className="text-[#7DB3FF] animate-pulse" />
            <span>Memuat komponen...</span>
          </div>
        )}
      </div>
    </div>
  );
}

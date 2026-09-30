import React, { useState, useRef } from "react";
import { 
  Flame, 
  ArrowRight, 
  Sparkles, 
  PartyPopper, 
  ShieldCheck, 
  Cpu, 
  ArrowUpRight, 
  Zap 
} from "lucide-react";
import { motion } from "motion/react";
import confetti from "canvas-confetti";
import gsap from "gsap";

// 1. Styled Cyberpunk Button
export function PrecompiledCyberpunkButton() {
  const [isActive, setIsActive] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '24px' }}>
      <button
        type="button"
        onClick={() => setIsActive(prev => !prev)}
        style={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '12px',
          padding: '14px 28px',
          background: isActive 
            ? 'linear-gradient(135deg, rgba(16, 52, 104, 0.98), rgba(8, 28, 64, 0.98))' 
            : 'linear-gradient(135deg, rgba(8, 24, 48, 0.9), rgba(4, 12, 28, 0.95))',
          border: isActive ? '1px solid #A3CCFF' : '1px solid #7DB3FF',
          borderRadius: '12px',
          color: '#F7FAFF',
          fontFamily: 'inherit',
          fontSize: '14px',
          fontWeight: 600,
          letterSpacing: '0.5px',
          cursor: 'pointer',
          transform: isActive ? 'translateX(24px) scale(1.04)' : 'translateX(0px) scale(1)',
          boxShadow: isActive 
            ? '0 0 35px rgba(125, 220, 255, 0.9), inset 0 0 20px rgba(125, 220, 255, 0.6)' 
            : '0 0 15px rgba(125, 179, 255, 0.4), inset 0 0 10px rgba(125, 179, 255, 0.2)',
          transition: 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease',
          backdropFilter: 'blur(10px)',
          outline: 'none',
        }}
      >
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '26px',
            height: '26px',
            borderRadius: '6px',
            background: isActive ? 'rgba(125, 220, 255, 0.35)' : 'rgba(125, 179, 255, 0.2)',
            color: isActive ? '#A3E5FF' : '#7DB3FF',
            transform: isActive ? 'rotate(15deg) scale(1.15)' : 'rotate(0deg) scale(1)',
            transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), background 0.3s ease, color 0.3s ease',
          }}
        >
          <Flame size={15} />
        </span>

        <span>{isActive ? 'Hyperdrive Engaged' : 'Ignite Hyperdrive'}</span>

        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            transform: isActive ? 'translateX(6px)' : 'translateX(0px)',
            transition: 'transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1)',
            opacity: isActive ? 1 : 0.8,
          }}
        >
          <ArrowRight size={15} />
        </span>
      </button>
      <span style={{ fontSize: '11px', color: '#A8B8CC', opacity: 0.6 }}>
        {isActive ? 'Klik kedua untuk bergerak mundur kembali' : 'Klik pertama untuk interaksi maju'}
      </span>
    </div>
  );
}

// 2. Glow Spotlight Button
export function PrecompiledGlowSpotlightButton() {
  const [isActive, setIsActive] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [spotlightOpacity, setSpotlightOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setSpotlightOpacity(1);
  };

  const handleMouseLeave = () => {
    setSpotlightOpacity(0);
  };

  return (
    <div className="flex items-center justify-center p-6">
      <motion.button
        animate={{
          x: isActive ? 24 : 0,
          scale: isActive ? 1.05 : 1,
        }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        onClick={() => setIsActive(prev => !prev)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative px-7 py-3.5 rounded-full font-medium text-sm text-white overflow-hidden group border border-[rgba(125,179,255,0.3)] bg-gradient-to-b from-[#0e2142] to-[#081326] shadow-[0_0_20px_rgba(0,0,0,0.4)] cursor-pointer"
      >
        {/* Spotlight Glow Follower */}
        <div
          className="pointer-events-none absolute -inset-px transition-opacity duration-300 rounded-full"
          style={{
            opacity: spotlightOpacity,
            background: `radial-gradient(120px circle at ${position.x}px ${position.y}px, rgba(125, 179, 255, 0.4), transparent 80%)`,
          }}
        />

        <div className="relative z-10 flex items-center gap-2.5 font-sans tracking-wide">
          <Sparkles size={16} className="text-[#7DB3FF] animate-pulse" />
          <span>{isActive ? 'Universe Active' : 'Explore Universe'}</span>
          <motion.div
            animate={{ x: isActive ? 5 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <ArrowRight size={15} className="text-white/70" />
          </motion.div>
        </div>
      </motion.button>
    </div>
  );
}

// 3. GSAP Celebration Confetti
export function PrecompiledConfettiCelebration() {
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleCelebrate = () => {
    if (btnRef.current) {
      gsap.timeline()
        .to(btnRef.current, { scale: 0.9, duration: 0.1, ease: 'power2.out' })
        .to(btnRef.current, { scale: 1.12, duration: 0.2, ease: 'back.out(2)' })
        .to(btnRef.current, { scale: 1, duration: 0.2, ease: 'power2.out' });
    }

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.65 },
      colors: ['#7DB3FF', '#F7FAFF', '#38BDF8', '#818CF8'],
    });
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 gap-3">
      <button
        ref={btnRef}
        type="button"
        onClick={handleCelebrate}
        className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#1d4ed8] to-[#2563eb] text-white font-semibold text-sm flex items-center gap-2.5 shadow-[0_0_24px_rgba(37,99,235,0.5)] border border-blue-400/40 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
      >
        <PartyPopper size={18} className="text-amber-300 animate-bounce" />
        <span>Celebrate Achievement</span>
      </button>
      <span className="text-[11px] font-mono text-[#A8B8CC]/70">
        Powered by GSAP & canvas-confetti
      </span>
    </div>
  );
}

// 4. Pure React Minimal Badge
export function PrecompiledPureReactBadge() {
  const [active, setActive] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '24px' }}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setActive(!active)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActive(!active); }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 20px',
          borderRadius: '999px',
          backgroundColor: active ? 'rgba(125, 179, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)',
          border: `1px solid ${active ? '#7DB3FF' : 'rgba(255, 255, 255, 0.15)'}`,
          cursor: 'pointer',
          transition: 'all 0.25s ease',
          userSelect: 'none',
        }}
      >
        <div
          style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: active ? '#34D399' : '#94A3B8',
            boxShadow: active ? '0 0 10px #34D399' : 'none',
            transition: 'all 0.25s ease',
          }}
        />
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF', letterSpacing: '0.3px' }}>
          {active ? 'Engine Online (Active)' : 'Engine Standby (Click Me)'}
        </span>
      </div>
      <span style={{ fontSize: '11px', color: '#94A3B8', fontFamily: 'monospace' }}>
        Zero external dependency
      </span>
    </div>
  );
}

// 5. Shimmer Glass Card
export function PrecompiledShimmerGlassCard() {
  return (
    <div className="flex items-center justify-center p-4">
      <motion.div
        whileHover={{ y: -4 }}
        className="relative w-full max-w-sm rounded-3xl p-6 bg-[rgba(10,22,44,0.6)] border border-white/10 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden group"
      >
        {/* Animated Gradient Accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#7DB3FF]/20 rounded-full blur-3xl group-hover:bg-[#7DB3FF]/35 transition-all duration-500 pointer-events-none" />

        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-2xl bg-[#7DB3FF]/10 border border-[#7DB3FF]/20 flex items-center justify-center text-[#7DB3FF]">
            <Cpu size={20} />
          </div>
          <span className="px-3 py-1 rounded-full text-[11px] font-mono uppercase tracking-wider bg-white/5 border border-white/10 text-white/70">
            Interactive
          </span>
        </div>

        <h3 className="text-lg font-bold text-white mb-2 tracking-tight group-hover:text-[#7DB3FF] transition-colors">
          Spatial Glass Architecture
        </h3>

        <p className="text-xs text-[#A8B8CC] leading-relaxed mb-5 font-light">
          Komponen UI modular dengan pantulan cahaya material, kontras tinggi, dan animasi mikro responsif.
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <ShieldCheck size={14} />
            <span>Verified System</span>
          </div>

          <button type="button" className="flex items-center gap-1 text-xs text-[#7DB3FF] hover:text-white transition-colors cursor-pointer font-medium">
            <span>Details</span>
            <ArrowUpRight size={13} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// 6. Animated Gradient Shimmer Text
export function PrecompiledShimmerTextEffect() {
  return (
    <div className="flex flex-col items-center justify-center p-8 gap-3 text-center">
      <span className="text-xs font-mono uppercase tracking-widest text-[#7DB3FF]/80">
        Next-Gen Motion
      </span>
      <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-[#F7FAFF] via-[#7DB3FF] to-[#88B8FF] bg-[length:200%_auto] bg-clip-text text-transparent animate-[shimmer_4s_linear_infinite]">
        Crafting Digital Realities
      </h2>
      <p className="text-xs sm:text-sm text-[#A8B8CC] max-w-xs font-light">
        High-fidelity typography crafted for creative technologists & designers.
      </p>
    </div>
  );
}

// 7. Interactive Magnetic Pill
export function PrecompiledMagneticPill() {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.35, y: middleY * 0.35 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div className="flex items-center justify-center p-8">
      <motion.div
        ref={ref}
        onMouseMove={handleMouse}
        onMouseLeave={reset}
        animate={{ x: position.x, y: position.y }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, mass: 0.1 }}
        className="px-6 py-3 rounded-full bg-[rgba(125,179,255,0.12)] border border-[#7DB3FF]/35 backdrop-blur-lg flex items-center gap-2.5 text-[#7DB3FF] hover:text-white cursor-pointer select-none shadow-[0_0_24px_rgba(125,179,255,0.2)] hover:border-[#7DB3FF] transition-colors"
      >
        <Zap size={16} className="text-[#7DB3FF]" />
        <span className="text-sm font-semibold tracking-wide">Magnetic Hover Pill</span>
      </motion.div>
    </div>
  );
}

// 8. Quantum Orbital Loader
export function PrecompiledQuantumLoader() {
  return (
    <div className="flex flex-col items-center justify-center p-8 gap-4">
      <div className="relative w-16 h-16 flex items-center justify-center">
        {/* Center Nucleus */}
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-4 h-4 rounded-full bg-[#7DB3FF] shadow-[0_0_16px_#7DB3FF]"
        />

        {/* Orbit Ring 1 */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border border-t-[#7DB3FF] border-r-transparent border-b-[#7DB3FF]/30 border-l-transparent"
        />

        {/* Orbit Ring 2 */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-2 rounded-full border border-t-white/80 border-r-transparent border-b-transparent border-l-white/20"
        />
      </div>

      <span className="text-xs font-mono uppercase tracking-widest text-[#A8B8CC]">
        Processing Quantum State...
      </span>
    </div>
  );
}

/**
 * Precompiled Component Registry
 * Maps predefined component names, identifiers, or code signatures to native precompiled React components.
 * This completely avoids browser-level eval / new Function under strict CSP.
 */
export function getPrecompiledComponent(name?: string, code?: string): React.ComponentType | null {
  const normalizedName = (name || "").toLowerCase().trim();
  const normalizedCode = (code || "").trim();

  if (
    normalizedName.includes("cyberpunk") ||
    normalizedCode.includes("StyledCyberpunkButton") ||
    normalizedCode.includes("Ignite Hyperdrive") ||
    normalizedCode.includes("Hyperdrive Engaged")
  ) {
    return PrecompiledCyberpunkButton;
  }

  if (
    normalizedName.includes("spotlight") ||
    normalizedCode.includes("GlowSpotlightButton") ||
    normalizedCode.includes("Explore Universe") ||
    normalizedCode.includes("Universe Active")
  ) {
    return PrecompiledGlowSpotlightButton;
  }

  if (
    normalizedName.includes("celebration") ||
    normalizedName.includes("confetti") ||
    normalizedCode.includes("ConfettiCelebration") ||
    normalizedCode.includes("Celebrate Achievement")
  ) {
    return PrecompiledConfettiCelebration;
  }

  if (
    normalizedName.includes("pure react") ||
    normalizedName.includes("badge") ||
    normalizedCode.includes("PureReactBadge") ||
    normalizedCode.includes("Engine Online")
  ) {
    return PrecompiledPureReactBadge;
  }

  if (
    normalizedName.includes("shimmer glass") ||
    normalizedName.includes("glass card") ||
    normalizedCode.includes("ShimmerGlassCard") ||
    normalizedCode.includes("Spatial Glass Architecture")
  ) {
    return PrecompiledShimmerGlassCard;
  }

  if (
    normalizedName.includes("shimmer text") ||
    normalizedName.includes("gradient shimmer") ||
    normalizedCode.includes("ShimmerTextEffect") ||
    normalizedCode.includes("Crafting Digital Realities")
  ) {
    return PrecompiledShimmerTextEffect;
  }

  if (
    normalizedName.includes("magnetic") ||
    normalizedName.includes("pill") ||
    normalizedCode.includes("MagneticPill") ||
    normalizedCode.includes("Magnetic Hover Pill")
  ) {
    return PrecompiledMagneticPill;
  }

  if (
    normalizedName.includes("quantum") ||
    normalizedName.includes("orbital") ||
    normalizedName.includes("loader") ||
    normalizedCode.includes("QuantumLoader") ||
    normalizedCode.includes("Processing Quantum State")
  ) {
    return PrecompiledQuantumLoader;
  }

  return null;
}

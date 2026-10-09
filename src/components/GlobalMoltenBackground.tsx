import React from 'react';
import { MoltenMetal } from './ui/MoltenMetal/MoltenMetal';
import { GhostFibers } from './ui/GhostFibers/GhostFibers';
import { LightPillar } from './ui/LightPillar/LightPillar';
import { useBackground } from '../features/background/BackgroundContext';
import { motion } from 'motion/react';

export function GlobalMoltenBackground() {
  const { backgroundType } = useBackground();

  const isMoltenActive = backgroundType === 'molten';
  const isGhostActive = backgroundType === 'ghost-fibers';
  const isPillarActive = backgroundType === 'light-pillar';

  return (
    <div 
      id="global-canvas-bg"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-[#020914]"
      aria-hidden="true"
    >
      {/* 1. Molten Metal Theme Layer */}
      <motion.div
        key="bg-molten"
        initial={{ opacity: isMoltenActive ? 1 : 0 }}
        animate={{ opacity: isMoltenActive ? 1 : 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 pointer-events-none"
      >
        <MoltenMetal
          color1="#081b42"
          color2="#356df3"
          color3="#9ac6ff"
          speed={0.28}
          scale={2.8}
          detail={3}
          glow={1.8}
          coreSize={0.12}
          swirl={0.85}
          fold={-0.15}
          blackPoint={0.05}
          brightness={1.4}
          colorMode="molten"
          grain={true}
          grainIntensity={0.03}
          mouseInteraction={true}
          mouseStrength={0.3}
          globalMouse={true}
          opacity={0.88}
          className="w-full h-full"
        />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#020914]/50 via-[#020914]/15 to-[#020914]/75" />
        <div className="absolute inset-0 pointer-events-none bg-radial-[ellipse_at_center,transparent_45%,#020914_85%] opacity-55" />
      </motion.div>

      {/* 2. Ghost Fibers Theme Layer */}
      <motion.div
        key="bg-ghost-fibers"
        initial={{ opacity: isGhostActive ? 1 : 0 }}
        animate={{ opacity: isGhostActive ? 1 : 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 pointer-events-none"
      >
        <GhostFibers
          lineColor="#140E35"
          glowColor="#3437A0"
          speed={0.2}
          scale={2}
          rotation={0}
          rotationSpeed={0.25}
          layers={4}
          waveAmplitude={0.015}
          waveFrequency={3}
          waveSpeed={0.15}
          layerSpeed={0.08}
          twist={0.1}
          twistFrequency={5}
          twistSpeed={1.2}
          lineFrequency={5}
          lineSpacing={2}
          lineSharpness={16}
          glowFalloff={10}
          glowIntensity={1.6}
          brightness={2}
          blueBoost={1.25}
          vignette={0.8}
          grain={0.05}
          dpr={1}
          className="w-full h-full"
        />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#020914]/75 via-[#020914]/30 to-[#020914]/85" />
        <div className="absolute inset-0 pointer-events-none bg-radial-[ellipse_at_center,transparent_35%,#020914_90%] opacity-80" />
      </motion.div>

      {/* 3. Light Pillar Theme Layer */}
      <motion.div
        key="bg-light-pillar"
        initial={{ opacity: isPillarActive ? 1 : 0 }}
        animate={{ opacity: isPillarActive ? 1 : 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 pointer-events-none"
      >
        <LightPillar
          topColor="#632fd4"
          bottomColor="#560761"
          intensity={0.95}
          rotationSpeed={1.5}
          glowAmount={0.006}
          pillarWidth={7.0}
          pillarHeight={0.6}
          noiseIntensity={0.12}
          pillarRotation={216}
          interactive={true}
          mixBlendMode="screen"
          quality="high"
          className="w-full h-full"
        />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#020914]/70 via-[#020914]/30 to-[#020914]/85" />
        <div className="absolute inset-0 pointer-events-none bg-radial-[ellipse_at_center,transparent_35%,#020914_90%] opacity-75" />
      </motion.div>
    </div>
  );
}

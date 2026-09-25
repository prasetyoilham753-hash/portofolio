import React from 'react';
import { MoltenMetal } from './ui/MoltenMetal/MoltenMetal';
import { GhostFibers } from './ui/GhostFibers/GhostFibers';
import { LightPillar } from './ui/LightPillar/LightPillar';
import { useBackground } from '../features/background/BackgroundContext';
import { motion, AnimatePresence } from 'motion/react';

export function GlobalMoltenBackground() {
  const { backgroundType } = useBackground();

  return (
    <div 
      id="global-canvas-bg"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-[#020914]"
      aria-hidden="true"
    >
      <AnimatePresence>
        {backgroundType === 'molten' && (
          <motion.div
            key="bg-molten"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            {/* Real-time WebGL Molten Metal Canvas - enhanced clarity & luminance */}
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
            {/* Balanced vignette & gradient overlays for optimal text contrast and high visibility */}
            <div 
              className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#020914]/50 via-[#020914]/15 to-[#020914]/75" 
            />
            <div 
              className="absolute inset-0 pointer-events-none bg-radial-[ellipse_at_center,transparent_45%,#020914_85%] opacity-55" 
            />
          </motion.div>
        )}

        {backgroundType === 'ghost-fibers' && (
          <motion.div
            key="bg-ghost-fibers"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            {/* Real-time WebGL Ghost Fibers Canvas from React Bits */}
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
            {/* Deep vignette & gradient overlays for editorial contrast and readability */}
            <div 
              className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#020914]/75 via-[#020914]/30 to-[#020914]/85" 
            />
            <div 
              className="absolute inset-0 pointer-events-none bg-radial-[ellipse_at_center,transparent_35%,#020914_90%] opacity-80" 
            />
          </motion.div>
        )}

        {backgroundType === 'light-pillar' && (
          <motion.div
            key="bg-light-pillar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            {/* Real-time WebGL Light Pillar Canvas - faster motion & vibrant glow */}
            <LightPillar
              topColor="#5227FF"
              bottomColor="#FF9FFC"
              intensity={1.05}
              rotationSpeed={0.75}
              glowAmount={0.006}
              pillarWidth={3.0}
              pillarHeight={0.4}
              noiseIntensity={0.35}
              pillarRotation={0}
              interactive={true}
              mixBlendMode="screen"
              quality="high"
              className="w-full h-full"
            />
            {/* Deep vignette & gradient overlays for editorial contrast and readability */}
            <div 
              className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#020914]/70 via-[#020914]/30 to-[#020914]/85" 
            />
            <div 
              className="absolute inset-0 pointer-events-none bg-radial-[ellipse_at_center,transparent_35%,#020914_90%] opacity-75" 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


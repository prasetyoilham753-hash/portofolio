import React from 'react';
import { MoltenMetal } from './ui/MoltenMetal/MoltenMetal';
import { GhostFibers } from './ui/GhostFibers/GhostFibers';
import { useBackground } from '../features/background/BackgroundContext';
import { motion, AnimatePresence } from 'motion/react';

export function GlobalMoltenBackground() {
  const { backgroundType } = useBackground();

  return (
    <div 
      id="global-canvas-bg"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      <AnimatePresence mode="wait">
        {backgroundType === 'molten' ? (
          <motion.div
            key="bg-molten"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            className="absolute inset-0"
          >
            {/* Real-time WebGL Molten Metal Canvas */}
            <MoltenMetal
              color1="#040e24"
              color2="#2955c4"
              color3="#7db3ff"
              speed={0.22}
              scale={3.2}
              detail={3}
              glow={1.4}
              coreSize={0.08}
              swirl={0.8}
              fold={-0.18}
              blackPoint={0.08}
              brightness={1.15}
              colorMode="molten"
              grain={true}
              grainIntensity={0.035}
              mouseInteraction={true}
              mouseStrength={0.25}
              globalMouse={true}
              opacity={0.55}
              className="w-full h-full"
            />
            {/* Deep vignette & gradient overlays for editorial contrast and readability */}
            <div 
              className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#020914]/80 via-[#020914]/40 to-[#020914]/90" 
            />
            <div 
              className="absolute inset-0 pointer-events-none bg-radial-[ellipse_at_center,transparent_30%,#020914_90%] opacity-85" 
            />
          </motion.div>
        ) : (
          <motion.div
            key="bg-ghost-fibers"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
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
      </AnimatePresence>
    </div>
  );
}


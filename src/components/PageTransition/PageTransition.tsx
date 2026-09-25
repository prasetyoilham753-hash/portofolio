import { motion, useReducedMotion } from "motion/react";
import { ReactNode, useState, useEffect } from "react";

// Module-scoped flag so the grand entrance runs on initial website open
let isFirstWebsiteLaunch = true;

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const shouldReduceMotion = useReducedMotion();
  const [isInitialLaunch] = useState(() => isFirstWebsiteLaunch);

  useEffect(() => {
    if (isFirstWebsiteLaunch) {
      isFirstWebsiteLaunch = false;
    }
  }, []);

  // First-time website opening: majestic, smooth, spatial deblur and elevation
  // Subsequent route changes: spatial 3D slide
  const variants = shouldReduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : isInitialLaunch
    ? {
        initial: {
          opacity: 0,
          y: 44,
          scale: 0.96,
          filter: "blur(10px)",
        },
        animate: {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
        },
        exit: {
          opacity: 0,
          x: -40,
          z: -80,
          rotateY: 8,
          filter: "blur(8px)",
        },
      }
    : {
        initial: {
          opacity: 0,
          x: 40,
          z: -80,
          rotateY: -8,
          filter: "blur(8px)",
        },
        animate: {
          opacity: 1,
          x: 0,
          z: 0,
          rotateY: 0,
          filter: "blur(0px)",
        },
        exit: {
          opacity: 0,
          x: -40,
          z: -80,
          rotateY: 8,
          filter: "blur(8px)",
        },
      };

  const transitionConfig = isInitialLaunch && !shouldReduceMotion
    ? {
        duration: 1.2,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number], // Apple fluid cubic-bezier curve
        delay: 0.05,
      }
    : {
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      };

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={transitionConfig}
      style={{ transformStyle: "preserve-3d" }}
      className="w-full h-full pt-6 sm:pt-8 md:pt-10 lg:pt-12 pb-24 md:pb-20 px-4 sm:px-6 md:px-10 lg:px-12 xl:px-16 max-w-[1600px] 2xl:max-w-[1740px] mx-auto relative"
    >
      {/* Subtle cinematic horizon light beam on initial site opening */}
      {isInitialLaunch && !shouldReduceMotion && (
        <motion.div
          initial={{ opacity: 0, scaleX: 0.3, y: -10 }}
          animate={{
            opacity: [0, 0.8, 0],
            scaleX: [0.3, 1.1, 1.4],
            y: [-10, 0, 8],
          }}
          transition={{
            duration: 1.35,
            ease: [0.16, 1, 0.3, 1],
            delay: 0.1,
          }}
          className="pointer-events-none absolute top-4 sm:top-6 md:top-20 left-1/2 -translate-x-1/2 w-3/4 max-w-[700px] h-[1px] bg-gradient-to-r from-transparent via-[#8DBEFF] to-transparent shadow-[0_0_24px_3px_rgba(141,190,255,0.45)] z-20"
          aria-hidden="true"
        />
      )}

      {children}
    </motion.div>
  );
}


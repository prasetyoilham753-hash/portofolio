import { motion, useReducedMotion } from "motion/react";
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const shouldReduceMotion = useReducedMotion();

  const variants = {
    initial: shouldReduceMotion
      ? { opacity: 0 }
      : { opacity: 0, x: 40, z: -80, rotateY: -8, filter: "blur(8px)" },
    animate: { opacity: 1, x: 0, z: 0, rotateY: 0, filter: "blur(0px)" },
    exit: shouldReduceMotion
      ? { opacity: 0 }
      : { opacity: 0, x: -40, z: -80, rotateY: 8, filter: "blur(8px)" },
  };

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ 
        duration: 0.7, 
        ease: [0.22, 1, 0.36, 1] // Custom ease-out curve for cinematic feel
      }}
      style={{ transformStyle: "preserve-3d" }}
      className="w-full h-full pt-28 pb-12 px-6 md:px-12 max-w-7xl mx-auto"
    >
      {children}
    </motion.div>
  );
}

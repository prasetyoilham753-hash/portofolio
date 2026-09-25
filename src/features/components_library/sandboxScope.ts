import React, { 
  useState, 
  useEffect, 
  useRef, 
  useMemo, 
  useCallback, 
  useId, 
  useReducer, 
  useContext, 
  createContext, 
  forwardRef, 
  memo, 
  Fragment, 
  cloneElement, 
  isValidElement, 
  Children 
} from "react";
import styled, { 
  css as styledCss, 
  keyframes as styledKeyframes, 
  ThemeProvider, 
  createGlobalStyle, 
  useTheme 
} from "styled-components";
import * as MotionReact from "motion/react";
import * as LucideIcons from "lucide-react";
import * as ThreeJs from "three";
import gsap from "gsap";
import confetti from "canvas-confetti";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import * as OGL from "ogl";

/**
 * Registry of all available modules in the sandbox.
 * Maps package names and aliases to actual module exports.
 */
export const AVAILABLE_MODULES: Record<string, any> = {
  "react": {
    __esModule: true,
    default: React,
    ...React,
    useState,
    useEffect,
    useRef,
    useMemo,
    useCallback,
    useId,
    useReducer,
    useContext,
    createContext,
    forwardRef,
    memo,
    Fragment,
    cloneElement,
    isValidElement,
    Children,
  },
  "react/jsx-runtime": {
    __esModule: true,
    default: { jsx: React.createElement, jsxs: React.createElement, Fragment },
    jsx: React.createElement,
    jsxs: React.createElement,
    Fragment,
  },
  "styled-components": {
    __esModule: true,
    default: styled,
    styled,
    css: styledCss,
    keyframes: styledKeyframes,
    ThemeProvider,
    createGlobalStyle,
    useTheme,
  },
  "motion/react": {
    __esModule: true,
    default: MotionReact,
    ...MotionReact,
  },
  "framer-motion": {
    __esModule: true,
    default: MotionReact,
    ...MotionReact,
  },
  "motion": {
    __esModule: true,
    default: MotionReact,
    ...MotionReact,
  },
  "lucide-react": {
    __esModule: true,
    default: LucideIcons,
    ...LucideIcons,
  },
  "three": {
    __esModule: true,
    default: ThreeJs,
    ...ThreeJs,
    THREE: ThreeJs,
  },
  "gsap": {
    __esModule: true,
    default: gsap,
    gsap,
  },
  "canvas-confetti": {
    __esModule: true,
    default: confetti,
    confetti,
  },
  "clsx": {
    __esModule: true,
    default: clsx,
    clsx,
  },
  "tailwind-merge": {
    __esModule: true,
    default: twMerge,
    twMerge,
  },
  "ogl": {
    __esModule: true,
    default: OGL,
    ...OGL,
  },
};

/**
 * Global variables injected into the execution scope
 * so components can use them even without explicit import statements.
 */
export const GLOBAL_SCOPE: Record<string, any> = {
  React,
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  useId,
  useReducer,
  useContext,
  createContext,
  forwardRef,
  memo,
  Fragment,
  cloneElement,
  isValidElement,
  Children,
  styled,
  css: styledCss,
  keyframes: styledKeyframes,
  ThemeProvider,
  createGlobalStyle,
  useTheme,
  motion: MotionReact.motion,
  AnimatePresence: MotionReact.AnimatePresence,
  useReducedMotion: MotionReact.useReducedMotion,
  useAnimation: MotionReact.useAnimation,
  useSpring: MotionReact.useSpring,
  useTransform: MotionReact.useTransform,
  useMotionValue: MotionReact.useMotionValue,
  useScroll: MotionReact.useScroll,
  useInView: MotionReact.useInView,
  useDragControls: MotionReact.useDragControls,
  useVelocity: MotionReact.useVelocity,
  gsap,
  confetti,
  canvasConfetti: confetti,
  THREE: ThreeJs,
  clsx,
  twMerge,
  ...OGL,
  ...LucideIcons,
};

/**
 * Creates an isolated require function that maps imported package names
 * to our registered modules.
 */
export function createSandboxRequire(onMissingPackage?: (pkgName: string) => void) {
  return function sandboxRequire(moduleName: string): any {
    // Ignore CSS file imports gracefully
    if (moduleName.endsWith(".css")) {
      return { __esModule: true, default: {} };
    }

    const mod = AVAILABLE_MODULES[moduleName];
    if (mod) {
      return mod;
    }

    if (onMissingPackage) {
      onMissingPackage(moduleName);
    }
    throw new Error(`Module "${moduleName}" is not available in sandbox runtime.`);
  };
}

export interface DependencyAnalysisResult {
  detectedImports: string[];
  unsupportedImports: string[];
  preparedCode: string;
}

/**
 * Inspects imports, detects missing dependencies, and ensures
 * proper export default wrapping if absent.
 */
export function analyzeAndPrepareCode(sourceCode: string): DependencyAnalysisResult {
  const detectedImports: string[] = [];
  const unsupportedImports: string[] = [];

  // Match: import ... from 'pkg' or require('pkg')
  const importRegex = /(?:import\s+(?:[\s\S]*?)\s+from\s+['"]([^'"]+)['"]|import\s+['"]([^'"]+)['"]|require\s*\(\s*['"]([^'"]+)['"]\s*\))/g;
  let match: RegExpExecArray | null;

  while ((match = importRegex.exec(sourceCode)) !== null) {
    const pkg = match[1] || match[2] || match[3];
    if (pkg) {
      detectedImports.push(pkg);
      if (!AVAILABLE_MODULES[pkg] && !pkg.endsWith(".css")) {
        unsupportedImports.push(pkg);
      }
    }
  }

  // Ensure export exists for components without explicit export default
  let preparedCode = sourceCode;
  const hasExport = /export\s+(?:default\s+|{[\s\S]*?}|(?:function|class|const|let|var)\s+)/.test(sourceCode);

  if (!hasExport) {
    // Find the last function or const component
    const componentMatches = [...sourceCode.matchAll(/(?:function\s+([A-Z][A-Za-z0-9_]*)|(?:const|let|var)\s+([A-Z][A-Za-z0-9_]*)\s*=)/g)];
    if (componentMatches.length > 0) {
      const lastMatch = componentMatches[componentMatches.length - 1];
      const componentName = lastMatch[1] || lastMatch[2];
      if (componentName) {
        preparedCode += `\nexports.default = ${componentName};`;
      }
    }
  }

  return {
    detectedImports: Array.from(new Set(detectedImports)),
    unsupportedImports: Array.from(new Set(unsupportedImports)),
    preparedCode,
  };
}

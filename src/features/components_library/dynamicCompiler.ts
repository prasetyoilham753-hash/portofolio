import { transform } from "sucrase";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import * as LucideIcons from "lucide-react";
import { motion } from "motion/react";
import confetti from "canvas-confetti";
import gsap from "gsap";
import styled from "styled-components";

/**
 * Safely compiles and evaluates user-written React / JSX / TypeScript component code
 * at runtime using Sucrase, so live previews instantly reflect exact user code.
 */
export function compileUserComponent(code: string, componentName: string): React.ComponentType | null {
  if (!code || !code.trim()) return null;

  try {
    // 1. Remove import statements (since packages are provided in scope)
    let processed = code.replace(/import\s+[\s\S]*?from\s+['"][^'"]+['"];?/g, "");

    // Extract potential exported component names
    let exportName = "Component";
    const exportDefaultMatch = processed.match(/export\s+default\s+(?:function\s+([a-zA-Z0-9_$]+)|([a-zA-Z0-9_$]+))/);
    const exportNamedMatch = processed.match(/export\s+(?:function\s+([a-zA-Z0-9_$]+)|const\s+([a-zA-Z0-9_$]+))/);

    if (exportDefaultMatch) {
      exportName = exportDefaultMatch[1] || exportDefaultMatch[2] || "Component";
    } else if (exportNamedMatch) {
      exportName = exportNamedMatch[1] || exportNamedMatch[2] || "Component";
    }

    // Replace exports with standard declarations and assignments
    processed = processed
      .replace(/export\s+default\s+function\s+/g, "function ")
      .replace(/export\s+default\s+class\s+/g, "class ")
      .replace(/export\s+default\s+/g, "const __defaultExport = ")
      .replace(/export\s+(function|const|class)\s+/g, "$1 ");

    // 2. Transpile JSX / TypeScript using Sucrase
    const compiled = transform(processed, {
      transforms: ["jsx", "typescript"],
    });

    // 3. Evaluate in secure scope with React hooks, motion, icons, and animation libraries
    const evalBody = `
      "use strict";
      const { ${Object.keys(LucideIcons).join(", ")} } = LucideIcons;
      ${compiled.code}
      
      if (typeof ${exportName} !== "undefined") {
        return ${exportName};
      }
      if (typeof __defaultExport !== "undefined") {
        return __defaultExport;
      }
      return null;
    `;

    const factory = new Function(
      "React",
      "useState",
      "useEffect",
      "useRef",
      "useCallback",
      "useMemo",
      "motion",
      "LucideIcons",
      "confetti",
      "gsap",
      "styled",
      evalBody
    );

    const Component = factory(
      React,
      useState,
      useEffect,
      useRef,
      useCallback,
      useMemo,
      motion,
      LucideIcons,
      confetti,
      gsap,
      styled
    );

    if (typeof Component === "function") {
      return Component as React.ComponentType;
    }
    return null;
  } catch (err) {
    console.warn("Dynamic component compilation warning:", err);
    return null;
  }
}

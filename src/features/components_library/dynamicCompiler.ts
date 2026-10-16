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
    // 1. Clean code: remove imports and strip TS interfaces/types that might conflict
    let processed = code
      .replace(/import\s+[\s\S]*?from\s+['"][^'"]+['"];?/g, "")
      .replace(/interface\s+[a-zA-Z0-9_$]+(\s*<[^>]*>)?\s*\{[\s\S]*?\}/g, "")
      .replace(/type\s+[a-zA-Z0-9_$]+(\s*<[^>]*>)?\s*=\s*[^;]+;/g, "");

    // Extract potential exported component names
    let exportName = "Component";
    const exportDefaultMatch = processed.match(/export\s+default\s+(?:function\s+([a-zA-Z0-9_$]+)|([a-zA-Z0-9_$]+))/);
    const exportNamedMatch = processed.match(/export\s+(?:function\s+([a-zA-Z0-9_$]+)|const\s+([a-zA-Z0-9_$]+))/);

    if (exportDefaultMatch) {
      exportName = exportDefaultMatch[1] || exportDefaultMatch[2] || "Component";
    } else if (exportNamedMatch) {
      exportName = exportNamedMatch[1] || exportNamedMatch[2] || "Component";
    }

    // Extract function names declared in code for fallback detection
    const declaredFuncs: string[] = [];
    const funcMatches = processed.matchAll(/function\s+([a-zA-Z0-9_$]+)/g);
    for (const match of funcMatches) {
      if (match[1]) declaredFuncs.push(match[1]);
    }
    const constMatches = processed.matchAll(/const\s+([a-zA-Z0-9_$]+)\s*=\s*(?:React\.)?(?:memo\()?\s*(?:\([^)]*\)|[a-zA-Z0-9_$]+)\s*=>/g);
    for (const match of constMatches) {
      if (match[1]) declaredFuncs.push(match[1]);
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

    // 3. Scan code for referenced Lucide icons to destructure only what is used
    const usedIcons = Object.keys(LucideIcons).filter(iconName => 
      code.includes(iconName)
    );
    const iconsDestructure = usedIcons.length > 0 
      ? `const { ${usedIcons.join(", ")} } = LucideIcons;` 
      : "";

    // 4. Evaluate in secure scope with React hooks, motion, icons, and animation libraries
    const evalBody = `
      "use strict";
      ${iconsDestructure}
      
      let __resolvedComponent = null;
      try {
        ${compiled.code}
        
        if (typeof ${exportName} !== "undefined" && typeof ${exportName} === "function") {
          __resolvedComponent = ${exportName};
        } else if (typeof __defaultExport !== "undefined") {
          __resolvedComponent = typeof __defaultExport === "function" ? __defaultExport : (() => __defaultExport);
        } else {
          // Check declared functions in reverse order (newest first)
          const candidates = ${JSON.stringify(declaredFuncs)};
          for (let i = candidates.length - 1; i >= 0; i--) {
            const name = candidates[i];
            if (typeof eval(name) === "function") {
              __resolvedComponent = eval(name);
              break;
            }
          }
        }
      } catch (evalErr) {
        console.error("Runtime evaluation inner error:", evalErr);
      }

      return __resolvedComponent;
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
  } catch (err: any) {
    console.error("Dynamic component compilation error in component:", componentName, err?.message || err);
    return null;
  }
}

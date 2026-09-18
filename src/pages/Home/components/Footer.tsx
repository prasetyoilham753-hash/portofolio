import React from "react";
import { Link } from "react-router-dom";
import { SiteProfile } from "../../../features/profile/types";

interface FooterProps {
  profile: SiteProfile | null;
}

export function Footer({ profile }: FooterProps) {
  return (
    <footer className="w-full border-t border-border-subtle bg-bg-primary mt-8">
      <div className="max-w-[430px] md:max-w-7xl mx-auto px-5 py-8 flex flex-col items-center gap-6">
        <span className="font-display font-bold text-2xl text-text-primary tracking-tight">BP</span>
        
        <div className="flex items-center gap-6 text-sm text-text-secondary font-medium">
          <a href={profile?.socialLinks?.github || "#"} className="hover:text-white transition-colors" target="_blank" rel="noreferrer">GitHub</a>
          <a href={profile?.socialLinks?.linkedin || "#"} className="hover:text-white transition-colors" target="_blank" rel="noreferrer">LinkedIn</a>
          <a href={`mailto:${profile?.socialLinks?.email || ""}`} className="hover:text-white transition-colors">Email</a>
        </div>
        
        <p className="text-xs text-text-muted">
          &copy; {new Date().getFullYear()} Bintang Prasetyo. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

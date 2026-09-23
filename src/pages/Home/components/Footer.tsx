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
        
        <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-text-secondary font-medium">
          <a href={profile?.socialLinks?.instagram || "https://instagram.com/bprasety_"} className="hover:text-white transition-colors" target="_blank" rel="noreferrer">Instagram</a>
          <a href={profile?.socialLinks?.x || profile?.socialLinks?.twitter || "https://x.com/bprasety_"} className="hover:text-white transition-colors" target="_blank" rel="noreferrer">X</a>
          <a href={profile?.socialLinks?.reddit || "https://reddit.com/user/bprasety_"} className="hover:text-white transition-colors" target="_blank" rel="noreferrer">Reddit</a>
          <a href={profile?.socialLinks?.linkedin || "https://linkedin.com/in/bintang-prasetyo"} className="hover:text-white transition-colors" target="_blank" rel="noreferrer">LinkedIn</a>
          <a href={`mailto:${profile?.socialLinks?.email || "contact@bprasety.com"}`} className="hover:text-white transition-colors">Email</a>
        </div>
        
        <p className="text-xs text-text-muted">
          &copy; {new Date().getFullYear()} Bintang Prasetyo. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

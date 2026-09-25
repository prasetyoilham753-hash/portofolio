import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import { SiteProfile, WhatIDoActionItem } from "../../../features/profile/types";

interface AboutProps {
  profile: SiteProfile | null;
}

export function About({ profile }: AboutProps) {
  const label = profile?.aboutLabel === "About Me" || !profile?.aboutLabel ? "What I Do" : profile.aboutLabel;
  const heading = profile?.aboutHeading || "Turning Ideas\nInto Real Products";

  // Build list of action items with their sub-columns
  let actionItems: WhatIDoActionItem[] = [];

  if (profile?.aboutActions && profile.aboutActions.length > 0) {
    actionItems = profile.aboutActions.filter(a => a.visible !== false);
  } else if (profile?.whatIDoCategories && profile.whatIDoCategories.length > 0) {
    actionItems = profile.whatIDoCategories
      .filter(c => c.visible !== false)
      .sort((a, b) => a.order - b.order)
      .map(c => {
        const cols = c.divs && c.divs.length > 0
          ? c.divs.map(d => d.name)
          : (c.subtitles || []);
        return {
          id: c.id,
          buttonText: c.title,
          buttonUrl: "/about",
          columns: cols,
          visible: true
        };
      });
  } else {
    // Default fallback
    actionItems = [
      {
        id: "action-1",
        buttonText: "Web & Development",
        buttonUrl: "/about",
        columns: ["React", "Next.js", "Firebase", "Tailwind CSS", "TypeScript"],
        visible: true
      },
      {
        id: "action-2",
        buttonText: "Art & Illustration",
        buttonUrl: "/gallery",
        columns: ["Digital Art", "Character Design", "Concept Art", "Illustration", "Spatial 3D"],
        visible: true
      }
    ];
  }

  return (
    <section 
      id="about-section" 
      className="w-full max-w-[620px] xs:max-w-[680px] sm:max-w-[840px] md:max-w-[1320px] lg:max-w-[1480px] xl:max-w-[1600px] 2xl:max-w-[1680px] mx-auto px-0 sm:px-1 md:px-2 lg:px-4 pt-1 sm:pt-2 pb-8 sm:pb-12 md:pb-16"
    >
      {/* Animated Card: Bottom-to-Top Entry Animation */}
      <motion.div 
        id="about-card"
        initial={{ opacity: 0, y: 45 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        className="w-full bg-[rgba(6,15,35,0.45)] border border-[rgba(120,170,255,0.18)] rounded-[24px] sm:rounded-[32px] md:rounded-[40px] p-6 sm:p-8 md:p-10 lg:p-12 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.25)] hover:border-[rgba(140,190,255,0.35)] transition-all duration-300 relative overflow-hidden group"
      >
        <div className="flex flex-col lg:flex-row lg:gap-12 xl:gap-16 relative z-10 items-start justify-between">
          
          {/* Left Column - Heading & Label */}
          <div className="flex flex-col lg:w-[320px] xl:w-[360px] shrink-0 w-full mb-8 lg:mb-0">
            <div className="inline-flex items-center gap-2 mb-2 sm:mb-3">
              <span className="w-2 h-2 rounded-full bg-[#7DB3FF] animate-pulse" />
              <h2 className="text-[13px] sm:text-[14px] font-display font-medium tracking-wider text-[#7DB3FF] uppercase">
                {label}
              </h2>
            </div>
            
            <h3 className="text-[24px] xs:text-[26px] sm:text-[30px] md:text-[34px] lg:text-[36px] font-bold leading-[1.18] text-[#F7FAFF] tracking-[-0.015em] whitespace-pre-line">
              {heading.replace(/\\n/g, '\n')}
            </h3>
          </div>

          {/* Right Column - Liquid Glass Action Cards */}
          <div className="flex-1 w-full flex flex-col gap-5 sm:gap-6">
            {actionItems.map((item, idx) => {
              const url = item.buttonUrl || "/about";
              const isExternal = url.startsWith("http://") || url.startsWith("https://");
              const cols = item.columns || [];

              return (
                <div 
                  key={item.id || idx}
                  className="liquid-glass-action-card w-full rounded-[22px] sm:rounded-[26px] p-4 sm:p-5 md:p-6 flex flex-col gap-3.5"
                >
                  {/* Liquid Glass Action Pill (Consistent with theme) */}
                  {isExternal ? (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="liquid-glass-action-btn group/btn"
                    >
                      <span className="text-[#F7FAFF] font-semibold text-[15px] sm:text-[16px] tracking-wide group-hover/btn:text-white transition-colors">
                        {item.buttonText}
                      </span>
                      <span className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[rgba(120,170,255,0.15)] border border-[rgba(120,170,255,0.30)] text-[#7DB3FF] group-hover/btn:bg-[#3B82F6] group-hover/btn:text-white group-hover/btn:border-[#60A5FA] group-hover/btn:translate-x-1 group-hover/btn:translate-y-[-1px] transition-all duration-300 shadow-[0_0_8px_rgba(120,170,255,0.15)]">
                        <ArrowUpRight size={16} strokeWidth={2.2} />
                      </span>
                    </a>
                  ) : (
                    <Link
                      to={url}
                      className="liquid-glass-action-btn group/btn"
                    >
                      <span className="text-[#F7FAFF] font-semibold text-[15px] sm:text-[16px] tracking-wide group-hover/btn:text-white transition-colors">
                        {item.buttonText}
                      </span>
                      <span className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[rgba(120,170,255,0.15)] border border-[rgba(120,170,255,0.30)] text-[#7DB3FF] group-hover/btn:bg-[#3B82F6] group-hover/btn:text-white group-hover/btn:border-[#60A5FA] group-hover/btn:translate-x-1 group-hover/btn:translate-y-[-1px] transition-all duration-300 shadow-[0_0_8px_rgba(120,170,255,0.15)]">
                        <ArrowUpRight size={16} strokeWidth={2.2} />
                      </span>
                    </Link>
                  )}

                  {/* Liquid Glass Sub Tags / Columns */}
                  {cols.length > 0 && (
                    <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-2.5 pt-1">
                      {cols.map((colText, cIdx) => (
                        <div 
                          key={cIdx}
                          className="liquid-glass-sub-tag cursor-default"
                        >
                          <span className="text-[#E2EEFC] font-medium text-[12px] sm:text-[13px] leading-snug">
                            {colText}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </motion.div>
    </section>
  );
}

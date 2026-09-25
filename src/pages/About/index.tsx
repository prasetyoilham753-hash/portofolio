import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Code2, 
  Palette, 
  Sparkles, 
  Award, 
  ArrowRight, 
  Clock, 
  Layers, 
  CheckCircle2, 
  Download,
  ExternalLink
} from "lucide-react";
import { getProfile } from "../../features/profile/api";
import { 
  SiteProfile, 
  AboutDiscipline, 
  AboutTimelineItem, 
  AboutStatItem 
} from "../../features/profile/types";
import { CvAccessModal } from "../../components/common/CvAccessModal";

const FALLBACK_DISCIPLINES: AboutDiscipline[] = [
  {
    id: "disc-1",
    title: "Software Engineering",
    subtitle: "Frontend Architecture & Systems",
    description: "Architecting high-performance web applications with React, TypeScript, Next.js, and fluid state machines. Prioritizing 60fps animations, rock-solid security, and clean modular codebases.",
    tags: ["React", "TypeScript", "Next.js", "Tailwind CSS", "Firebase", "Web Architecture"]
  },
  {
    id: "disc-2",
    title: "Digital Illustration & Art",
    subtitle: "Concept Art & Visual Aesthetics",
    description: "Creating emotive character illustrations, digital environments, and spatial graphics that blend storytelling with rigorous technical precision.",
    tags: ["Digital Painting", "Character Design", "Concept Art", "Visual DNA", "Color Theory"]
  },
  {
    id: "disc-3",
    title: "Creative Technology",
    subtitle: "Spatial 3D & Interactive Shaders",
    description: "Crafting fluid spatial web environments with WebGL, Three.js, and glassmorphic depth hierarchies inspired by Apple VisionOS design standards.",
    tags: ["WebGL", "Three.js", "GLSL Shaders", "Spatial UI", "Motion Design"]
  }
];

const FALLBACK_TIMELINE: AboutTimelineItem[] = [
  {
    id: "time-1",
    year: "2024 — Present",
    role: "Senior Creative Technologist & Consultant",
    company: "Autonomous Studio",
    description: "Leading frontend engineering, WebGL visual integrations, and product architecture for digital products."
  },
  {
    id: "time-2",
    year: "2022 — 2024",
    role: "Lead Frontend Engineer",
    company: "Digital Innovations Lab",
    description: "Engineered high-scale web platforms, design systems, and responsive multi-platform user interfaces."
  },
  {
    id: "time-3",
    year: "2020 — 2022",
    role: "Software Developer & Digital Illustrator",
    company: "Creative Media Works",
    description: "Crafted interactive digital campaigns, brand identities, and visual assets."
  }
];

const FALLBACK_STATS: AboutStatItem[] = [
  { label: "Years of Experience", value: "5+" },
  { label: "Projects Delivered", value: "30+" },
  { label: "Artworks Created", value: "100+" },
  { label: "Certifications", value: "10+" }
];

export default function About() {
  const [profile, setProfile] = useState<SiteProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCvModalOpen, setIsCvModalOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getProfile();
        if (data) setProfile(data);
      } catch (err) {
        console.error("Error loading About profile:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const title = profile?.aboutPageTitle || "About Me";
  const subtitle = profile?.aboutPageSubtitle || 
    "I am a Creative Technologist and Illustrator bridging the gap between rigorous engineering and refined visual aesthetics.";
  const story = profile?.aboutPageStory || 
    "My philosophy centers on creating digital products that feel 'expensive because they are refined, not because they have many effects.' Every line of code and every stroke of illustration serves a deliberate purpose.\n\nFrom high-performance React architectures to immersive WebGL fluid shaders and expressive digital art, I treat interactive design as a singular craft where technology and emotion coalesce.";

  const disciplines = profile?.aboutDisciplines && profile.aboutDisciplines.length > 0
    ? profile.aboutDisciplines
    : FALLBACK_DISCIPLINES;

  const timeline = profile?.aboutTimeline && profile.aboutTimeline.length > 0
    ? profile.aboutTimeline
    : FALLBACK_TIMELINE;

  const stats = profile?.aboutStats && profile.aboutStats.length > 0
    ? profile.aboutStats
    : FALLBACK_STATS;

  return (
    <div className="flex flex-col gap-12 sm:gap-16 pb-28">
      {/* 1. Header Section */}
      <header className="max-w-3xl flex flex-col gap-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-medium text-white tracking-tight leading-[1.12]">
          {title}
        </h1>
        <p className="text-[#A8B8CC] text-base sm:text-lg font-light leading-relaxed max-w-2xl">
          {subtitle}
        </p>
      </header>

      {/* 2. Key Metrics Bar */}
      {stats.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((item, idx) => (
            <div
              key={idx}
              className="glass-card p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/10 bg-[rgba(6,15,35,0.45)] backdrop-blur-md flex flex-col gap-1 hover:border-[#7DB3FF]/40 transition-all"
            >
              <span className="text-2xl sm:text-3xl font-bold font-display text-white tracking-tight">
                {item.value}
              </span>
              <span className="text-xs sm:text-sm text-text-secondary font-light">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 3. Story & Philosophy Card */}
      <section className="glass-card p-6 sm:p-10 md:p-12 rounded-[28px] sm:rounded-[36px] border border-[rgba(120,170,255,0.18)] bg-[rgba(6,15,35,0.45)] backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.25)] flex flex-col gap-6">
        <div className="inline-flex items-center gap-2 text-[#7DB3FF]">
          <Sparkles size={18} />
          <h2 className="text-sm font-display font-semibold uppercase tracking-wider">
            Philosophy & Approach
          </h2>
        </div>

        <div className="text-base sm:text-lg text-[#E2EEFC]/90 font-light leading-relaxed space-y-4 whitespace-pre-line max-w-4xl">
          {story}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3.5 pt-4 border-t border-white/10">
          <Link
            to="/projects"
            className="ios-glass-btn ios-glass-primary px-6 py-2.5 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg"
          >
            <span>Explore Projects</span>
            <ArrowRight size={14} />
          </Link>

          <Link
            to="/certificates"
            className="ios-glass-btn px-6 py-2.5 text-xs font-semibold text-[#7DB3FF] border-[#7DB3FF]/30 flex items-center gap-2 cursor-pointer"
          >
            <Award size={15} />
            <span>View Certificates</span>
          </Link>

          {profile?.cvUrl && (
            <button
              type="button"
              onClick={() => setIsCvModalOpen(true)}
              className="ios-glass-btn px-5 py-2.5 text-xs font-medium text-white/80 hover:text-white flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Download size={14} />
              <span>Download CV</span>
            </button>
          )}
        </div>

        {/* Modal Kode Akses CV */}
        <CvAccessModal
          isOpen={isCvModalOpen}
          onClose={() => setIsCvModalOpen(false)}
          cvUrl={profile?.cvUrl}
          correctCode={profile?.cvAccessCode || "19112191"}
          candidateName={profile?.name || "Bintang Prasetyo"}
        />
      </section>

      {/* 4. Core Disciplines */}
      <section className="flex flex-col gap-6 sm:gap-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl sm:text-3xl font-display font-medium text-white">
            Core Disciplines
          </h2>
          <p className="text-text-secondary text-sm sm:text-base font-light">
            Areas of technical mastery, creative practice, and design execution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7">
          {disciplines.map((disc, idx) => (
            <div
              key={disc.id || idx}
              className="glass-card p-6 sm:p-8 rounded-3xl border border-[rgba(120,170,255,0.18)] bg-[rgba(6,15,35,0.45)] backdrop-blur-md flex flex-col justify-between gap-6 hover:border-[rgba(140,190,255,0.45)] transition-all duration-300 group hover:-translate-y-1"
            >
              <div className="flex flex-col gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#7DB3FF]/15 border border-[#7DB3FF]/30 flex items-center justify-center text-[#7DB3FF] shadow-sm">
                  {idx === 0 ? <Code2 size={20} /> : idx === 1 ? <Palette size={20} /> : <Layers size={20} />}
                </div>

                <div className="flex flex-col gap-1">
                  <h3 className="text-xl font-bold text-white group-hover:text-[#7DB3FF] transition-colors">
                    {disc.title}
                  </h3>
                  {disc.subtitle && (
                    <span className="text-xs text-[#7DB3FF] font-medium">
                      {disc.subtitle}
                    </span>
                  )}
                </div>

                <p className="text-sm text-text-secondary font-light leading-relaxed">
                  {disc.description}
                </p>
              </div>

              {/* Tags */}
              {disc.tags && disc.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-3 border-t border-white/5">
                  {disc.tags.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-2.5 py-1 rounded-lg text-xs bg-white/[0.04] border border-white/10 text-[#E2EEFC]/80"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 5. Experience Timeline */}
      {timeline.length > 0 && (
        <section className="flex flex-col gap-6 sm:gap-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl sm:text-3xl font-display font-medium text-white flex items-center gap-2.5">
              <Clock className="text-[#7DB3FF]" size={24} />
              <span>Career & Milestones</span>
            </h2>
            <p className="text-text-secondary text-sm sm:text-base font-light">
              Chronological journey across engineering leadership, independent consulting, and creative production.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:gap-5">
            {timeline.map((item, idx) => (
              <div
                key={item.id || idx}
                className="glass-card p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-white/10 bg-[rgba(6,15,35,0.45)] backdrop-blur-md flex flex-col md:flex-row md:items-start justify-between gap-4 hover:border-white/25 transition-all"
              >
                <div className="md:w-1/4 shrink-0">
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-medium bg-[#7DB3FF]/15 border border-[#7DB3FF]/30 text-[#7DB3FF]">
                    {item.year}
                  </span>
                </div>

                <div className="flex-1 flex flex-col gap-1.5">
                  <h3 className="text-lg font-semibold text-white">
                    {item.role}
                  </h3>
                  <span className="text-sm text-[#7DB3FF] font-medium">
                    {item.company}
                  </span>
                  {item.description && (
                    <p className="text-sm text-text-secondary font-light leading-relaxed pt-1">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Award, 
  ArrowRight, 
  Download
} from "lucide-react";
import { getProfile } from "../../features/profile/api";
import { 
  SiteProfile, 
  AboutStatItem 
} from "../../features/profile/types";
import { CvAccessModal } from "../../components/common/CvAccessModal";

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
          <h2 className="text-sm font-display font-semibold uppercase tracking-wider">
            Philosophy & Biography
          </h2>
        </div>

        <div className="text-base sm:text-lg text-[#E2EEFC]/90 font-light leading-relaxed space-y-4 whitespace-pre-line max-w-4xl">
          {story}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/10">
          <Link
            to="/projects"
            className="flex-1 sm:flex-initial justify-center px-5 py-2.5 rounded-xl text-xs font-medium bg-[#205BF0] hover:bg-[#1A4ED4] text-white transition-all duration-200 flex items-center gap-1.5 shadow-sm whitespace-nowrap"
          >
            <span>Explore Projects</span>
            <ArrowRight size={13} />
          </Link>

          <Link
            to="/certificates"
            className="flex-1 sm:flex-initial justify-center px-5 py-2.5 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/10 text-white/90 border border-white/10 transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap"
          >
            <Award size={14} className="text-[#7DB3FF]" />
            <span>View Certificates</span>
          </Link>

          {profile?.cvUrl && (
            <button
              type="button"
              onClick={() => setIsCvModalOpen(true)}
              className="flex-1 sm:flex-initial justify-center px-5 py-2.5 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/10 text-white/90 border border-white/10 transition-all duration-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Download size={14} className="text-emerald-400" />
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
    </div>
  );
}

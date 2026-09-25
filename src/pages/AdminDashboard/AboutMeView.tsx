import React, { useState, useEffect } from "react";
import { 
  User, 
  Sparkles, 
  Save, 
  Check, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Layers, 
  Clock, 
  FileText,
  HelpCircle,
  ExternalLink
} from "lucide-react";
import { getProfile, updateProfile } from "../../features/profile/api";
import { 
  SiteProfile, 
  AboutDiscipline, 
  AboutTimelineItem, 
  AboutStatItem 
} from "../../features/profile/types";

const DEFAULT_DISCIPLINES: AboutDiscipline[] = [
  {
    id: "disc-1",
    title: "Software Engineering",
    subtitle: "Frontend Architecture & Systems",
    description: "Architecting high-performance web applications with React, TypeScript, Next.js, and fluid state machines. Prioritizing 60fps animations and modular codebases.",
    tags: ["React", "TypeScript", "Next.js", "Tailwind CSS", "Firebase", "Web Architecture"]
  },
  {
    id: "disc-2",
    title: "Digital Illustration & Art",
    subtitle: "Concept Art & Visual Aesthetics",
    description: "Creating emotive character illustrations, digital environments, and spatial graphics that blend storytelling with technical precision.",
    tags: ["Digital Painting", "Character Design", "Concept Art", "Visual DNA", "Color Theory"]
  },
  {
    id: "disc-3",
    title: "Creative Technology",
    subtitle: "Spatial 3D & Interactive Shaders",
    description: "Crafting fluid spatial web environments with WebGL, Three.js, and glassmorphic depth hierarchies inspired by Apple VisionOS standards.",
    tags: ["WebGL", "Three.js", "GLSL Shaders", "Spatial UI", "Motion Design"]
  }
];

const DEFAULT_TIMELINE: AboutTimelineItem[] = [
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

const DEFAULT_STATS: AboutStatItem[] = [
  { label: "Years of Experience", value: "5+" },
  { label: "Projects Delivered", value: "30+" },
  { label: "Artworks Created", value: "100+" },
  { label: "Certifications", value: "10+" }
];

export function AboutMeView() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form State
  const [pageTitle, setPageTitle] = useState("About Me");
  const [pageSubtitle, setPageSubtitle] = useState(
    "I am a Creative Technologist and Illustrator bridging the gap between rigorous engineering and refined visual aesthetics."
  );
  const [pageStory, setPageStory] = useState(
    "My philosophy centers on creating digital products that feel 'expensive because they are refined, not because they have many effects.' Every line of code and every stroke of illustration serves a deliberate purpose.\n\nFrom high-performance React architectures to immersive WebGL fluid shaders and expressive digital art, I treat interactive design as a singular craft where technology and emotion coalesce."
  );

  const [disciplines, setDisciplines] = useState<AboutDiscipline[]>(DEFAULT_DISCIPLINES);
  const [timeline, setTimeline] = useState<AboutTimelineItem[]>(DEFAULT_TIMELINE);
  const [stats, setStats] = useState<AboutStatItem[]>(DEFAULT_STATS);

  useEffect(() => {
    async function loadData() {
      try {
        const profile = await getProfile();
        if (profile) {
          if (profile.aboutPageTitle) setPageTitle(profile.aboutPageTitle);
          if (profile.aboutPageSubtitle) setPageSubtitle(profile.aboutPageSubtitle);
          if (profile.aboutPageStory) setPageStory(profile.aboutPageStory);
          if (profile.aboutDisciplines && profile.aboutDisciplines.length > 0) {
            setDisciplines(profile.aboutDisciplines);
          }
          if (profile.aboutTimeline && profile.aboutTimeline.length > 0) {
            setTimeline(profile.aboutTimeline);
          }
          if (profile.aboutStats && profile.aboutStats.length > 0) {
            setStats(profile.aboutStats);
          }
        }
      } catch (err) {
        console.error("Error loading About data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      await updateProfile({
        aboutPageTitle: pageTitle,
        aboutPageSubtitle: pageSubtitle,
        aboutPageStory: pageStory,
        aboutDisciplines: disciplines,
        aboutTimeline: timeline,
        aboutStats: stats
      });
      setFeedback({ type: "success", message: "Konten About Me berhasil diperbarui secara realtime!" });
    } catch (err: any) {
      console.error("Failed to save About Me:", err);
      setFeedback({ type: "error", message: err.message || "Gagal menyimpan perubahan About Me." });
    } finally {
      setSaving(false);
    }
  };

  // Discipline helpers
  const handleAddDiscipline = () => {
    const newDisc: AboutDiscipline = {
      id: `disc-${Date.now()}`,
      title: "New Discipline / Focus",
      subtitle: "Focus Area",
      description: "Describe the scope and technical execution...",
      tags: ["Skill 1", "Skill 2"]
    };
    setDisciplines([...disciplines, newDisc]);
  };

  const handleUpdateDiscipline = (index: number, field: keyof AboutDiscipline, val: any) => {
    const updated = [...disciplines];
    updated[index] = { ...updated[index], [field]: val };
    setDisciplines(updated);
  };

  const handleDeleteDiscipline = (index: number) => {
    setDisciplines(disciplines.filter((_, i) => i !== index));
  };

  // Timeline helpers
  const handleAddTimeline = () => {
    const newItem: AboutTimelineItem = {
      id: `time-${Date.now()}`,
      year: "2024 — Present",
      role: "Position / Role",
      company: "Company or Client",
      description: "Brief summary of achievements and responsibilities."
    };
    setTimeline([...timeline, newItem]);
  };

  const handleUpdateTimeline = (index: number, field: keyof AboutTimelineItem, val: string) => {
    const updated = [...timeline];
    updated[index] = { ...updated[index], [field]: val };
    setTimeline(updated);
  };

  const handleDeleteTimeline = (index: number) => {
    setTimeline(timeline.filter((_, i) => i !== index));
  };

  // Stats helpers
  const handleUpdateStat = (index: number, field: "label" | "value", val: string) => {
    const updated = [...stats];
    updated[index] = { ...updated[index], [field]: val };
    setStats(updated);
  };

  const handleAddStat = () => {
    setStats([...stats, { label: "New Metric", value: "100%" }]);
  };

  const handleDeleteStat = (index: number) => {
    setStats(stats.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-[#7DB3FF]/30 border-t-[#7DB3FF] animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSaveAll} className="flex flex-col gap-10">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-medium text-white flex items-center gap-2.5">
            <User className="text-[#7DB3FF]" size={24} />
            <span>Manajemen Halaman About Me</span>
          </h2>
          <p className="text-text-secondary text-sm font-light">
            Kelola narasi biografi, pilar keahlian teknis & seni, serta linimasa karir.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="ios-glass-btn ios-glass-primary px-6 py-2.5 text-xs font-semibold uppercase tracking-wider cursor-pointer flex items-center gap-2 shadow-lg"
        >
          <Save size={16} />
          <span>{saving ? "Menyimpan..." : "Simpan Perubahan"}</span>
        </button>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div 
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-sm ${
            feedback.type === "success" 
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? <Check size={16} /> : <AlertCircle size={16} />}
            <span>{feedback.message}</span>
          </div>
          <button 
            type="button"
            onClick={() => setFeedback(null)} 
            className="text-white/60 hover:text-white text-xs cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* SECTION 1: HEADER & NARRATIVE STORY */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 bg-[rgba(6,15,35,0.45)] flex flex-col gap-6">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <FileText className="text-[#7DB3FF]" size={18} />
          <h3 className="text-lg font-medium text-white">Header & Biografi Utama</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-secondary">Judul Halaman (Hero Title)</label>
            <input
              type="text"
              value={pageTitle}
              onChange={(e) => setPageTitle(e.target.value)}
              className="w-full bg-[rgba(6,15,35,0.6)] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#7DB3FF]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-secondary">Ringkasan Singkat (Hero Subtitle)</label>
            <input
              type="text"
              value={pageSubtitle}
              onChange={(e) => setPageSubtitle(e.target.value)}
              className="w-full bg-[rgba(6,15,35,0.6)] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#7DB3FF]"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-text-secondary">
            Narasi Filosofi & Kisah Perjalanan (Story / Long Narrative)
          </label>
          <textarea
            rows={5}
            value={pageStory}
            onChange={(e) => setPageStory(e.target.value)}
            className="w-full bg-[rgba(6,15,35,0.6)] border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#7DB3FF] resize-y leading-relaxed font-light"
            placeholder="Tuliskan filosofi desain, pendekatan teknis, atau cerita Anda..."
          />
        </div>
      </div>

      {/* SECTION 2: STATS HIGHLIGHTS */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 bg-[rgba(6,15,35,0.45)] flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="text-[#7DB3FF]" size={18} />
            <h3 className="text-lg font-medium text-white">Metrik & Statistik Kunci</h3>
          </div>
          <button
            type="button"
            onClick={handleAddStat}
            className="ios-glass-btn px-3 py-1.5 text-xs text-[#7DB3FF] border-[#7DB3FF]/30 cursor-pointer flex items-center gap-1"
          >
            <Plus size={14} />
            <span>Tambah Metrik</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((st, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col gap-2 relative group">
              <input
                type="text"
                value={st.value}
                onChange={(e) => handleUpdateStat(idx, "value", e.target.value)}
                className="text-2xl font-bold text-white bg-transparent border-b border-transparent focus:border-[#7DB3FF] focus:outline-none w-full"
                placeholder="5+"
              />
              <input
                type="text"
                value={st.label}
                onChange={(e) => handleUpdateStat(idx, "label", e.target.value)}
                className="text-xs text-text-secondary bg-transparent border-b border-transparent focus:border-[#7DB3FF] focus:outline-none w-full"
                placeholder="Label"
              />
              <button
                type="button"
                onClick={() => handleDeleteStat(idx)}
                className="absolute top-2 right-2 p-1 text-rose-400 opacity-0 group-hover:opacity-100 hover:bg-rose-500/20 rounded-md transition-all cursor-pointer"
                title="Hapus"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: CORE DISCIPLINES & FOCUS AREAS */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 bg-[rgba(6,15,35,0.45)] flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="text-[#7DB3FF]" size={18} />
            <h3 className="text-lg font-medium text-white">Pilar Keahlian & Disiplin (Core Disciplines)</h3>
          </div>
          <button
            type="button"
            onClick={handleAddDiscipline}
            className="ios-glass-btn px-3.5 py-1.5 text-xs text-[#7DB3FF] border-[#7DB3FF]/30 cursor-pointer flex items-center gap-1.5"
          >
            <Plus size={14} />
            <span>Tambah Pilar</span>
          </button>
        </div>

        <div className="flex flex-col gap-5">
          {disciplines.map((disc, idx) => (
            <div 
              key={disc.id || idx}
              className="p-5 sm:p-6 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col gap-4 relative group"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-[#7DB3FF]/15 border border-[#7DB3FF]/30 text-[#7DB3FF]">
                  Pilar #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleDeleteDiscipline(idx)}
                  className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 cursor-pointer transition-colors"
                  title="Hapus Pilar"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-text-secondary">Nama Pilar / Keahlian</label>
                  <input
                    type="text"
                    value={disc.title}
                    onChange={(e) => handleUpdateDiscipline(idx, "title", e.target.value)}
                    className="w-full bg-[rgba(6,15,35,0.6)] border border-white/15 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#7DB3FF]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-text-secondary">Subjudul / Sub-spesialisasi</label>
                  <input
                    type="text"
                    value={disc.subtitle || ""}
                    onChange={(e) => handleUpdateDiscipline(idx, "subtitle", e.target.value)}
                    className="w-full bg-[rgba(6,15,35,0.6)] border border-white/15 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#7DB3FF]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-text-secondary">Deskripsi Pendek</label>
                <textarea
                  rows={2}
                  value={disc.description}
                  onChange={(e) => handleUpdateDiscipline(idx, "description", e.target.value)}
                  className="w-full bg-[rgba(6,15,35,0.6)] border border-white/15 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#7DB3FF] resize-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-text-secondary">Tags / Keterampilan Kunci (Pisahkan dengan koma)</label>
                <input
                  type="text"
                  value={disc.tags ? disc.tags.join(", ") : ""}
                  onChange={(e) => {
                    const tags = e.target.value.split(",").map(t => t.trim()).filter(Boolean);
                    handleUpdateDiscipline(idx, "tags", tags);
                  }}
                  placeholder="React, TypeScript, Three.js, Concept Art..."
                  className="w-full bg-[rgba(6,15,35,0.6)] border border-white/15 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#7DB3FF]"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 4: CAREER & MILESTONES TIMELINE */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 bg-[rgba(6,15,35,0.45)] flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="text-[#7DB3FF]" size={18} />
            <h3 className="text-lg font-medium text-white">Linimasa Pengalaman & Jejak Karir</h3>
          </div>
          <button
            type="button"
            onClick={handleAddTimeline}
            className="ios-glass-btn px-3.5 py-1.5 text-xs text-[#7DB3FF] border-[#7DB3FF]/30 cursor-pointer flex items-center gap-1.5"
          >
            <Plus size={14} />
            <span>Tambah Riwayat</span>
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {timeline.map((item, idx) => (
            <div 
              key={item.id || idx}
              className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col gap-3 relative group"
            >
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={item.year}
                  onChange={(e) => handleUpdateTimeline(idx, "year", e.target.value)}
                  className="font-mono text-xs text-[#7DB3FF] bg-transparent border-b border-transparent focus:border-[#7DB3FF] focus:outline-none w-48"
                  placeholder="2024 — Sekarang"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteTimeline(idx)}
                  className="p-1 rounded text-rose-400 hover:bg-rose-500/20 cursor-pointer"
                  title="Hapus Riwayat"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={item.role}
                  onChange={(e) => handleUpdateTimeline(idx, "role", e.target.value)}
                  placeholder="Jabatan / Peran (Contoh: Lead Frontend Engineer)"
                  className="w-full bg-[rgba(6,15,35,0.6)] border border-white/15 rounded-xl px-4 py-2 text-sm text-white font-medium focus:outline-none focus:border-[#7DB3FF]"
                />
                <input
                  type="text"
                  value={item.company}
                  onChange={(e) => handleUpdateTimeline(idx, "company", e.target.value)}
                  placeholder="Instansi / Perusahaan (Contoh: Autonomous Studio)"
                  className="w-full bg-[rgba(6,15,35,0.6)] border border-white/15 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#7DB3FF]"
                />
              </div>

              <textarea
                rows={2}
                value={item.description || ""}
                onChange={(e) => handleUpdateTimeline(idx, "description", e.target.value)}
                placeholder="Pencapaian utama atau fokus tanggung jawab..."
                className="w-full bg-[rgba(6,15,35,0.6)] border border-white/15 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#7DB3FF] resize-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Save Bar */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t border-white/10">
        <button
          type="submit"
          disabled={saving}
          className="ios-glass-btn ios-glass-primary px-8 py-3 text-sm font-semibold uppercase tracking-wider cursor-pointer flex items-center gap-2 shadow-xl"
        >
          <Save size={18} />
          <span>{saving ? "Menyimpan..." : "Simpan Semua Perubahan About Me"}</span>
        </button>
      </div>
    </form>
  );
}

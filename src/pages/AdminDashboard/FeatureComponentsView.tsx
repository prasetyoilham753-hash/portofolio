import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Copy, 
  Check, 
  Sparkles, 
  Code2, 
  Layers, 
  Boxes, 
  X, 
  FileCode, 
  Sliders, 
  Info,
  Package,
  Wand2,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  FeatureComponent, 
  FeatureComponentInput, 
  FeaturesHeaderContent,
  COMPONENT_CATEGORIES 
} from "../../features/components_library/types";
import { 
  subscribeToAllComponents, 
  createFeatureComponent, 
  updateFeatureComponent, 
  deleteFeatureComponent, 
  subscribeToFeaturesHeader,
  saveFeaturesHeader
} from "../../features/components_library/api";
import { COMPONENT_TEMPLATES } from "../../features/components_library/templates";
import { DynamicComponentRunner } from "../../components/DynamicComponentRunner/DynamicComponentRunner";
import { DeleteConfirmModal } from "../../components/common/DeleteConfirmModal";

export function FeatureComponentsView() {
  const [components, setComponents] = useState<FeatureComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Header settings state
  const [headerContent, setHeaderContent] = useState<FeaturesHeaderContent>({
    badge: "Interactive UI & Motion Library",
    title: "Feature Components",
    description: "Koleksi komponen antarmuka, animasi mikro, dan eksperimen visual interaktif. Coba langsung di sandbox dan salin kode JSX untuk proyek Anda."
  });
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [isSavingHeader, setIsSavingHeader] = useState(false);
  const [headerSuccess, setHeaderSuccess] = useState(false);

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Delete confirm modal state
  const [componentToDelete, setComponentToDelete] = useState<FeatureComponent | null>(null);
  const [isDeletingComponent, setIsDeletingComponent] = useState(false);

  // Form inputs
  const [formData, setFormData] = useState<FeatureComponentInput>({
    name: "",
    category: "Buttons",
    description: "",
    code: "",
    css: "",
    dependencies: ["lucide-react", "motion"],
    status: "published",
    tags: [],
    order: 0,
  });

  const [depInput, setDepInput] = useState("");
  const [activeEditorTab, setActiveEditorTab] = useState<'jsx' | 'css'>('jsx');

  // Modernize component code to guarantee clean two-way forward & backward interactive motion
  const upgradeComponentCode = (comp: FeatureComponent): FeatureComponent => {
    const isCyberpunk = 
      comp.name.toLowerCase().includes("cyberpunk") || 
      comp.code.includes("Ignite Hyperdrive");
    const hasOldOrBuggyCode = 
      comp.code.includes("setClickCount") || 
      comp.code.includes("pulseGlow") || 
      comp.code.includes("activeGlow") || 
      comp.code.includes("StyledButton") || 
      !comp.code.includes("prev => !prev");

    if (isCyberpunk && hasOldOrBuggyCode) {
      return {
        ...comp,
        code: COMPONENT_TEMPLATES[0].code
      };
    }
    return comp;
  };

  // Real-time subscription to components and header
  useEffect(() => {
    setLoading(true);
    const unsubComponents = subscribeToAllComponents(
      (items) => {
        setComponents(items.map(upgradeComponentCode));
        setLoading(false);
      },
      (err) => {
        console.error("Failed to load components:", err);
        setLoading(false);
      }
    );

    const unsubHeader = subscribeToFeaturesHeader((data) => {
      if (data) {
        setHeaderContent({
          badge: data.badge || "Interactive UI & Motion Library",
          title: data.title || "Feature Components",
          description: data.description || "Koleksi komponen antarmuka, animasi mikro, dan eksperimen visual interaktif. Coba langsung di sandbox dan salin kode JSX untuk proyek Anda."
        });
      }
    });

    return () => {
      unsubComponents();
      unsubHeader();
    };
  }, []);

  const handleSaveHeader = async () => {
    setIsSavingHeader(true);
    setHeaderSuccess(false);
    try {
      await saveFeaturesHeader(headerContent);
      setHeaderSuccess(true);
      setTimeout(() => setHeaderSuccess(false), 3000);
      setIsEditingHeader(false);
    } catch (err) {
      console.error("Failed to save header content:", err);
    } finally {
      setIsSavingHeader(false);
    }
  };

  const handleOpenAddModal = (templateIndex?: number) => {
    setEditingId(null);
    setErrorMessage(null);
    setActiveEditorTab('jsx');

    if (templateIndex !== undefined && COMPONENT_TEMPLATES[templateIndex]) {
      const t = COMPONENT_TEMPLATES[templateIndex];
      setFormData({
        name: t.name,
        category: t.category,
        description: t.description,
        code: t.code,
        css: t.css || "",
        dependencies: [...t.dependencies],
        status: "published",
        tags: [t.category.toLowerCase()],
        order: components.length,
      });
    } else {
      // Default blank with 2-way interactive forward & backward button
      setFormData({
        name: "",
        category: "Buttons",
        description: "Tombol interaktif dengan animasi dua arah yang halus (klik 1 bergerak maju & aktif, klik 2 bergerak mundur kembali ke posisi awal secara berulang).",
        code: `import React, { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function InteractiveButton() {
  const [isActive, setIsActive] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '24px' }}>
      <button 
        type="button"
        onClick={() => setIsActive(prev => !prev)}
        style={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '12px',
          padding: '14px 28px',
          borderRadius: '12px',
          fontFamily: 'inherit',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
          outline: 'none',
          backdropFilter: 'blur(10px)',
          transform: isActive ? 'translateX(24px) scale(1.04)' : 'translateX(0px) scale(1)',
          background: isActive 
            ? 'linear-gradient(135deg, rgba(16, 52, 104, 0.98), rgba(8, 28, 64, 0.98))' 
            : 'linear-gradient(135deg, rgba(8, 24, 48, 0.9), rgba(4, 12, 28, 0.95))',
          border: isActive ? '1px solid #A3CCFF' : '1px solid #7DB3FF',
          color: '#F7FAFF',
          boxShadow: isActive 
            ? '0 0 35px rgba(125, 220, 255, 0.8), inset 0 0 15px rgba(125, 220, 255, 0.5)' 
            : '0 0 15px rgba(125, 179, 255, 0.4), inset 0 0 10px rgba(125, 179, 255, 0.2)',
          transition: 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease',
        }}
      >
        <span 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: isActive ? 'rotate(15deg) scale(1.15)' : 'rotate(0deg) scale(1)',
            transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
            color: isActive ? '#A3E5FF' : '#7DB3FF',
          }}
        >
          <Sparkles size={16} />
        </span>
        <span>{isActive ? 'Aktif (Klik untuk Mundur)' : 'Interaksi (Klik untuk Maju)'}</span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            transform: isActive ? 'translateX(6px)' : 'translateX(0px)',
            transition: 'transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1)',
            opacity: isActive ? 1 : 0.8,
          }}
        >
          <ArrowRight size={15} />
        </span>
      </button>
      <span style={{ fontSize: '11px', color: '#A8B8CC', opacity: 0.6 }}>
        {isActive ? 'Klik kedua untuk bergerak mundur kembali' : 'Klik pertama untuk interaksi maju'}
      </span>
    </div>
  );
}`,
        css: "",
        dependencies: ["lucide-react"],
        status: "published",
        tags: [],
        order: components.length,
      });
    }
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (comp: FeatureComponent) => {
    const upgraded = upgradeComponentCode(comp);
    setEditingId(upgraded.id);
    setErrorMessage(null);
    setActiveEditorTab('jsx');
    setFormData({
      name: upgraded.name,
      category: upgraded.category,
      description: upgraded.description || "",
      code: upgraded.code,
      css: upgraded.css || "",
      dependencies: upgraded.dependencies || [],
      status: upgraded.status,
      tags: upgraded.tags || [],
      order: upgraded.order || 0,
    });
    setIsModalOpen(true);
  };

  const handleSaveComponent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMessage("Nama komponen wajib diisi.");
      return;
    }
    if (!formData.code.trim()) {
      setErrorMessage("Kode React / JSX komponen wajib diisi.");
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      if (editingId) {
        await updateFeatureComponent(editingId, { ...formData, status: "published" });
      } else {
        await createFeatureComponent({ ...formData, status: "published" });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      console.error("Save component failed:", err);
      setErrorMessage(err.message || "Gagal menyimpan komponen.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (comp: FeatureComponent) => {
    setComponentToDelete(comp);
  };

  const handleConfirmDelete = async () => {
    if (!componentToDelete) return;
    setIsDeletingComponent(true);
    try {
      await deleteFeatureComponent(componentToDelete.id);
      setComponentToDelete(null);
    } catch (err: any) {
      console.error("Gagal menghapus komponen:", err);
      alert("Gagal menghapus komponen: " + (err?.message || "Periksa izin koneksi."));
    } finally {
      setIsDeletingComponent(false);
    }
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddDependency = () => {
    const trimmed = depInput.trim();
    if (trimmed && !formData.dependencies?.includes(trimmed)) {
      setFormData(prev => ({
        ...prev,
        dependencies: [...(prev.dependencies || []), trimmed]
      }));
      setDepInput("");
    }
  };

  const handleRemoveDependency = (dep: string) => {
    setFormData(prev => ({
      ...prev,
      dependencies: prev.dependencies?.filter(d => d !== dep) || []
    }));
  };

  // Filter components
  const filteredComponents = components.filter(comp => {
    const matchesCategory = selectedCategory === "All" || comp.category === selectedCategory;
    const matchesSearch = 
      comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Top action & status banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[rgba(6,15,35,0.45)] border border-white/10 backdrop-blur-md">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#7DB3FF] animate-pulse" />
            <h2 className="text-lg sm:text-xl font-display font-medium text-white tracking-tight">
              Feature Components Library
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-text-secondary font-light">
            Tambahkan dan kelola komponen UI / animasi kustom yang dapat langsung dicoba dan disalin kodenya di <code className="text-[#7DB3FF]">/features</code>.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setIsEditingHeader(!isEditingHeader)}
            className="ios-glass-btn px-3.5 py-2 text-xs sm:text-sm font-medium text-white/90 hover:text-white flex items-center gap-2 cursor-pointer transition-all"
          >
            <Edit3 size={14} className="text-[#7DB3FF]" />
            <span>{isEditingHeader ? "Tutup Edit Header" : "Edit Header Halaman"}</span>
          </button>
          <button
            onClick={() => handleOpenAddModal()}
            className="ios-glass-btn ios-glass-primary px-4 py-2.5 text-xs sm:text-sm font-medium text-white flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(125,179,255,0.3)] hover:shadow-[0_0_26px_rgba(125,179,255,0.45)] transition-all"
          >
            <Plus size={16} />
            <span>+ Add Component</span>
          </button>
        </div>
      </div>

      {/* Page Header Editor Card (h1, p, badge) */}
      <AnimatePresence>
        {isEditingHeader && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden p-5 rounded-2xl bg-[rgba(8,18,38,0.6)] border border-[#7DB3FF]/30 backdrop-blur-md flex flex-col gap-4 shadow-[0_12px_32px_rgba(0,0,0,0.35)]"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#7DB3FF]" />
                <h3 className="text-sm font-semibold text-white font-display">
                  Edit Header Halaman /features (h1 & p)
                </h3>
              </div>
              {headerSuccess && (
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                  <Check size={13} /> Tersimpan ke database!
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono text-text-muted">
                  Badge Tagline (Teks Atas)
                </label>
                <input
                  type="text"
                  value={headerContent.badge || ""}
                  onChange={(e) => setHeaderContent(prev => ({ ...prev, badge: e.target.value }))}
                  placeholder="Contoh: Interactive UI & Motion Library"
                  className="px-3 py-2 text-xs rounded-xl bg-black/30 border border-white/10 focus:border-[#7DB3FF] text-white outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono text-text-muted">
                  Judul Utama (H1)
                </label>
                <input
                  type="text"
                  value={headerContent.title || ""}
                  onChange={(e) => setHeaderContent(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Contoh: Feature Components"
                  className="px-3 py-2 text-xs rounded-xl bg-black/30 border border-white/10 focus:border-[#7DB3FF] text-white outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-[11px] font-mono text-text-muted">
                  Deskripsi / Subtitle (P)
                </label>
                <textarea
                  rows={2}
                  value={headerContent.description || ""}
                  onChange={(e) => setHeaderContent(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Contoh: Koleksi komponen antarmuka, animasi mikro, dan eksperimen visual interaktif..."
                  className="px-3 py-2 text-xs rounded-xl bg-black/30 border border-white/10 focus:border-[#7DB3FF] text-white outline-none resize-none leading-relaxed"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEditingHeader(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs text-white/60 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveHeader}
                disabled={isSavingHeader}
                className="ios-glass-btn ios-glass-primary px-4 py-1.5 text-xs font-semibold text-white flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(125,179,255,0.25)]"
              >
                {isSavingHeader ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Check size={13} />
                    <span>Simpan Perubahan Header</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Starter Template Shortcuts */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-text-muted flex items-center gap-1.5">
            <Wand2 size={13} className="text-[#7DB3FF]" />
            <span>Quick Start Templates</span>
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {COMPONENT_TEMPLATES.map((tmpl, idx) => (
            <button
              key={tmpl.name}
              onClick={() => handleOpenAddModal(idx)}
              className="p-3 rounded-xl bg-[rgba(10,24,46,0.5)] border border-white/10 hover:border-[#7DB3FF]/50 hover:bg-[#7DB3FF]/10 text-left transition-all group cursor-pointer flex flex-col gap-1"
            >
              <span className="text-xs font-semibold text-white group-hover:text-[#7DB3FF] transition-colors truncate">
                {tmpl.name}
              </span>
              <span className="text-[10px] text-text-muted font-mono">
                {tmpl.category}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari komponen..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-[rgba(6,15,35,0.5)] border border-white/10 focus:border-[#7DB3FF] text-white placeholder-white/40 outline-none transition-all"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {["All", ...COMPONENT_CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-transparent text-white border border-white/40 shadow-[0_0_12px_rgba(125,179,255,0.25)] font-semibold"
                  : "bg-transparent text-text-secondary border border-white/10 hover:border-white/20 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Components Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-72 rounded-2xl bg-white/[0.03] border border-white/5 animate-pulse" />
          ))}
        </div>
      ) : filteredComponents.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[rgba(6,15,35,0.3)] border border-white/5 flex flex-col items-center justify-center gap-3">
          <Boxes size={32} className="text-[#7DB3FF]/40" />
          <p className="text-sm text-text-secondary">
            Belum ada komponen di kategori ini.
          </p>
          <button
            onClick={() => handleOpenAddModal()}
            className="ios-glass-btn px-4 py-2 text-xs text-[#7DB3FF] border-[#7DB3FF]/30 hover:border-[#7DB3FF] cursor-pointer"
          >
            Tambah Komponen Sekarang
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredComponents.map((comp) => (
            <div
              key={comp.id}
              className="glass-card rounded-2xl border border-white/10 bg-[rgba(8,18,38,0.6)] backdrop-blur-md overflow-hidden flex flex-col justify-between group hover:border-[#7DB3FF]/40 transition-all shadow-[0_8px_24px_rgba(0,0,0,0.3)]"
            >
              {/* Header Info */}
              <div className="p-4 border-b border-white/5 flex items-start justify-between gap-2">
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-[#7DB3FF]/15 border border-[#7DB3FF]/30 text-[#7DB3FF]">
                      {comp.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Live on /features
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white tracking-tight truncate mt-1">
                    {comp.name}
                  </h3>
                </div>
              </div>

              {/* Live Preview Area */}
              <div className="p-3 bg-black/20">
                <DynamicComponentRunner
                  code={comp.code}
                  css={comp.css}
                  componentName={comp.name}
                  minHeight="min-h-[190px]"
                  showControls={false}
                />
              </div>

              {/* Description & Dependencies */}
              <div className="p-4 flex flex-col gap-3">
                <p className="text-xs text-[#A8B8CC] line-clamp-2 font-light leading-relaxed">
                  {comp.description || "Tidak ada deskripsi."}
                </p>

                {comp.dependencies && comp.dependencies.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Package size={12} className="text-[#7DB3FF] shrink-0" />
                    {comp.dependencies.map(dep => (
                      <span key={dep} className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-white/5 border border-white/10 text-white/70">
                        {dep}
                      </span>
                    ))}
                  </div>
                )}

                {/* Card Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-white/5 gap-2">
                  <button
                    onClick={() => handleCopyCode(comp.code, comp.id)}
                    className="ios-glass-btn px-3 py-1.5 text-xs text-[#7DB3FF] hover:text-white flex items-center gap-1.5 cursor-pointer"
                    title="Salin Kode Komponen"
                  >
                    {copiedId === comp.id ? (
                      <>
                        <Check size={13} className="text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(comp)}
                      className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                      title="Edit Komponen"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(comp)}
                      className="p-1.5 rounded-lg text-rose-400/70 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Hapus Komponen"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add / Edit Component */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card w-full max-w-5xl rounded-3xl border border-[rgba(125,179,255,0.25)] bg-[rgba(8,18,36,0.98)] shadow-[0_25px_70px_rgba(0,0,0,0.8)] flex flex-col max-h-[92vh] overflow-hidden my-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#7DB3FF]/15 border border-[#7DB3FF]/30 flex items-center justify-center text-[#7DB3FF]">
                    <Code2 size={18} />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      {editingId ? "Edit Feature Component" : "Add Feature Component"}
                    </h3>
                    <p className="text-xs text-text-muted">
                      Tambahkan kode JSX, custom CSS, dan pratinjau langsung secara terisolasi.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form Content (Split layout: Editor & Live Preview) */}
              <form onSubmit={handleSaveComponent} className="flex flex-col flex-1 overflow-y-auto p-6 gap-6">
                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Top Row: Meta Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-white/80">Component Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. Glowing Spotlight Button"
                      className="px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-[#7DB3FF] text-white text-xs sm:text-sm outline-none"
                      required
                    />
                  </div>

                  {/* Category */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-white/80">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))}
                      className="px-3.5 py-2.5 rounded-xl bg-[#09152b] border border-white/10 focus:border-[#7DB3FF] text-white text-xs sm:text-sm outline-none"
                    >
                      {COMPONENT_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-white/80">Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                    placeholder="Deskripsi singkat fungsi, animasi, atau kegunaan komponen..."
                    className="px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-[#7DB3FF] text-white text-xs sm:text-sm outline-none"
                  />
                </div>

                {/* Dependencies List Input */}
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <label className="text-xs font-semibold text-white/80">
                      Dependencies / Packages
                    </label>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-text-muted">Quick add:</span>
                      {["styled-components", "motion", "lucide-react", "gsap", "canvas-confetti", "three"].map(pkg => (
                        <button
                          key={pkg}
                          type="button"
                          onClick={() => {
                            if (!formData.dependencies?.includes(pkg)) {
                              setFormData(prev => ({
                                ...prev,
                                dependencies: [...(prev.dependencies || []), pkg]
                              }));
                            }
                          }}
                          className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/5 hover:bg-[#7DB3FF]/20 text-[#7DB3FF] border border-white/10 hover:border-[#7DB3FF]/40 cursor-pointer transition-colors"
                        >
                          +{pkg}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={depInput}
                      onChange={(e) => setDepInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddDependency();
                        }
                      }}
                      placeholder="Ketik nama package lalu tekan Enter atau Tambah"
                      className="flex-1 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddDependency}
                      className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white cursor-pointer font-medium"
                    >
                      + Tambah
                    </button>
                  </div>
                  {formData.dependencies && formData.dependencies.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap mt-1">
                      {formData.dependencies.map(dep => (
                        <span key={dep} className="px-2.5 py-1 rounded-lg text-xs font-mono bg-[#7DB3FF]/10 border border-[#7DB3FF]/20 text-[#7DB3FF] flex items-center gap-1.5">
                          <span>{dep}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveDependency(dep)}
                            className="text-white/40 hover:text-white cursor-pointer"
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Main Code Editor & Live Preview Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                  {/* Left Column: Code / CSS Editor */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveEditorTab('jsx')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all flex items-center gap-1.5 ${
                            activeEditorTab === 'jsx'
                              ? "bg-[#7DB3FF]/20 text-[#7DB3FF] border border-[#7DB3FF]/40"
                              : "text-white/60 hover:text-white"
                          }`}
                        >
                          <FileCode size={13} />
                          <span>React / JSX Code *</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveEditorTab('css')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all flex items-center gap-1.5 ${
                            activeEditorTab === 'css'
                              ? "bg-[#7DB3FF]/20 text-[#7DB3FF] border border-[#7DB3FF]/40"
                              : "text-white/60 hover:text-white"
                          }`}
                        >
                          <Sliders size={13} />
                          <span>CSS (Optional)</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-text-muted">
                          {activeEditorTab === 'jsx' ? 'JSX / TypeScript' : 'Custom CSS'}
                        </span>
                        {activeEditorTab === 'jsx' && (
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(p => ({
                                ...p,
                                code: COMPONENT_TEMPLATES[0].code,
                                dependencies: Array.from(new Set([...(p.dependencies || []), "lucide-react"]))
                              }));
                            }}
                            className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-[#7DB3FF]/15 text-[#7DB3FF] border border-[#7DB3FF]/30 hover:bg-[#7DB3FF]/25 cursor-pointer flex items-center gap-1 transition-all"
                            title="Gunakan pola interaksi 2-arah: klik 1 bergerak maju, klik 2 bergerak mundur kembali"
                          >
                            <Sparkles size={11} />
                            <span>Pola 2-Arah (Maju/Mundur)</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {activeEditorTab === 'jsx' ? (
                      <textarea
                        value={formData.code}
                        onChange={(e) => setFormData(p => ({ ...p, code: e.target.value }))}
                        placeholder="Tulis kode React / JSX komponen di sini..."
                        rows={14}
                        spellCheck={false}
                        className="w-full p-4 rounded-2xl bg-[rgba(3,8,20,0.95)] border border-white/15 focus:border-[#7DB3FF] text-[#E0EBF7] font-mono text-xs leading-relaxed outline-none shadow-inner resize-y"
                        required
                      />
                    ) : (
                      <textarea
                        value={formData.css || ""}
                        onChange={(e) => setFormData(p => ({ ...p, css: e.target.value }))}
                        placeholder="/* Custom CSS untuk komponen ini (jika ada @keyframes atau custom class) */"
                        rows={14}
                        spellCheck={false}
                        className="w-full p-4 rounded-2xl bg-[rgba(3,8,20,0.95)] border border-white/15 focus:border-[#7DB3FF] text-[#E0EBF7] font-mono text-xs leading-relaxed outline-none shadow-inner resize-y"
                      />
                    )}
                  </div>

                  {/* Right Column: Live Isolated Preview */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white/80 flex items-center gap-1.5">
                        <Sparkles size={14} className="text-[#7DB3FF]" />
                        <span>Live Preview (Isolated Sandbox)</span>
                      </span>
                      <span className="text-[11px] text-emerald-400 font-mono">Interactive</span>
                    </div>

                    <div className="flex-1 min-h-[300px] flex flex-col">
                      <DynamicComponentRunner
                        code={formData.code}
                        css={formData.css}
                        componentName={formData.name || "Preview"}
                        minHeight="min-h-[280px]"
                        className="h-full"
                        showControls={true}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Save Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    disabled={isSaving}
                    className="ios-glass-btn px-4 py-2 text-xs text-text-secondary hover:text-white cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="ios-glass-btn ios-glass-primary px-6 py-2.5 text-xs font-semibold text-white flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(125,179,255,0.3)] hover:shadow-[0_0_26px_rgba(125,179,255,0.5)] transition-all"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <Check size={14} />
                        <span>Save Component</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!componentToDelete}
        title="Hapus Komponen"
        itemName={componentToDelete?.name}
        description="Apakah Anda yakin ingin menghapus komponen ini? Komponen akan dihapus secara permanen dari database dan tidak lagi tampil di halaman features pengunjung."
        isDeleting={isDeletingComponent}
        onConfirm={handleConfirmDelete}
        onCancel={() => setComponentToDelete(null)}
      />
    </div>
  );
}

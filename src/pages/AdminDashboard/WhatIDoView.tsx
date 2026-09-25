import React, { useState, useEffect } from "react";
import { getProfile, updateProfile } from "../../features/profile/api";
import { SiteProfile, WhatIDoActionItem } from "../../features/profile/types";

export function WhatIDoView() {
  const [aboutLabel, setAboutLabel] = useState("What I Do");
  const [aboutHeading, setAboutHeading] = useState("Turning Ideas\nInto Real Products");
  const [actions, setActions] = useState<WhatIDoActionItem[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getProfile();
        if (data) {
          setAboutLabel(data.aboutLabel || "What I Do");
          setAboutHeading(data.aboutHeading || "Turning Ideas\nInto Real Products");

          if (data.aboutActions && data.aboutActions.length > 0) {
            setActions(data.aboutActions);
          } else if (data.whatIDoCategories && data.whatIDoCategories.length > 0) {
            // Convert existing categories to action buttons with text columns
            const converted: WhatIDoActionItem[] = data.whatIDoCategories.map(cat => {
              const cols = cat.divs && cat.divs.length > 0 
                ? cat.divs.map(d => d.name)
                : (cat.subtitles || []);
              return {
                id: cat.id || `action-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                buttonText: cat.title || "Tombol Aksi",
                buttonUrl: "/about",
                columns: cols.length > 0 ? cols : ["Kolom 1", "Kolom 2", "Kolom 3"],
                visible: cat.visible !== false
              };
            });
            setActions(converted);
          } else {
            // Default initial state
            setActions([
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
            ]);
          }
        }
      } catch (err) {
        console.error("Failed to load What I Do settings:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ==========================================
  // TOMBOL AKSI MANAGEMENT
  // ==========================================
  const handleAddAction = (presetText?: string, presetCols?: string[]) => {
    const newAction: WhatIDoActionItem = {
      id: `action-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      buttonText: presetText || "Tombol Aksi Baru",
      buttonUrl: "/about",
      columns: presetCols || ["Kolom 1", "Kolom 2", "Kolom 3"],
      visible: true
    };
    setActions(prev => [...prev, newAction]);
  };

  const handleUpdateAction = (id: string, field: keyof WhatIDoActionItem, value: any) => {
    setActions(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleDeleteAction = (id: string) => {
    setActions(prev => prev.filter(item => item.id !== id));
  };

  const handleMoveAction = (index: number, direction: 'up' | 'down') => {
    const list = [...actions];
    if (direction === 'up' && index > 0) {
      const temp = list[index];
      list[index] = list[index - 1];
      list[index - 1] = temp;
    } else if (direction === 'down' && index < list.length - 1) {
      const temp = list[index];
      list[index] = list[index + 1];
      list[index + 1] = temp;
    }
    setActions(list);
  };

  // ==========================================
  // KOLOM TEKS DI BAWAH TOMBOL AKSI
  // ==========================================
  const handleAddColumn = (actionId: string) => {
    setActions(prev => prev.map(item => {
      if (item.id !== actionId) return item;
      const currentCols = item.columns ? [...item.columns] : [];
      return {
        ...item,
        columns: [...currentCols, `Kolom ${currentCols.length + 1}`]
      };
    }));
  };

  const handleUpdateColumn = (actionId: string, colIndex: number, text: string) => {
    setActions(prev => prev.map(item => {
      if (item.id !== actionId) return item;
      const currentCols = [...item.columns];
      currentCols[colIndex] = text;
      return {
        ...item,
        columns: currentCols
      };
    }));
  };

  const handleDeleteColumn = (actionId: string, colIndex: number) => {
    setActions(prev => prev.map(item => {
      if (item.id !== actionId) return item;
      const currentCols = [...item.columns];
      currentCols.splice(colIndex, 1);
      return {
        ...item,
        columns: currentCols
      };
    }));
  };

  // ==========================================
  // SAVE
  // ==========================================
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const sanitizedActions: WhatIDoActionItem[] = actions.map((item, idx) => ({
        id: item.id || `action-${Date.now()}-${idx}`,
        buttonText: item.buttonText.trim() || `Tombol Aksi ${idx + 1}`,
        buttonUrl: item.buttonUrl?.trim() || "/about",
        columns: (item.columns || []).map(c => c.trim()).filter(Boolean),
        visible: item.visible !== false
      }));

      // Backward compatibility sync for legacy consumers
      const syncCategories = sanitizedActions.map((item, idx) => ({
        id: item.id,
        title: item.buttonText,
        order: idx + 1,
        visible: item.visible !== false,
        divs: item.columns.map((c, cIdx) => ({ id: `${item.id}-col-${cIdx}`, name: c })),
        subtitles: item.columns,
        description: item.columns.join(', ')
      }));

      const payloadToSave: Partial<SiteProfile> = {
        aboutLabel: aboutLabel.trim() || "What I Do",
        aboutHeading: aboutHeading.trim() || "Turning Ideas\nInto Real Products",
        aboutActions: sanitizedActions,
        whatIDoCategories: syncCategories
      };

      await updateProfile(payloadToSave);
      setActions(sanitizedActions);
      setMessage({ type: 'success', text: 'Perubahan What I Do berhasil disimpan ke database!' });
    } catch (err: any) {
      console.error("Failed to save What I Do:", err);
      setMessage({ type: 'error', text: `Gagal menyimpan: ${err.code || err.message}` });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-text-secondary animate-pulse p-4">Loading What I Do settings...</div>;

  return (
    <div className="glass-card p-6 sm:p-8 rounded-2xl max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-2xl font-display font-medium text-white">What I Do Dashboard</h2>
          <p className="text-sm text-text-secondary mt-1">
            Kelola judul utama, tombol-tombol aksi, dan kolom teks di bawah setiap tombol aksi.
          </p>
        </div>
      </div>
      
      {message && (
        <div className={`p-4 rounded-lg text-sm mb-6 ${
          message.type === 'success' 
            ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
            : 'bg-red-500/10 border border-red-500/20 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} className="flex flex-col gap-8">
        
        {/* 1. Sederhana: Section Label & Heading */}
        <div className="bg-white/[0.02] p-5 sm:p-6 rounded-2xl border border-white/5 flex flex-col gap-4">
          <h3 className="text-base font-display font-medium text-[#7DB3FF] border-b border-white/5 pb-2">
            1. Label & Heading Utama
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-text-secondary uppercase font-semibold tracking-wider">
                Label Atas
              </label>
              <input 
                type="text" 
                value={aboutLabel} 
                onChange={e => setAboutLabel(e.target.value)} 
                className="glass-input px-4 py-2.5 rounded-lg w-full font-medium" 
                placeholder="What I Do" 
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs text-text-secondary uppercase font-semibold tracking-wider">
                Judul Besar (Heading)
              </label>
              <textarea 
                value={aboutHeading} 
                onChange={e => setAboutHeading(e.target.value)} 
                className="glass-input px-4 py-2 rounded-lg w-full min-h-[50px] resize-y font-medium text-sm" 
                placeholder="Turning Ideas&#10;Into Real Products" 
              />
            </div>
          </div>
        </div>

        {/* 2. Tombol Aksi & Kolom Teks di Bawahnya */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
            <div>
              <h3 className="text-lg font-display font-medium text-[#F7FAFF]">
                2. Tombol Aksi & Kolom Teks di Bawahnya
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Tambahkan tombol aksi baru, lalu tambahkan kolom teks di bawah tombol tersebut.
              </p>
            </div>
            <button 
              type="button" 
              onClick={() => handleAddAction()} 
              className="ios-glass-btn px-4 py-2 text-xs font-semibold cursor-pointer w-fit"
            >
              <span>+ Tambah Tombol Aksi Baru</span>
            </button>
          </div>

          {/* List of Action Buttons */}
          <div className="flex flex-col gap-5">
            {actions.map((item, index) => {
              const cols = item.columns || [];

              return (
                <div 
                  key={item.id} 
                  className="bg-[rgba(8,18,34,0.85)] border border-[rgba(130,180,255,0.22)] p-5 sm:p-6 rounded-2xl flex flex-col gap-5 shadow-lg relative"
                >
                  {/* Header: Tombol Aksi */}
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-2.5 shrink-0">
                      <div className="flex flex-col gap-1">
                        <button 
                          type="button" 
                          onClick={() => handleMoveAction(index, 'up')} 
                          disabled={index === 0} 
                          className="text-text-tertiary hover:text-white disabled:opacity-25 px-1 text-xs cursor-pointer font-bold"
                          title="Pindah ke Atas"
                        >
                          ↑
                        </button>
                        <button 
                          type="button" 
                          onClick={() => handleMoveAction(index, 'down')} 
                          disabled={index === actions.length - 1} 
                          className="text-text-tertiary hover:text-white disabled:opacity-25 px-1 text-xs cursor-pointer font-bold"
                          title="Pindah ke Bawah"
                        >
                          ↓
                        </button>
                      </div>
                      <span className="text-xs font-mono text-[#7DB3FF] px-2.5 py-1 bg-[#7DB3FF]/15 border border-[#7DB3FF]/30 rounded-md font-bold">
                        Tombol #{index + 1}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 w-full">
                      <div>
                        <label className="text-[11px] text-text-secondary uppercase font-semibold">
                          Teks Tombol Aksi
                        </label>
                        <input 
                          type="text" 
                          value={item.buttonText} 
                          onChange={e => handleUpdateAction(item.id, 'buttonText', e.target.value)} 
                          className="glass-input px-3.5 py-2 text-sm rounded-lg w-full font-semibold mt-1" 
                          placeholder="Contoh: Web & Development, Art Commission"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-text-secondary uppercase font-semibold">
                          Link Tujuan (Opsional)
                        </label>
                        <input 
                          type="text" 
                          value={item.buttonUrl || ''} 
                          onChange={e => handleUpdateAction(item.id, 'buttonUrl', e.target.value)} 
                          className="glass-input px-3.5 py-2 text-sm rounded-lg w-full mt-1 text-text-secondary" 
                          placeholder="Contoh: /about, /projects, /gallery"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                      <button 
                        type="button" 
                        onClick={() => handleUpdateAction(item.id, 'visible', !item.visible)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                          item.visible !== false 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                            : 'bg-white/5 text-text-muted border border-white/10'
                        }`}
                      >
                        {item.visible !== false ? 'Visible' : 'Hidden'}
                      </button>

                      <button 
                        type="button" 
                        onClick={() => handleDeleteAction(item.id)} 
                        className="text-red-400 hover:text-red-300 text-xs px-2.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors cursor-pointer"
                      >
                        Hapus Tombol
                      </button>
                    </div>
                  </div>

                  {/* Kolom Teks di Bawah Tombol Aksi */}
                  <div className="flex flex-col gap-3 bg-black/30 p-4 rounded-xl border border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-text-primary uppercase tracking-wider">
                        Kolom Teks di Bawah Tombol Ini ({cols.length} Kolom):
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAddColumn(item.id)}
                        className="text-xs text-[#7DB3FF] hover:text-white font-medium flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <span>+ Tambah Kolom Teks</span>
                      </button>
                    </div>

                    {/* Grid Kolom Teks */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
                      {cols.map((colText, cIdx) => (
                        <div 
                          key={cIdx}
                          className="bg-white/[0.04] border border-white/10 rounded-xl p-2.5 flex flex-col gap-1.5 relative group hover:border-[#7DB3FF]/40 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-[#7DB3FF] font-semibold">
                              Kolom #{cIdx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteColumn(item.id, cIdx)}
                              className="text-text-muted hover:text-red-400 text-xs px-1 hover:scale-110 transition-transform cursor-pointer"
                              title="Hapus kolom ini"
                            >
                              ✕
                            </button>
                          </div>

                          <input 
                            type="text"
                            value={colText}
                            onChange={e => handleUpdateColumn(item.id, cIdx, e.target.value)}
                            className="glass-input px-2.5 py-1.5 text-xs rounded font-medium text-white w-full"
                            placeholder={`Teks kolom`}
                          />
                        </div>
                      ))}

                      {cols.length === 0 && (
                        <div className="col-span-full py-3 text-center text-xs text-text-muted">
                          Belum ada kolom teks di bawah tombol ini. Klik <button type="button" onClick={() => handleAddColumn(item.id)} className="text-[#7DB3FF] underline cursor-pointer font-medium">+ Tambah Kolom Teks</button> untuk mengisi.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {actions.length === 0 && (
              <div className="py-8 text-center text-sm text-text-muted border border-dashed border-white/10 rounded-2xl">
                Belum ada tombol aksi. Klik <button type="button" onClick={() => handleAddAction()} className="text-[#7DB3FF] underline cursor-pointer font-medium">+ Tambah Tombol Aksi Baru</button>.
              </div>
            )}

            <button
              type="button"
              onClick={() => handleAddAction()}
              className="py-3.5 px-5 rounded-xl border border-dashed border-white/20 text-xs text-text-secondary hover:text-white hover:border-[#7DB3FF]/50 hover:bg-white/[0.03] flex items-center justify-center gap-2 transition-all cursor-pointer font-medium"
            >
              <span>+ Tambah Tombol Aksi Baru</span>
            </button>
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-white/5">
          <button 
            type="submit" 
            disabled={saving} 
            className="ios-glass-btn ios-glass-primary px-8 py-3 text-sm font-semibold cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan What I Do'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

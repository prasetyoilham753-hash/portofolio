import React, { useState, useEffect } from "react";
import { 
  Maximize2, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Tag, 
  Calendar,
  Cloud,
  Layers,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { subscribeToGallery } from "../../features/gallery/api";
import { GalleryItem } from "../../features/gallery/types";
import { getProfile } from "../../features/profile/api";

export default function Gallery() {
  const [artworks, setArtworks] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Title & description synced from profile
  const [title, setTitle] = useState("Art Gallery");
  const [description, setDescription] = useState(
    "Visual studies, digital art, and experimental compositions engineered with fluid aesthetics."
  );

  // Lightbox Modal State
  const [activeArtwork, setActiveArtwork] = useState<GalleryItem | null>(null);
  const [activeIdx, setActiveIdx] = useState<number>(-1);

  useEffect(() => {
    // Load Header Info
    getProfile()
      .then((profile) => {
        if (profile) {
          if ((profile as any).galleryTitle) setTitle((profile as any).galleryTitle);
          if ((profile as any).galleryDescription) setDescription((profile as any).galleryDescription);
        }
      })
      .catch((err) => console.error("Error loading gallery header:", err));

    // Subscribe to Art Gallery realtime collection
    const unsubscribe = subscribeToGallery(
      (items) => {
        setArtworks(items);
        setLoading(false);
      },
      (err) => {
        console.error("Gallery subscription error:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!activeArtwork) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveArtwork(null);
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeArtwork, activeIdx, artworks]);

  // Categories list derived from artworks
  const categories = ["All", ...Array.from(new Set(artworks.map((a) => a.category).filter(Boolean))) as string[]];

  const filteredArtworks = selectedCategory === "All"
    ? artworks
    : artworks.filter((item) => item.category === selectedCategory);

  const handleOpenLightbox = (item: GalleryItem, index: number) => {
    setActiveArtwork(item);
    setActiveIdx(index);
  };

  const handleNext = () => {
    if (filteredArtworks.length === 0) return;
    const nextIdx = (activeIdx + 1) % filteredArtworks.length;
    setActiveIdx(nextIdx);
    setActiveArtwork(filteredArtworks[nextIdx]);
  };

  const handlePrev = () => {
    if (filteredArtworks.length === 0) return;
    const prevIdx = (activeIdx - 1 + filteredArtworks.length) % filteredArtworks.length;
    setActiveIdx(prevIdx);
    setActiveArtwork(filteredArtworks[prevIdx]);
  };

  // Abstract vertical offset helper for organic sideways flow
  const getAbstractOffsetClass = (index: number) => {
    const offsets = [
      "md:translate-y-0",
      "md:translate-y-5",
      "md:-translate-y-3",
      "md:translate-y-8",
      "md:-translate-y-2",
      "md:translate-y-4",
    ];
    return offsets[index % offsets.length];
  };

  // Abstract corner radius styling
  const getAbstractBorderRadius = (index: number) => {
    const rads = [
      "rounded-2xl",
      "rounded-3xl",
      "rounded-2xl rounded-tr-3xl",
      "rounded-2xl rounded-bl-3xl",
      "rounded-3xl rounded-tl-xl",
    ];
    return rads[index % rads.length];
  };

  return (
    <div className="flex flex-col gap-10 pb-28">
      {/* Header Section */}
      <header className="max-w-3xl flex flex-col gap-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-medium text-white tracking-tight leading-[1.12]">
          {title}
        </h1>
        <p className="text-[#A8B8CC] text-base sm:text-lg font-light leading-relaxed max-w-2xl">
          {description}
        </p>
      </header>

      {/* Category Filter Pills */}
      {categories.length > 2 && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-xs font-medium cursor-pointer whitespace-nowrap rounded-full transition-all duration-200 ${
                selectedCategory === cat
                  ? "bg-transparent border border-[#7DB3FF] text-[#7DB3FF] shadow-[0_0_12px_rgba(125,179,255,0.25)]"
                  : "bg-transparent border border-white/15 text-text-secondary hover:text-white hover:border-white/30"
              }`}
            >
              <span>{cat}</span>
            </button>
          ))}
        </div>
      )}

      {/* LOADING STATE */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[350px] w-full">
          <div className="flex flex-col items-center gap-3 text-text-secondary text-sm">
            <div className="w-8 h-8 rounded-full border-2 border-[#7DB3FF]/30 border-t-[#7DB3FF] animate-spin" />
            <span>Memuat Art Gallery...</span>
          </div>
        </div>
      ) : filteredArtworks.length === 0 ? (
        /* EMPTY STATE */
        <div className="glass-card p-12 sm:p-16 rounded-3xl border border-white/10 bg-[rgba(10,24,42,0.4)] backdrop-blur-xl text-center flex flex-col items-center justify-center gap-4 text-[#A8B8CC]">
          <div className="w-16 h-16 rounded-3xl bg-[#7DB3FF]/10 border border-[#7DB3FF]/20 flex items-center justify-center text-[#7DB3FF]">
            <Layers size={28} />
          </div>
          <div className="flex flex-col gap-2 max-w-md">
            <h3 className="text-xl font-display font-medium text-white">
              {artworks.length === 0 ? "Belum Ada Karya di Art Gallery" : `Tidak ada karya untuk kategori "${selectedCategory}"`}
            </h3>
            <p className="text-sm font-light leading-relaxed text-text-secondary">
              {artworks.length === 0
                ? "Koleksi foto dan karya seni sedang dikurasi dan akan segera diperbarui."
                : "Pilih kategori lain atau kembali ke 'All' untuk melihat seluruh karya seni."}
            </p>
          </div>
        </div>
      ) : (
        /* ABSTRACT SIDEWAYS / HORIZONTAL DYNAMIC MASONRY LAYOUT
           Ukuran div berbeda-beda mengikuti proporsi asli tiap foto dengan flow kesamping secara abstrak */
        <div className="w-full">
          <div className="flex flex-wrap items-start gap-5 sm:gap-7 pt-4 pb-12">
            {filteredArtworks.map((item, index) => {
              // Calculate natural aspect ratio
              const ratio = item.aspectRatio || (item.width && item.height ? item.width / item.height : 1.2);
              const isPanoramic = ratio > 1.8;
              const isLandscape = ratio >= 1.2 && ratio <= 1.8;
              const isSquare = ratio >= 0.85 && ratio < 1.2;
              const isPortrait = ratio < 0.85;

              // Dynamic width basis and flex growth based on genuine photo proportions
              // This gives each photo container its own unique size following the image
              let flexBasis = "280px";
              let minWidth = "240px";
              let maxWidth = "520px";
              let containerHeight = "320px";

              if (isPanoramic) {
                flexBasis = "460px";
                minWidth = "340px";
                maxWidth = "680px";
                containerHeight = "260px";
              } else if (isLandscape) {
                flexBasis = "360px";
                minWidth = "280px";
                maxWidth = "560px";
                containerHeight = "300px";
              } else if (isPortrait) {
                flexBasis = "240px";
                minWidth = "200px";
                maxWidth = "360px";
                containerHeight = "390px";
              } else if (isSquare) {
                flexBasis = "300px";
                minWidth = "250px";
                maxWidth = "420px";
                containerHeight = "320px";
              }

              const offsetClass = getAbstractOffsetClass(index);
              const borderRadiusClass = getAbstractBorderRadius(index);

              return (
                <div
                  key={item.id}
                  id={`art-item-${item.id}`}
                  onClick={() => handleOpenLightbox(item, index)}
                  className={`group relative flex-grow cursor-pointer transition-all duration-500 hover:z-20 ${offsetClass}`}
                  style={{
                    flexBasis,
                    minWidth,
                    maxWidth,
                  }}
                >
                  {/* Dynamic Abstract Card Container */}
                  <div
                    className={`relative w-full overflow-hidden bg-black/40 border border-white/15 backdrop-blur-md transition-all duration-500 group-hover:border-[#7DB3FF]/60 group-hover:shadow-[0_16px_40px_-10px_rgba(125,179,255,0.25)] group-hover:-translate-y-1.5 ${borderRadiusClass}`}
                    style={{ height: containerHeight }}
                  >
                    {/* Natural Photo */}
                    <img
                      src={item.imageUrl}
                      alt={item.title || "Artwork"}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                    />

                    {/* Glossy Ambient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/10 opacity-70 group-hover:opacity-90 transition-opacity duration-300" />

                    {/* Top Badges (Category & Year / Dimensions) */}
                    <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none z-10">
                      {item.category ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-medium tracking-wide uppercase bg-black/60 backdrop-blur-md text-white/90 border border-white/15 shadow-sm">
                          {item.category}
                        </span>
                      ) : (
                        <span />
                      )}

                      <div className="flex items-center gap-1.5">
                        {item.imageUrl?.includes("cloudinary") && (
                          <span className="p-1 rounded-full bg-black/60 text-emerald-400 border border-white/10" title="Cloudinary CDN">
                            <Cloud size={11} />
                          </span>
                        )}
                        {item.year && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-white/70 bg-black/60 backdrop-blur-md border border-white/10">
                            {item.year}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Metadata & Hover View Prompt */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 flex flex-col gap-1.5 z-10 pointer-events-none">
                      {item.title && (
                        <h3 className="text-base sm:text-lg font-display font-medium text-white tracking-tight drop-shadow-md group-hover:text-[#7DB3FF] transition-colors duration-300">
                          {item.title}
                        </h3>
                      )}

                      {item.caption && (
                        <p className="text-xs text-white/75 font-light line-clamp-2 leading-relaxed drop-shadow-sm">
                          {item.caption}
                        </p>
                      )}

                      {/* View Action Cue */}
                      <div className="pt-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <span className="text-[11px] font-mono text-white/60">
                          {item.width && item.height ? `${item.width} × ${item.height} px` : "View Fullscreen"}
                        </span>
                        <span className="ios-glass-btn px-3 py-1 text-[11px] font-semibold text-white flex items-center gap-1">
                          <Maximize2 size={11} />
                          <span>Expand</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* LIGHTBOX MODAL VIEWER */}
      {activeArtwork && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-2xl animate-fade-in"
          onClick={() => setActiveArtwork(null)}
        >
          {/* Modal Container */}
          <div
            className="relative max-w-6xl w-full max-h-[92vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveArtwork(null)}
              className="absolute -top-12 right-0 sm:right-2 p-2 rounded-full text-white/70 hover:text-white bg-white/10 hover:bg-white/20 transition-colors cursor-pointer z-50"
              title="Tutup (Esc)"
            >
              <X size={20} />
            </button>

            {/* Navigation Arrows */}
            {filteredArtworks.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-2 sm:-left-12 top-1/2 -translate-y-1/2 p-3 rounded-full text-white/80 hover:text-white bg-black/60 sm:bg-white/10 hover:bg-white/25 border border-white/15 transition-all cursor-pointer z-50"
                  title="Sebelumnya (Arrow Left)"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-2 sm:-right-12 top-1/2 -translate-y-1/2 p-3 rounded-full text-white/80 hover:text-white bg-black/60 sm:bg-white/10 hover:bg-white/25 border border-white/15 transition-all cursor-pointer z-50"
                  title="Selanjutnya (Arrow Right)"
                >
                  <ChevronRight size={22} />
                </button>
              </>
            )}

            {/* Main Lightbox Content */}
            <div className="flex flex-col items-center max-w-full max-h-[85vh] rounded-2xl overflow-hidden bg-black/60 border border-white/15 shadow-2xl">
              {/* Photo Display */}
              <div className="relative flex items-center justify-center max-h-[72vh] w-auto overflow-hidden">
                <img
                  src={activeArtwork.imageUrl}
                  alt={activeArtwork.title || "Full Artwork"}
                  className="max-h-[72vh] max-w-full object-contain rounded-t-xl"
                />
              </div>

              {/* Bottom Info Bar */}
              <div className="w-full p-4 sm:p-5 bg-[rgba(10,24,42,0.95)] border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                <div className="flex flex-col gap-1 max-w-xl">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-lg font-display font-medium text-white">
                      {activeArtwork.title || <span className="italic text-white/50">Untitled Artwork</span>}
                    </h3>
                    {activeArtwork.category && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#7DB3FF]/20 text-[#7DB3FF] border border-[#7DB3FF]/30">
                        {activeArtwork.category}
                      </span>
                    )}
                  </div>
                  {activeArtwork.caption && (
                    <p className="text-xs text-text-secondary font-light leading-relaxed">
                      {activeArtwork.caption}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0 text-xs text-text-muted font-mono">
                  {activeArtwork.width && activeArtwork.height && (
                    <span>
                      {activeArtwork.width} × {activeArtwork.height} px
                    </span>
                  )}
                  {activeArtwork.year && (
                    <span className="flex items-center gap-1 text-white/70">
                      <Calendar size={12} />
                      <span>{activeArtwork.year}</span>
                    </span>
                  )}
                  <span className="text-white/40">
                    {activeIdx + 1} / {filteredArtworks.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

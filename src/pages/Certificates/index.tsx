import React, { useState, useEffect, useRef } from "react";
import { 
  Maximize2, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Award, 
  Layers, 
  ExternalLink, 
  Check, 
  Copy, 
  Sparkles, 
  ShieldCheck,
  Image as ImageIcon
} from "lucide-react";
import { subscribeToCertificates } from "../../features/certificates/api";
import { CertificateItem } from "../../features/certificates/types";
import { getProfile } from "../../features/profile/api";

interface CertificateCardProps {
  key?: React.Key;
  item: CertificateItem;
  index: number;
  offsetClass: string;
  onOpenLightbox: (item: CertificateItem, index: number, photoIndex?: number) => void;
}

/**
 * Individual Certificate Card with interactive multi-image carousel slider
 */
function CertificateCard({
  item,
  index,
  offsetClass,
  onOpenLightbox,
}: CertificateCardProps) {
  const images = Array.isArray(item.images) && item.images.length > 0
    ? item.images.filter(Boolean)
    : (item.imageUrl ? [item.imageUrl] : []);

  const [currentIdx, setCurrentIdx] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const handlePrevSlide = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setCurrentIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNextSlide = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setCurrentIdx((prev) => (prev + 1) % images.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        // swipe left -> next
        handleNextSlide(e);
      } else {
        // swipe right -> prev
        handlePrevSlide(e);
      }
    }
    touchStartX.current = null;
  };

  const currentImageUrl = images[currentIdx] || item.imageUrl;

  return (
    <div
      onClick={() => onOpenLightbox(item, index, currentIdx)}
      className={`group relative rounded-[26px] overflow-hidden border border-[rgba(120,170,255,0.18)] bg-[rgba(6,15,35,0.45)] backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.25)] hover:border-[rgba(140,190,255,0.45)] transition-all duration-300 cursor-pointer flex flex-col justify-between hover:shadow-[0_16px_40px_rgba(0,0,0,0.4),0_0_24px_rgba(120,170,255,0.12)] hover:-translate-y-1.5 ${offsetClass}`}
    >
      {/* Top Image Container & Interactive Slider */}
      <div 
        className="relative aspect-[16/10] bg-black/40 overflow-hidden select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={currentImageUrl}
          alt={`${item.title} - Foto ${currentIdx + 1}`}
          loading="lazy"
          key={currentImageUrl}
          className="w-full h-full object-cover transition-all duration-500 ease-out group-hover:scale-105 animate-fade-in"
          onError={(e) => {
            (e.target as HTMLElement).style.display = "none";
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(6,15,35,0.92)] via-[rgba(6,15,35,0.25)] to-transparent opacity-80 group-hover:opacity-60 transition-opacity pointer-events-none" />

        {/* Top Badges: Category & Featured & Multi-photo counter */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10 pointer-events-none">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-3 py-1 rounded-full text-[11px] font-medium tracking-wide bg-[rgba(6,15,35,0.8)] border border-white/20 text-[#E2EEFC] backdrop-blur-md shadow-sm">
              {item.category}
            </span>

            {item.featured && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-md">
                <Sparkles size={11} strokeWidth={2.5} />
                <span>Featured</span>
              </span>
            )}
          </div>

          {/* Multi-photo Counter Badge */}
          {images.length > 1 && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-[rgba(6,15,35,0.85)] border border-[#7DB3FF]/40 text-[#7DB3FF] backdrop-blur-md shadow-sm">
              <ImageIcon size={12} />
              <span>{currentIdx + 1}/{images.length}</span>
            </span>
          )}
        </div>

        {/* Slider Navigation Arrows (shown if multiple images exist) */}
        {images.length > 1 && (
          <div className="absolute inset-y-0 left-2 right-2 flex items-center justify-between z-20 pointer-events-none">
            <button
              type="button"
              onClick={handlePrevSlide}
              className="pointer-events-auto w-8 h-8 rounded-full bg-[rgba(6,15,35,0.75)] hover:bg-[#7DB3FF] text-white hover:text-black border border-white/20 hover:border-[#7DB3FF] flex items-center justify-center backdrop-blur-md transition-all duration-200 opacity-80 sm:opacity-0 group-hover:opacity-100 shadow-lg cursor-pointer transform active:scale-90"
              aria-label="Foto sebelumnya"
            >
              <ChevronLeft size={16} />
            </button>

            <button
              type="button"
              onClick={handleNextSlide}
              className="pointer-events-auto w-8 h-8 rounded-full bg-[rgba(6,15,35,0.75)] hover:bg-[#7DB3FF] text-white hover:text-black border border-white/20 hover:border-[#7DB3FF] flex items-center justify-center backdrop-blur-md transition-all duration-200 opacity-80 sm:opacity-0 group-hover:opacity-100 shadow-lg cursor-pointer transform active:scale-90"
              aria-label="Foto berikutnya"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Slide Pagination Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-3.5 left-0 right-0 flex items-center justify-center gap-1.5 z-10">
            {images.map((_, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIdx(dotIdx);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  currentIdx === dotIdx
                    ? "w-5 bg-[#7DB3FF] shadow-[0_0_8px_#7DB3FF]"
                    : "w-1.5 bg-white/40 hover:bg-white/70"
                }`}
                aria-label={`Slide ke ${dotIdx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Hover Inspect Indicator (Only shown if single photo or in bottom right) */}
        <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-[rgba(6,15,35,0.75)] border border-white/25 text-[#7DB3FF] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 backdrop-blur-md shadow-lg pointer-events-none z-10">
          <Maximize2 size={14} />
        </div>
      </div>

      {/* Card Content Details */}
      <div className="p-5 sm:p-6 flex flex-col gap-3 flex-1 justify-between relative z-10">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <div className="flex items-center gap-1.5 font-medium text-[#7DB3FF]">
              <ShieldCheck size={14} className="text-[#7DB3FF]" />
              <span>{item.issuer}</span>
            </div>
            <span className="text-white/60 font-mono text-[11px]">{item.issueDate}</span>
          </div>

          <h3 className="text-lg font-semibold text-white group-hover:text-[#7DB3FF] transition-colors line-clamp-2 leading-snug">
            {item.title}
          </h3>

          {item.description && (
            <p className="text-xs text-text-secondary font-light line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          )}
        </div>

        {/* Skills Pills */}
        {item.skills && item.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-3 border-t border-white/5">
            {item.skills.slice(0, 3).map((skill, sIdx) => (
              <span
                key={sIdx}
                className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-white/[0.05] border border-white/10 text-[#E2EEFC]/80"
              >
                {skill}
              </span>
            ))}
            {item.skills.length > 3 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] bg-white/[0.05] text-white/50">
                +{item.skills.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Certificates() {
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [copiedId, setCopiedId] = useState(false);

  // Title & description synced from profile if available
  const [title, setTitle] = useState("Certificates & Credentials");
  const [description, setDescription] = useState(
    "Verified professional certifications, technical proficiencies, and specialized competencies in modern software engineering and spatial design."
  );

  // Lightbox Modal State
  const [activeCert, setActiveCert] = useState<CertificateItem | null>(null);
  const [activeIdx, setActiveIdx] = useState<number>(-1);
  const [activePhotoIdx, setActivePhotoIdx] = useState<number>(0);

  // Touch handlers for Lightbox swipe
  const lightboxTouchStartX = useRef<number | null>(null);

  useEffect(() => {
    // Load Header Info
    getProfile()
      .then((profile) => {
        if (profile) {
          if ((profile as any).certificatesTitle) setTitle((profile as any).certificatesTitle);
          if ((profile as any).certificatesDescription) setDescription((profile as any).certificatesDescription);
        }
      })
      .catch((err) => console.error("Error loading certificates header:", err));

    // Subscribe to Certificates realtime collection
    const unsubscribe = subscribeToCertificates(
      (items) => {
        setCertificates(items || []);
        setLoading(false);
      },
      (err) => {
        console.error("Certificates subscription error:", err);
        setCertificates([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const categories = ["All", ...Array.from(new Set(certificates.map((c) => c.category).filter(Boolean))) as string[]];

  const filteredCertificates = selectedCategory === "All"
    ? certificates
    : certificates.filter((item) => item.category === selectedCategory);

  const activeImages = activeCert
    ? (Array.isArray(activeCert.images) && activeCert.images.length > 0
        ? activeCert.images.filter(Boolean)
        : (activeCert.imageUrl ? [activeCert.imageUrl] : []))
    : [];

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!activeCert) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveCert(null);
      } else if (e.key === "ArrowRight") {
        if (activeImages.length > 1) {
          setActivePhotoIdx((prev) => (prev + 1) % activeImages.length);
        } else {
          handleNextCert();
        }
      } else if (e.key === "ArrowLeft") {
        if (activeImages.length > 1) {
          setActivePhotoIdx((prev) => (prev - 1 + activeImages.length) % activeImages.length);
        } else {
          handlePrevCert();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeCert, activeIdx, activePhotoIdx, activeImages.length, filteredCertificates]);

  const handleOpenLightbox = (item: CertificateItem, index: number, photoIndex: number = 0) => {
    setActiveCert(item);
    setActiveIdx(index);
    setActivePhotoIdx(photoIndex);
    setCopiedId(false);
  };

  const handleNextCert = () => {
    if (filteredCertificates.length === 0) return;
    const nextIdx = (activeIdx + 1) % filteredCertificates.length;
    setActiveIdx(nextIdx);
    setActiveCert(filteredCertificates[nextIdx]);
    setActivePhotoIdx(0);
    setCopiedId(false);
  };

  const handlePrevCert = () => {
    if (filteredCertificates.length === 0) return;
    const prevIdx = (activeIdx - 1 + filteredCertificates.length) % filteredCertificates.length;
    setActiveIdx(prevIdx);
    setActiveCert(filteredCertificates[prevIdx]);
    setActivePhotoIdx(0);
    setCopiedId(false);
  };

  const handleCopyId = (idString?: string) => {
    if (!idString) return;
    navigator.clipboard.writeText(idString);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Organic vertical flow offset
  const getAbstractOffsetClass = (index: number) => {
    const offsets = [
      "md:translate-y-0",
      "md:translate-y-4",
      "md:-translate-y-2",
      "md:translate-y-6",
      "md:-translate-y-1",
    ];
    return offsets[index % offsets.length];
  };

  return (
    <div className="flex flex-col gap-10 pb-28">
      {/* Header Section */}
      <header className="max-w-3xl flex flex-col gap-4">
        <div className="inline-flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#7DB3FF] animate-pulse" />
          <span className="text-[12px] sm:text-[13px] font-display font-medium tracking-wider text-[#7DB3FF] uppercase">
            Verified Credentials
          </span>
        </div>
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
            <span>Memuat Sertifikat...</span>
          </div>
        </div>
      ) : certificates.length === 0 ? (
        /* EMPTY STATE: NOTHING POSTED YET */
        <div className="glass-card p-12 sm:p-16 rounded-3xl border border-white/10 bg-[rgba(10,24,42,0.4)] backdrop-blur-xl text-center flex flex-col items-center justify-center gap-4 text-[#A8B8CC]">
          <div className="w-16 h-16 rounded-3xl bg-[#7DB3FF]/10 border border-[#7DB3FF]/20 flex items-center justify-center text-[#7DB3FF]">
            <Award size={28} />
          </div>
          <div className="flex flex-col gap-2 max-w-md">
            <h3 className="text-xl font-display font-medium text-white">
              Belum Ada Sertifikat
            </h3>
            <p className="text-sm font-light leading-relaxed text-text-secondary">
              Sertifikasi profesional dan kredensial terverifikasi akan ditampilkan di sini setelah dipublikasikan oleh admin.
            </p>
          </div>
        </div>
      ) : filteredCertificates.length === 0 ? (
        /* EMPTY CATEGORY STATE */
        <div className="glass-card p-12 rounded-3xl border border-white/10 bg-[rgba(10,24,42,0.4)] backdrop-blur-xl text-center flex flex-col items-center justify-center gap-4 text-[#A8B8CC]">
          <div className="w-14 h-14 rounded-2xl bg-[#7DB3FF]/10 border border-[#7DB3FF]/20 flex items-center justify-center text-[#7DB3FF]">
            <Layers size={24} />
          </div>
          <div className="flex flex-col gap-2 max-w-md">
            <h3 className="text-lg font-display font-medium text-white">
              Tidak ada sertifikat untuk kategori "{selectedCategory}"
            </h3>
            <p className="text-xs font-light leading-relaxed text-text-secondary">
              Pilih kategori lain atau kembali ke 'All' untuk melihat seluruh kredensial.
            </p>
          </div>
        </div>
      ) : (
        /* ART GALLERY-STYLE DYNAMIC SPATIAL MASONRY GRID */
        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 pt-2 pb-12">
            {filteredCertificates.map((item, index) => {
              const offsetClass = getAbstractOffsetClass(index);
              return (
                <CertificateCard
                  key={item.id || index}
                  item={item}
                  index={index}
                  offsetClass={offsetClass}
                  onOpenLightbox={handleOpenLightbox}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* FULLSCREEN LIGHTBOX MODAL WITH MULTI-IMAGE SLIDER */}
      {activeCert && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 md:p-10 animate-fade-in"
          onClick={() => setActiveCert(null)}
        >
          {/* Close Button */}
          <button
            onClick={() => setActiveCert(null)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white cursor-pointer transition-all duration-200"
            aria-label="Tutup pratinjau"
          >
            <X size={20} />
          </button>

          {/* Previous Certificate Button */}
          {filteredCertificates.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrevCert();
              }}
              className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-[rgba(6,15,35,0.75)] hover:bg-[#7DB3FF] border border-white/20 text-white hover:text-black cursor-pointer transition-all duration-200 shadow-2xl backdrop-blur-md"
              title="Sertifikat sebelumnya"
            >
              <ChevronLeft size={22} />
            </button>
          )}

          {/* Next Certificate Button */}
          {filteredCertificates.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNextCert();
              }}
              className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-[rgba(6,15,35,0.75)] hover:bg-[#7DB3FF] border border-white/20 text-white hover:text-black cursor-pointer transition-all duration-200 shadow-2xl backdrop-blur-md"
              title="Sertifikat selanjutnya"
            >
              <ChevronRight size={22} />
            </button>
          )}

          {/* Modal Card Content */}
          <div 
            className="max-w-5xl w-full max-h-[92vh] flex flex-col lg:flex-row bg-[rgba(10,24,45,0.94)] border border-white/20 rounded-[28px] sm:rounded-[36px] overflow-hidden shadow-2xl relative z-40"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left/Top: High-res Preview Image & Slider */}
            <div 
              className="lg:w-3/5 bg-black/70 flex flex-col items-center justify-between p-4 sm:p-6 overflow-hidden min-h-[300px] max-h-[500px] lg:max-h-[660px] relative select-none"
              onTouchStart={(e) => {
                lightboxTouchStartX.current = e.touches[0].clientX;
              }}
              onTouchEnd={(e) => {
                if (lightboxTouchStartX.current === null) return;
                const diff = lightboxTouchStartX.current - e.changedTouches[0].clientX;
                if (Math.abs(diff) > 40) {
                  if (diff > 0 && activeImages.length > 1) {
                    setActivePhotoIdx((prev) => (prev + 1) % activeImages.length);
                  } else if (diff < 0 && activeImages.length > 1) {
                    setActivePhotoIdx((prev) => (prev - 1 + activeImages.length) % activeImages.length);
                  }
                }
                lightboxTouchStartX.current = null;
              }}
            >
              {/* Photo Index Badge Overlay */}
              {activeImages.length > 1 && (
                <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-[rgba(6,15,35,0.85)] border border-[#7DB3FF]/40 text-[#7DB3FF] backdrop-blur-md shadow-md">
                  <ImageIcon size={13} />
                  <span>Foto {activePhotoIdx + 1} dari {activeImages.length}</span>
                </div>
              )}

              {/* Main Image View */}
              <div className="flex-1 w-full flex items-center justify-center relative overflow-hidden my-auto">
                <img
                  src={activeImages[activePhotoIdx] || activeCert.imageUrl}
                  alt={`${activeCert.title} - ${activePhotoIdx + 1}`}
                  key={activeImages[activePhotoIdx] || activeCert.imageUrl}
                  className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl transition-all duration-300 animate-fade-in"
                />

                {/* Left/Right Slide Arrows inside Photo Viewer */}
                {activeImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setActivePhotoIdx((prev) => (prev - 1 + activeImages.length) % activeImages.length)}
                      className="absolute left-2 p-2.5 rounded-full bg-[rgba(6,15,35,0.8)] hover:bg-[#7DB3FF] text-white hover:text-black border border-white/20 hover:border-[#7DB3FF] transition-all shadow-lg backdrop-blur-md cursor-pointer"
                      title="Foto sebelumnya"
                    >
                      <ChevronLeft size={18} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setActivePhotoIdx((prev) => (prev + 1) % activeImages.length)}
                      className="absolute right-2 p-2.5 rounded-full bg-[rgba(6,15,35,0.8)] hover:bg-[#7DB3FF] text-white hover:text-black border border-white/20 hover:border-[#7DB3FF] transition-all shadow-lg backdrop-blur-md cursor-pointer"
                      title="Foto selanjutnya"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}
              </div>

              {/* Bottom Thumbnail Strip for Multi-Image Certificates */}
              {activeImages.length > 1 && (
                <div className="w-full flex items-center justify-center gap-2 pt-3 overflow-x-auto no-scrollbar z-20">
                  {activeImages.map((imgUrl, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => setActivePhotoIdx(pIdx)}
                      className={`relative w-14 h-11 sm:w-16 sm:h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                        activePhotoIdx === pIdx
                          ? "border-[#7DB3FF] shadow-[0_0_12px_rgba(125,179,255,0.5)] scale-105"
                          : "border-white/20 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`Thumbnail ${pIdx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right/Bottom: Credential Details & Verification */}
            <div className="lg:w-2/5 p-6 sm:p-8 flex flex-col justify-between gap-6 overflow-y-auto max-h-[420px] lg:max-h-[660px] bg-[rgba(6,15,35,0.65)]">
              <div className="flex flex-col gap-4">
                {/* Category & Featured Badges */}
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#7DB3FF]/20 border border-[#7DB3FF]/40 text-[#7DB3FF]">
                    {activeCert.category}
                  </span>
                  {activeCert.featured && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-black">
                      Featured
                    </span>
                  )}
                </div>

                {/* Title & Issuer */}
                <div className="flex flex-col gap-1.5">
                  <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                    {activeCert.title}
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-[#7DB3FF]">
                    <ShieldCheck size={16} />
                    <span className="font-medium">{activeCert.issuer}</span>
                    <span className="text-white/30">•</span>
                    <span className="text-white/70 font-mono text-xs">{activeCert.issueDate}</span>
                  </div>
                </div>

                {/* Credential ID Copy Box */}
                {activeCert.credentialId && (
                  <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between gap-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-text-secondary">
                        Credential ID
                      </span>
                      <span className="text-xs font-mono text-white select-all">
                        {activeCert.credentialId}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopyId(activeCert.credentialId)}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs flex items-center gap-1 cursor-pointer transition-all"
                      title="Salin ID Kredensial"
                    >
                      {copiedId ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      <span className="text-[11px]">{copiedId ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                )}

                {/* Description */}
                {activeCert.description && (
                  <p className="text-sm text-text-secondary font-light leading-relaxed">
                    {activeCert.description}
                  </p>
                )}

                {/* Skills Tags */}
                {activeCert.skills && activeCert.skills.length > 0 && (
                  <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
                    <span className="text-xs font-medium text-white/80">Skills & Competencies</span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeCert.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/[0.06] border border-white/12 text-[#E2EEFC]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                {activeCert.credentialUrl ? (
                  <a
                    href={activeCert.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ios-glass-btn ios-glass-primary flex-1 py-3 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg text-white"
                  >
                    <span>Verify Credential</span>
                    <ExternalLink size={14} />
                  </a>
                ) : (
                  <div className="flex-1 py-3 text-center text-xs font-medium text-white/40 bg-white/[0.03] rounded-xl border border-white/10">
                    Verified Credential Document
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

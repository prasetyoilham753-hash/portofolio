import React, { useState, useEffect, useRef } from "react";
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Sparkles, 
  Check, 
  X, 
  MoveUp, 
  MoveDown,
  UploadCloud,
  Cloud,
  Loader2,
  AlertCircle,
  RefreshCw,
  Image as ImageIcon,
  FileText,
  Maximize2
} from "lucide-react";
import { subscribeToGallery, createGalleryItem, updateGalleryItem, deleteGalleryItem } from "../../features/gallery/api";
import { GalleryItem } from "../../features/gallery/types";
import { uploadFileToCloudinary, getProfile, updateProfile } from "../../features/profile/api";
import { DeleteConfirmModal } from "../../components/common/DeleteConfirmModal";

export function GalleryView() {
  const [artworks, setArtworks] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Gallery Page Header Settings (Stored in profile)
  const [galleryTitle, setGalleryTitle] = useState("Art Gallery");
  const [galleryDescription, setGalleryDescription] = useState("Visual studies, digital art, and experimental compositions.");
  const [loadingHeader, setLoadingHeader] = useState(true);
  const [savingHeader, setSavingHeader] = useState(false);
  const [headerMsg, setHeaderMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Custom Delete Modal State
  const [itemToDelete, setItemToDelete] = useState<GalleryItem | null>(null);
  const [isDeletingItem, setIsDeletingItem] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePath, setImagePath] = useState("");
  const [category, setCategory] = useState("Digital Art");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [aspectRatio, setAspectRatio] = useState<number>(1);

  // Cloudinary Direct Upload States
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [showManualUrl, setShowManualUrl] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Artworks Realtime
  useEffect(() => {
    const unsubscribe = subscribeToGallery(
      (items) => {
        setArtworks(items);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching gallery items:", err);
        setErrorMsg("Gagal memuat karya seni Art Gallery.");
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Load Header Settings from Profile
  useEffect(() => {
    let isMounted = true;
    getProfile()
      .then((profile) => {
        if (isMounted && profile) {
          if ((profile as any).galleryTitle) setGalleryTitle((profile as any).galleryTitle);
          if ((profile as any).galleryDescription) setGalleryDescription((profile as any).galleryDescription);
        }
        if (isMounted) setLoadingHeader(false);
      })
      .catch((err) => {
        console.error("Error loading gallery header config:", err);
        if (isMounted) setLoadingHeader(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSaveHeader = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingHeader(true);
    setHeaderMsg(null);
    try {
      await updateProfile({
        galleryTitle: galleryTitle.trim() || "Art Gallery",
        galleryDescription: galleryDescription.trim(),
      } as any);
      setHeaderMsg({ type: "success", text: "Header Art Gallery berhasil disimpan!" });
      setTimeout(() => setHeaderMsg(null), 4000);
    } catch (err: any) {
      console.error("Failed to save gallery header:", err);
      setHeaderMsg({ type: "error", text: err?.message || "Gagal menyimpan header." });
    } finally {
      setSavingHeader(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setCaption("");
    setImageUrl("");
    setImagePath("");
    setCategory("Digital Art");
    setYear(new Date().getFullYear().toString());
    setWidth(0);
    setHeight(0);
    setAspectRatio(1);
    setEditingId(null);
    setUploadingImage(false);
    setUploadError(null);
    setUploadedFileName("");
    setShowManualUrl(false);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: GalleryItem) => {
    setEditingId(item.id);
    setTitle(item.title || "");
    setCaption(item.caption || "");
    setImageUrl(item.imageUrl || "");
    setImagePath(item.imagePath || "");
    setCategory(item.category || "Digital Art");
    setYear(item.year || "");
    setWidth(item.width || 0);
    setHeight(item.height || 0);
    setAspectRatio(item.aspectRatio || 1);
    setUploadingImage(false);
    setUploadError(null);
    setUploadedFileName("");
    setShowManualUrl(false);
    setIsModalOpen(true);
  };

  // Direct Cloudinary Upload handler for Art Gallery Photos
  const handlePhotoUpload = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Silakan pilih file gambar (JPG, PNG, WebP, GIF, SVG, AVIF).");
      return;
    }

    setUploadingImage(true);
    setUploadError(null);
    setUploadedFileName(file.name);

    // Read natural image dimensions & aspect ratio
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth || 800;
      const h = img.naturalHeight || 600;
      setWidth(w);
      setHeight(h);
      setAspectRatio(w / h);
      URL.revokeObjectURL(objectUrl);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
    };
    img.src = objectUrl;

    try {
      const result = await uploadFileToCloudinary(file);
      setImageUrl(result.url);
      setImagePath(result.path);
      setUploadingImage(false);
    } catch (err: any) {
      console.error("Cloudinary art upload failed:", err);
      setUploadError(err?.message || "Gagal mengunggah foto ke Cloudinary.");
      setUploadingImage(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handlePhotoUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadingImage) {
      alert("Sedang mengunggah foto ke Cloudinary. Mohon tunggu sebelum menyimpan.");
      return;
    }

    if (!imageUrl.trim()) {
      alert("Mohon upload foto karya seni terlebih dahulu melalui area Cloudinary.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await updateGalleryItem(editingId, {
          title: title.trim(),
          caption: caption.trim(),
          imageUrl: imageUrl.trim(),
          imagePath: imagePath.trim(),
          category: category.trim(),
          year: year.trim(),
          width,
          height,
          aspectRatio: aspectRatio || 1,
        });
      } else {
        await createGalleryItem({
          title: title.trim(),
          caption: caption.trim(),
          imageUrl: imageUrl.trim(),
          imagePath: imagePath.trim(),
          category: category.trim(),
          year: year.trim(),
          width,
          height,
          aspectRatio: aspectRatio || 1,
          order: artworks.length,
        });
      }
      setIsModalOpen(false);
      resetForm();
    } catch (err: any) {
      console.error("Failed to save artwork:", err);
      alert("Gagal menyimpan karya seni: " + (err?.message || "Terjadi kesalahan"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (item: GalleryItem) => {
    setItemToDelete(item);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeletingItem(true);
    try {
      await deleteGalleryItem(itemToDelete.id);
      setItemToDelete(null);
    } catch (err: any) {
      console.error("Failed to delete artwork:", err);
      alert("Gagal menghapus karya seni: " + (err?.message || "Periksa koneksi dan izin."));
    } finally {
      setIsDeletingItem(false);
    }
  };

  const handleMoveOrder = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= artworks.length) return;

    const currentItem = artworks[index];
    const targetItem = artworks[targetIndex];

    try {
      await updateGalleryItem(currentItem.id, { order: targetIndex });
      await updateGalleryItem(targetItem.id, { order: index });
    } catch (err: any) {
      console.error("Failed to update artwork order:", err);
    }
  };

  const getOrientationLabel = (ratio: number) => {
    if (!ratio) return "Normal";
    if (ratio > 1.35) return "Landscape";
    if (ratio < 0.8) return "Portrait";
    if (ratio >= 0.8 && ratio <= 1.35) return "Square";
    return "Custom";
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-medium text-white flex items-center gap-2.5">
            <ImageIcon className="text-[#7DB3FF]" size={22} />
            <span>Manajemen Art Gallery</span>
          </h2>
          <p className="text-text-secondary text-sm font-light mt-1">
            Kelola karya seni, foto ilustrasi, dan komposisi visual dengan upload langsung ke Cloudinary.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="ios-glass-btn ios-glass-primary px-5 py-2.5 text-xs font-semibold cursor-pointer flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>Tambah Foto / Karya Seni</span>
        </button>
      </div>

      {/* Art Gallery Page Header Configuration */}
      <div className="glass-card p-6 rounded-2xl border border-white/10 bg-[rgba(10,24,42,0.4)] backdrop-blur-xl flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <FileText size={18} className="text-[#7DB3FF]" />
            <div>
              <h3 className="text-lg font-display text-white">Art Gallery Page Header</h3>
              <p className="text-xs text-text-secondary font-light">
                Kelola judul dan deskripsi yang tampil di bagian atas halaman publik Art Gallery (/gallery).
              </p>
            </div>
          </div>
          {headerMsg && (
            <div
              className={`px-3 py-1 rounded-lg text-xs flex items-center gap-1.5 self-start sm:self-auto ${
                headerMsg.type === "success"
                  ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                  : "bg-red-500/15 border border-red-500/30 text-red-400"
              }`}
            >
              {headerMsg.type === "success" ? <Check size={13} /> : <AlertCircle size={13} />}
              <span>{headerMsg.text}</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSaveHeader} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Judul Halaman
            </label>
            <input
              type="text"
              value={galleryTitle}
              onChange={(e) => setGalleryTitle(e.target.value)}
              placeholder="Art Gallery"
              className="glass-input px-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/15 focus:border-[#7DB3FF] outline-none text-white"
            />
          </div>

          <div className="sm:col-span-2 flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Deskripsi Halaman (Sub-judul)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={galleryDescription}
                onChange={(e) => setGalleryDescription(e.target.value)}
                placeholder="Visual studies, digital art, and experimental compositions."
                className="glass-input px-4 py-2.5 rounded-xl text-sm flex-1 bg-white/5 border border-white/15 focus:border-[#7DB3FF] outline-none text-white"
              />
              <button
                type="submit"
                disabled={savingHeader || loadingHeader}
                className="ios-glass-btn ios-glass-primary px-5 py-2 text-xs font-semibold cursor-pointer disabled:opacity-40 flex items-center gap-1.5 shrink-0"
              >
                {savingHeader ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Check size={13} />
                )}
                <span>Simpan</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Gallery Items Grid */}
      {errorMsg ? (
        <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {errorMsg}
        </div>
      ) : loading ? (
        <div className="glass-card p-12 rounded-2xl text-center text-text-secondary text-sm">
          Memuat daftar karya seni...
        </div>
      ) : artworks.length === 0 ? (
        <div className="glass-card p-12 rounded-2xl text-center flex flex-col items-center justify-center gap-4 text-[#A8B8CC]">
          <div className="w-14 h-14 rounded-2xl bg-[#7DB3FF]/10 border border-[#7DB3FF]/20 flex items-center justify-center text-[#7DB3FF]">
            <ImageIcon size={26} />
          </div>
          <div className="flex flex-col gap-1 max-w-md">
            <h3 className="text-lg font-medium text-white">Belum Ada Karya di Art Gallery</h3>
            <p className="text-sm font-light leading-relaxed">
              Tambahkan foto, ilustrasi, atau karya visual Anda dengan upload langsung ke Cloudinary tanpa perlu mengisi URL. Setiap foto akan otomatis menyesuaikan ukuran kartu dalam layout menyamping yang abstrak!
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="ios-glass-btn ios-glass-primary px-6 py-2.5 text-xs font-semibold cursor-pointer flex items-center gap-2 mt-2"
          >
            <Plus size={14} />
            <span>Tambah Foto Sekarang</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {artworks.map((item, idx) => (
            <div
              key={item.id}
              className="glass-card p-4 rounded-2xl border border-white/10 bg-[rgba(10,24,42,0.45)] backdrop-blur-xl flex flex-col gap-3 justify-between hover:border-white/20 transition-all"
            >
              {/* Photo Card with dynamic ratio preview */}
              <div 
                className="w-full rounded-xl overflow-hidden bg-black/40 border border-white/10 relative group"
                style={{
                  minHeight: "180px",
                  maxHeight: "260px",
                }}
              >
                <img
                  src={item.imageUrl}
                  alt={item.title || "Artwork"}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  style={{ maxHeight: "260px" }}
                />

                {/* Cloudinary indicator */}
                {item.imageUrl?.includes("cloudinary") && (
                  <span className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/75 text-emerald-400 border border-emerald-500/30" title="Tersimpan di Cloudinary">
                    <Cloud size={12} />
                  </span>
                )}

                {/* Ratio badge */}
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-black/75 text-[#7DB3FF] border border-white/20">
                  {getOrientationLabel(item.aspectRatio || 1)}
                  {item.width && item.height ? ` (${item.width}×${item.height})` : ""}
                </span>

                {item.category && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/75 text-white/80 border border-white/10">
                    {item.category}
                  </span>
                )}
              </div>

              {/* Artwork Details */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-base font-bold text-white truncate">
                    {item.title || <span className="italic text-white/50 font-normal">Tanpa Judul</span>}
                  </h4>
                  {item.year && (
                    <span className="text-xs text-text-muted font-mono shrink-0">
                      {item.year}
                    </span>
                  )}
                </div>
                {item.caption && (
                  <p className="text-xs text-text-secondary font-light line-clamp-2 leading-relaxed">
                    {item.caption}
                  </p>
                )}
              </div>

              {/* Actions & Reordering */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleMoveOrder(idx, "up")}
                    disabled={idx === 0}
                    className="p-1.5 rounded bg-white/5 border border-white/10 text-white/60 hover:text-white disabled:opacity-20 cursor-pointer"
                    title="Geser ke Kiri/Atas"
                  >
                    <MoveUp size={12} />
                  </button>
                  <button
                    onClick={() => handleMoveOrder(idx, "down")}
                    disabled={idx === artworks.length - 1}
                    className="p-1.5 rounded bg-white/5 border border-white/10 text-white/60 hover:text-white disabled:opacity-20 cursor-pointer"
                    title="Geser ke Kanan/Bawah"
                  >
                    <MoveDown size={12} />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="ios-glass-btn px-3 py-1 text-xs text-[#7DB3FF] hover:text-white cursor-pointer flex items-center gap-1"
                  >
                    <Edit3 size={12} />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleDelete(item)}
                    className="ios-glass-btn px-3 py-1 text-xs text-red-400 hover:text-red-300 cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 size={12} />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
          <div className="glass-card max-w-xl w-full p-6 sm:p-8 rounded-3xl border border-white/20 bg-[rgba(10,24,42,0.95)] shadow-2xl flex flex-col gap-6 relative my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <Sparkles size={18} className="text-[#7DB3FF]" />
                <h3 className="text-xl font-bold text-white">
                  {editingId ? "Edit Karya Seni" : "Tambah Karya Seni Baru"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* DIRECT CLOUDINARY PHOTO UPLOAD */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                    <Cloud size={14} className="text-[#7DB3FF]" />
                    <span>Upload Foto (Cloudinary) *</span>
                  </label>
                  {imageUrl && (
                    <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
                      <Check size={12} />
                      <span>Terkoneksi ke Cloudinary</span>
                    </span>
                  )}
                </div>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handlePhotoUpload(e.target.files[0]);
                    }
                  }}
                />

                {/* Error message */}
                {uploadError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Upload Status / Image Preview */}
                {uploadingImage ? (
                  <div className="w-full py-10 px-4 rounded-2xl border-2 border-dashed border-[#7DB3FF]/50 bg-[#7DB3FF]/5 flex flex-col items-center justify-center gap-3 text-center">
                    <Loader2 size={32} className="text-[#7DB3FF] animate-spin" />
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium text-white">
                        Mengunggah foto ke Cloudinary...
                      </p>
                      <p className="text-xs text-[#A8B8CC]">
                        {uploadedFileName || "Menyimpan resolusi asli gambar"}
                      </p>
                    </div>
                  </div>
                ) : imageUrl ? (
                  <div className="w-full rounded-2xl border border-white/15 bg-black/40 overflow-hidden relative group">
                    <div className="min-h-[160px] max-h-[260px] w-full flex items-center justify-center bg-black/60 relative p-2">
                      <img
                        src={imageUrl}
                        alt="Preview"
                        className="max-h-[240px] max-w-full object-contain rounded-lg"
                      />

                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/80 border border-white/15 backdrop-blur-md flex items-center gap-1.5 text-xs text-emerald-400">
                        <Cloud size={13} />
                        <span className="font-medium text-[11px]">Cloudinary</span>
                      </div>

                      {width > 0 && height > 0 && (
                        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/80 border border-white/15 backdrop-blur-md text-[11px] text-[#7DB3FF]">
                          {width} × {height} px ({getOrientationLabel(aspectRatio)})
                        </div>
                      )}
                    </div>

                    {/* Action Bar */}
                    <div className="p-3 bg-[rgba(10,24,42,0.85)] border-t border-white/10 flex items-center justify-between gap-3">
                      <span className="text-xs text-text-secondary truncate">
                        Rasio asli terdeteksi otomatis
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="ios-glass-btn px-3 py-1.5 text-xs text-[#7DB3FF] hover:text-white cursor-pointer flex items-center gap-1.5"
                        >
                          <RefreshCw size={12} />
                          <span>Ganti Foto</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setImageUrl("");
                            setImagePath("");
                            setWidth(0);
                            setHeight(0);
                          }}
                          className="ios-glass-btn px-3 py-1.5 text-xs text-red-400 hover:text-red-300 cursor-pointer flex items-center gap-1.5"
                        >
                          <Trash2 size={12} />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full py-8 px-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-3 text-center ${
                      dragActive
                        ? "border-[#7DB3FF] bg-[#7DB3FF]/15 scale-[0.99]"
                        : "border-white/15 bg-white/[0.02] hover:border-[#7DB3FF]/50 hover:bg-[#7DB3FF]/5"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-[#7DB3FF]/10 border border-[#7DB3FF]/25 flex items-center justify-center text-[#7DB3FF]">
                      <UploadCloud size={24} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium text-white">
                        Klik untuk upload atau seret foto ke sini
                      </p>
                      <p className="text-xs text-[#A8B8CC]">
                        Foto akan terhubung langsung ke Cloudinary tanpa perlu mengisi URL
                      </p>
                      <p className="text-[11px] text-text-muted mt-0.5">
                        Mendukung JPG, PNG, WebP, GIF, SVG, AVIF (Resolusi & ukuran asli dipertahankan)
                      </p>
                    </div>
                  </div>
                )}

                {/* Optional manual URL toggle */}
                <div className="pt-0.5">
                  <button
                    type="button"
                    onClick={() => setShowManualUrl(!showManualUrl)}
                    className="text-[11px] text-[#7DB3FF] hover:underline cursor-pointer"
                  >
                    {showManualUrl ? "— Sembunyikan URL manual" : "+ Atau gunakan URL gambar manual"}
                  </button>
                  {showManualUrl && (
                    <div className="mt-2">
                      <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://res.cloudinary.com/... atau URL gambar lainnya"
                        className="glass-input px-3.5 py-2 rounded-xl text-xs bg-white/5 border border-white/15 focus:border-[#7DB3FF] outline-none text-white placeholder:text-white/30 w-full"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Judul Karya (Opsional)
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: Digital Genesis, Neon Horizon"
                    maxLength={100}
                    className="glass-input px-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/15 focus:border-[#7DB3FF] outline-none text-white placeholder:text-white/30"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Kategori / Medium
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Contoh: Digital Art, Illustration, 3D Render"
                    maxLength={50}
                    className="glass-input px-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/15 focus:border-[#7DB3FF] outline-none text-white placeholder:text-white/30"
                  />
                </div>
              </div>

              {/* Year & Dimensions Note */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Tahun / Periode
                  </label>
                  <input
                    type="text"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="2025"
                    maxLength={20}
                    className="glass-input px-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/15 focus:border-[#7DB3FF] outline-none text-white placeholder:text-white/30"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Orientasi & Layout Kartu
                  </label>
                  <div className="glass-input px-4 py-2.5 rounded-xl text-xs bg-white/5 border border-white/10 text-white/70 flex items-center justify-between">
                    <span>{getOrientationLabel(aspectRatio)}</span>
                    <span className="text-[11px] text-text-muted">
                      {width ? `${width}×${height}px` : "Auto-deteksi"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Caption / Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Catatan / Cerita di Balik Karya (Opsional)
                </label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="Ceritakan eksplorasi visual, tools yang digunakan, atau konsep artistik..."
                  className="glass-input p-4 rounded-xl text-sm leading-relaxed bg-white/5 border border-white/15 focus:border-[#7DB3FF] outline-none text-white placeholder:text-white/30 resize-none"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-white/60 hover:text-white cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingImage || !imageUrl.trim()}
                  className="ios-glass-btn ios-glass-primary px-6 py-2.5 text-xs font-semibold cursor-pointer disabled:opacity-40 flex items-center gap-2"
                >
                  {submitting ? (
                    <span>Menyimpan...</span>
                  ) : uploadingImage ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Mengunggah Foto...</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      <span>{editingId ? "Perbarui Karya" : "Simpan Karya Seni"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(itemToDelete)}
        title="Hapus Karya Seni"
        itemName={itemToDelete?.title || "Karya Tanpa Judul"}
        description="Foto karya seni ini akan dihapus secara permanen dari Art Gallery dan database Firestore."
        isDeleting={isDeletingItem}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!isDeletingItem) setItemToDelete(null);
        }}
      />
    </div>
  );
}

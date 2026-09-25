import React, { useState, useEffect, useRef } from "react";
import { 
  Plus, 
  Trash2, 
  Edit, 
  ExternalLink, 
  Award, 
  X, 
  Check, 
  AlertCircle,
  Search,
  UploadCloud,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  Link2
} from "lucide-react";
import { 
  subscribeToCertificates, 
  createCertificate, 
  updateCertificate, 
  deleteCertificate 
} from "../../features/certificates/api";
import { CertificateItem } from "../../features/certificates/types";
import { uploadFileToCloudinary } from "../../features/profile/api";

const DEFAULT_CATEGORIES = [
  "Engineering",
  "Cloud & DevOps",
  "Frontend Architecture",
  "AI & Data",
  "Design & UI/UX",
  "System Architecture"
];

export function CertificatesView() {
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<CertificateItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Cloudinary Upload State
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showManualUrl, setShowManualUrl] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [issuer, setIssuer] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [credentialId, setCredentialId] = useState("");
  const [credentialUrl, setCredentialUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [imagePath, setImagePath] = useState("");
  const [imagePaths, setImagePaths] = useState<string[]>([]);
  const [aspectRatio, setAspectRatio] = useState(1.4);
  const [category, setCategory] = useState("Engineering");
  const [description, setDescription] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [order, setOrder] = useState<number>(1);
  const [featured, setFeatured] = useState(false);
  const [manualUrlInput, setManualUrlInput] = useState("");

  useEffect(() => {
    const unsubscribe = subscribeToCertificates(
      (items) => {
        setCertificates(items || []);
        setLoading(false);
      },
      (error) => {
        console.error("Certificates fetch error:", error);
        setCertificates([]);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const resetForm = () => {
    setTitle("");
    setIssuer("");
    setIssueDate("");
    setExpirationDate("");
    setCredentialId("");
    setCredentialUrl("");
    setImageUrl("");
    setImages([]);
    setImagePath("");
    setImagePaths([]);
    setAspectRatio(1.4);
    setCategory("Engineering");
    setDescription("");
    setSkillsInput("");
    setOrder(certificates.length + 1);
    setFeatured(false);
    setEditingCert(null);
    setUploadingImage(false);
    setUploadError(null);
    setShowManualUrl(false);
    setManualUrlInput("");
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cert: CertificateItem) => {
    setEditingCert(cert);
    setTitle(cert.title || "");
    setIssuer(cert.issuer || "");
    setIssueDate(cert.issueDate || "");
    setExpirationDate(cert.expirationDate || "");
    setCredentialId(cert.credentialId || "");
    setCredentialUrl(cert.credentialUrl || "");
    
    // Resolve multiple images
    const initialImages = Array.isArray(cert.images) && cert.images.length > 0
      ? cert.images
      : (cert.imageUrl ? [cert.imageUrl] : []);
    
    const initialPaths = Array.isArray(cert.imagePaths) && cert.imagePaths.length > 0
      ? cert.imagePaths
      : (cert.imagePath ? [cert.imagePath] : []);

    setImageUrl(initialImages[0] || "");
    setImages(initialImages);
    setImagePath(initialPaths[0] || "");
    setImagePaths(initialPaths);
    setAspectRatio(cert.aspectRatio || 1.4);
    setCategory(cert.category || "Engineering");
    setDescription(cert.description || "");
    setSkillsInput(cert.skills ? cert.skills.join(", ") : "");
    setOrder(cert.order ?? 1);
    setFeatured(Boolean(cert.featured));
    setUploadingImage(false);
    setUploadError(null);
    setShowManualUrl(false);
    setManualUrlInput("");
    setIsModalOpen(true);
  };

  // Direct Cloudinary Multi-Upload Handler for Certificates
  const handleImageFilesSelect = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter(f => f.type.startsWith("image/"));
    if (fileArray.length === 0) {
      setUploadError("Silakan pilih minimal satu file gambar yang valid (JPG, PNG, WebP, SVG, AVIF).");
      return;
    }

    setUploadingImage(true);
    setUploadError(null);

    try {
      const uploadedUrls: string[] = [];
      const uploadedPaths: string[] = [];

      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];

        // Measure aspect ratio for first image if none set
        if (i === 0 && images.length === 0) {
          const objectUrl = URL.createObjectURL(file);
          const img = new Image();
          img.onload = () => {
            const w = img.naturalWidth || 800;
            const h = img.naturalHeight || 600;
            setAspectRatio(w / h);
            URL.revokeObjectURL(objectUrl);
          };
          img.onerror = () => URL.revokeObjectURL(objectUrl);
          img.src = objectUrl;
        }

        const result = await uploadFileToCloudinary(file);
        uploadedUrls.push(result.url);
        uploadedPaths.push(result.path);
      }

      setImages((prev) => {
        const next = [...prev, ...uploadedUrls];
        if (next.length > 0) setImageUrl(next[0]);
        return next;
      });

      setImagePaths((prev) => {
        const next = [...prev, ...uploadedPaths];
        if (next.length > 0) setImagePath(next[0]);
        return next;
      });

      setUploadingImage(false);
    } catch (err: any) {
      console.error("Cloudinary certificate upload failed:", err);
      setUploadError(err?.message || "Gagal mengunggah gambar sertifikat ke Cloudinary.");
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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageFilesSelect(e.dataTransfer.files);
    }
  };

  const handleAddManualUrl = () => {
    const url = manualUrlInput.trim();
    if (!url) return;
    setImages(prev => {
      const next = [...prev, url];
      if (next.length === 1) setImageUrl(url);
      return next;
    });
    setManualUrlInput("");
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => {
      const next = prev.filter((_, i) => i !== index);
      setImageUrl(next[0] || "");
      return next;
    });
    setImagePaths(prev => {
      const next = prev.filter((_, i) => i !== index);
      setImagePath(next[0] || "");
      return next;
    });
  };

  const handleSetCoverImage = (index: number) => {
    if (index === 0) return;
    setImages(prev => {
      const target = prev[index];
      const rest = prev.filter((_, i) => i !== index);
      const next = [target, ...rest];
      setImageUrl(next[0]);
      return next;
    });
    setImagePaths(prev => {
      if (prev.length <= index) return prev;
      const target = prev[index];
      const rest = prev.filter((_, i) => i !== index);
      const next = [target, ...rest];
      setImagePath(next[0]);
      return next;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !issuer.trim()) {
      setFeedback({ type: "error", message: "Judul dan Lembaga Penerbit sertifikat wajib diisi." });
      return;
    }

    const finalImages = images.filter(Boolean);
    const finalImageUrl = finalImages[0] || imageUrl.trim();

    if (!finalImageUrl) {
      setFeedback({ type: "error", message: "Silakan unggah minimal 1 gambar sertifikat." });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    const skills = skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      if (editingCert) {
        await updateCertificate(editingCert.id, {
          title,
          issuer,
          issueDate,
          expirationDate,
          credentialId,
          credentialUrl,
          imageUrl: finalImageUrl,
          images: finalImages,
          imagePath: imagePaths[0] || imagePath || "",
          imagePaths: imagePaths,
          aspectRatio,
          category,
          description,
          skills,
          order: Number(order) || 1,
          featured
        });
        setFeedback({ type: "success", message: "Sertifikat berhasil diperbarui!" });
      } else {
        await createCertificate({
          title,
          issuer,
          issueDate,
          expirationDate,
          credentialId,
          credentialUrl,
          imageUrl: finalImageUrl,
          images: finalImages,
          imagePath: imagePaths[0] || imagePath || "",
          imagePaths: imagePaths,
          aspectRatio,
          category,
          description,
          skills,
          order: Number(order) || certificates.length + 1,
          featured
        });
        setFeedback({ type: "success", message: "Sertifikat baru berhasil diposting!" });
      }

      setIsModalOpen(false);
      resetForm();
    } catch (err: any) {
      console.error("Save certificate error:", err);
      setFeedback({ type: "error", message: err.message || "Gagal menyimpan data sertifikat." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsSubmitting(true);
    try {
      await deleteCertificate(id);
      setFeedback({ type: "success", message: "Sertifikat berhasil dihapus!" });
      setDeleteId(null);
    } catch (err: any) {
      console.error("Delete error:", err);
      setFeedback({ type: "error", message: "Gagal menghapus sertifikat." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = ["All", ...Array.from(new Set(certificates.map((c) => c.category).filter(Boolean)))];

  const filteredCertificates = certificates.filter((c) => {
    const matchesCategory = selectedCategory === "All" || c.category === selectedCategory;
    const matchesQuery = 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.issuer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.skills && c.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="flex flex-col gap-8">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-medium text-white flex items-center gap-2.5">
            <Award className="text-[#7DB3FF]" size={24} />
            <span>Manajemen Certificate</span>
          </h2>
          <p className="text-text-secondary text-sm font-light">
            Kelola sertifikasi profesional dan unggah gambar langsung terintegrasi Cloudinary.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="ios-glass-btn ios-glass-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-wider cursor-pointer flex items-center gap-2 shadow-lg self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Tambah Sertifikat</span>
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
            onClick={() => setFeedback(null)} 
            className="text-white/60 hover:text-white text-xs cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      {certificates.length > 0 && (
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
            <input
              type="text"
              placeholder="Cari berdasarkan judul, penerbit, atau skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[rgba(6,15,35,0.4)] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#7DB3FF]/50"
            />
          </div>

          {categories.length > 2 && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`ios-glass-btn px-3 py-1.5 text-xs font-medium cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat ? "ios-glass-primary text-white" : "text-text-secondary"
                  }`}
                >
                  <span>{cat}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Certificates Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-[#7DB3FF]/30 border-t-[#7DB3FF] animate-spin" />
        </div>
      ) : certificates.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl text-center flex flex-col items-center gap-4 text-text-secondary border border-white/10 bg-[rgba(6,15,35,0.3)]">
          <Award size={40} className="text-[#7DB3FF]/60" />
          <div className="flex flex-col gap-1 max-w-md">
            <h3 className="text-lg font-medium text-white">Belum Ada Sertifikat yang Diposting</h3>
            <p className="text-sm font-light">
              Klik tombol "Tambah Sertifikat" untuk mengunggah gambar sertifikat dari perangkat Anda.
            </p>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="ios-glass-btn ios-glass-primary px-5 py-2 text-xs font-semibold uppercase tracking-wider cursor-pointer flex items-center gap-1.5 mt-2"
          >
            <Plus size={14} />
            <span>Posting Sertifikat Pertama</span>
          </button>
        </div>
      ) : filteredCertificates.length === 0 ? (
        <div className="glass-card p-8 rounded-2xl text-center text-text-secondary">
          <p className="text-sm">Tidak ada sertifikat yang cocok dengan pencarian.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCertificates.map((cert) => (
            <div
              key={cert.id}
              className="glass-card rounded-2xl overflow-hidden border border-white/10 bg-[rgba(6,15,35,0.45)] hover:border-[rgba(120,170,255,0.35)] transition-all flex flex-col justify-between group"
            >
              {/* Image Preview */}
              <div className="relative aspect-[16/10] bg-black/40 overflow-hidden">
                <img
                  src={cert.imageUrl}
                  alt={cert.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
                
                {/* Category & Featured Badge & Photo Count */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[rgba(6,15,35,0.75)] border border-white/20 text-white backdrop-blur-md">
                    {cert.category}
                  </span>
                  {cert.images && cert.images.length > 1 && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#7DB3FF]/20 border border-[#7DB3FF]/40 text-[#7DB3FF] backdrop-blur-md">
                      <ImageIcon size={10} />
                      <span>{cert.images.length} Foto</span>
                    </span>
                  )}
                  {cert.featured && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/80 text-black shadow-sm">
                      Featured
                    </span>
                  )}
                </div>

                <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenEditModal(cert)}
                    className="p-1.5 rounded-lg bg-[rgba(6,15,35,0.85)] border border-white/20 text-white hover:text-[#7DB3FF] cursor-pointer"
                    title="Edit"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteId(cert.id)}
                    className="p-1.5 rounded-lg bg-[rgba(6,15,35,0.85)] border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 cursor-pointer"
                    title="Hapus"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex flex-col gap-3 flex-1 justify-between">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs text-text-secondary">
                    <span className="font-medium text-[#7DB3FF]">{cert.issuer}</span>
                    <span>{cert.issueDate}</span>
                  </div>

                  <h3 className="text-base font-medium text-white line-clamp-2 leading-snug">
                    {cert.title}
                  </h3>

                  {cert.description && (
                    <p className="text-xs text-text-secondary font-light line-clamp-2 leading-relaxed">
                      {cert.description}
                    </p>
                  )}
                </div>

                {/* Skills tags */}
                {cert.skills && cert.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/5">
                    {cert.skills.slice(0, 4).map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md text-[11px] bg-white/[0.05] border border-white/10 text-white/80"
                      >
                        {s}
                      </span>
                    ))}
                    {cert.skills.length > 4 && (
                      <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-white/[0.05] text-white/50">
                        +{cert.skills.length - 4}
                      </span>
                    )}
                  </div>
                )}

                {/* Verification Link */}
                <div className="pt-2 flex items-center justify-between border-t border-white/5 text-xs text-text-secondary">
                  <span>ID: {cert.credentialId || "N/A"}</span>
                  {cert.credentialUrl ? (
                    <a
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#7DB3FF] hover:underline flex items-center gap-1"
                    >
                      <span>Verify</span>
                      <ExternalLink size={12} />
                    </a>
                  ) : (
                    <span className="text-white/30">Verified</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL WITH CLOUDINARY UPLOAD */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="glass-card w-full max-w-2xl bg-[rgba(10,24,45,0.96)] border border-white/20 rounded-3xl p-6 sm:p-8 flex flex-col gap-6 max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-xl font-display font-medium text-white flex items-center gap-2">
                <Award className="text-[#7DB3FF]" size={20} />
                <span>{editingCert ? "Edit Sertifikat" : "Tambah Sertifikat Baru"}</span>
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="p-1 rounded-full text-white/60 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-5">
              {/* CLOUDINARY MULTI-IMAGE UPLOAD ZONE */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-white/90 flex items-center gap-1.5">
                    <ImageIcon size={14} className="text-[#7DB3FF]" />
                    <span>
                      Foto Sertifikat ({images.length} Foto) <span className="text-rose-400">*</span>
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowManualUrl(!showManualUrl)}
                    className="text-[11px] text-[#7DB3FF] hover:underline cursor-pointer flex items-center gap-1 font-normal"
                  >
                    <Link2 size={12} />
                    <span>{showManualUrl ? "Gunakan Upload File" : "Input URL Manual"}</span>
                  </button>
                </div>

                {/* Hidden File Input for Multiple Uploads */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleImageFilesSelect(e.target.files);
                    }
                  }}
                />

                {/* Uploaded Images Thumbnail Strip / Grid */}
                {images.length > 0 && (
                  <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-[rgba(6,15,35,0.7)] border border-white/15">
                    <div className="flex items-center justify-between text-xs text-text-secondary pb-2 border-b border-white/10">
                      <span>Daftar Foto Sertifikat (Foto pertama adalah Cover Utama)</span>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="text-[11px] text-[#7DB3FF] hover:text-white flex items-center gap-1 font-medium cursor-pointer"
                      >
                        <Plus size={13} />
                        <span>Tambah Foto Lagi</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                      {images.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          className={`relative group rounded-xl overflow-hidden border ${
                            idx === 0
                              ? "border-[#7DB3FF] shadow-[0_0_12px_rgba(125,179,255,0.25)] ring-1 ring-[#7DB3FF]"
                              : "border-white/15 bg-black/40"
                          } bg-black/50 aspect-[4/3] flex flex-col justify-between`}
                        >
                          <img
                            src={imgUrl}
                            alt={`Foto ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />

                          {/* Top Badges */}
                          <div className="absolute top-1.5 left-1.5 right-1.5 flex items-center justify-between z-10">
                            {idx === 0 ? (
                              <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-[#7DB3FF] text-black shadow-md">
                                Cover Utama
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-mono bg-black/70 text-white/80 border border-white/20 backdrop-blur-sm">
                                #{idx + 1}
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="p-1 rounded-md bg-black/70 hover:bg-rose-500/80 text-white/80 hover:text-white transition-colors cursor-pointer backdrop-blur-sm"
                              title="Hapus foto ini"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>

                          {/* Bottom Action: Set as Cover */}
                          {idx > 0 && (
                            <button
                              type="button"
                              onClick={() => handleSetCoverImage(idx)}
                              className="absolute bottom-1.5 left-1.5 right-1.5 py-1 text-[10px] font-medium bg-[rgba(6,15,35,0.85)] hover:bg-[#7DB3FF] text-white hover:text-black rounded-lg border border-white/20 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 backdrop-blur-sm cursor-pointer"
                            >
                              <Check size={10} />
                              <span>Jadikan Cover</span>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload Zone (Dropzone) */}
                {!showManualUrl ? (
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-5 sm:p-6 flex flex-col items-center justify-center gap-2.5 text-center cursor-pointer transition-all ${
                      dragActive
                        ? "border-[#7DB3FF] bg-[#7DB3FF]/15 scale-[0.99]"
                        : "border-white/20 bg-white/[0.03] hover:border-[#7DB3FF]/50 hover:bg-white/[0.06]"
                    }`}
                  >
                    {uploadingImage ? (
                      <div className="flex flex-col items-center gap-2 py-3 text-[#7DB3FF]">
                        <Loader2 size={28} className="animate-spin" />
                        <span className="text-xs font-medium">Mengunggah ke Cloudinary...</span>
                      </div>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-xl bg-[#7DB3FF]/15 border border-[#7DB3FF]/30 text-[#7DB3FF] flex items-center justify-center">
                          <UploadCloud size={20} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <p className="text-xs sm:text-sm font-medium text-white">
                            {images.length > 0 ? "Klik untuk menambah foto sertifikat lainnya" : "Klik untuk upload foto sertifikat (Bisa pilih 2 foto atau lebih)"}
                          </p>
                          <p className="text-[11px] text-text-secondary">
                            Mendukung JPG, PNG, WebP, SVG, AVIF. Otomatis terunggah & dioptimasi ke Cloudinary.
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  /* Manual URL Input */
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://res.cloudinary.com/... atau URL gambar"
                      value={manualUrlInput}
                      onChange={(e) => setManualUrlInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddManualUrl();
                        }
                      }}
                      className="flex-1 bg-[rgba(6,15,35,0.6)] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#7DB3FF]"
                    />
                    <button
                      type="button"
                      onClick={handleAddManualUrl}
                      className="ios-glass-btn px-4 py-2.5 text-xs text-white font-medium cursor-pointer shrink-0"
                    >
                      + Tambah
                    </button>
                  </div>
                )}

                {uploadError && (
                  <p className="text-xs text-rose-400 flex items-center gap-1.5 mt-1">
                    <AlertCircle size={13} />
                    <span>{uploadError}</span>
                  </p>
                )}
              </div>

              {/* Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-text-secondary">
                  Judul Sertifikasi <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Google Cloud Professional Cloud Architect"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[rgba(6,15,35,0.6)] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#7DB3FF]"
                />
              </div>

              {/* Issuer & Issue Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-text-secondary">
                    Lembaga Penerbit (Issuer) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Google Cloud / Meta / AWS"
                    value={issuer}
                    onChange={(e) => setIssuer(e.target.value)}
                    className="w-full bg-[rgba(6,15,35,0.6)] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#7DB3FF]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-text-secondary">
                    Tahun / Tanggal Terbit
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 2024 atau Okt 2024"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full bg-[rgba(6,15,35,0.6)] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#7DB3FF]"
                  />
                </div>
              </div>

              {/* Category & Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-text-secondary">
                    Kategori Sertifikat
                  </label>
                  <input
                    type="text"
                    list="cert-categories-list-2"
                    placeholder="Pilih atau ketik kategori baru"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[rgba(6,15,35,0.6)] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#7DB3FF]"
                  />
                  <datalist id="cert-categories-list-2">
                    {DEFAULT_CATEGORIES.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-text-secondary">
                    Urutan Tampil (Order)
                  </label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    className="w-full bg-[rgba(6,15,35,0.6)] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#7DB3FF]"
                  />
                </div>
              </div>

              {/* Credential ID & Verification URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-text-secondary">
                    ID Kredensial / No. Sertifikat
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: GCP-882941"
                    value={credentialId}
                    onChange={(e) => setCredentialId(e.target.value)}
                    className="w-full bg-[rgba(6,15,35,0.6)] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#7DB3FF]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-text-secondary">
                    Tautan Verifikasi (Credential URL)
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={credentialUrl}
                    onChange={(e) => setCredentialUrl(e.target.value)}
                    className="w-full bg-[rgba(6,15,35,0.6)] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#7DB3FF]"
                  />
                </div>
              </div>

              {/* Skills Tags */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-text-secondary">
                  Keahlian Terkait (Skills / Tags) - pisahkan dengan koma
                </label>
                <input
                  type="text"
                  placeholder="Contoh: React, TypeScript, Cloud Architecture, Docker"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  className="w-full bg-[rgba(6,15,35,0.6)] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#7DB3FF]"
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-text-secondary">
                  Deskripsi / Cakupan Materi
                </label>
                <textarea
                  rows={3}
                  placeholder="Penjelasan ringkas mengenai kompetensi yang diverifikasi dalam sertifikat ini..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[rgba(6,15,35,0.6)] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#7DB3FF] resize-none"
                />
              </div>

              {/* Featured checkbox */}
              <label className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/10 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="rounded border-white/20 text-[#7DB3FF] focus:ring-0"
                />
                <span className="text-xs text-white font-medium">
                  Tandai sebagai Sertifikat Utama (Featured)
                </span>
              </label>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="ios-glass-btn px-5 py-2.5 text-xs text-white/70 hover:text-white cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || uploadingImage}
                  className="ios-glass-btn ios-glass-primary px-6 py-2.5 text-xs font-semibold uppercase tracking-wider cursor-pointer"
                >
                  {isSubmitting ? "Menyimpan..." : editingCert ? "Simpan Perubahan" : "Posting Sertifikat"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-md bg-[rgba(10,24,45,0.95)] border border-rose-500/30 rounded-2xl p-6 flex flex-col gap-4">
            <h3 className="text-lg font-medium text-white flex items-center gap-2 text-rose-400">
              <AlertCircle size={20} />
              <span>Konfirmasi Hapus</span>
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Apakah Anda yakin ingin menghapus sertifikat ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteId(null)}
                className="ios-glass-btn px-4 py-2 text-xs text-white/70 hover:text-white cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={isSubmitting}
                className="ios-glass-btn px-5 py-2 text-xs font-semibold bg-rose-500/20 border-rose-500/50 text-rose-300 hover:bg-rose-500/40 cursor-pointer"
              >
                {isSubmitting ? "Menghapus..." : "Hapus Sertifikat"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect, useRef } from "react";
import { 
  Plus, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Image as ImageIcon, 
  Video, 
  Sparkles, 
  Check, 
  X, 
  MoveUp, 
  MoveDown,
  Layers,
  UploadCloud,
  Cloud,
  Loader2,
  AlertCircle,
  RefreshCw,
  Film,
  FileText
} from "lucide-react";
import { subscribeToProjects, createProject, updateProject, deleteProject } from "../../features/projects/api";
import { ProjectItem } from "../../features/projects/types";
import { uploadFileToCloudinary, getProfile, updateProfile } from "../../features/profile/api";
import { DeleteConfirmModal } from "../../components/common/DeleteConfirmModal";

export function ProjectsView() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Project Page Header Settings (Migrated from Site Content)
  const [pageDescription, setPageDescription] = useState("");
  const [loadingPageDesc, setLoadingPageDesc] = useState(true);
  const [savingPageDesc, setSavingPageDesc] = useState(false);
  const [pageDescMsg, setPageDescMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Custom Delete Modal State
  const [projectToDelete, setProjectToDelete] = useState<ProjectItem | null>(null);
  const [isDeletingProject, setIsDeletingProject] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaPath, setMediaPath] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [badge, setBadge] = useState("Featured");
  const [categories, setCategories] = useState<string[]>(["Web App"]);
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [hyperlink, setHyperlink] = useState("");
  const [githubUrl, setGithubUrl] = useState("");

  // Cloudinary Direct Upload States
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [showManualUrl, setShowManualUrl] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = subscribeToProjects(
      (items) => {
        setProjects(items);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching projects:", err);
        setErrorMsg("Gagal memuat daftar project.");
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch real-time or initial Project Page description from site_content/profile
  useEffect(() => {
    let isMounted = true;
    getProfile()
      .then((profile) => {
        if (isMounted && profile) {
          setPageDescription(profile.projectDescription ?? "");
        }
        if (isMounted) setLoadingPageDesc(false);
      })
      .catch((err) => {
        console.error("Error loading project description:", err);
        if (isMounted) setLoadingPageDesc(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSavePageDescription = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPageDesc(true);
    setPageDescMsg(null);
    try {
      await updateProfile({ projectDescription: pageDescription });
      setPageDescMsg({ type: "success", text: "Deskripsi header halaman project berhasil disimpan!" });
      setTimeout(() => setPageDescMsg(null), 4000);
    } catch (err: any) {
      console.error("Failed to save project page description:", err);
      setPageDescMsg({ type: "error", text: err?.message || "Gagal menyimpan deskripsi halaman." });
    } finally {
      setSavingPageDesc(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setMediaUrl("");
    setMediaPath("");
    setMediaType("image");
    setBadge("Featured");
    setCategories(["Web App"]);
    setNewCategoryInput("");
    setHyperlink("");
    setGithubUrl("");
    setEditingId(null);
    setUploadingMedia(false);
    setUploadError(null);
    setUploadedFileName("");
    setShowManualUrl(false);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (project: ProjectItem) => {
    setEditingId(project.id);
    setTitle(project.title || "");
    setDescription(project.description || "");
    setMediaUrl(project.mediaUrl || "");
    setMediaPath(project.mediaPath || "");
    setMediaType(project.mediaType || "image");
    setBadge(project.badge || "Featured");
    setCategories(Array.isArray(project.categories) ? project.categories : []);
    setHyperlink(project.hyperlink || "");
    setGithubUrl(project.githubUrl || "");
    setUploadingMedia(false);
    setUploadError(null);
    setUploadedFileName("");
    setShowManualUrl(false);
    setIsModalOpen(true);
  };

  // Direct Cloudinary Upload handler
  const handleMediaFileUpload = async (file: File) => {
    if (!file) return;

    // Validate mime type
    const isVideo = file.type.startsWith("video") || /\.(mp4|webm|mov|mkv)$/i.test(file.name);
    const isImage = file.type.startsWith("image") || /\.(jpg|jpeg|png|webp|gif|svg|avif)$/i.test(file.name);

    if (!isVideo && !isImage) {
      setUploadError("Format file tidak didukung. Silakan pilih file gambar (JPG, PNG, WebP) atau video (MP4, WebM).");
      return;
    }

    setUploadingMedia(true);
    setUploadError(null);
    setUploadedFileName(file.name);
    const detectedType = isVideo ? "video" : "image";
    setMediaType(detectedType);

    try {
      const result = await uploadFileToCloudinary(file);
      setMediaUrl(result.url);
      setMediaPath(result.path);
      setUploadingMedia(false);
    } catch (err: any) {
      console.error("Cloudinary media upload failed:", err);
      setUploadError(err?.message || "Gagal mengunggah media ke Cloudinary. Silakan periksa koneksi internet Anda.");
      setUploadingMedia(false);
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
      handleMediaFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleAddCategory = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const val = newCategoryInput.trim();
    if (!val) return;
    if (!categories.includes(val)) {
      setCategories([...categories, val]);
    }
    setNewCategoryInput("");
  };

  const handleRemoveCategory = (catToRemove: string) => {
    setCategories(categories.filter((c) => c !== catToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadingMedia) {
      alert("Sedang mengunggah media ke Cloudinary. Mohon tunggu proses selesai sebelum menyimpan.");
      return;
    }

    if (!title.trim() || !description.trim() || submitting) return;

    if (!mediaUrl.trim()) {
      alert("Mohon upload gambar atau video project terlebih dahulu melalui area Cloudinary.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await updateProject(editingId, {
          title: title.trim(),
          description: description.trim(),
          mediaUrl: mediaUrl.trim(),
          mediaPath: mediaPath.trim(),
          mediaType,
          badge: badge.trim(),
          categories,
          hyperlink: hyperlink.trim(),
          githubUrl: githubUrl.trim(),
        });
      } else {
        await createProject({
          title: title.trim(),
          description: description.trim(),
          mediaUrl: mediaUrl.trim(),
          mediaPath: mediaPath.trim(),
          mediaType,
          badge: badge.trim(),
          categories,
          hyperlink: hyperlink.trim(),
          githubUrl: githubUrl.trim(),
          order: projects.length,
        });
      }
      setIsModalOpen(false);
      resetForm();
    } catch (err: any) {
      console.error("Failed to save project:", err);
      alert("Gagal menyimpan project: " + (err?.message || "Terjadi kesalahan"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (project: ProjectItem) => {
    setProjectToDelete(project);
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    setIsDeletingProject(true);
    try {
      await deleteProject(projectToDelete.id);
      setProjectToDelete(null);
    } catch (err: any) {
      console.error("Failed to delete project:", err);
      alert("Gagal menghapus project: " + (err?.message || "Periksa koneksi dan izin."));
    } finally {
      setIsDeletingProject(false);
    }
  };

  const handleMoveOrder = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= projects.length) return;

    const currentProj = projects[index];
    const targetProj = projects[targetIndex];

    try {
      await updateProject(currentProj.id, { order: targetIndex });
      await updateProject(targetProj.id, { order: index });
    } catch (err: any) {
      console.error("Failed to update order:", err);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-medium text-white flex items-center gap-2.5">
            <Layers className="text-[#7DB3FF]" size={22} />
            <span>Manajemen Project Portfolio</span>
          </h2>
          <p className="text-text-secondary text-sm font-light mt-1">
            Tambah, edit, dan kelola semua project dengan upload media langsung ke Cloudinary.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="ios-glass-btn ios-glass-primary px-5 py-2.5 text-xs font-semibold cursor-pointer flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>Tambah Project Baru</span>
        </button>
      </div>

      {/* Projects Page Section (Header & Description on /projects) */}
      <div className="glass-card p-6 rounded-2xl border border-white/10 bg-[rgba(10,24,42,0.4)] backdrop-blur-xl flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <FileText size={18} className="text-[#7DB3FF]" />
            <div>
              <h3 className="text-lg font-display text-white">Projects Page</h3>
              <p className="text-xs text-text-secondary font-light">
                Kelola deskripsi header yang ditampilkan pada halaman publik Project (/projects).
              </p>
            </div>
          </div>
          {pageDescMsg && (
            <div
              className={`px-3 py-1 rounded-lg text-xs flex items-center gap-1.5 self-start sm:self-auto ${
                pageDescMsg.type === "success"
                  ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                  : "bg-red-500/15 border border-red-500/30 text-red-400"
              }`}
            >
              {pageDescMsg.type === "success" ? <Check size={13} /> : <AlertCircle size={13} />}
              <span>{pageDescMsg.text}</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSavePageDescription} className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-sm text-text-secondary">Project Header Description (Paragraf)</label>
              <span className="text-xs text-text-muted font-mono">
                {pageDescription.length} karakter
              </span>
            </div>
            <textarea
              value={pageDescription}
              onChange={(e) => setPageDescription(e.target.value)}
              className="glass-input px-4 py-3 rounded-lg w-full min-h-[90px] resize-y leading-relaxed text-sm bg-white/5 border border-white/15 focus:border-[#7DB3FF] outline-none text-white placeholder:text-white/30"
              placeholder="A curated collection of digital products, experimental tools, and scalable applications engineered with precision, performance, and modern web aesthetics."
            />
            <p className="text-[11px] text-text-muted">
              Teks paragraf ini ditampilkan di bawah judul &quot;Project&quot; pada halaman Projects.
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingPageDesc || loadingPageDesc}
              className="ios-glass-btn ios-glass-primary px-5 py-2 text-xs font-semibold cursor-pointer disabled:opacity-40 flex items-center gap-2"
            >
              {savingPageDesc ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Check size={13} />
                  <span>Simpan Deskripsi Halaman</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Projects List Feed */}
      {errorMsg ? (
        <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {errorMsg}
        </div>
      ) : loading ? (
        <div className="glass-card p-12 rounded-2xl text-center text-text-secondary text-sm">
          Memuat daftar project...
        </div>
      ) : projects.length === 0 ? (
        <div className="glass-card p-12 rounded-2xl text-center flex flex-col items-center justify-center gap-4 text-[#A8B8CC]">
          <div className="w-14 h-14 rounded-2xl bg-[#7DB3FF]/10 border border-[#7DB3FF]/20 flex items-center justify-center text-[#7DB3FF]">
            <Layers size={26} />
          </div>
          <div className="flex flex-col gap-1 max-w-md">
            <h3 className="text-lg font-medium text-white">Belum Ada Project</h3>
            <p className="text-sm font-light leading-relaxed">
              Halaman <strong>Project</strong> saat ini belum menampilkan project karena Anda belum menambahkannya. Klik tombol di bawah untuk membuat project pertama Anda dengan media yang langsung terunggah ke Cloudinary!
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="ios-glass-btn ios-glass-primary px-6 py-2.5 text-xs font-semibold cursor-pointer flex items-center gap-2 mt-2"
          >
            <Plus size={14} />
            <span>Tambah Project Sekarang</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {projects.map((project, idx) => (
            <div
              key={project.id}
              className="glass-card p-5 rounded-2xl border border-white/10 bg-[rgba(10,24,42,0.45)] backdrop-blur-xl flex flex-col md:flex-row gap-5 items-start md:items-center justify-between transition-all hover:border-white/20"
            >
              {/* Media Preview Thumbnail */}
              <div className="w-full md:w-40 h-28 rounded-xl overflow-hidden shrink-0 bg-black/40 border border-white/10 relative">
                {project.mediaType === "video" ? (
                  <video
                    src={project.mediaUrl}
                    className="w-full h-full object-cover"
                    muted
                    loop
                    autoPlay
                    playsInline
                  />
                ) : (
                  <img
                    src={project.mediaUrl}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                )}
                {project.badge && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-semibold tracking-wider uppercase bg-black/75 border border-white/20 text-[#7DB3FF]">
                    {project.badge}
                  </span>
                )}
                {project.mediaUrl?.includes("cloudinary") && (
                  <span className="absolute bottom-1.5 right-1.5 p-1 rounded-md bg-black/75 text-emerald-400 border border-emerald-500/30" title="Tersimpan di Cloudinary">
                    <Cloud size={11} />
                  </span>
                )}
              </div>

              {/* Info Body */}
              <div className="flex flex-col gap-2 flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-lg font-bold text-white truncate">
                    {project.title}
                  </h3>
                  {project.hyperlink && (
                    <a
                      href={project.hyperlink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#7DB3FF] hover:underline flex items-center gap-1"
                    >
                      <span>Lihat Link</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-text-secondary font-light line-clamp-2 leading-relaxed">
                  {project.description}
                </p>

                {/* Categories */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {project.categories?.map((cat) => (
                    <span
                      key={cat}
                      className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/[0.05] border border-white/10 text-white/70"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                {/* Reorder Buttons */}
                <div className="flex flex-col gap-1 mr-2">
                  <button
                    onClick={() => handleMoveOrder(idx, "up")}
                    disabled={idx === 0}
                    className="p-1 rounded bg-white/5 border border-white/10 text-white/60 hover:text-white disabled:opacity-20 cursor-pointer"
                    title="Pindah ke Atas"
                  >
                    <MoveUp size={12} />
                  </button>
                  <button
                    onClick={() => handleMoveOrder(idx, "down")}
                    disabled={idx === projects.length - 1}
                    className="p-1 rounded bg-white/5 border border-white/10 text-white/60 hover:text-white disabled:opacity-20 cursor-pointer"
                    title="Pindah ke Bawah"
                  >
                    <MoveDown size={12} />
                  </button>
                </div>

                <button
                  onClick={() => handleOpenEdit(project)}
                  className="ios-glass-btn px-3 py-1.5 text-xs text-[#7DB3FF] hover:text-white cursor-pointer flex items-center gap-1.5"
                >
                  <Edit3 size={13} />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => handleDelete(project)}
                  className="ios-glass-btn px-3 py-1.5 text-xs text-red-400 hover:text-red-300 cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 size={13} />
                  <span>Hapus</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
          <div className="glass-card max-w-2xl w-full p-6 sm:p-8 rounded-3xl border border-white/20 bg-[rgba(10,24,42,0.95)] shadow-2xl flex flex-col gap-6 relative my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <Sparkles size={18} className="text-[#7DB3FF]" />
                <h3 className="text-xl font-bold text-white">
                  {editingId ? "Edit Project" : "Tambah Project Baru"}
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
              {/* Title (h2) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Title Projek (h2) *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Artha — Financial AI OS"
                  maxLength={120}
                  className="glass-input px-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/15 focus:border-[#7DB3FF] outline-none text-white placeholder:text-white/30"
                  required
                />
              </div>

              {/* DIRECT CLOUDINARY MEDIA UPLOAD */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                    <Cloud size={14} className="text-[#7DB3FF]" />
                    <span>Gambar / Media Projek (Cloudinary) *</span>
                  </label>
                  {mediaUrl && (
                    <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
                      <Check size={12} />
                      <span>Tersambung ke Cloudinary</span>
                    </span>
                  )}
                </div>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleMediaFileUpload(e.target.files[0]);
                    }
                  }}
                />

                {/* Upload Error Banner */}
                {uploadError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Upload State / Preview Container */}
                {uploadingMedia ? (
                  <div className="w-full py-10 px-4 rounded-2xl border-2 border-dashed border-[#7DB3FF]/50 bg-[#7DB3FF]/5 flex flex-col items-center justify-center gap-3 text-center">
                    <Loader2 size={32} className="text-[#7DB3FF] animate-spin" />
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium text-white">
                        Mengunggah media ke Cloudinary...
                      </p>
                      <p className="text-xs text-[#A8B8CC]">
                        {uploadedFileName || "Menyimpan file langsung ke cloud storage"}
                      </p>
                    </div>
                  </div>
                ) : mediaUrl ? (
                  /* Media Uploaded Preview */
                  <div className="w-full rounded-2xl border border-white/15 bg-black/40 overflow-hidden relative group">
                    <div className="h-52 w-full flex items-center justify-center bg-black/60 relative">
                      {mediaType === "video" ? (
                        <video
                          src={mediaUrl}
                          className="w-full h-full object-contain"
                          controls
                          playsInline
                        />
                      ) : (
                        <img
                          src={mediaUrl}
                          alt="Preview"
                          className="w-full h-full object-contain"
                        />
                      )}

                      {/* Floating Cloudinary badge */}
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/80 border border-white/15 backdrop-blur-md flex items-center gap-1.5 text-xs text-emerald-400">
                        <Cloud size={13} />
                        <span className="font-medium text-[11px]">Cloudinary Active</span>
                      </div>

                      {/* Type indicator */}
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/80 border border-white/15 backdrop-blur-md flex items-center gap-1.5 text-xs text-[#7DB3FF]">
                        {mediaType === "video" ? <Film size={12} /> : <ImageIcon size={12} />}
                        <span className="font-medium text-[11px] uppercase tracking-wide">
                          {mediaType === "video" ? "Video" : "Gambar"}
                        </span>
                      </div>
                    </div>

                    {/* Action Bar beneath preview */}
                    <div className="p-3 bg-[rgba(10,24,42,0.85)] border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs text-text-secondary">
                        <span>Tipe Media:</span>
                        <select
                          value={mediaType}
                          onChange={(e) => setMediaType(e.target.value as "image" | "video")}
                          className="glass-input px-2.5 py-1 rounded-lg text-xs bg-white/5 border border-white/15 text-white"
                        >
                          <option value="image" className="bg-[#0A182A]">Gambar (Image)</option>
                          <option value="video" className="bg-[#0A182A]">Video</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="ios-glass-btn px-3 py-1.5 text-xs text-[#7DB3FF] hover:text-white cursor-pointer flex items-center gap-1.5"
                        >
                          <RefreshCw size={12} />
                          <span>Ganti File Cloudinary</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMediaUrl("");
                            setMediaPath("");
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
                  /* Drag & Drop Upload Zone */
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
                        Klik untuk upload atau seret gambar / video ke sini
                      </p>
                      <p className="text-xs text-[#A8B8CC]">
                        File akan langsung diunggah ke Cloudinary tanpa perlu mengisi URL secara manual
                      </p>
                      <p className="text-[11px] text-text-muted mt-1">
                        Mendukung JPG, PNG, WebP, GIF, MP4, WebM (Auto-deteksi)
                      </p>
                    </div>
                  </div>
                )}

                {/* Optional manual URL toggle for rare cases */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowManualUrl(!showManualUrl)}
                    className="text-[11px] text-[#7DB3FF] hover:underline cursor-pointer"
                  >
                    {showManualUrl ? "— Sembunyikan URL manual" : "+ Atau gunakan URL manual jika diperlukan"}
                  </button>
                  {showManualUrl && (
                    <div className="mt-2 flex flex-col gap-1">
                      <input
                        type="url"
                        value={mediaUrl}
                        onChange={(e) => setMediaUrl(e.target.value)}
                        placeholder="https://res.cloudinary.com/... atau URL lainnya"
                        className="glass-input px-3.5 py-2 rounded-xl text-xs bg-white/5 border border-white/15 focus:border-[#7DB3FF] outline-none text-white placeholder:text-white/30"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Lencana (span) & Hyperlink (a) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Lencana / Badge (span)
                  </label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="Contoh: Featured, Web App, Active"
                    maxLength={50}
                    className="glass-input px-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/15 focus:border-[#7DB3FF] outline-none text-white placeholder:text-white/30"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Hyperlink Tautan (a)
                  </label>
                  <input
                    type="url"
                    value={hyperlink}
                    onChange={(e) => setHyperlink(e.target.value)}
                    placeholder="https://example.com"
                    className="glass-input px-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/15 focus:border-[#7DB3FF] outline-none text-white placeholder:text-white/30"
                  />
                </div>
              </div>

              {/* Beberapa Kategori (div) */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Beberapa Kategori / Tags (div)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategoryInput}
                    onChange={(e) => setNewCategoryInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCategory();
                      }
                    }}
                    placeholder="Ketik kategori lalu tekan Enter atau Tambah (contoh: React, AI, Full Stack)"
                    className="glass-input px-4 py-2 rounded-xl text-xs flex-1 bg-white/5 border border-white/15 focus:border-[#7DB3FF] outline-none text-white placeholder:text-white/30"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddCategory()}
                    className="ios-glass-btn px-4 py-2 text-xs text-[#7DB3FF] hover:text-white font-medium cursor-pointer"
                  >
                    Tambah
                  </button>
                </div>

                {/* Category Badges */}
                <div className="flex flex-wrap gap-1.5 min-h-[30px] pt-1">
                  {categories.map((cat) => (
                    <span
                      key={cat}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs bg-[rgba(125,179,255,0.15)] border border-[rgba(125,179,255,0.3)] text-[#D2E3F7]"
                    >
                      <span>{cat}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCategory(cat)}
                        className="text-white/40 hover:text-white"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Deskripsi Project (p) */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Deskripsi Project (p) *
                  </label>
                  <span className="text-[11px] text-white/40 font-mono">
                    {description.length}/1000
                  </span>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  maxLength={1000}
                  placeholder="Jelaskan tujuan, fitur, dan teknologi yang digunakan dalam project ini..."
                  className="glass-input p-4 rounded-xl text-sm leading-relaxed bg-white/5 border border-white/15 focus:border-[#7DB3FF] outline-none text-white placeholder:text-white/30 resize-none"
                  required
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
                  disabled={submitting || uploadingMedia || !title.trim() || !description.trim() || !mediaUrl.trim()}
                  className="ios-glass-btn ios-glass-primary px-6 py-2.5 text-xs font-semibold cursor-pointer disabled:opacity-40 flex items-center gap-2"
                >
                  {submitting ? (
                    <span>Menyimpan...</span>
                  ) : uploadingMedia ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Mengunggah Media...</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      <span>{editingId ? "Perbarui Project" : "Simpan Project"}</span>
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
        isOpen={Boolean(projectToDelete)}
        title="Hapus Project"
        itemName={projectToDelete?.title}
        description="Project ini akan dihapus secara permanen dari portofolio Anda dan database Firestore."
        isDeleting={isDeletingProject}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!isDeletingProject) setProjectToDelete(null);
        }}
      />
    </div>
  );
}

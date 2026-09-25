import React, { useEffect, useState } from "react";
import { 
  Trash2, 
  Search, 
  ShieldAlert, 
  Plus, 
  X, 
  Check, 
  MessageSquare, 
  CornerDownRight, 
  Clock, 
  Save, 
  RefreshCw,
  Sliders,
  AlertTriangle,
  FileText,
  RotateCcw
} from "lucide-react";
import { 
  subscribeToComments, 
  deleteComment, 
  subscribeToCommentFilters, 
  saveCommentFilters 
} from "../../features/comments/api";
import { 
  CommentItem, 
  CommentFilterConfig, 
  DEFAULT_FILTER_CONFIG,
  DEFAULT_HEADER_DESCRIPTION
} from "../../features/comments/types";
import { DeleteConfirmModal } from "../../components/common/DeleteConfirmModal";

export function CommentsView() {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [commentToDelete, setCommentToDelete] = useState<CommentItem | null>(null);
  const [isDeletingComment, setIsDeletingComment] = useState(false);

  // Filter settings state
  const [filterConfig, setFilterConfig] = useState<CommentFilterConfig>(DEFAULT_FILTER_CONFIG);
  const [newPhrase, setNewPhrase] = useState("");
  const [savingFilter, setSavingFilter] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Search & filter in list
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "roots" | "replies">("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const unsubComments = subscribeToComments(
      (items) => {
        setComments(items);
        setLoadingComments(false);
        setCommentsError(null);
      },
      (err) => {
        console.error("Comments fetch error:", err);
        setCommentsError(err?.message || "Gagal memuat komentar.");
        setLoadingComments(false);
      }
    );

    const unsubFilters = subscribeToCommentFilters((cfg) => {
      setFilterConfig(cfg);
    });

    return () => {
      unsubComments();
      unsubFilters();
    };
  }, []);

  const handleDelete = (comment: CommentItem) => {
    setCommentToDelete(comment);
  };

  const handleConfirmDelete = async () => {
    if (!commentToDelete) return;
    setIsDeletingComment(true);
    setDeletingId(commentToDelete.id);
    try {
      await deleteComment(commentToDelete.id);
      setCommentToDelete(null);
    } catch (err: any) {
      console.error("Failed to delete comment:", err);
      alert("Gagal menghapus komentar: " + (err?.message || "Periksa izin akun."));
    } finally {
      setIsDeletingComment(false);
      setDeletingId(null);
    }
  };

  const handleAddPhrase = (e: React.FormEvent) => {
    e.preventDefault();
    const phrase = newPhrase.trim().toLowerCase();
    if (!phrase) return;

    if (filterConfig.bannedPhrases.includes(phrase)) {
      alert("Frasa sudah ada dalam daftar filter.");
      return;
    }

    setFilterConfig((prev) => ({
      ...prev,
      bannedPhrases: [...prev.bannedPhrases, phrase]
    }));
    setNewPhrase("");
  };

  const handleRemovePhrase = (phraseToRemove: string) => {
    setFilterConfig((prev) => ({
      ...prev,
      bannedPhrases: prev.bannedPhrases.filter((p) => p !== phraseToRemove)
    }));
  };

  const handleSaveFilterConfig = async () => {
    setSavingFilter(true);
    try {
      await saveCommentFilters(filterConfig);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error("Failed to save filter config:", err);
      alert("Gagal menyimpan pengaturan filter: " + err.message);
    } finally {
      setSavingFilter(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "-";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }).format(date);
    } catch {
      return "-";
    }
  };

  // Filtered comments list for table/card view
  const filteredComments = comments.filter((c) => {
    if (filterType === "roots" && c.parentId) return false;
    if (filterType === "replies" && !c.parentId) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.authorName.toLowerCase().includes(q) ||
      c.content.toLowerCase().includes(q) ||
      (c.replyToAuthor && c.replyToAuthor.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex flex-col gap-8">
      {/* Header & Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-medium text-white flex items-center gap-2.5">
            <MessageSquare className="text-[#7DB3FF]" size={22} />
            <span>Manajemen Komentar Publik</span>
          </h2>
          <p className="text-text-secondary text-sm font-light mt-1">
            Kelola diskusi publik pengunjung, hapus komentar yang tidak pantas, dan atur penyaringan frasa kata terlarang.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-text-secondary">
            Total: <strong className="text-white ml-1">{comments.length}</strong>
          </div>
        </div>
      </div>

      {/* Phrase Filter & Page Description Settings Box */}
      <div className="glass-card p-6 rounded-2xl border border-[rgba(130,180,255,0.2)] bg-[rgba(10,20,38,0.5)] backdrop-blur-xl flex flex-col gap-6">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Sliders size={18} className="text-[#7DB3FF]" />
            <h3 className="text-base font-semibold text-white">
              Pengaturan Halaman & Filter Komentar
            </h3>
          </div>

          <div className="flex items-center gap-3">
            {saveSuccess && (
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <Check size={14} /> Tersimpan!
              </span>
            )}
            <button
              onClick={handleSaveFilterConfig}
              disabled={savingFilter}
              className="ios-glass-btn ios-glass-primary px-4 py-2 text-xs font-semibold cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {savingFilter ? (
                <RefreshCw size={12} className="animate-spin" />
              ) : (
                <Save size={12} />
              )}
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </div>

        {/* Toggle Status Fitur Komentar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/10">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-white">Status Fitur Komentar Publik</span>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                filterConfig.enabled !== false
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  : "bg-amber-500/20 text-amber-300 border-amber-500/40"
              }`}>
                {filterConfig.enabled !== false ? "AKTIF" : "NONAKTIF"}
              </span>
            </div>
            <p className="text-[11px] text-text-tertiary">
              Saat nonaktif, kolom pengiriman komentar dan tombol balasan ditutup, tetapi pengunjung tetap dapat membaca semua komentar yang sudah dipublikasikan.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setFilterConfig((prev) => ({ ...prev, enabled: prev.enabled === false }))}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                filterConfig.enabled !== false ? "bg-[#7DB3FF]" : "bg-white/20"
              }`}
              role="switch"
              aria-checked={filterConfig.enabled !== false}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  filterConfig.enabled !== false ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <span className="text-xs font-medium text-white">
              {filterConfig.enabled !== false ? "Aktif" : "Nonaktif"}
            </span>
          </div>
        </div>

        {/* Header Description Editor */}
        <div className="flex flex-col gap-2 bg-white/[0.02] p-4 rounded-xl border border-white/5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-white/90 flex items-center gap-1.5">
              <FileText size={13} className="text-[#7DB3FF]" />
              <span>Deskripsi / Subtitle Halaman Komentar (&lt;p&gt;)</span>
            </label>
            <button
              type="button"
              onClick={() => setFilterConfig((prev) => ({ ...prev, headerDescription: DEFAULT_HEADER_DESCRIPTION }))}
              className="text-[11px] text-white/40 hover:text-[#7DB3FF] flex items-center gap-1 transition-colors"
              title="Kembalikan teks deskripsi bawaan"
            >
              <RotateCcw size={11} />
              <span>Reset Default</span>
            </button>
          </div>
          <textarea
            rows={2}
            value={filterConfig.headerDescription || ""}
            onChange={(e) => setFilterConfig((prev) => ({ ...prev, headerDescription: e.target.value }))}
            placeholder="Tulis deskripsi pengantar yang muncul di bawah judul Comments..."
            className="glass-input w-full p-3 rounded-xl text-xs leading-relaxed bg-white/5 border border-white/15 focus:border-[#7DB3FF] outline-none text-white resize-none"
          />
          <span className="text-[11px] text-text-tertiary">
            Teks ini langsung tampil secara real-time pada paragraf header di halaman publik <code>/comments</code>.
          </span>
        </div>

        {/* Action Mode Radio */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-xs text-text-secondary">
          <span className="font-medium text-white/80">Tindakan saat frasa terdeteksi:</span>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer text-white">
              <input
                type="radio"
                name="filterAction"
                value="censor"
                checked={filterConfig.filterAction === "censor"}
                onChange={() => setFilterConfig((prev) => ({ ...prev, filterAction: "censor" }))}
                className="accent-[#7DB3FF]"
              />
              <span>Sensor Otomatis (ganti kata dengan ***)</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-white">
              <input
                type="radio"
                name="filterAction"
                value="reject"
                checked={filterConfig.filterAction === "reject"}
                onChange={() => setFilterConfig((prev) => ({ ...prev, filterAction: "reject" }))}
                className="accent-[#7DB3FF]"
              />
              <span>Tolak Pengiriman (tampilkan pesan peringatan)</span>
            </label>
          </div>
        </div>

        {/* Add Phrase Form */}
        <form onSubmit={handleAddPhrase} className="flex gap-2 max-w-md">
          <input
            type="text"
            value={newPhrase}
            onChange={(e) => setNewPhrase(e.target.value)}
            placeholder="Tambah kata/frasa terlarang baru..."
            className="glass-input px-3.5 py-2 rounded-xl text-xs flex-1 bg-white/5 border border-white/15 text-white placeholder:text-white/40 focus:border-[#7DB3FF] outline-none"
          />
          <button
            type="submit"
            disabled={!newPhrase.trim()}
            className="ios-glass-btn px-4 py-2 text-xs text-[#7DB3FF] hover:text-white font-medium cursor-pointer disabled:opacity-40 flex items-center gap-1"
          >
            <Plus size={14} />
            <span>Tambah</span>
          </button>
        </form>

        {/* Active Banned Phrases Badges */}
        <div className="flex flex-wrap gap-2 pt-1">
          {filterConfig.bannedPhrases.length === 0 ? (
            <span className="text-xs text-text-tertiary italic">
              Tidak ada frasa yang dibatasi. Semua kata diizinkan.
            </span>
          ) : (
            filterConfig.bannedPhrases.map((phrase) => (
              <span
                key={phrase}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs bg-red-500/10 border border-red-500/25 text-red-300 backdrop-blur-md"
              >
                <span>{phrase}</span>
                <button
                  type="button"
                  onClick={() => handleRemovePhrase(phrase)}
                  className="text-red-400 hover:text-white transition-colors p-0.5"
                  title={`Hapus filter "${phrase}"`}
                >
                  <X size={12} />
                </button>
              </span>
            ))
          )}
        </div>
      </div>

      {/* Comments List Section */}
      <div className="flex flex-col gap-4">
        {/* Controls: Search and Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                filterType === "all"
                  ? "bg-[#7DB3FF]/25 border border-[#7DB3FF]/50 text-white"
                  : "bg-white/5 border border-white/10 text-text-secondary hover:text-white"
              }`}
            >
              Semua ({comments.length})
            </button>
            <button
              onClick={() => setFilterType("roots")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                filterType === "roots"
                  ? "bg-[#7DB3FF]/25 border border-[#7DB3FF]/50 text-white"
                  : "bg-white/5 border border-white/10 text-text-secondary hover:text-white"
              }`}
            >
              Top-Level ({comments.filter((c) => !c.parentId).length})
            </button>
            <button
              onClick={() => setFilterType("replies")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                filterType === "replies"
                  ? "bg-[#7DB3FF]/25 border border-[#7DB3FF]/50 text-white"
                  : "bg-white/5 border border-white/10 text-text-secondary hover:text-white"
              }`}
            >
              Balasan / Replies ({comments.filter((c) => c.parentId).length})
            </button>
          </div>

          <div className="relative max-w-xs w-full">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari komentar atau nama..."
              className="glass-input pl-9 pr-3 py-1.5 rounded-xl text-xs w-full bg-white/5 border border-white/15 text-white placeholder:text-white/40 focus:border-[#7DB3FF] outline-none"
            />
          </div>
        </div>

        {/* Comments Feed / Cards */}
        {commentsError ? (
          <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {commentsError}
          </div>
        ) : loadingComments ? (
          <div className="glass-card p-12 rounded-2xl text-center text-text-secondary text-sm">
            Memuat daftar komentar...
          </div>
        ) : filteredComments.length === 0 ? (
          <div className="glass-card p-12 rounded-2xl text-center text-text-secondary font-light">
            Tidak ada komentar yang sesuai dengan pencarian atau filter.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredComments.map((comment) => (
              <div
                key={comment.id}
                id={`admin-comment-${comment.id}`}
                className="glass-card p-5 rounded-xl border border-white/10 bg-[rgba(10,24,42,0.4)] flex flex-col gap-3 relative group transition-all hover:border-white/20"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 border ${
                      comment.isAnonymous
                        ? "bg-white/5 border-white/15 text-white/50"
                        : "bg-[#7DB3FF]/20 border-[#7DB3FF]/40 text-[#7DB3FF]"
                    }`}>
                      {comment.isAnonymous ? "A" : (comment.authorName.charAt(0) || "U")}
                    </span>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white truncate">
                          {comment.authorName}
                        </span>
                        {comment.isAnonymous && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/50 border border-white/10">
                            Anonim
                          </span>
                        )}
                        {comment.parentId && (
                          <span className="text-xs text-[#7DB3FF] flex items-center gap-1">
                            <CornerDownRight size={12} />
                            <span>Balasan {comment.replyToAuthor ? `ke @${comment.replyToAuthor}` : ""}</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-white/40 font-mono flex items-center gap-1">
                        <Clock size={11} />
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Delete Action Button */}
                  <button
                    onClick={() => handleDelete(comment)}
                    disabled={deletingId === comment.id}
                    className="ios-glass-btn px-3 py-1 text-xs text-red-400 hover:text-red-300 font-semibold cursor-pointer shrink-0 flex items-center gap-1.5 transition-colors"
                    title="Hapus komentar ini"
                  >
                    <Trash2 size={13} />
                    <span>Hapus</span>
                  </button>
                </div>

                {/* Content */}
                <div className="text-xs sm:text-sm text-[#C0D3EB] font-light leading-relaxed whitespace-pre-wrap break-words pl-1 bg-white/[0.02] p-3 rounded-lg border border-white/5">
                  {comment.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(commentToDelete)}
        title="Hapus Komentar"
        itemName={commentToDelete ? `${commentToDelete.authorName}: "${commentToDelete.content.slice(0, 60)}${commentToDelete.content.length > 60 ? "..." : ""}"` : undefined}
        description="Komentar ini akan dihapus secara permanen dari ruang percakapan publik dan database Firestore."
        isDeleting={isDeletingComment}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!isDeletingComment) setCommentToDelete(null);
        }}
      />
    </div>
  );
}

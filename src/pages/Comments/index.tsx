import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  Send, 
  CornerDownRight, 
  User, 
  ShieldCheck, 
  Sparkles, 
  Clock,
  X,
  Smile,
  AlertCircle,
  MessageSquare,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2
} from "lucide-react";
import { 
  subscribeToComments, 
  createComment, 
  subscribeToCommentFilters,
  checkAndFilterPhrases
} from "../../features/comments/api";
import { getProfile, getCachedProfile } from "../../features/profile/api";
import { SiteProfile } from "../../features/profile/types";
import { 
  CommentItem, 
  CommentFilterConfig, 
  DEFAULT_FILTER_CONFIG,
  DEFAULT_HEADER_DESCRIPTION
} from "../../features/comments/types";

export default function Comments() {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterConfig, setFilterConfig] = useState<CommentFilterConfig>(DEFAULT_FILTER_CONFIG);

  // Main comment form state
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  // Profile & Admin Identity Verification state
  const [profile, setProfile] = useState<SiteProfile | null>(getCachedProfile);
  const [adminVerificationCode, setAdminVerificationCode] = useState("");
  const [showAdminCode, setShowAdminCode] = useState(false);
  const [isAdminVerified, setIsAdminVerified] = useState(false);
  const [adminVerificationError, setAdminVerificationError] = useState<string | null>(null);
  const [adminAttention, setAdminAttention] = useState(false);

  const adminVerificationSectionRef = useRef<HTMLDivElement>(null);
  const adminCodeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getProfile().then((data) => {
      if (data) setProfile(data);
    });
  }, []);

  // Clear attention highlight after timeout
  useEffect(() => {
    if (adminAttention) {
      const timer = setTimeout(() => setAdminAttention(false), 2600);
      return () => clearTimeout(timer);
    }
  }, [adminAttention]);

  const isClaimingAdmin = useMemo(() => {
    if (isAnonymous) return false;
    const normalized = authorName.trim().toLowerCase();
    const defaultAllowed = [
      "admin",
      "administrator",
      "bintang",
      "bintang prasetyo",
      "bprasety",
      "prasetyo"
    ];
    const customAllowed = (profile?.adminAllowedNames || []).map(n => n.trim().toLowerCase()).filter(Boolean);
    const allAllowed = Array.from(new Set([...defaultAllowed, ...customAllowed]));

    return allAllowed.some(name => {
      if (normalized === name) return true;
      if (normalized.startsWith(name + " ") || normalized.endsWith(" " + name)) return true;
      return false;
    });
  }, [authorName, isAnonymous, profile?.adminAllowedNames]);

  const isAdminAuthor = (name: string) => {
    if (!name || name === "Anonymous") return false;
    const normalized = name.trim().toLowerCase();
    const defaultAllowed = [
      "bintang prasetyo",
      "bintang",
      "admin",
      "administrator",
      "bprasety",
      "bprasety_"
    ];
    const customAllowed = (profile?.adminAllowedNames || []).map(n => n.trim().toLowerCase()).filter(Boolean);
    const allAllowed = [...defaultAllowed, ...customAllowed];
    return allAllowed.some(adm => {
      if (normalized === adm) return true;
      if (normalized.startsWith(adm + " ") || normalized.endsWith(" " + adm)) return true;
      return false;
    });
  };

  // Reset verification when name changes away from admin
  useEffect(() => {
    if (!isClaimingAdmin) {
      setIsAdminVerified(false);
      setAdminVerificationError(null);
      setAdminVerificationCode("");
      setShowAdminCode(false);
      setAdminAttention(false);
    }
  }, [isClaimingAdmin]);

  // Check if authorName contains banned phrases
  const authorBannedCheck = useMemo(() => {
    if (isAnonymous || !authorName.trim()) {
      return { hasForbidden: false, matchedPhrases: [] as string[] };
    }
    const res = checkAndFilterPhrases(
      authorName.trim(),
      filterConfig.bannedPhrases,
      "reject"
    );
    return {
      hasForbidden: res.hasForbiddenPhrase,
      matchedPhrases: res.matchedPhrases
    };
  }, [authorName, isAnonymous, filterConfig.bannedPhrases]);

  const handleVerifyAdmin = () => {
    const expected = (profile?.cvAccessCode || "19112191").trim();
    if (adminVerificationCode.trim() === expected) {
      setIsAdminVerified(true);
      setAdminVerificationError(null);
      setAdminAttention(false);
      setFormError(null);
    } else {
      setIsAdminVerified(false);
      setAdminVerificationError("Kode verifikasi identitas tidak cocok.");
      adminCodeInputRef.current?.select();
    }
  };

  const handleSendButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    // 1. If author name contains forbidden phrases:
    if (!isAnonymous && authorBannedCheck.hasForbidden) {
      setFormError(`Nama pengirim tidak boleh mengandung frasa terlarang ("${authorBannedCheck.matchedPhrases.join(", ")}"). Harap gunakan nama lain.`);
      document.getElementById("comment-author-name")?.focus();
      return;
    }

    // 2. If author name claims admin identity but is not verified:
    if (isClaimingAdmin && !isAdminVerified) {
      setAdminAttention(true);
      setFormError("Nama ini dilindungi sebagai identitas Administrator. Harap verifikasi identitas Anda terlebih dahulu.");
      adminVerificationSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => {
        adminCodeInputRef.current?.focus();
      }, 250);
      return;
    }

    // 3. If content is empty
    if (!content.trim()) {
      setFormError("Silakan tulis komentar Anda terlebih dahulu.");
      document.getElementById("comment-content-textarea")?.focus();
      return;
    }

    // 4. Langsung kirim dalam 1 kali klik (tidak perlu klik 2 kali)
    handleSubmitMain();
  };

  // Active reply target
  const [replyingTo, setReplyingTo] = useState<CommentItem | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replyAuthorName, setReplyAuthorName] = useState("");
  const [replyIsAnonymous, setReplyIsAnonymous] = useState(false);
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  const MAX_CHARS = 1000;

  // Real-time subscriptions
  useEffect(() => {
    const unsubComments = subscribeToComments(
      (items) => {
        setComments(items);
        setLoading(false);
      },
      (err) => {
        console.error("Comments subscription error:", err);
        setLoading(false);
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

  // Format date helper
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Baru saja";
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
      return "Baru saja";
    }
  };

  // Group comments: top-level vs replies
  const { rootComments, repliesByParent } = useMemo(() => {
    const roots: CommentItem[] = [];
    const repliesMap: Record<string, CommentItem[]> = {};

    // Sort all comments by creation time
    const sorted = [...comments].sort((a, b) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      return timeB - timeA;
    });

    for (const c of sorted) {
      if (c.parentId) {
        if (!repliesMap[c.parentId]) {
          repliesMap[c.parentId] = [];
        }
        repliesMap[c.parentId].push(c);
      } else {
        roots.push(c);
      }
    }

    // Sort replies chronologically (older first)
    Object.keys(repliesMap).forEach((parentId) => {
      repliesMap[parentId].sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeA - timeB;
      });
    });

    return { rootComments: roots, repliesByParent: repliesMap };
  }, [comments]);

  // Check if replyAuthorName contains banned phrases
  const replyAuthorBannedCheck = useMemo(() => {
    if (replyIsAnonymous || !replyAuthorName.trim()) {
      return { hasForbidden: false, matchedPhrases: [] as string[] };
    }
    const res = checkAndFilterPhrases(
      replyAuthorName.trim(),
      filterConfig.bannedPhrases,
      "reject"
    );
    return {
      hasForbidden: res.hasForbiddenPhrase,
      matchedPhrases: res.matchedPhrases
    };
  }, [replyAuthorName, replyIsAnonymous, filterConfig.bannedPhrases]);

  // Handle main comment submission
  const handleSubmitMain = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim() || submitting) return;

    // Check if author name contains forbidden phrases
    if (!isAnonymous && authorBannedCheck.hasForbidden) {
      setFormError(`Nama pengirim tidak boleh mengandung frasa terlarang ("${authorBannedCheck.matchedPhrases.join(", ")}"). Harap gunakan nama lain.`);
      document.getElementById("comment-author-name")?.focus();
      return;
    }

    // Check if author is claiming Admin identity
    if (isClaimingAdmin) {
      const expected = (profile?.cvAccessCode || "19112191").trim();
      if (!isAdminVerified && adminVerificationCode.trim() !== expected) {
        setAdminAttention(true);
        setFormError("Verifikasi identitas diperlukan untuk menggunakan nama Administrator. Masukkan kode akses keamanan yang valid.");
        setAdminVerificationError("Kode verifikasi identitas tidak cocok.");
        adminVerificationSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => adminCodeInputRef.current?.focus(), 250);
        return;
      }
      setIsAdminVerified(true);
    }

    setFormError(null);
    setSubmitting(true);

    try {
      await createComment({
        authorName: isAnonymous ? "Anonymous" : authorName.trim(),
        isAnonymous,
        content: content.trim(),
        filterConfig
      });

      setContent("");
      setFormSuccess(true);
      setTimeout(() => setFormSuccess(false), 4000);
    } catch (err: any) {
      console.error("Failed to post comment:", err);
      setFormError(err.message || "Gagal mengirim komentar. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle reply submission
  const handleSubmitReply = async (parentComment: CommentItem) => {
    if (!replyContent.trim() || replySubmitting) return;

    // Check if reply author name contains forbidden phrases
    if (!replyIsAnonymous && replyAuthorBannedCheck.hasForbidden) {
      setReplyError(`Nama pengirim tidak boleh mengandung frasa terlarang ("${replyAuthorBannedCheck.matchedPhrases.join(", ")}"). Harap gunakan nama lain.`);
      return;
    }

    setReplyError(null);
    setReplySubmitting(true);

    try {
      await createComment({
        authorName: replyIsAnonymous ? "Anonymous" : replyAuthorName.trim(),
        isAnonymous: replyIsAnonymous,
        content: replyContent.trim(),
        parentId: parentComment.id,
        replyToAuthor: parentComment.authorName,
        filterConfig
      });

      setReplyContent("");
      setReplyingTo(null);
    } catch (err: any) {
      console.error("Failed to post reply:", err);
      setReplyError(err.message || "Gagal mengirim balasan.");
    } finally {
      setReplySubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-10 pb-28 pt-2 sm:pt-4 w-full max-w-5xl lg:max-w-6xl 2xl:max-w-7xl mx-auto">
      {/* Header Section */}
      <header className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="max-w-3xl flex flex-col gap-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-medium text-white tracking-tight leading-[1.12]">
              Comments
            </h1>
            <p className="text-[#A8B8CC] text-base sm:text-lg font-light max-w-2xl leading-relaxed">
              {filterConfig.headerDescription || DEFAULT_HEADER_DESCRIPTION}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[rgba(10,24,42,0.6)] border border-white/10 text-xs text-[#7DB3FF] shrink-0 self-start sm:self-auto backdrop-blur-md mb-2">
            <MessageSquare size={13} className="text-[#7DB3FF]" />
            <span>{comments.length} Komentar</span>
          </div>
        </div>
      </header>

      {/* Main Comment Input Box or Disabled Banner */}
      {filterConfig.enabled === false ? (
        <section 
          id="comment-composer-box"
          className="glass-card p-6 sm:p-7 rounded-2xl border border-amber-500/20 bg-amber-500/5 backdrop-blur-2xl flex flex-col sm:flex-row items-center gap-4 text-amber-200/90 shadow-lg"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400">
            <AlertCircle size={20} />
          </div>
          <div className="flex flex-col gap-1 text-center sm:text-left">
            <h3 className="text-sm font-semibold text-amber-200">
              Pengiriman Komentar Sedang Dinonaktifkan
            </h3>
            <p className="text-xs text-amber-200/70 leading-relaxed">
              Fitur pengiriman komentar baru saat ini sedang ditutup oleh administrator. Anda tetap dapat membaca semua komentar dan diskusi yang ada di bawah ini.
            </p>
          </div>
        </section>
      ) : (
        <section 
          id="comment-composer-box"
          className="glass-card p-5 sm:p-7 rounded-2xl border border-[rgba(130,180,255,0.2)] bg-[rgba(10,20,38,0.55)] backdrop-blur-2xl shadow-[0_16px_40px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.2)] relative overflow-hidden"
        >
          <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white/10 via-transparent to-transparent pointer-events-none" />

          <form onSubmit={handleSubmitMain} className="flex flex-col gap-4 relative z-10">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#7DB3FF]/90">
                Tulis Komentar
              </span>
              
              {/* Identity Mode Toggle */}
              <div className="flex items-center gap-2 text-xs">
                <label 
                  htmlFor="anon-toggle"
                  className="flex items-center gap-2 cursor-pointer select-none text-[#A8B8CC] hover:text-white transition-colors"
                >
                  <input
                    type="checkbox"
                    id="anon-toggle"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 text-[#7DB3FF] focus:ring-0 focus:ring-offset-0 bg-white/5 cursor-pointer accent-[#7DB3FF]"
                  />
                  <span>Kirim secara Anonim</span>
                </label>
              </div>
            </div>

            {/* Author Name Input Container */}
            <div className="flex flex-col gap-2">
              {!isAnonymous ? (
                <>
                  <input
                    id="comment-author-name"
                    type="text"
                    value={authorName}
                    onChange={(e) => {
                      setAuthorName(e.target.value);
                      if (formError) setFormError(null);
                    }}
                    placeholder="Nama Anda atau alias (maks 60 karakter)"
                    maxLength={60}
                    className={`glass-input px-4 py-2.5 rounded-xl text-sm w-full outline-none transition-all ${
                      authorBannedCheck.hasForbidden
                        ? "bg-red-500/10 border-red-500/60 focus:border-red-400 text-red-100 placeholder:text-red-300/40 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                        : "bg-[rgba(255,255,255,0.04)] border-white/15 focus:border-[#7DB3FF] focus:bg-[rgba(255,255,255,0.08)] text-white placeholder:text-white/40"
                    }`}
                    disabled={submitting}
                  />

                  {authorBannedCheck.hasForbidden && (
                    <div className="flex items-center gap-1.5 text-xs text-red-400 px-1 pt-0.5">
                      <AlertCircle size={13} className="shrink-0 text-red-400" />
                      <span>
                        Nama pengirim tidak boleh mengandung frasa terlarang: <strong className="font-semibold underline decoration-red-400/50">"{authorBannedCheck.matchedPhrases.join(", ")}"</strong>.
                      </span>
                    </div>
                  )}

                  {/* Secret Admin Identity Verification Prompt */}
                  {isClaimingAdmin && (
                    <div 
                      ref={adminVerificationSectionRef}
                      id="admin-identity-verification"
                      className={`p-3.5 sm:p-4 rounded-xl border transition-all duration-300 ${
                        isAdminVerified 
                          ? "bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
                          : adminAttention
                            ? "bg-[rgba(32,91,240,0.16)] border-[#7DB3FF] ring-2 ring-[#7DB3FF]/50 shadow-[0_0_20px_rgba(32,91,240,0.35)] animate-pulse"
                            : "bg-[rgba(32,91,240,0.08)] border-[#205BF0]/30 shadow-sm"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 text-xs font-semibold">
                          {isAdminVerified ? (
                            <>
                              <ShieldCheck size={16} className="text-emerald-400" />
                              <span className="text-emerald-300">Identitas Administrator Terverifikasi</span>
                            </>
                          ) : (
                            <>
                              <Lock size={15} className="text-[#7DB3FF]" />
                              <span className="text-[#7DB3FF]">Verifikasi Identitas Administrator</span>
                            </>
                          )}
                        </div>
                        {isAdminVerified && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Verified Official
                          </span>
                        )}
                      </div>

                      {!isAdminVerified ? (
                        <div className="flex flex-col gap-2">
                          <p className="text-xs text-[#A8B8CC] leading-relaxed font-light">
                            Nama ini dilindungi sebagai identitas resmi Administrator. Masukkan kode akses keamanan Anda untuk memverifikasi kepemilikan nama ini sebelum mengirim komentar.
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                              <input
                                ref={adminCodeInputRef}
                                type={showAdminCode ? "text" : "password"}
                                value={adminVerificationCode}
                                onChange={(e) => {
                                  setAdminVerificationCode(e.target.value);
                                  setAdminVerificationError(null);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleVerifyAdmin();
                                  }
                                }}
                                placeholder="Masukkan Kode Keamanan Rahasia"
                                maxLength={32}
                                className="glass-input pl-3.5 pr-9 py-2 rounded-lg text-xs w-full bg-[rgba(255,255,255,0.05)] border border-white/20 focus:border-[#7DB3FF] text-white placeholder:text-white/30 outline-none font-mono"
                              />
                              <button
                                type="button"
                                onClick={() => setShowAdminCode(!showAdminCode)}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors p-0.5 cursor-pointer"
                                title={showAdminCode ? "Sembunyikan kode" : "Tampilkan kode"}
                              >
                                {showAdminCode ? <EyeOff size={13} /> : <Eye size={13} />}
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={handleVerifyAdmin}
                              className="px-4 py-2 rounded-xl text-xs font-medium bg-[#205BF0] hover:bg-[#1A4ED4] text-white transition-all duration-200 shrink-0 cursor-pointer shadow-sm"
                            >
                              Verifikasi
                            </button>
                          </div>
                          {adminVerificationError && (
                            <span className="text-[11px] text-red-400 flex items-center gap-1.5 pt-0.5">
                              <AlertCircle size={13} className="shrink-0" />
                              {adminVerificationError}
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-emerald-200/80 font-light flex items-center gap-1.5">
                          <CheckCircle2 size={13} className="text-emerald-400" />
                          <span>Komentar akan dikirim menggunakan hak identitas Administrator resmi.</span>
                        </p>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-xs text-white/50 italic px-1">
                  Komentar akan dipublikasikan sebagai Pengguna Anonim.
                </div>
              )}
            </div>

            {/* Comment Textarea & Status Alerts Container */}
            <div className="relative flex flex-col gap-2">
              <div className="relative">
                <textarea
                  id="comment-content-textarea"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                      e.preventDefault();
                      handleSubmitMain();
                    }
                  }}
                  rows={4}
                  maxLength={MAX_CHARS}
                  placeholder="Bagikan pemikiran, pertanyaan, ide, atau sapaan Anda..."
                  className="glass-input w-full p-4 rounded-xl text-sm leading-relaxed bg-[rgba(255,255,255,0.04)] border border-white/15 focus:border-[#7DB3FF] focus:bg-[rgba(255,255,255,0.08)] outline-none text-white placeholder:text-white/40 resize-none transition-all"
                  disabled={submitting}
                  required
                />
                <div className={`absolute bottom-3 right-3 text-[11px] font-mono ${
                  content.length >= MAX_CHARS ? 'text-red-400' : 'text-white/40'
                }`}>
                  {content.length}/{MAX_CHARS}
                </div>
              </div>

              {/* Error & Success Messages */}
              {formError && (
                <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0 text-red-400" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <Sparkles size={15} className="shrink-0 text-emerald-400" />
                  <span>Komentar berhasil dipublikasikan! Terima kasih atas kontribusi Anda.</span>
                </div>
              )}
            </div>

            {/* Bottom Controls */}
            <div className="flex items-center justify-end pt-1">
              <div className="ml-auto">
                <button
                  id="submit-comment-button"
                  type="button"
                  onClick={handleSendButtonClick}
                  disabled={submitting || !content.trim()}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#205BF0] hover:bg-[#1A4ED4] active:bg-[#1541B8] text-white shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed select-none group"
                  title="Send"
                >
                  {submitting ? (
                    <>
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin block" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                      <span>Send</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </section>
      )}

      {/* Comments List Feed */}
      <section className="flex flex-col gap-4" aria-label="Daftar Komentar Publik">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <h2 className="text-sm font-semibold tracking-wider uppercase text-[#7DB3FF]/90 flex items-center gap-2">
            <span>Diskusi Terkini</span>
            <span className="text-[11px] font-normal text-white/40">({comments.length})</span>
          </h2>
        </div>

        {loading ? (
          <div className="glass-card p-12 rounded-2xl flex flex-col items-center justify-center gap-3 text-[#A8B8CC]">
            <div className="w-6 h-6 rounded-full border-2 border-[#7DB3FF]/30 border-t-[#7DB3FF] animate-spin" />
            <span className="text-sm font-light">Memuat percakapan...</span>
          </div>
        ) : rootComments.length === 0 ? (
          <div className="glass-card p-12 rounded-2xl text-center flex flex-col items-center justify-center gap-3 text-[#A8B8CC]">
            <div className="w-12 h-12 rounded-full bg-[#7DB3FF]/10 border border-[#7DB3FF]/20 flex items-center justify-center text-[#7DB3FF] mb-1">
              <Smile size={24} />
            </div>
            <h3 className="text-lg font-medium text-white">Belum ada komentar</h3>
            <p className="text-sm font-light max-w-sm">
              Jadilah yang pertama memulai percakapan di ruang publik ini.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {rootComments.map((item) => {
              const replies = repliesByParent[item.id] || [];
              const isReplying = replyingTo?.id === item.id;

              return (
                <div 
                  key={item.id}
                  id={`comment-${item.id}`}
                  className="w-full rounded-2xl bg-[rgba(10,24,42,0.45)] border border-[rgba(130,180,255,0.14)] p-5 sm:p-6 backdrop-blur-xl transition-all hover:border-[rgba(130,180,255,0.3)] shadow-[0_10px_30px_rgba(0,0,0,0.25)] flex flex-col gap-4"
                >
                  {/* Author Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                        item.isAnonymous 
                          ? "bg-white/5 border-white/15 text-white/60" 
                          : isAdminAuthor(item.authorName)
                            ? "bg-gradient-to-br from-emerald-500/35 to-teal-500/25 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                            : "bg-gradient-to-br from-[#7DB3FF]/30 to-[#3C8CFF]/20 border-[#7DB3FF]/40 text-[#7DB3FF]"
                      }`}>
                        {item.isAnonymous ? (
                          <ShieldCheck size={16} />
                        ) : isAdminAuthor(item.authorName) ? (
                          <ShieldCheck size={18} className="text-emerald-400" />
                        ) : (
                          <span className="text-xs font-bold uppercase">
                            {item.authorName.charAt(0) || "U"}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white truncate flex items-center gap-1.5">
                            {item.authorName}
                            {isAdminAuthor(item.authorName) && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 shadow-sm">
                                <ShieldCheck size={11} className="text-emerald-400" />
                                Verified Admin
                              </span>
                            )}
                          </span>
                          {item.isAnonymous && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 border border-white/10 text-white/50">
                              Anonim
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-white/40 flex items-center gap-1 font-mono">
                          <Clock size={11} />
                          {formatDate(item.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Reply Action Trigger */}
                    {filterConfig.enabled !== false && (
                      <button
                        id={`reply-btn-${item.id}`}
                        type="button"
                        onClick={() => {
                          if (isReplying) {
                            setReplyingTo(null);
                          } else {
                            setReplyingTo(item);
                            setReplyContent("");
                            setReplyError(null);
                          }
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all duration-200 border ${
                          isReplying
                            ? "bg-[#7DB3FF]/20 text-white border-[#7DB3FF]/50 shadow-[0_0_12px_rgba(125,179,255,0.25)]"
                            : "bg-white/[0.04] text-[#7DB3FF] border-white/10 hover:bg-[#7DB3FF]/15 hover:border-[#7DB3FF]/30 hover:text-white active:scale-[0.98]"
                        }`}
                        title="Balas komentar ini"
                      >
                        <CornerDownRight size={13} />
                        <span>{isReplying ? "Batal" : "Reply"}</span>
                      </button>
                    )}
                  </div>

                  {/* Comment Body */}
                  <div className="text-sm sm:text-[14.5px] text-[#D2E3F7] leading-relaxed font-light whitespace-pre-wrap break-words pl-1">
                    {item.content}
                  </div>

                  {/* Inline Reply Form when active */}
                  {isReplying && (
                    <div className="mt-2 p-4 rounded-xl bg-[rgba(15,30,55,0.6)] border border-[#7DB3FF]/30 flex flex-col gap-3 relative animate-fadeIn">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#7DB3FF] font-medium flex items-center gap-1.5">
                          <CornerDownRight size={13} />
                          <span>Membalas <strong>@{item.authorName}</strong></span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setReplyingTo(null)}
                          className="text-white/40 hover:text-white p-1"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      {/* Identity for reply */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-[#A8B8CC]">
                          <input
                            type="checkbox"
                            checked={replyIsAnonymous}
                            onChange={(e) => setReplyIsAnonymous(e.target.checked)}
                            className="w-3.5 h-3.5 rounded border-white/20 accent-[#7DB3FF]"
                          />
                          <span>Kirim sebagai Anonim</span>
                        </label>

                        {!replyIsAnonymous && (
                          <div className="flex flex-col gap-1">
                            <input
                              type="text"
                              value={replyAuthorName}
                              onChange={(e) => {
                                setReplyAuthorName(e.target.value);
                                if (replyError) setReplyError(null);
                              }}
                              placeholder="Nama Anda (opsional)"
                              maxLength={60}
                              className={`glass-input px-3 py-1.5 rounded-lg text-xs outline-none transition-all ${
                                replyAuthorBannedCheck.hasForbidden
                                  ? "bg-red-500/10 border-red-500/50 text-red-100 placeholder:text-red-300/40"
                                  : "bg-white/5 border border-white/10 text-white placeholder:text-white/30"
                              }`}
                            />
                            {replyAuthorBannedCheck.hasForbidden && (
                              <span className="text-[11px] text-red-400">
                                Mengandung frasa terlarang: "{replyAuthorBannedCheck.matchedPhrases.join(", ")}"
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        rows={2}
                        maxLength={MAX_CHARS}
                        placeholder={`Tulis balasan untuk @${item.authorName}...`}
                        className="glass-input w-full p-3 rounded-lg text-xs leading-relaxed bg-white/5 border border-white/15 focus:border-[#7DB3FF] outline-none text-white resize-none"
                        disabled={replySubmitting}
                      />

                      {replyError && (
                        <div className="text-[11px] text-red-300 p-2 rounded bg-red-500/10 border border-red-500/20">
                          {replyError}
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setReplyingTo(null)}
                          className="px-3 py-1.5 text-xs text-white/60 hover:text-white"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          disabled={replySubmitting || !replyContent.trim()}
                          onClick={() => handleSubmitReply(item)}
                          className="ios-glass-btn ios-glass-primary px-4 py-1.5 text-xs font-semibold cursor-pointer disabled:opacity-40"
                        >
                          {replySubmitting ? "Mengirim..." : "Kirim Balasan"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Threaded Replies Section */}
                  {replies.length > 0 && (
                    <div className="mt-2 pt-3 border-t border-white/10 flex flex-col gap-3 pl-3 sm:pl-5 border-l-2 border-l-[#7DB3FF]/25 ml-2">
                      <div className="text-[11px] font-semibold text-[#7DB3FF]/80 uppercase tracking-wider">
                        {replies.length} Balasan
                      </div>

                      {replies.map((reply) => (
                        <div 
                          key={reply.id} 
                          id={`reply-${reply.id}`}
                          className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col gap-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={`w-6 h-6 rounded-lg text-[10px] font-bold flex items-center justify-center shrink-0 border ${
                                reply.isAnonymous 
                                  ? "bg-white/5 border-white/10 text-white/50" 
                                  : isAdminAuthor(reply.authorName)
                                    ? "bg-emerald-500/25 border-emerald-500/40 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                                    : "bg-[#7DB3FF]/20 border-[#7DB3FF]/30 text-[#7DB3FF]"
                              }`}>
                                {reply.isAnonymous ? "A" : isAdminAuthor(reply.authorName) ? <ShieldCheck size={12} className="text-emerald-400" /> : (reply.authorName.charAt(0) || "U")}
                              </span>
                              <span className="text-xs font-medium text-white truncate flex items-center gap-1.5">
                                {reply.authorName}
                                {isAdminAuthor(reply.authorName) && (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-medium bg-emerald-500/20 border border-emerald-500/30 text-emerald-300">
                                    <ShieldCheck size={10} className="text-emerald-400" />
                                    Admin
                                  </span>
                                )}
                              </span>
                              {reply.isAnonymous && (
                                <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-white/5 text-white/40">
                                  Anonim
                                </span>
                              )}
                              {reply.replyToAuthor && (
                                <span className="text-[11px] text-[#7DB3FF]/80 font-light truncate">
                                  ↳ @{reply.replyToAuthor}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-white/40 font-mono shrink-0">
                              {formatDate(reply.createdAt)}
                            </span>
                          </div>
                          
                          <div className="text-xs sm:text-[13px] text-[#C0D3EB] leading-relaxed font-light whitespace-pre-wrap break-words pl-1">
                            {reply.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

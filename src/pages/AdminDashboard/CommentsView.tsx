import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Trash2,
  Search,
  ShieldAlert,
  ShieldCheck,
  Plus,
  X,
  Check,
  MessageSquare,
  CornerDownRight,
  Clock,
  Save,
  RefreshCw,
  Sliders,
  AlertCircle,
  FileText,
  RotateCcw,
  ExternalLink,
  Image as ImageIcon,
  Send,
  Loader2,
  UploadCloud,
} from "lucide-react";
import {
  subscribeToComments,
  createComment,
  uploadCommentImage,
  deleteComment,
  subscribeToCommentFilters,
  saveCommentFilters,
  isProtectedAdminIdentity,
} from "../../features/comments/api";
import {
  CommentItem,
  CommentFilterConfig,
  DEFAULT_ADMIN_IDENTITIES,
  DEFAULT_FILTER_CONFIG,
  DEFAULT_HEADER_DESCRIPTION,
} from "../../features/comments/types";
import { DeleteConfirmModal } from "../../components/common/DeleteConfirmModal";

const MAX_CHARS = 1000;

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
  const [filterNotice, setFilterNotice] = useState<string | null>(null);

  // Admin allowed names state
  const [adminNames, setAdminNames] = useState<string[]>(DEFAULT_ADMIN_IDENTITIES);
  const [newAdminName, setNewAdminName] = useState("");
  const [savingAdminNames, setSavingAdminNames] = useState(false);
  const [adminNamesSuccess, setAdminNamesSuccess] = useState(false);
  const [adminNamesNotice, setAdminNamesNotice] = useState<string | null>(null);

  // Official Admin Top-Level Comment Composer state
  const [selectedAdminIdentity, setSelectedAdminIdentity] = useState<string>("Bintang Prasetyo");
  const [adminContent, setAdminContent] = useState("");
  const [adminSubmitting, setAdminSubmitting] = useState(false);
  const [adminPostError, setAdminPostError] = useState<string | null>(null);
  const [adminPostSuccess, setAdminPostSuccess] = useState(false);
  const [adminImageUrl, setAdminImageUrl] = useState<string | null>(null);
  const [adminImagePublicId, setAdminImagePublicId] = useState<string | null>(null);
  const [adminImageFileName, setAdminImageFileName] = useState("");
  const [adminImageUploading, setAdminImageUploading] = useState(false);
  const adminFileInputRef = useRef<HTMLInputElement>(null);

  // Official Admin Inline Reply Composer state
  const [replyingTo, setReplyingTo] = useState<CommentItem | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [replyImageUrl, setReplyImageUrl] = useState<string | null>(null);
  const [replyImagePublicId, setReplyImagePublicId] = useState<string | null>(null);
  const [replyImageFileName, setReplyImageFileName] = useState("");
  const [replyImageUploading, setReplyImageUploading] = useState(false);
  const replyFileInputRef = useRef<HTMLInputElement>(null);

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
        setCommentsError(err?.message || "Failed to load comments.");
        setLoadingComments(false);
      }
    );

    const unsubFilters = subscribeToCommentFilters((cfg) => {
      setFilterConfig(cfg);
    });

    import("../../features/profile/api").then(({ getProfile }) => {
      getProfile().then((profile) => {
        if (
          profile?.adminAllowedNames &&
          Array.isArray(profile.adminAllowedNames) &&
          profile.adminAllowedNames.length > 0
        ) {
          setAdminNames(profile.adminAllowedNames);
          const preferred =
            profile.adminAllowedNames.find((n) => n.toLowerCase() === "bintang prasetyo") ||
            profile.adminAllowedNames[0];
          if (preferred) setSelectedAdminIdentity(preferred);
        } else if (profile?.name) {
          setSelectedAdminIdentity(profile.name);
        }
      });
    });

    return () => {
      unsubComments();
      unsubFilters();
    };
  }, []);

  // Ensure selectedAdminIdentity remains valid if adminNames list changes
  useEffect(() => {
    if (adminNames.length > 0 && !adminNames.includes(selectedAdminIdentity)) {
      const preferred =
        adminNames.find((n) => n.toLowerCase() === "bintang prasetyo") || adminNames[0];
      setSelectedAdminIdentity(preferred);
    }
  }, [adminNames, selectedAdminIdentity]);

  const handleSelectAdminImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAdminPostError(null);
    setAdminImageFileName(file.name);
    setAdminImageUploading(true);

    try {
      const result = await uploadCommentImage(file);
      setAdminImageUrl(result.url);
      setAdminImagePublicId(result.publicId);
    } catch (err: any) {
      console.error("Failed to upload admin comment image:", err);
      setAdminPostError(err?.message || "Failed to upload sticker or image.");
      setAdminImageUrl(null);
      setAdminImagePublicId(null);
      setAdminImageFileName("");
    } finally {
      setAdminImageUploading(false);
      if (adminFileInputRef.current) adminFileInputRef.current.value = "";
    }
  };

  const handleRemoveAdminImage = () => {
    setAdminImageUrl(null);
    setAdminImagePublicId(null);
    setAdminImageFileName("");
    if (adminFileInputRef.current) adminFileInputRef.current.value = "";
  };

  // Admin can submit with text, sticker/image only (without text), or both
  const canSubmitAdminMain =
    Boolean(adminContent.trim() || adminImageUrl) && !adminSubmitting && !adminImageUploading;

  const handleSubmitAdminComment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!canSubmitAdminMain) return;

    setAdminPostError(null);
    setAdminSubmitting(true);

    try {
      await createComment({
        authorName: selectedAdminIdentity || "Bintang Prasetyo",
        isAnonymous: false,
        content: adminContent.trim(),
        imageUrl: adminImageUrl,
        imagePublicId: adminImagePublicId,
        filterConfig,
        fromAdminDashboard: true,
        adminAllowedNames: adminNames,
      });

      setAdminContent("");
      handleRemoveAdminImage();
      setAdminPostSuccess(true);
      setTimeout(() => setAdminPostSuccess(false), 3500);
    } catch (err: any) {
      console.error("Failed to post official admin comment:", err);
      setAdminPostError(err?.message || "Failed to publish admin comment.");
    } finally {
      setAdminSubmitting(false);
    }
  };

  const handleSelectReplyImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setReplyError(null);
    setReplyImageFileName(file.name);
    setReplyImageUploading(true);

    try {
      const result = await uploadCommentImage(file);
      setReplyImageUrl(result.url);
      setReplyImagePublicId(result.publicId);
    } catch (err: any) {
      console.error("Failed to upload admin reply image:", err);
      setReplyError(err?.message || "Failed to upload reply sticker or image.");
      setReplyImageUrl(null);
      setReplyImagePublicId(null);
      setReplyImageFileName("");
    } finally {
      setReplyImageUploading(false);
      if (replyFileInputRef.current) replyFileInputRef.current.value = "";
    }
  };

  const handleRemoveReplyImage = () => {
    setReplyImageUrl(null);
    setReplyImagePublicId(null);
    setReplyImageFileName("");
    if (replyFileInputRef.current) replyFileInputRef.current.value = "";
  };

  // Admin can reply with text, sticker/image only (without text), or both
  const canSubmitAdminReply =
    Boolean(replyContent.trim() || replyImageUrl) && !replySubmitting && !replyImageUploading;

  const handleSubmitAdminReply = async (targetComment: CommentItem) => {
    if (!canSubmitAdminReply) return;

    setReplyError(null);
    setReplySubmitting(true);

    try {
      await createComment({
        authorName: selectedAdminIdentity || "Bintang Prasetyo",
        isAnonymous: false,
        content: replyContent.trim(),
        imageUrl: replyImageUrl,
        imagePublicId: replyImagePublicId,
        parentId: targetComment.id,
        replyToAuthor: targetComment.authorName,
        filterConfig,
        fromAdminDashboard: true,
        adminAllowedNames: adminNames,
      });

      setReplyContent("");
      handleRemoveReplyImage();
      setReplyingTo(null);
    } catch (err: any) {
      console.error("Failed to post official admin reply:", err);
      setReplyError(err?.message || "Failed to send admin reply.");
    } finally {
      setReplySubmitting(false);
    }
  };

  const handleToggleReply = (comment: CommentItem) => {
    if (replyingTo?.id === comment.id) {
      setReplyingTo(null);
      handleRemoveReplyImage();
    } else {
      setReplyingTo(comment);
      setReplyContent("");
      setReplyError(null);
      handleRemoveReplyImage();
    }
  };

  const handleAddAdminName = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newAdminName.trim();
    if (!name) return;

    if (adminNames.some((n) => n.toLowerCase() === name.toLowerCase())) {
      setAdminNamesNotice("That identity name is already in the list.");
      return;
    }

    setAdminNamesNotice(null);
    setAdminNames((prev) => [...prev, name]);
    setNewAdminName("");
  };

  const handleRemoveAdminName = (nameToRemove: string) => {
    setAdminNamesNotice(null);
    setAdminNames((prev) => prev.filter((n) => n !== nameToRemove));
  };

  const handleSaveAdminNames = async () => {
    setSavingAdminNames(true);
    setAdminNamesNotice(null);
    try {
      const { updateProfile } = await import("../../features/profile/api");
      await updateProfile({ adminAllowedNames: adminNames });
      setAdminNamesSuccess(true);
      setTimeout(() => setAdminNamesSuccess(false), 3000);
    } catch (err: any) {
      console.error("Failed to save admin names:", err);
      setAdminNamesNotice(
        "Failed to save administrator identity list: " + (err?.message || "Check account permissions.")
      );
    } finally {
      setSavingAdminNames(false);
    }
  };

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
      setCommentsError("Failed to delete comment: " + (err?.message || "Check account permissions."));
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
      setFilterNotice("Phrase is already in the filter list.");
      return;
    }

    setFilterNotice(null);
    setFilterConfig((prev) => ({
      ...prev,
      bannedPhrases: [...prev.bannedPhrases, phrase],
    }));
    setNewPhrase("");
  };

  const handleRemovePhrase = (phraseToRemove: string) => {
    setFilterNotice(null);
    setFilterConfig((prev) => ({
      ...prev,
      bannedPhrases: prev.bannedPhrases.filter((p) => p !== phraseToRemove),
    }));
  };

  const handleSaveFilterConfig = async () => {
    setSavingFilter(true);
    setFilterNotice(null);
    try {
      await saveCommentFilters(filterConfig);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error("Failed to save filter config:", err);
      setFilterNotice(
        "Failed to save filter settings: " + (err?.message || "Check account permissions.")
      );
    } finally {
      setSavingFilter(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "-";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return new Intl.DateTimeFormat("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch {
      return "-";
    }
  };

  const isCommentOfficial = (c: CommentItem) => {
    if (c.isAnonymous) return false;
    if (c.isAdmin === true) return true;
    return isProtectedAdminIdentity(c.authorName, adminNames);
  };

  const availableIdentities =
    adminNames.length > 0 ? adminNames : DEFAULT_ADMIN_IDENTITIES;

  // Build multi-level threaded grouping & search filtering
  const { threadedRoots, repliesMap, orphanReplies, flatFiltered, descendantCountMap } = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = (c: CommentItem) => {
      if (!q) return true;
      return (
        c.authorName.toLowerCase().includes(q) ||
        c.content.toLowerCase().includes(q) ||
        Boolean(c.replyToAuthor && c.replyToAuthor.toLowerCase().includes(q))
      );
    };

    const sortedDesc = [...comments].sort((a, b) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      return timeB - timeA;
    });

    const byId = new Map<string, CommentItem>();
    for (const c of sortedDesc) {
      byId.set(c.id, c);
    }

    const hasValidRootAncestor = (item: CommentItem): boolean => {
      const visited = new Set<string>([item.id]);
      let currParentId = item.parentId;
      while (currParentId) {
        if (visited.has(currParentId)) return false;
        visited.add(currParentId);
        const parentItem = byId.get(currParentId);
        if (!parentItem) return false;
        currParentId = parentItem.parentId;
      }
      return true;
    };

    const byParent: Record<string, CommentItem[]> = {};
    const orphans: CommentItem[] = [];

    for (const c of sortedDesc) {
      if (c.parentId) {
        if (hasValidRootAncestor(c)) {
          if (!byParent[c.parentId]) byParent[c.parentId] = [];
          byParent[c.parentId].push(c);
        } else if (matchesSearch(c)) {
          orphans.push(c);
        }
      }
    }

    // Chronological order for replies within each branch
    Object.keys(byParent).forEach((pid) => {
      byParent[pid].sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeA - timeB;
      });
    });

    const countMap: Record<string, number> = {};
    const countDescendants = (id: string, visited = new Set<string>()): number => {
      if (visited.has(id)) return 0;
      if (countMap[id] !== undefined) return countMap[id];
      visited.add(id);
      const children = byParent[id] || [];
      let total = children.length;
      for (const ch of children) {
        total += countDescendants(ch.id, visited);
      }
      visited.delete(id);
      countMap[id] = total;
      return total;
    };

    const subtreeMatchesSearch = (id: string, visited = new Set<string>()): boolean => {
      if (visited.has(id)) return false;
      visited.add(id);
      const children = byParent[id] || [];
      for (const ch of children) {
        if (matchesSearch(ch) || subtreeMatchesSearch(ch.id, visited)) return true;
      }
      return false;
    };

    for (const c of sortedDesc) {
      countDescendants(c.id);
    }

    const roots = sortedDesc.filter((c) => {
      if (c.parentId) return false;
      if (matchesSearch(c)) return true;
      return subtreeMatchesSearch(c.id);
    });

    const flat = sortedDesc.filter((c) => {
      if (filterType === "roots" && c.parentId) return false;
      if (filterType === "replies" && !c.parentId) return false;
      return matchesSearch(c);
    });

    return {
      threadedRoots: roots,
      repliesMap: byParent,
      orphanReplies: orphans,
      flatFiltered: flat,
      descendantCountMap: countMap,
    };
  }, [comments, searchQuery, filterType]);

  // Reusable Inline Reply Composer JSX for any comment/reply card
  const renderInlineReplyComposer = (target: CommentItem) => {
    if (replyingTo?.id !== target.id) return null;

    return (
      <div className="mt-2 p-4 rounded-xl bg-[rgba(12,28,46,0.8)] border border-emerald-500/35 flex flex-col gap-3">
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
          <span className="text-emerald-300 font-medium flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>
              Replying to <strong>@{target.authorName}</strong> as{" "}
              <strong>{selectedAdminIdentity}</strong>
            </span>
          </span>

          <div className="flex items-center gap-2">
            <select
              value={selectedAdminIdentity}
              onChange={(e) => setSelectedAdminIdentity(e.target.value)}
              className="glass-input px-2.5 py-1 rounded-lg text-xs bg-white/5 border border-white/15 text-emerald-200 outline-none cursor-pointer"
            >
              {availableIdentities.map((identity) => (
                <option key={identity} value={identity} className="bg-[#0B1526] text-white">
                  {identity}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                setReplyingTo(null);
                handleRemoveReplyImage();
              }}
              className="text-white/40 hover:text-white p-1 cursor-pointer"
              title="Close reply form"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        <textarea
          value={replyContent}
          onChange={(e) => {
            setReplyContent(e.target.value);
            if (replyError) setReplyError(null);
          }}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
              e.preventDefault();
              handleSubmitAdminReply(target);
            }
          }}
          rows={2}
          maxLength={MAX_CHARS}
          placeholder={
            replyImageUrl
              ? `Add reply text (optional — sticker is ready to send)...`
              : `Write a reply to @${target.authorName} or attach a sticker/image without text...`
          }
          className="glass-input w-full p-3 rounded-lg text-xs leading-relaxed bg-white/5 border border-white/15 focus:border-emerald-400/70 outline-none text-white resize-none"
          disabled={replySubmitting}
        />

        {/* Sticker Preview inside Reply Composer */}
        {(replyImageUrl || replyImageUploading) && (
          <div className="p-2.5 rounded-xl bg-black/30 border border-white/10 flex items-center justify-between gap-3 w-fit max-w-full">
            <div className="flex items-center gap-3 min-w-0">
              {replyImageUrl ? (
                <div className="w-fit shrink-0">
                  <img
                    src={replyImageUrl}
                    alt="Reply sticker preview"
                    className="block w-auto h-auto max-w-[96px] max-h-[96px] object-contain rounded-lg drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-lg border border-dashed border-[#7DB3FF]/40 bg-[#7DB3FF]/10 flex items-center justify-center shrink-0 text-[#7DB3FF]">
                  <Loader2 size={14} className="animate-spin" />
                </div>
              )}
              <div className="flex flex-col min-w-0 pr-1">
                <span className="text-[11px] text-white/90 truncate max-w-[180px]">
                  {replyImageFileName || "Sticker / Image"}
                </span>
                <span className="text-[10px] text-emerald-300/80">
                  {replyImageUploading ? "Uploading..." : "Ready to send directly without text"}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemoveReplyImage}
              className="text-white/40 hover:text-red-400 p-1 cursor-pointer shrink-0"
              title="Remove sticker/image"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {replyError && (
          <div className="text-[11px] text-red-300 p-2 rounded bg-red-500/10 border border-red-500/20">
            {replyError}
          </div>
        )}

        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <input
              ref={replyFileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
              onChange={handleSelectReplyImage}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => replyFileInputRef.current?.click()}
              disabled={replyImageUploading || replySubmitting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-white/5 hover:bg-white/10 text-[#7DB3FF] border border-white/10 transition-colors cursor-pointer disabled:opacity-40"
            >
              {replyImageUploading ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <ImageIcon size={12} />
                  <span>{replyImageUrl ? "Change Sticker / Image" : "Sticker / Image"}</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setReplyingTo(null);
                handleRemoveReplyImage();
              }}
              className="px-3 py-1.5 text-xs text-white/60 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!canSubmitAdminReply}
              onClick={() => handleSubmitAdminReply(target)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer disabled:opacity-40 transition-colors"
            >
              {replySubmitting ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send size={12} />
                  <span>
                    {replyImageUrl && !replyContent.trim()
                      ? "Send Sticker Reply"
                      : "Send Reply"}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Sticker-style image view in Admin list (div strictly hugs image dimensions)
  const renderAttachedSticker = (imageUrl?: string | null, authorName?: string) => {
    if (!imageUrl) return null;
    return (
      <div className="pl-1 self-start w-fit">
        <a
          href={imageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block w-fit select-none transition-transform duration-200 hover:scale-[1.03]"
          title="Click to open full size in a new tab"
        >
          <img
            src={imageUrl}
            alt={`Sticker from ${authorName || "Admin"}`}
            loading="lazy"
            className="block w-auto h-auto max-w-[152px] sm:max-w-[176px] max-h-[152px] sm:max-h-[176px] object-contain rounded-xl drop-shadow-[0_6px_16px_rgba(0,0,0,0.38)]"
          />
          <span className="mt-1 inline-flex items-center gap-1 text-[10px] text-[#7DB3FF]/75 opacity-0 group-hover:opacity-100 transition-opacity">
            <ExternalLink size={10} /> Open original
          </span>
        </a>
      </div>
    );
  };

  // Recursive nested reply renderer for Admin threaded view
  const renderAdminReplyNode = (reply: CommentItem, depth: number): React.ReactNode => {
    const replyOfficial = isCommentOfficial(reply);
    const isReplyingToSub = replyingTo?.id === reply.id;
    const subReplies = repliesMap[reply.id] || [];
    const indentClass =
      depth < 3
        ? "ml-2 sm:ml-3.5 pl-3 sm:pl-4"
        : depth < 5
          ? "ml-1.5 sm:ml-2.5 pl-2.5 sm:pl-3"
          : "ml-0.5 sm:ml-1 pl-2 sm:pl-2.5";

    return (
      <div
        key={reply.id}
        id={`admin-reply-${reply.id}`}
        className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col gap-2.5"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0 flex-wrap">
            <span
              className={`w-6 h-6 rounded-lg text-[10px] font-bold flex items-center justify-center shrink-0 border ${
                reply.isAnonymous
                  ? "bg-white/5 border-white/15 text-white/50"
                  : replyOfficial
                    ? "bg-emerald-500/25 border-emerald-500/40 text-emerald-300"
                    : "bg-[#7DB3FF]/20 border-[#7DB3FF]/40 text-[#7DB3FF]"
              }`}
            >
              {reply.isAnonymous ? (
                "A"
              ) : replyOfficial ? (
                <ShieldCheck size={12} className="text-emerald-400" />
              ) : (
                reply.authorName.charAt(0) || "U"
              )}
            </span>
            <span className="text-xs font-semibold text-white">{reply.authorName}</span>
            {replyOfficial && (
              <span className="text-[9.5px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-0.5">
                <ShieldCheck size={9} /> Admin
              </span>
            )}
            {reply.replyToAuthor && (
              <span className="text-[11px] text-[#7DB3FF]/80 font-light">
                ↳ @{reply.replyToAuthor}
              </span>
            )}
            <span className="text-[10px] text-white/40 font-mono">
              • {formatDate(reply.createdAt)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => handleToggleReply(reply)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium cursor-pointer flex items-center gap-1 transition-colors border ${
                isReplyingToSub
                  ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                  : "bg-white/5 border-white/10 text-[#7DB3FF] hover:text-white"
              }`}
              title={`Reply to @${reply.authorName}`}
            >
              <CornerDownRight size={11} />
              <span>{isReplyingToSub ? "Cancel" : "Reply"}</span>
            </button>
            <button
              type="button"
              onClick={() => setCommentToDelete(reply)}
              disabled={deletingId === reply.id}
              className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white/5 hover:bg-red-500/15 border border-white/10 text-red-400 hover:text-red-300 cursor-pointer flex items-center gap-1 transition-colors"
              title="Delete this reply"
            >
              <Trash2 size={11} />
            </button>
          </div>
        </div>

        {reply.content.trim() ? (
          <div className="text-xs text-[#C0D3EB] font-light leading-relaxed whitespace-pre-wrap break-words pl-1">
            {reply.content}
          </div>
        ) : null}

        {renderAttachedSticker(reply.imageUrl, reply.authorName)}

        {renderInlineReplyComposer(reply)}

        {subReplies.length > 0 && (
          <div
            className={`mt-1 flex flex-col gap-2.5 border-l-2 border-l-[#7DB3FF]/25 ${indentClass}`}
          >
            {subReplies.map((child) => renderAdminReplyNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header & Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-medium text-white flex items-center gap-2.5">
            <MessageSquare className="text-[#7DB3FF]" size={22} />
            <span>Public Comments Management</span>
          </h2>
          <p className="text-text-secondary text-sm font-light mt-1">
            Post official comments or stickers/images without requiring text, reply to visitor threads directly from the Dashboard, and manage protected identities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-text-secondary">
            Total: <strong className="text-white ml-1">{comments.length}</strong>
          </div>
        </div>
      </div>

      {/* Official Admin Comment & Sticker Composer (Exclusive to Dashboard) */}
      <div className="glass-card p-6 rounded-2xl border border-emerald-500/25 bg-[rgba(10,24,40,0.55)] backdrop-blur-xl flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-400" />
            <h3 className="text-base font-semibold text-white">
              Post Official Comment or Sticker as Admin
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-text-secondary">Sender Identity:</span>
            <select
              value={selectedAdminIdentity}
              onChange={(e) => setSelectedAdminIdentity(e.target.value)}
              className="glass-input px-3 py-1.5 rounded-xl text-xs bg-[rgba(255,255,255,0.06)] border border-emerald-500/35 text-emerald-200 focus:border-emerald-400 outline-none cursor-pointer"
            >
              {availableIdentities.map((identity) => (
                <option key={identity} value={identity} className="bg-[#0B1526] text-white">
                  {identity}
                </option>
              ))}
            </select>
          </div>
        </div>

        <form onSubmit={handleSubmitAdminComment} className="flex flex-col gap-3">
          <div className="relative">
            <textarea
              value={adminContent}
              onChange={(e) => {
                setAdminContent(e.target.value);
                if (adminPostError) setAdminPostError(null);
              }}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                  e.preventDefault();
                  handleSubmitAdminComment();
                }
              }}
              rows={3}
              maxLength={MAX_CHARS}
              placeholder={
                adminImageUrl
                  ? `Optional text (you can send the sticker/image directly without text)...`
                  : `Write an official comment as ${selectedAdminIdentity}, or attach a sticker/image directly without typing text...`
              }
              className="glass-input w-full p-3.5 rounded-xl text-sm leading-relaxed bg-white/[0.04] border border-white/15 focus:border-emerald-400/70 outline-none text-white placeholder:text-white/35 resize-none"
              disabled={adminSubmitting}
            />
            <span
              className={`absolute bottom-2.5 right-3 text-[11px] font-mono ${
                adminContent.length >= MAX_CHARS ? "text-red-400" : "text-white/40"
              }`}
            >
              {adminContent.length}/{MAX_CHARS}
            </span>
          </div>

          {(adminImageUrl || adminImageUploading) && (
            <div className="p-3 rounded-xl bg-black/30 border border-white/15 flex items-center justify-between gap-4 w-fit max-w-full">
              <div className="flex items-center gap-3 min-w-0">
                {adminImageUrl ? (
                  <div className="w-fit shrink-0">
                    <img
                      src={adminImageUrl}
                      alt="Admin sticker preview"
                      className="block w-auto h-auto max-w-[112px] max-h-[112px] object-contain rounded-xl drop-shadow-[0_6px_16px_rgba(0,0,0,0.4)]"
                    />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-lg border border-dashed border-[#7DB3FF]/50 bg-[#7DB3FF]/10 flex items-center justify-center shrink-0 text-[#7DB3FF]">
                    <Loader2 size={16} className="animate-spin" />
                  </div>
                )}
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-medium text-white truncate max-w-xs">
                    {adminImageFileName || "Attached Sticker / Image"}
                  </span>
                  <span className="text-[11px] text-emerald-300/85 flex items-center gap-1">
                    {adminImageUploading ? (
                      <>
                        <UploadCloud size={11} className="animate-pulse" /> Uploading to Cloudinary...
                      </>
                    ) : (
                      <>
                        <Check size={11} /> Ready to send as sticker (text optional)
                      </>
                    )}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveAdminImage}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-red-400 transition-colors cursor-pointer shrink-0"
                title="Remove sticker/image"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {adminPostError && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0 text-red-400" />
              <span>{adminPostError}</span>
            </div>
          )}

          {adminPostSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <Check size={14} className="shrink-0 text-emerald-400" />
              <span>Published to the public comments page.</span>
            </div>
          )}

          <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
            <div>
              <input
                ref={adminFileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                onChange={handleSelectAdminImage}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => adminFileInputRef.current?.click()}
                disabled={adminImageUploading || adminSubmitting}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/15 text-[#7DB3FF] transition-all cursor-pointer disabled:opacity-40"
              >
                {adminImageUploading ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <ImageIcon size={14} />
                    <span>{adminImageUrl ? "Change Sticker / Image" : "Select Sticker / Image"}</span>
                  </>
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={!canSubmitAdminMain}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer disabled:opacity-40 shadow-sm"
            >
              {adminSubmitting ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Send size={13} />
                  <span>
                    {adminImageUrl && !adminContent.trim()
                      ? `Send Sticker as ${selectedAdminIdentity}`
                      : `Publish as ${selectedAdminIdentity}`}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Comments List & Reply Moderation Section */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                filterType === "all"
                  ? "bg-[#7DB3FF]/25 border border-[#7DB3FF]/50 text-white"
                  : "bg-white/5 border border-white/10 text-text-secondary hover:text-white"
              }`}
            >
              Threads ({comments.length})
            </button>
            <button
              onClick={() => setFilterType("roots")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                filterType === "roots"
                  ? "bg-[#7DB3FF]/25 border border-[#7DB3FF]/50 text-white"
                  : "bg-white/5 border border-white/10 text-text-secondary hover:text-white"
              }`}
            >
              Root Comments ({comments.filter((c) => !c.parentId).length})
            </button>
            <button
              onClick={() => setFilterType("replies")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                filterType === "replies"
                  ? "bg-[#7DB3FF]/25 border border-[#7DB3FF]/50 text-white"
                  : "bg-white/5 border border-white/10 text-text-secondary hover:text-white"
              }`}
            >
              All Replies ({comments.filter((c) => c.parentId).length})
            </button>
          </div>

          <div className="relative max-w-xs w-full">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search comments or names..."
              className="glass-input pl-9 pr-3 py-1.5 rounded-xl text-xs w-full bg-white/5 border border-white/15 text-white placeholder:text-white/40 focus:border-[#7DB3FF] outline-none"
            />
          </div>
        </div>

        {/* Comments Feed / Threaded Cards */}
        {commentsError ? (
          <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {commentsError}
          </div>
        ) : loadingComments ? (
          <div className="glass-card p-12 rounded-2xl text-center text-text-secondary text-sm">
            Loading comments...
          </div>
        ) : (filterType === "all"
            ? threadedRoots.length === 0 && orphanReplies.length === 0
            : flatFiltered.length === 0) ? (
          <div className="glass-card p-12 rounded-2xl text-center text-text-secondary font-light">
            No comments match your current search or filter.
          </div>
        ) : filterType === "all" ? (
          <div className="flex flex-col gap-4">
            {threadedRoots.map((comment) => {
              const official = isCommentOfficial(comment);
              const isReplyingHere = replyingTo?.id === comment.id;
              const childReplies = repliesMap[comment.id] || [];

              return (
                <div
                  key={comment.id}
                  id={`admin-comment-${comment.id}`}
                  className="glass-card p-5 rounded-2xl border border-white/10 bg-[rgba(10,24,42,0.45)] flex flex-col gap-3 transition-all hover:border-white/20"
                >
                  {/* Root Comment Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`w-8 h-8 rounded-xl text-xs font-bold flex items-center justify-center shrink-0 border ${
                          comment.isAnonymous
                            ? "bg-white/5 border-white/15 text-white/50"
                            : official
                              ? "bg-emerald-500/25 border-emerald-500/40 text-emerald-300"
                              : "bg-[#7DB3FF]/20 border-[#7DB3FF]/40 text-[#7DB3FF]"
                        }`}
                      >
                        {comment.isAnonymous ? (
                          "A"
                        ) : official ? (
                          <ShieldCheck size={15} className="text-emerald-400" />
                        ) : (
                          comment.authorName.charAt(0) || "U"
                        )}
                      </span>

                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-white truncate">
                            {comment.authorName}
                          </span>
                          {official && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                              <ShieldCheck size={10} /> Official Admin
                            </span>
                          )}
                          {comment.isAnonymous && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/50 border border-white/10">
                              Anonymous
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-white/40 font-mono flex items-center gap-1">
                          <Clock size={11} />
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Reply & Delete Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleReply(comment)}
                        className={`ios-glass-btn px-3 py-1.5 text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-colors ${
                          isReplyingHere
                            ? "text-emerald-300 border-emerald-500/40 bg-emerald-500/15"
                            : "text-[#7DB3FF] hover:text-white"
                        }`}
                        title="Reply to this comment as Admin"
                      >
                        <CornerDownRight size={13} />
                        <span>{isReplyingHere ? "Cancel Reply" : "Reply"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(comment)}
                        disabled={deletingId === comment.id}
                        className="ios-glass-btn px-3 py-1.5 text-xs text-red-400 hover:text-red-300 font-semibold cursor-pointer flex items-center gap-1.5 transition-colors"
                        title="Delete this comment"
                      >
                        <Trash2 size={13} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Root Comment Text (if non-empty) */}
                  {comment.content.trim() ? (
                    <div className="text-xs sm:text-sm text-[#C0D3EB] font-light leading-relaxed whitespace-pre-wrap break-words pl-1 bg-white/[0.02] p-3 rounded-lg border border-white/5">
                      {comment.content}
                    </div>
                  ) : null}

                  {/* Root Attached Sticker / Image */}
                  {renderAttachedSticker(comment.imageUrl, comment.authorName)}

                  {/* Inline Reply Composer on Root */}
                  {renderInlineReplyComposer(comment)}

                  {/* Nested Replies inside Thread */}
                  {childReplies.length > 0 && (
                    <div className="mt-2 pt-3 border-t border-white/10 pl-3 sm:pl-5 border-l-2 border-l-[#7DB3FF]/25 ml-2 flex flex-col gap-3">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7DB3FF]/80">
                        {descendantCountMap[comment.id] || childReplies.length}{" "}
                        {(descendantCountMap[comment.id] || childReplies.length) === 1
                          ? "Reply"
                          : "Replies"}
                      </span>

                      {childReplies.map((reply) => renderAdminReplyNode(reply, 1))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Orphan Replies (if parent comment was previously deleted) */}
            {orphanReplies.map((comment) => {
              const official = isCommentOfficial(comment);
              const isReplyingHere = replyingTo?.id === comment.id;

              return (
                <div
                  key={comment.id}
                  id={`admin-comment-${comment.id}`}
                  className="glass-card p-5 rounded-xl border border-white/10 bg-[rgba(10,24,42,0.4)] flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-white">{comment.authorName}</span>
                      {official && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Official Admin
                        </span>
                      )}
                      <span className="text-xs text-[#7DB3FF] flex items-center gap-1">
                        <CornerDownRight size={12} />
                        <span>Reply {comment.replyToAuthor ? `to @${comment.replyToAuthor}` : ""}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleReply(comment)}
                        className="ios-glass-btn px-3 py-1 text-xs text-[#7DB3FF] hover:text-white font-semibold cursor-pointer flex items-center gap-1.5"
                      >
                        <CornerDownRight size={13} />
                        <span>{isReplyingHere ? "Cancel" : "Reply"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(comment)}
                        disabled={deletingId === comment.id}
                        className="ios-glass-btn px-3 py-1 text-xs text-red-400 hover:text-red-300 font-semibold cursor-pointer flex items-center gap-1.5"
                      >
                        <Trash2 size={13} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                  {comment.content.trim() ? (
                    <div className="text-xs sm:text-sm text-[#C0D3EB] font-light whitespace-pre-wrap break-words pl-1">
                      {comment.content}
                    </div>
                  ) : null}
                  {renderAttachedSticker(comment.imageUrl, comment.authorName)}
                  {renderInlineReplyComposer(comment)}
                </div>
              );
            })}
          </div>
        ) : (
          /* Filtered Flat View ("roots" or "replies") */
          <div className="flex flex-col gap-3">
            {flatFiltered.map((comment) => {
              const official = isCommentOfficial(comment);
              const isReplyingHere = replyingTo?.id === comment.id;

              return (
                <div
                  key={comment.id}
                  id={`admin-comment-${comment.id}`}
                  className="glass-card p-5 rounded-xl border border-white/10 bg-[rgba(10,24,42,0.4)] flex flex-col gap-3 transition-all hover:border-white/20"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 border ${
                          comment.isAnonymous
                            ? "bg-white/5 border-white/15 text-white/50"
                            : official
                              ? "bg-emerald-500/25 border-emerald-500/40 text-emerald-300"
                              : "bg-[#7DB3FF]/20 border-[#7DB3FF]/40 text-[#7DB3FF]"
                        }`}
                      >
                        {comment.isAnonymous ? (
                          "A"
                        ) : official ? (
                          <ShieldCheck size={14} className="text-emerald-400" />
                        ) : (
                          comment.authorName.charAt(0) || "U"
                        )}
                      </span>

                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-white truncate">
                            {comment.authorName}
                          </span>
                          {official && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                              <ShieldCheck size={10} /> Official Admin
                            </span>
                          )}
                          {comment.parentId && (
                            <span className="text-xs text-[#7DB3FF] flex items-center gap-1">
                              <CornerDownRight size={12} />
                              <span>
                                Reply {comment.replyToAuthor ? `to @${comment.replyToAuthor}` : ""}
                              </span>
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-white/40 font-mono flex items-center gap-1">
                          <Clock size={11} />
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleReply(comment)}
                        className={`ios-glass-btn px-3 py-1.5 text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-colors ${
                          isReplyingHere
                            ? "text-emerald-300 border-emerald-500/40 bg-emerald-500/15"
                            : "text-[#7DB3FF] hover:text-white"
                        }`}
                      >
                        <CornerDownRight size={13} />
                        <span>{isReplyingHere ? "Cancel Reply" : "Reply"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(comment)}
                        disabled={deletingId === comment.id}
                        className="ios-glass-btn px-3 py-1.5 text-xs text-red-400 hover:text-red-300 font-semibold cursor-pointer flex items-center gap-1.5 transition-colors"
                      >
                        <Trash2 size={13} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>

                  {comment.content.trim() ? (
                    <div className="text-xs sm:text-sm text-[#C0D3EB] font-light leading-relaxed whitespace-pre-wrap break-words pl-1 bg-white/[0.02] p-3 rounded-lg border border-white/5">
                      {comment.content}
                    </div>
                  ) : null}

                  {renderAttachedSticker(comment.imageUrl, comment.authorName)}

                  {renderInlineReplyComposer(comment)}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Phrase Filter & Page Description Settings Box */}
      <div className="glass-card p-6 rounded-2xl border border-[rgba(130,180,255,0.2)] bg-[rgba(10,20,38,0.5)] backdrop-blur-xl flex flex-col gap-6">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Sliders size={18} className="text-[#7DB3FF]" />
            <h3 className="text-base font-semibold text-white">
              Page Settings &amp; Comment Filters
            </h3>
          </div>

          <div className="flex items-center gap-3">
            {saveSuccess && (
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <Check size={14} /> Saved!
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
              <span>Save Changes</span>
            </button>
          </div>
        </div>

        {filterNotice && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0 text-amber-400" />
            <span>{filterNotice}</span>
          </div>
        )}

        {/* Toggle Public Comments Feature Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/10">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-white">Public Comments Feature Status</span>
              <span
                className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                  filterConfig.enabled !== false
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                }`}
              >
                {filterConfig.enabled !== false ? "ACTIVE" : "DISABLED"}
              </span>
            </div>
            <p className="text-[11px] text-text-tertiary">
              When disabled, the visitor submission form is temporarily paused, while existing discussions remain readable and Admins can still publish comments from this Dashboard.
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
              {filterConfig.enabled !== false ? "Active" : "Disabled"}
            </span>
          </div>
        </div>

        {/* Header Description Editor */}
        <div className="flex flex-col gap-2 bg-white/[0.02] p-4 rounded-xl border border-white/5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-white/90 flex items-center gap-1.5">
              <FileText size={13} className="text-[#7DB3FF]" />
              <span>Comments Page Description / Subtitle (&lt;p&gt;)</span>
            </label>
            <button
              type="button"
              onClick={() =>
                setFilterConfig((prev) => ({ ...prev, headerDescription: DEFAULT_HEADER_DESCRIPTION }))
              }
              className="text-[11px] text-white/40 hover:text-[#7DB3FF] flex items-center gap-1 transition-colors"
              title="Restore default description text"
            >
              <RotateCcw size={11} />
              <span>Reset Default</span>
            </button>
          </div>
          <textarea
            rows={2}
            value={filterConfig.headerDescription || ""}
            onChange={(e) =>
              setFilterConfig((prev) => ({ ...prev, headerDescription: e.target.value }))
            }
            placeholder="Write an introductory subtitle displayed beneath the Comments heading..."
            className="glass-input w-full p-3 rounded-xl text-xs leading-relaxed bg-white/5 border border-white/15 focus:border-[#7DB3FF] outline-none text-white resize-none"
          />
          <span className="text-[11px] text-text-tertiary">
            Displayed in real time beneath the header on the public <code>/comments</code> page.
          </span>
        </div>

        {/* Action Mode Radio */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-xs text-text-secondary">
          <span className="font-medium text-white/80">Action when phrase is detected:</span>
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
              <span>Auto-Censor (replace phrase with ***)</span>
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
              <span>Reject Submission (show warning notice)</span>
            </label>
          </div>
        </div>

        {/* Add Phrase Form */}
        <form onSubmit={handleAddPhrase} className="flex gap-2 max-w-md">
          <input
            type="text"
            value={newPhrase}
            onChange={(e) => {
              setNewPhrase(e.target.value);
              if (filterNotice) setFilterNotice(null);
            }}
            placeholder="Add a restricted word or phrase..."
            className="glass-input px-3.5 py-2 rounded-xl text-xs flex-1 bg-white/5 border border-white/15 text-white placeholder:text-white/40 focus:border-[#7DB3FF] outline-none"
          />
          <button
            type="submit"
            disabled={!newPhrase.trim()}
            className="px-4 py-2 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/10 text-[#7DB3FF] border border-white/10 transition-all duration-200 cursor-pointer disabled:opacity-40 flex items-center gap-1"
          >
            <Plus size={14} />
            <span>Add</span>
          </button>
        </form>

        {/* Active Banned Phrases Badges */}
        <div className="flex flex-wrap gap-2 pt-1">
          {filterConfig.bannedPhrases.length === 0 ? (
            <span className="text-xs text-text-tertiary italic">
              No restricted phrases configured. All words are allowed.
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
                  title={`Remove filter "${phrase}"`}
                >
                  <X size={12} />
                </button>
              </span>
            ))
          )}
        </div>
      </div>

      {/* Admin Protected Identities Management Box */}
      <div className="glass-card p-6 rounded-2xl border border-[rgba(130,180,255,0.2)] bg-[rgba(10,20,38,0.5)] backdrop-blur-xl flex flex-col gap-6">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert size={18} className="text-[#7DB3FF]" />
            <h3 className="text-base font-semibold text-white">
              Protected Administrator Identities
            </h3>
          </div>

          <div className="flex items-center gap-3">
            {adminNamesSuccess && (
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <Check size={14} /> Saved!
              </span>
            )}
            <button
              onClick={handleSaveAdminNames}
              disabled={savingAdminNames}
              className="px-4 py-2 rounded-xl text-xs font-medium bg-[#205BF0] hover:bg-[#1A4ED4] text-white transition-all duration-200 cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
            >
              {savingAdminNames ? (
                <RefreshCw size={12} className="animate-spin" />
              ) : (
                <Save size={12} />
              )}
              <span>Save Admin Identities</span>
            </button>
          </div>
        </div>

        <p className="text-xs text-text-secondary leading-relaxed font-light">
          Every name in this list is strictly protected: public visitors attempting to use these names in the comment form will have authorization automatically denied without exposing internal details, and posting under these identities is restricted exclusively to this Dashboard.
        </p>

        {adminNamesNotice && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0 text-amber-400" />
            <span>{adminNamesNotice}</span>
          </div>
        )}

        {/* Add Admin Name Form */}
        <form onSubmit={handleAddAdminName} className="flex gap-2 max-w-md">
          <input
            type="text"
            value={newAdminName}
            onChange={(e) => {
              setNewAdminName(e.target.value);
              if (adminNamesNotice) setAdminNamesNotice(null);
            }}
            placeholder="Add a protected identity name (e.g., Bintang, Staff)..."
            className="glass-input px-3.5 py-2 rounded-xl text-xs flex-1 bg-white/5 border border-white/15 text-white placeholder:text-white/40 focus:border-[#7DB3FF] outline-none"
            maxLength={60}
          />
          <button
            type="submit"
            disabled={!newAdminName.trim()}
            className="px-4 py-2 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/10 text-[#7DB3FF] border border-white/10 transition-all duration-200 cursor-pointer disabled:opacity-40 flex items-center gap-1"
          >
            <Plus size={14} />
            <span>Add</span>
          </button>
        </form>

        {/* Active Admin Name Badges */}
        <div className="flex flex-wrap gap-2 pt-1">
          {adminNames.length === 0 ? (
            <span className="text-xs text-text-tertiary italic">
              No custom identity names configured (core defaults remain active).
            </span>
          ) : (
            adminNames.map((name) => (
              <span
                key={name}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs bg-[rgba(32,91,240,0.15)] border border-[#205BF0]/40 text-[#7DB3FF] backdrop-blur-md"
              >
                <span className="font-medium text-white">{name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveAdminName(name)}
                  className="text-white/50 hover:text-red-400 transition-colors p-0.5"
                  title={`Remove "${name}"`}
                >
                  <X size={12} />
                </button>
              </span>
            ))
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(commentToDelete)}
        title="Delete Comment"
        itemName={
          commentToDelete
            ? `${commentToDelete.authorName}: "${
                commentToDelete.content.trim()
                  ? `${commentToDelete.content.slice(0, 60)}${
                      commentToDelete.content.length > 60 ? "..." : ""
                    }`
                  : "[Sticker / Image]"
              }"`
            : undefined
        }
        description="This comment will be permanently deleted from the public discussion feed and Firestore database."
        isDeleting={isDeletingComment}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!isDeletingComment) setCommentToDelete(null);
        }}
      />
    </div>
  );
}

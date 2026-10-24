import React, { useState, useEffect, useMemo } from "react";
import {
  Send,
  CornerDownRight,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Clock,
  X,
  Smile,
  AlertCircle,
  MessageSquare,
  Minus,
  Plus,
} from "lucide-react";
import {
  subscribeToComments,
  createComment,
  subscribeToCommentFilters,
  checkAndFilterPhrases,
  isProtectedAdminIdentity,
  PUBLIC_IDENTITY_REJECTED_MESSAGE,
} from "../../features/comments/api";
import { getProfile, getCachedProfile } from "../../features/profile/api";
import { SiteProfile } from "../../features/profile/types";
import {
  CommentItem,
  CommentFilterConfig,
  DEFAULT_FILTER_CONFIG,
} from "../../features/comments/types";

export default function Comments() {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterConfig, setFilterConfig] = useState<CommentFilterConfig>(DEFAULT_FILTER_CONFIG);
  const [profile, setProfile] = useState<SiteProfile | null>(getCachedProfile);

  // Main comment form state
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  // Active reply state
  const [replyingTo, setReplyingTo] = useState<CommentItem | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replyAuthorName, setReplyAuthorName] = useState("");
  const [replyIsAnonymous, setReplyIsAnonymous] = useState(false);
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [collapsedThreads, setCollapsedThreads] = useState<Record<string, boolean>>({});

  const MAX_CHARS = 1000;

  useEffect(() => {
    getProfile().then((data) => {
      if (data) setProfile(data);
    });
  }, []);

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

  // Automatic rejection check if public visitor enters a protected admin identity
  const isClaimingAdmin = useMemo(() => {
    if (isAnonymous || !authorName.trim()) return false;
    return isProtectedAdminIdentity(authorName, profile?.adminAllowedNames);
  }, [authorName, isAnonymous, profile?.adminAllowedNames]);

  const isReplyClaimingAdmin = useMemo(() => {
    if (replyIsAnonymous || !replyAuthorName.trim()) return false;
    return isProtectedAdminIdentity(replyAuthorName, profile?.adminAllowedNames);
  }, [replyAuthorName, replyIsAnonymous, profile?.adminAllowedNames]);

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
      matchedPhrases: res.matchedPhrases,
    };
  }, [authorName, isAnonymous, filterConfig.bannedPhrases]);

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
      matchedPhrases: res.matchedPhrases,
    };
  }, [replyAuthorName, replyIsAnonymous, filterConfig.bannedPhrases]);

  const isOfficialComment = (comment: CommentItem) => {
    if (comment.isAnonymous) return false;
    if (comment.isAdmin === true) return true;
    return isProtectedAdminIdentity(comment.authorName, profile?.adminAllowedNames);
  };

  // Format date helper
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Just now";
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
      return "Just now";
    }
  };

  // Group comments into a multi-level Reddit-style tree: top-level roots + children map + recursive descendant counts
  const { rootComments, repliesByParent, descendantCountById } = useMemo(() => {
    const roots: CommentItem[] = [];
    const repliesMap: Record<string, CommentItem[]> = {};

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

    Object.keys(repliesMap).forEach((parentId) => {
      repliesMap[parentId].sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeA - timeB;
      });
    });

    const countById: Record<string, number> = {};
    const computeDescendants = (id: string, visited = new Set<string>()): number => {
      if (visited.has(id)) return 0;
      if (countById[id] !== undefined) return countById[id];
      visited.add(id);
      const direct = repliesMap[id] || [];
      let total = direct.length;
      for (const child of direct) {
        total += computeDescendants(child.id, visited);
      }
      visited.delete(id);
      countById[id] = total;
      return total;
    };

    for (const c of sorted) {
      computeDescendants(c.id);
    }

    return {
      rootComments: roots,
      repliesByParent: repliesMap,
      descendantCountById: countById,
    };
  }, [comments]);

  const toggleThreadCollapse = (commentId: string) => {
    setCollapsedThreads((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const handleToggleReplyTarget = (target: CommentItem) => {
    if (replyingTo?.id === target.id) {
      setReplyingTo(null);
    } else {
      setReplyingTo(target);
      setReplyContent("");
      setReplyError(null);
      setCollapsedThreads((prev) =>
        prev[target.id] ? { ...prev, [target.id]: false } : prev
      );
    }
  };

  // Handle main comment submission (public visitor only)
  const handleSubmitMain = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (submitting) return;

    if (!isAnonymous && !authorName.trim()) {
      setFormError('Please enter your name or check "Post Anonymously" before sending.');
      document.getElementById("comment-author-name")?.focus();
      return;
    }

    if (!isAnonymous && isClaimingAdmin) {
      setFormError(PUBLIC_IDENTITY_REJECTED_MESSAGE);
      document.getElementById("comment-author-name")?.focus();
      return;
    }

    if (!isAnonymous && authorBannedCheck.hasForbidden) {
      setFormError(
        `Display name cannot contain restricted phrases ("${authorBannedCheck.matchedPhrases.join(", ")}"). Please choose another name.`
      );
      document.getElementById("comment-author-name")?.focus();
      return;
    }

    if (!content.trim()) {
      setFormError("Please write your comment before sending.");
      document.getElementById("comment-content-textarea")?.focus();
      return;
    }

    setFormError(null);
    setSubmitting(true);

    try {
      await createComment({
        authorName: isAnonymous ? "Anonymous" : authorName.trim(),
        isAnonymous,
        content: content.trim(),
        filterConfig,
        fromAdminDashboard: false,
        adminAllowedNames: profile?.adminAllowedNames,
      });

      setContent("");
      setFormSuccess(true);
      setTimeout(() => setFormSuccess(false), 4000);
    } catch (err: any) {
      console.error("Failed to post comment:", err);
      setFormError(err?.message || "Failed to post comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleSubmitMain();
  };

  // Handle reply submission at any nesting depth (public visitor only)
  const handleSubmitReply = async (parentComment: CommentItem) => {
    if (replySubmitting) return;

    if (!replyIsAnonymous && !replyAuthorName.trim()) {
      setReplyError('Please enter your name or check "Post Anonymously" before sending.');
      document.getElementById(`reply-author-name-${parentComment.id}`)?.focus();
      return;
    }

    if (!replyIsAnonymous && isReplyClaimingAdmin) {
      setReplyError(PUBLIC_IDENTITY_REJECTED_MESSAGE);
      document.getElementById(`reply-author-name-${parentComment.id}`)?.focus();
      return;
    }

    if (!replyIsAnonymous && replyAuthorBannedCheck.hasForbidden) {
      setReplyError(
        `Display name cannot contain restricted phrases ("${replyAuthorBannedCheck.matchedPhrases.join(", ")}"). Please choose another name.`
      );
      document.getElementById(`reply-author-name-${parentComment.id}`)?.focus();
      return;
    }

    if (!replyContent.trim()) {
      setReplyError("Please write your reply before sending.");
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
        filterConfig,
        fromAdminDashboard: false,
        adminAllowedNames: profile?.adminAllowedNames,
      });

      setReplyContent("");
      setReplyingTo(null);
      setCollapsedThreads((prev) =>
        prev[parentComment.id] ? { ...prev, [parentComment.id]: false } : prev
      );
    } catch (err: any) {
      console.error("Failed to post reply:", err);
      setReplyError(err?.message || "Failed to post reply.");
    } finally {
      setReplySubmitting(false);
    }
  };

  const isMissingAuthorIdentity = !isAnonymous && !authorName.trim();
  const isMissingReplyAuthorIdentity = !replyIsAnonymous && !replyAuthorName.trim();
  const hasAuthorInputError = !isAnonymous && (isClaimingAdmin || authorBannedCheck.hasForbidden);
  const hasReplyAuthorError =
    !replyIsAnonymous && (isReplyClaimingAdmin || replyAuthorBannedCheck.hasForbidden);

  // Reusable inline reply composer for both root comments and nested replies
  const renderInlineReplyForm = (targetItem: CommentItem) => {
    if (replyingTo?.id !== targetItem.id) return null;

    return (
      <div className="mt-2 p-3.5 sm:p-4 rounded-xl bg-[rgba(15,30,55,0.65)] border border-[#7DB3FF]/30 flex flex-col gap-3 relative animate-fadeIn">
        <div className="flex items-center justify-between text-xs gap-2">
          <span className="text-[#7DB3FF] font-medium flex items-center gap-1.5 min-w-0 truncate">
            <CornerDownRight size={13} className="shrink-0" />
            <span className="truncate">
              Replying to <strong>@{targetItem.authorName}</strong>
            </span>
          </span>
          <button
            type="button"
            onClick={() => setReplyingTo(null)}
            className="text-white/40 hover:text-white p-1 cursor-pointer shrink-0"
            title="Cancel reply"
          >
            <X size={14} />
          </button>
        </div>

        {/* Identity for reply */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-[#A8B8CC] hover:text-white transition-colors select-none">
              <input
                type="checkbox"
                checked={replyIsAnonymous}
                onChange={(e) => {
                  setReplyIsAnonymous(e.target.checked);
                  if (replyError) setReplyError(null);
                }}
                className="w-3.5 h-3.5 rounded border-white/20 accent-[#7DB3FF] cursor-pointer"
              />
              <span>Post Anonymously</span>
            </label>

            {!replyIsAnonymous && (
              <input
                id={`reply-author-name-${targetItem.id}`}
                type="text"
                value={replyAuthorName}
                onChange={(e) => {
                  setReplyAuthorName(e.target.value);
                  if (replyError) setReplyError(null);
                }}
                aria-invalid={hasReplyAuthorError}
                required={!replyIsAnonymous}
                placeholder="Name"
                maxLength={60}
                className={`glass-input px-3 py-1.5 rounded-lg text-xs outline-none transition-all w-full sm:w-auto sm:min-w-[220px] ${
                  hasReplyAuthorError
                    ? "bg-red-500/10 border-red-500/50 text-red-100 placeholder:text-red-300/40"
                    : "bg-white/5 border border-white/10 focus:border-[#7DB3FF] text-white placeholder:text-white/35"
                }`}
              />
            )}
          </div>

          {!replyIsAnonymous && isReplyClaimingAdmin && (
            <div
              role="alert"
              className="flex items-center gap-1.5 text-[11px] text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2"
            >
              <ShieldAlert size={13} className="shrink-0 text-red-400" />
              <span>{PUBLIC_IDENTITY_REJECTED_MESSAGE}</span>
            </div>
          )}

          {!replyIsAnonymous && !isReplyClaimingAdmin && replyAuthorBannedCheck.hasForbidden && (
            <span className="text-[11px] text-red-400">
              Contains restricted phrases: "{replyAuthorBannedCheck.matchedPhrases.join(", ")}"
            </span>
          )}
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
              handleSubmitReply(targetItem);
            }
          }}
          rows={2}
          maxLength={MAX_CHARS}
          placeholder={`Write a reply to @${targetItem.authorName}...`}
          className="glass-input w-full p-3 rounded-lg text-xs leading-relaxed bg-white/5 border border-white/15 focus:border-[#7DB3FF] outline-none text-white placeholder:text-white/35 resize-none"
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
            className="px-3 py-1.5 text-xs text-white/60 hover:text-white cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={
              replySubmitting ||
              !replyContent.trim() ||
              isMissingReplyAuthorIdentity ||
              hasReplyAuthorError
            }
            onClick={() => handleSubmitReply(targetItem)}
            className="ios-glass-btn ios-glass-primary px-4 py-1.5 text-xs font-semibold cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
          >
            {replySubmitting ? "Sending..." : "Post Reply"}
          </button>
        </div>
      </div>
    );
  };

  // Recursive Reddit-style reply renderer
  const renderReplyNode = (reply: CommentItem, depth: number): React.ReactNode => {
    const replyIsOfficial = isOfficialComment(reply);
    const isReplyingToReply = replyingTo?.id === reply.id;
    const childReplies = repliesByParent[reply.id] || [];
    const totalNested = descendantCountById[reply.id] || childReplies.length;
    const isCollapsed = Boolean(collapsedThreads[reply.id]);

    // Cap horizontal indent on deep threads so mobile screens stay readable
    const nestedIndentClass =
      depth < 3
        ? "ml-2 sm:ml-3.5 pl-3 sm:pl-4"
        : depth < 5
          ? "ml-1.5 sm:ml-2.5 pl-2.5 sm:pl-3.5"
          : "ml-0.5 sm:ml-1.5 pl-2 sm:pl-3";

    return (
      <div
        key={reply.id}
        id={`reply-${reply.id}`}
        className="p-3 sm:p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col gap-2"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-wrap">
            <span
              className={`w-6 h-6 rounded-lg text-[10px] font-bold flex items-center justify-center shrink-0 border ${
                reply.isAnonymous
                  ? "bg-white/5 border-white/10 text-white/50"
                  : replyIsOfficial
                    ? "bg-emerald-500/25 border-emerald-500/40 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                    : "bg-[#7DB3FF]/20 border-[#7DB3FF]/30 text-[#7DB3FF]"
              }`}
            >
              {reply.isAnonymous ? (
                "A"
              ) : replyIsOfficial ? (
                <ShieldCheck size={12} className="text-emerald-400" />
              ) : (
                reply.authorName.charAt(0) || "U"
              )}
            </span>

            <span className="text-xs font-medium text-white truncate flex items-center gap-1.5">
              {reply.authorName}
              {replyIsOfficial && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-medium bg-emerald-500/20 border border-emerald-500/30 text-emerald-300">
                  <ShieldCheck size={10} className="text-emerald-400" />
                  Official
                </span>
              )}
            </span>

            {reply.isAnonymous && (
              <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-white/5 text-white/40">
                Anonymous
              </span>
            )}

            {reply.replyToAuthor && (
              <span className="text-[11px] text-[#7DB3FF]/80 font-light truncate">
                ↳ @{reply.replyToAuthor}
              </span>
            )}

            <span className="text-[10px] text-white/40 font-mono">
              • {formatDate(reply.createdAt)}
            </span>
          </div>

          {filterConfig.enabled !== false && (
            <button
              id={`reply-btn-${reply.id}`}
              type="button"
              onClick={() => handleToggleReplyTarget(reply)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium cursor-pointer transition-all duration-200 border shrink-0 ${
                isReplyingToReply
                  ? "bg-[#7DB3FF]/20 text-white border-[#7DB3FF]/50 shadow-[0_0_10px_rgba(125,179,255,0.2)]"
                  : "bg-white/[0.04] text-[#7DB3FF] border-white/10 hover:bg-[#7DB3FF]/15 hover:border-[#7DB3FF]/30 hover:text-white active:scale-[0.98]"
              }`}
              title={`Reply to @${reply.authorName}`}
            >
              <CornerDownRight size={11} />
              <span>{isReplyingToReply ? "Cancel" : "Reply"}</span>
            </button>
          )}
        </div>

        {reply.content.trim() ? (
          <div className="text-xs sm:text-[13px] text-[#C0D3EB] leading-relaxed font-light whitespace-pre-wrap break-words pl-1">
            {reply.content}
          </div>
        ) : null}

        {/* Attached Image / Sticker in Reply */}
        {reply.imageUrl && (
          <div className="pl-1 self-start w-fit">
            <div className="relative w-fit select-none">
              <img
                src={reply.imageUrl}
                alt={`Reply sticker from ${reply.authorName}`}
                loading="lazy"
                draggable={false}
                className="block w-auto h-auto max-w-[144px] sm:max-w-[168px] max-h-[144px] sm:max-h-[168px] object-contain rounded-xl drop-shadow-[0_6px_16px_rgba(0,0,0,0.35)] pointer-events-none"
              />
            </div>
          </div>
        )}

        {/* Inline Reply Composer on this Reply */}
        {renderInlineReplyForm(reply)}

        {/* Nested Sub-Replies (Reddit-style collapsible thread rail) */}
        {childReplies.length > 0 && (
          <div className="mt-1 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => toggleThreadCollapse(reply.id)}
              className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#7DB3FF]/80 hover:text-white transition-colors w-fit cursor-pointer select-none pl-1"
              aria-expanded={!isCollapsed}
            >
              <span className="w-4 h-4 rounded-md bg-white/[0.05] border border-white/15 flex items-center justify-center text-[#7DB3FF]">
                {isCollapsed ? <Plus size={10} /> : <Minus size={10} />}
              </span>
              <span>
                {isCollapsed
                  ? `Show ${totalNested} ${totalNested === 1 ? "reply" : "replies"}`
                  : `${totalNested} ${totalNested === 1 ? "reply" : "replies"}`}
              </span>
            </button>

            {!isCollapsed && (
              <div
                className={`flex flex-col gap-2.5 border-l-2 border-l-[#7DB3FF]/25 hover:border-l-[#7DB3FF]/50 transition-colors ${nestedIndentClass}`}
              >
                {childReplies.map((child) => renderReplyNode(child, depth + 1))}
              </div>
            )}
          </div>
        )}
      </div>
    );
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
            {filterConfig.headerDescription ? (
              <p className="text-[#A8B8CC] text-base sm:text-lg font-light max-w-2xl leading-relaxed">
                {filterConfig.headerDescription}
              </p>
            ) : null}
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[rgba(10,24,42,0.6)] border border-white/10 text-xs text-[#7DB3FF] shrink-0 self-start sm:self-auto backdrop-blur-md mb-2">
            <MessageSquare size={13} className="text-[#7DB3FF]" />
            <span>
              {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
            </span>
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
              Comment Submissions Are Paused
            </h3>
            <p className="text-xs text-amber-200/70 leading-relaxed">
              Posting new comments is temporarily disabled. You can still read all existing discussions below.
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
                Write a Comment
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
                    onChange={(e) => {
                      setIsAnonymous(e.target.checked);
                      if (formError) setFormError(null);
                    }}
                    className="w-4 h-4 rounded border-white/20 text-[#7DB3FF] focus:ring-0 focus:ring-offset-0 bg-white/5 cursor-pointer accent-[#7DB3FF]"
                  />
                  <span>Post Anonymously</span>
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
                    aria-invalid={hasAuthorInputError}
                    required={!isAnonymous}
                    placeholder="Name"
                    maxLength={60}
                    className={`glass-input px-4 py-2.5 rounded-xl text-sm w-full outline-none transition-all ${
                      hasAuthorInputError
                        ? "bg-red-500/10 border-red-500/60 focus:border-red-400 text-red-100 placeholder:text-red-300/40 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                        : "bg-[rgba(255,255,255,0.04)] border-white/15 focus:border-[#7DB3FF] focus:bg-[rgba(255,255,255,0.08)] text-white placeholder:text-white/40"
                    }`}
                    disabled={submitting}
                  />

                  {isClaimingAdmin && (
                    <div
                      role="alert"
                      className="flex items-center gap-2 text-xs text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl px-3.5 py-2.5"
                    >
                      <ShieldAlert size={14} className="shrink-0 text-red-400" />
                      <span>{PUBLIC_IDENTITY_REJECTED_MESSAGE}</span>
                    </div>
                  )}

                  {!isClaimingAdmin && authorBannedCheck.hasForbidden && (
                    <div className="flex items-center gap-1.5 text-xs text-red-400 px-1 pt-0.5">
                      <AlertCircle size={13} className="shrink-0 text-red-400" />
                      <span>
                        Display name cannot contain restricted phrases:{" "}
                        <strong className="font-semibold underline decoration-red-400/50">
                          "{authorBannedCheck.matchedPhrases.join(", ")}"
                        </strong>
                        .
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-xs text-white/50 italic px-1">
                  Your comment will be published as Anonymous.
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
                  placeholder="Share ur thought, questions, ideas, or vent your frustation"
                  className="glass-input w-full p-4 rounded-xl text-sm leading-relaxed bg-[rgba(255,255,255,0.04)] border border-white/15 focus:border-[#7DB3FF] focus:bg-[rgba(255,255,255,0.08)] outline-none text-white placeholder:text-white/40 resize-none transition-all"
                  disabled={submitting}
                  required
                />
                <div
                  className={`absolute bottom-3 right-3 text-[11px] font-mono ${
                    content.length >= MAX_CHARS ? "text-red-400" : "text-white/40"
                  }`}
                >
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
                  <span>Comment published! Thank you for joining the conversation.</span>
                </div>
              )}
            </div>

            {/* Bottom Controls */}
            <div className="flex items-center justify-end pt-1">
              <button
                id="submit-comment-button"
                type="button"
                onClick={handleSendButtonClick}
                disabled={submitting || !content.trim() || isMissingAuthorIdentity || hasAuthorInputError}
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
                    <Send
                      size={14}
                      className="transition-transform duration-200 group-hover:translate-x-0.5"
                    />
                    <span>Send</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Comments List Feed */}
      <section className="flex flex-col gap-4" aria-label="Public Comments Feed">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <h2 className="text-sm font-semibold tracking-wider uppercase text-[#7DB3FF]/90 flex items-center gap-2">
            <span>Recent Discussions</span>
            <span className="text-[11px] font-normal text-white/40">({comments.length})</span>
          </h2>
        </div>

        {loading ? (
          <div className="glass-card p-12 rounded-2xl flex flex-col items-center justify-center gap-3 text-[#A8B8CC]">
            <div className="w-6 h-6 rounded-full border-2 border-[#7DB3FF]/30 border-t-[#7DB3FF] animate-spin" />
            <span className="text-sm font-light">Loading discussions...</span>
          </div>
        ) : rootComments.length === 0 ? (
          <div className="glass-card p-12 rounded-2xl text-center flex flex-col items-center justify-center gap-3 text-[#A8B8CC]">
            <div className="w-12 h-12 rounded-full bg-[#7DB3FF]/10 border border-[#7DB3FF]/20 flex items-center justify-center text-[#7DB3FF] mb-1">
              <Smile size={24} />
            </div>
            <h3 className="text-lg font-medium text-white">No comments yet</h3>
            <p className="text-sm font-light max-w-sm">
              Be the first to start a conversation in this space.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {rootComments.map((item) => {
              const replies = repliesByParent[item.id] || [];
              const totalThreadReplies = descendantCountById[item.id] || replies.length;
              const isReplying = replyingTo?.id === item.id;
              const itemIsOfficial = isOfficialComment(item);
              const isRootThreadCollapsed = Boolean(collapsedThreads[item.id]);

              return (
                <div
                  key={item.id}
                  id={`comment-${item.id}`}
                  className="w-full rounded-2xl bg-[rgba(10,24,42,0.45)] border border-[rgba(130,180,255,0.14)] p-5 sm:p-6 backdrop-blur-xl transition-all hover:border-[rgba(130,180,255,0.3)] shadow-[0_10px_30px_rgba(0,0,0,0.25)] flex flex-col gap-4"
                >
                  {/* Author Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                          item.isAnonymous
                            ? "bg-white/5 border-white/15 text-white/60"
                            : itemIsOfficial
                              ? "bg-gradient-to-br from-emerald-500/35 to-teal-500/25 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                              : "bg-gradient-to-br from-[#7DB3FF]/30 to-[#3C8CFF]/20 border-[#7DB3FF]/40 text-[#7DB3FF]"
                        }`}
                      >
                        {item.isAnonymous ? (
                          <ShieldCheck size={16} />
                        ) : itemIsOfficial ? (
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
                            {itemIsOfficial && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 shadow-sm">
                                <ShieldCheck size={11} className="text-emerald-400" />
                                Official
                              </span>
                            )}
                          </span>
                          {item.isAnonymous && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 border border-white/10 text-white/50">
                              Anonymous
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
                        onClick={() => handleToggleReplyTarget(item)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all duration-200 border shrink-0 ${
                          isReplying
                            ? "bg-[#7DB3FF]/20 text-white border-[#7DB3FF]/50 shadow-[0_0_12px_rgba(125,179,255,0.25)]"
                            : "bg-white/[0.04] text-[#7DB3FF] border-white/10 hover:bg-[#7DB3FF]/15 hover:border-[#7DB3FF]/30 hover:text-white active:scale-[0.98]"
                        }`}
                        title="Reply to this comment"
                      >
                        <CornerDownRight size={13} />
                        <span>{isReplying ? "Cancel" : "Reply"}</span>
                      </button>
                    )}
                  </div>

                  {/* Comment Body */}
                  {item.content.trim() ? (
                    <div className="text-sm sm:text-[14.5px] text-[#D2E3F7] leading-relaxed font-light whitespace-pre-wrap break-words pl-1">
                      {item.content}
                    </div>
                  ) : null}

                  {/* Attached Image / Sticker (Div hugs image dimensions like WhatsApp sticker) */}
                  {item.imageUrl && (
                    <div className="pl-1 self-start w-fit">
                      <div className="relative w-fit select-none">
                        <img
                          src={item.imageUrl}
                          alt={`Sticker from ${item.authorName}`}
                          loading="lazy"
                          draggable={false}
                          className="block w-auto h-auto max-w-[168px] sm:max-w-[196px] max-h-[168px] sm:max-h-[196px] object-contain rounded-xl drop-shadow-[0_8px_20px_rgba(0,0,0,0.38)] pointer-events-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Inline Reply Form when active on root comment */}
                  {renderInlineReplyForm(item)}

                  {/* Threaded Replies Section (Reddit-style multi-level tree) */}
                  {replies.length > 0 && (
                    <div className="mt-2 pt-3 border-t border-white/10 flex flex-col gap-3">
                      <button
                        type="button"
                        onClick={() => toggleThreadCollapse(item.id)}
                        className="inline-flex items-center gap-2 text-[11px] font-semibold text-[#7DB3FF]/85 hover:text-white uppercase tracking-wider w-fit cursor-pointer select-none transition-colors"
                        aria-expanded={!isRootThreadCollapsed}
                      >
                        <span className="w-4 h-4 rounded-md bg-white/[0.05] border border-white/15 flex items-center justify-center text-[#7DB3FF]">
                          {isRootThreadCollapsed ? <Plus size={10} /> : <Minus size={10} />}
                        </span>
                        <span>
                          {isRootThreadCollapsed
                            ? `Show ${totalThreadReplies} ${totalThreadReplies === 1 ? "Reply" : "Replies"}`
                            : `${totalThreadReplies} ${totalThreadReplies === 1 ? "Reply" : "Replies"}`}
                        </span>
                      </button>

                      {!isRootThreadCollapsed && (
                        <div className="flex flex-col gap-3 pl-3 sm:pl-5 border-l-2 border-l-[#7DB3FF]/25 hover:border-l-[#7DB3FF]/45 transition-colors ml-2">
                          {replies.map((reply) => renderReplyNode(reply, 1))}
                        </div>
                      )}
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

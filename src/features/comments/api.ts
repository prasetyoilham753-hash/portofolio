import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  setDoc
} from "firebase/firestore";
import { auth, db } from "../../services/firebase/config";
import { verifyIsAdmin } from "../auth/adminAuth";
import { handleFirestoreError, OperationType } from "../../services/firebase/errors";
import { 
  CommentItem, 
  CommentFilterConfig, 
  DEFAULT_ADMIN_IDENTITIES,
  DEFAULT_FILTER_CONFIG,
  DEFAULT_HEADER_DESCRIPTION 
} from "./types";

const COMMENTS_COLLECTION = "comments";
const FILTERS_DOC_PATH = "site_content";
const FILTERS_DOC_ID = "comment_filters";

export const PUBLIC_IDENTITY_REJECTED_MESSAGE =
  "Authorization denied: This identity is protected and cannot be used.";

/**
 * Checks whether a display name matches or impersonates a protected administrator identity.
 */
export function isProtectedAdminIdentity(
  name: string,
  customAllowedNames?: string[]
): boolean {
  if (!name) return false;
  const raw = name.trim().toLowerCase().replace(/\s+/g, " ");
  if (!raw || raw === "anonymous") return false;

  const cleaned = raw.replace(/^[@_.\-\s]+|[@_.\-\s]+$/g, "");
  const collapsed = raw.replace(/[^a-z0-9]/g, "");

  const reservedNames = Array.from(
    new Set([
      ...DEFAULT_ADMIN_IDENTITIES.map((n) => n.trim().toLowerCase()),
      "moderator",
      "owner",
      ...(customAllowedNames || [])
        .map((n) => n.trim().toLowerCase().replace(/\s+/g, " "))
        .filter(Boolean),
    ])
  );

  return reservedNames.some((reserved) => {
    const target = reserved.replace(/^[@_.\-\s]+|[@_.\-\s]+$/g, "");
    if (!target) return false;

    if (raw === target || cleaned === target) return true;

    const escaped = target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const boundaryRegex = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i");
    if (boundaryRegex.test(raw) || boundaryRegex.test(cleaned)) {
      return true;
    }

    const targetCollapsed = target.replace(/[^a-z0-9]/g, "");
    if (targetCollapsed.length >= 5 && collapsed === targetCollapsed) {
      return true;
    }

    return false;
  });
}

/**
 * Filter text against banned phrases.
 */
export function checkAndFilterPhrases(
  text: string, 
  bannedPhrases: string[], 
  action: "censor" | "reject"
): { 
  cleanText: string; 
  hasForbiddenPhrase: boolean; 
  matchedPhrases: string[] 
} {
  if (!bannedPhrases || bannedPhrases.length === 0) {
    return { cleanText: text, hasForbiddenPhrase: false, matchedPhrases: [] };
  }

  const matched: string[] = [];
  let processed = text;

  for (const phrase of bannedPhrases) {
    const trimmed = phrase.trim();
    if (!trimmed) continue;
    
    // Escape regex special chars
    const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b|${escaped}`, 'gi');

    if (regex.test(processed)) {
      matched.push(trimmed);
      if (action === "censor") {
        processed = processed.replace(regex, (match) => "*".repeat(match.length));
      }
    }
  }

  return {
    cleanText: processed,
    hasForbiddenPhrase: matched.length > 0,
    matchedPhrases: matched
  };
}

/**
 * Subscribe to real-time public comments list.
 */
export function subscribeToComments(
  onUpdate: (comments: CommentItem[]) => void,
  onError?: (error: any) => void
) {
  try {
    const q = query(
      collection(db, COMMENTS_COLLECTION),
      orderBy("createdAt", "desc")
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<CommentItem, "id">)
        }));
        onUpdate(items);
      },
      (error) => {
        console.error("Firestore onSnapshot comments error:", error);
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.LIST, COMMENTS_COLLECTION);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COMMENTS_COLLECTION);
    return () => {};
  }
}

/**
 * Upload an image attachment to Cloudinary for comments (Admin Dashboard only).
 */
export async function uploadCommentImage(file: File): Promise<{ url: string; publicId: string }> {
  const isAuthorizedAdmin = await verifyIsAdmin(auth.currentUser);
  if (!isAuthorizedAdmin) {
    throw new Error(PUBLIC_IDENTITY_REJECTED_MESSAGE);
  }

  const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB limit
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error(`Image size exceeds the 10 MB limit. Current size: ${(file.size / (1024 * 1024)).toFixed(2)} MB`);
  }

  const allowedTypes = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/avif'
  ]);

  if (file.type && !allowedTypes.has(file.type)) {
    throw new Error(`Unsupported file type: ${file.type}. Please choose an image file (JPG, PNG, WebP, GIF, or AVIF).`);
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'BINTANGPRASETYO');

  try {
    const response = await fetch('https://api.cloudinary.com/v1_1/tu1lmhsg/image/upload', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error?.message || `Failed to upload image (${response.statusText})`);
    }

    const data = await response.json();
    return {
      url: data.secure_url,
      publicId: data.public_id || data.secure_url
    };
  } catch (error: any) {
    console.error("[Cloudinary] Comment image upload error:", error);
    throw error;
  }
}

/**
 * Add a new comment or reply.
 * Public submissions automatically reject any protected admin identity.
 * Admin identity comments can only be created when `fromAdminDashboard` is true
 * and the caller holds an authenticated, authorized Firebase Admin session.
 */
export async function createComment(params: {
  authorName: string;
  isAnonymous: boolean;
  content: string;
  imageUrl?: string | null;
  imagePublicId?: string | null;
  parentId?: string | null;
  replyToAuthor?: string | null;
  filterConfig?: CommentFilterConfig;
  fromAdminDashboard?: boolean;
  adminAllowedNames?: string[];
}): Promise<{ id: string; filteredText: string }> {
  const isFromDashboard = params.fromAdminDashboard === true;
  const filter = params.filterConfig || DEFAULT_FILTER_CONFIG;

  if (isFromDashboard) {
    const isAuthorizedAdmin = await verifyIsAdmin(auth.currentUser);
    if (!isAuthorizedAdmin) {
      throw new Error("Invalid authorization session.");
    }
  } else {
    if (filter.enabled === false) {
      throw new Error("New comment submissions are currently paused.");
    }

    if (!params.isAnonymous && isProtectedAdminIdentity(params.authorName, params.adminAllowedNames)) {
      throw new Error(PUBLIC_IDENTITY_REJECTED_MESSAGE);
    }

    if (params.imageUrl || params.imagePublicId) {
      throw new Error(PUBLIC_IDENTITY_REJECTED_MESSAGE);
    }

    if (!params.isAnonymous && params.authorName) {
      const authorFilterResult = checkAndFilterPhrases(
        params.authorName.trim(),
        filter.bannedPhrases,
        "reject"
      );
      if (authorFilterResult.hasForbiddenPhrase) {
        throw new Error(
          `Display name cannot contain restricted phrases: "${authorFilterResult.matchedPhrases.join(", ")}"`
        );
      }
    }
  }

  const trimmedContent = params.content.trim();
  const hasAdminImage = isFromDashboard && Boolean(params.imageUrl && params.imageUrl.trim());

  if (!trimmedContent && !hasAdminImage) {
    throw new Error(
      isFromDashboard
        ? "Please write a comment or attach an image/sticker first."
        : "Please write a comment before sending."
    );
  }

  let finalContent = trimmedContent.slice(0, 1000);

  if (!isFromDashboard) {
    const filterResult = checkAndFilterPhrases(
      trimmedContent,
      filter.bannedPhrases,
      filter.filterAction
    );

    if (filter.filterAction === "reject" && filterResult.hasForbiddenPhrase) {
      throw new Error(
        `Comment cannot be posted because it contains restricted phrases: "${filterResult.matchedPhrases.join(", ")}"`
      );
    }
    finalContent = filterResult.cleanText.slice(0, 1000);
  }

  const isAnon = isFromDashboard ? false : Boolean(params.isAnonymous);
  const author = isAnon
    ? "Anonymous"
    : (params.authorName.trim() || "Anonymous").slice(0, 60);

  if (!isFromDashboard && !isAnon && isProtectedAdminIdentity(author, params.adminAllowedNames)) {
    throw new Error(PUBLIC_IDENTITY_REJECTED_MESSAGE);
  }

  const payload: Record<string, any> = {
    authorName: author,
    isAnonymous: isAnon,
    content: finalContent,
    createdAt: serverTimestamp(),
  };

  if (isFromDashboard) {
    payload.isAdmin = true;
    if (params.imageUrl && params.imageUrl.trim()) {
      payload.imageUrl = params.imageUrl.trim().slice(0, 500);
    }
    if (params.imagePublicId && params.imagePublicId.trim()) {
      payload.imagePublicId = params.imagePublicId.trim().slice(0, 200);
    }
  }

  if (params.parentId && params.parentId.trim()) {
    payload.parentId = params.parentId.trim().slice(0, 128);
  }
  if (params.replyToAuthor && params.replyToAuthor.trim()) {
    payload.replyToAuthor = params.replyToAuthor.trim().slice(0, 60);
  }

  try {
    const docRef = await addDoc(collection(db, COMMENTS_COLLECTION), payload);
    return { id: docRef.id, filteredText: finalContent };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COMMENTS_COLLECTION);
    throw error;
  }
}

/**
 * Delete a comment by ID (Admin only).
 */
export async function deleteComment(commentId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COMMENTS_COLLECTION, commentId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COMMENTS_COLLECTION}/${commentId}`);
    throw error;
  }
}

/**
 * Subscribe to phrase filters and page config stored in site_content/comment_filters.
 */
export function subscribeToCommentFilters(
  onUpdate: (config: CommentFilterConfig) => void
) {
  try {
    const docRef = doc(db, FILTERS_DOC_PATH, FILTERS_DOC_ID);
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          onUpdate({
            bannedPhrases: Array.isArray(data.bannedPhrases) ? data.bannedPhrases : DEFAULT_FILTER_CONFIG.bannedPhrases,
            filterAction: data.filterAction === "reject" ? "reject" : "censor",
            headerDescription: typeof data.headerDescription === "string" ? data.headerDescription : DEFAULT_HEADER_DESCRIPTION,
            enabled: data.enabled !== false,
            updatedAt: data.updatedAt
          });
        } else {
          onUpdate(DEFAULT_FILTER_CONFIG);
        }
      },
      (err) => {
        console.warn("Could not fetch custom filters, falling back to default:", err);
        onUpdate(DEFAULT_FILTER_CONFIG);
      }
    );
  } catch {
    onUpdate(DEFAULT_FILTER_CONFIG);
    return () => {};
  }
}

/**
 * Update phrase filters and page config (Admin only).
 */
export async function saveCommentFilters(config: CommentFilterConfig): Promise<void> {
  try {
    const docRef = doc(db, FILTERS_DOC_PATH, FILTERS_DOC_ID);
    await setDoc(docRef, {
      bannedPhrases: config.bannedPhrases.map((s) => s.trim().toLowerCase()).filter(Boolean),
      filterAction: config.filterAction,
      headerDescription: config.headerDescription || DEFAULT_HEADER_DESCRIPTION,
      enabled: config.enabled !== false,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${FILTERS_DOC_PATH}/${FILTERS_DOC_ID}`);
    throw error;
  }
}

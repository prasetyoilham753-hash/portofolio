import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  setDoc,
  getDoc
} from "firebase/firestore";
import { db } from "../../services/firebase/config";
import { handleFirestoreError, OperationType } from "../../services/firebase/errors";
import { 
  CommentItem, 
  CommentFilterConfig, 
  DEFAULT_FILTER_CONFIG,
  DEFAULT_HEADER_DESCRIPTION 
} from "./types";

const COMMENTS_COLLECTION = "comments";
const FILTERS_DOC_PATH = "site_content";
const FILTERS_DOC_ID = "comment_filters";

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
 * Add a new comment or reply.
 */
export async function createComment(params: {
  authorName: string;
  isAnonymous: boolean;
  content: string;
  parentId?: string | null;
  replyToAuthor?: string | null;
  filterConfig?: CommentFilterConfig;
}): Promise<{ id: string; filteredText: string }> {
  const filter = params.filterConfig || DEFAULT_FILTER_CONFIG;
  if (filter.enabled === false) {
    throw new Error("Fitur komentar saat ini sedang dinonaktifkan oleh administrator.");
  }

  const filterResult = checkAndFilterPhrases(
    params.content.trim(),
    filter.bannedPhrases,
    filter.filterAction
  );

  if (filter.filterAction === "reject" && filterResult.hasForbiddenPhrase) {
    throw new Error(
      `Komentar tidak dapat dikirim karena mengandung frasa terlarang: "${filterResult.matchedPhrases.join(", ")}"`
    );
  }

  const finalContent = filterResult.cleanText.slice(0, 1000);
  const author = params.isAnonymous
    ? "Anonymous"
    : (params.authorName.trim() || "Anonymous").slice(0, 60);

  const payload: Record<string, any> = {
    authorName: author,
    isAnonymous: Boolean(params.isAnonymous),
    content: finalContent,
    createdAt: serverTimestamp(),
  };

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

export interface CommentItem {
  id: string;
  authorName: string;
  isAnonymous: boolean;
  content: string;
  parentId?: string | null;
  replyToAuthor?: string | null;
  createdAt: any;
}

export interface CommentFilterConfig {
  bannedPhrases: string[];
  filterAction: "censor" | "reject";
  updatedAt?: any;
}

export const DEFAULT_FILTER_CONFIG: CommentFilterConfig = {
  bannedPhrases: ["spam", "promo", "slot", "judol", "kasar", "scam", "gacor"],
  filterAction: "censor"
};

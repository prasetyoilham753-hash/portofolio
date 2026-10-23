export interface CommentItem {
  id: string;
  authorName: string;
  isAnonymous: boolean;
  content: string;
  imageUrl?: string | null;
  imagePublicId?: string | null;
  parentId?: string | null;
  replyToAuthor?: string | null;
  createdAt: any;
}

export interface CommentFilterConfig {
  bannedPhrases: string[];
  filterAction: "censor" | "reject";
  headerDescription?: string;
  enabled?: boolean;
  updatedAt?: any;
}

export const DEFAULT_HEADER_DESCRIPTION = "";

export const DEFAULT_FILTER_CONFIG: CommentFilterConfig = {
  bannedPhrases: ["spam", "promo", "slot", "judol", "kasar", "scam", "gacor"],
  filterAction: "censor",
  headerDescription: "",
  enabled: true,
};

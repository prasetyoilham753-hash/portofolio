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
  headerDescription?: string;
  updatedAt?: any;
}

export const DEFAULT_HEADER_DESCRIPTION = "Ruang percakapan publik terbuka. Tinggalkan pesan, sapaan, feedback, atau tanggapi komentar pengunjung lainnya.";

export const DEFAULT_FILTER_CONFIG: CommentFilterConfig = {
  bannedPhrases: ["spam", "promo", "slot", "judol", "kasar", "scam", "gacor"],
  filterAction: "censor",
  headerDescription: DEFAULT_HEADER_DESCRIPTION,
};

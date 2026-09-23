export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  mediaUrl: string;
  mediaType?: "image" | "video";
  mediaPath?: string;
  badge?: string;
  categories: string[];
  hyperlink?: string;
  githubUrl?: string;
  order?: number;
  createdAt?: any;
  updatedAt?: any;
}

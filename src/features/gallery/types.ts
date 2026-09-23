export interface GalleryItem {
  id: string;
  title?: string;
  caption?: string;
  imageUrl: string;
  imagePath?: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
  category?: string;
  year?: string;
  order?: number;
  createdAt?: any;
  updatedAt?: any;
}

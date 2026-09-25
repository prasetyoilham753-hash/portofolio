export interface CertificateItem {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  expirationDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  imageUrl: string;
  images?: string[];
  imagePath?: string;
  imagePaths?: string[];
  category: string;
  description?: string;
  skills?: string[];
  order: number;
  featured?: boolean;
  aspectRatio?: number;
  createdAt?: any;
  updatedAt?: any;
}

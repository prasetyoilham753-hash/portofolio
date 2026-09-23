export interface Technology {
  id: string;
  name: string;
  order: number;
  visible: boolean;
}

export interface SiteProfile {
  name: string;
  firstName?: string;
  lastName?: string;
  title: string;
  heroDescription?: string;
  projectDescription?: string;
  about: string;
  aboutLabel?: string;
  aboutHeading?: string;
  aboutButtonText?: string;
  photoUrl: string;
  photoPath: string;
  photoUrl2?: string;
  photoPath2?: string;
  cvUrl?: string;
  cvPath?: string;
  socialLinks: {
    github?: string;
    linkedin?: string;
    email?: string;
    instagram?: string;
    twitter?: string;
    x?: string;
    reddit?: string;
  };
  technologies?: Technology[];
  updatedAt?: any;
}


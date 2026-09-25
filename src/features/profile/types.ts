export interface Technology {
  id: string;
  name: string;
  order: number;
  visible: boolean;
}

export interface WhatIDoSubDiv {
  id: string;
  name: string;
  description?: string;
}

export interface WhatIDoActionItem {
  id: string;
  buttonText: string;
  buttonUrl?: string;
  columns: string[]; // daftar kolom teks di bawah tombol aksi ini
  visible?: boolean;
}

export interface WhatIDoCategory {
  id: string;
  title: string;
  description?: string;
  subtitles?: string[];
  divs?: WhatIDoSubDiv[];
  order: number;
  visible: boolean;
}

export interface AboutDiscipline {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  tags?: string[];
}

export interface AboutTimelineItem {
  id: string;
  year: string;
  role: string;
  company: string;
  description?: string;
}

export interface AboutStatItem {
  label: string;
  value: string;
}

export type TextAlignment = "left" | "center" | "right" | "justify";

export interface SiteProfile {
  name: string;
  firstName?: string;
  lastName?: string;
  title: string;
  heroDescription?: string;
  heroDescriptionAlign?: TextAlignment;
  projectDescription?: string;
  about: string;
  aboutLabel?: string;
  aboutHeading?: string;
  aboutButtonText?: string;
  aboutActions?: WhatIDoActionItem[];
  aboutPageTitle?: string;
  aboutPageSubtitle?: string;
  aboutPageBio?: string;
  aboutPageStory?: string;
  aboutDisciplines?: AboutDiscipline[];
  aboutTimeline?: AboutTimelineItem[];
  aboutStats?: AboutStatItem[];
  photoUrl: string;
  photoPath: string;
  photoUrl2?: string;
  photoPath2?: string;
  cvUrl?: string;
  cvPath?: string;
  cvAccessCode?: string;
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
  whatIDoCategories?: WhatIDoCategory[];
  updatedAt?: any;
}

export type ComponentCategory = 
  | 'Buttons'
  | 'Cards'
  | 'Feedback'
  | 'Forms'
  | 'Navigation'
  | 'Data Display'
  | 'Overlays'
  | 'Advanced'
  | 'Text Effects'
  | 'Animations'
  | 'Backgrounds'
  | '3D'
  | 'Other';

export const COMPONENT_CATEGORIES: ComponentCategory[] = [
  'Buttons',
  'Cards',
  'Feedback',
  'Forms',
  'Navigation',
  'Data Display',
  'Overlays',
  'Advanced',
  'Text Effects',
  'Animations',
  'Backgrounds',
  '3D',
  'Other'
];

export interface FeatureComponent {
  id: string;
  name: string;
  category: ComponentCategory | string;
  description: string;
  code: string;
  css?: string;
  dependencies?: string[];
  status: 'published' | 'draft';
  tags?: string[];
  order?: number;
  createdAt?: any;
  updatedAt?: any;
}

export type FeatureComponentInput = Omit<FeatureComponent, 'id' | 'createdAt' | 'updatedAt'>;

export interface FeaturesHeaderContent {
  badge?: string;
  title?: string;
  description?: string;
  updatedAt?: any;
}

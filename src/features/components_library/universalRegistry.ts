import { ComponentCategory } from "./types";

export interface ComponentMetadata {
  type: string;
  name: string;
  category: ComponentCategory;
  description: string;
  defaultProps: Record<string, any>;
  supportedProps: string[];
  editableProperties: {
    key: string;
    label: string;
    type: 'string' | 'boolean' | 'number' | 'select' | 'color';
    options?: string[];
  }[];
  defaultStyles?: Record<string, string>;
  supportedVariants: string[];
  childrenSupport: boolean;
  eventSupport: boolean;
}

export const UNIVERSAL_COMPONENT_REGISTRY: ComponentMetadata[] = [
  // 1. Buttons & Actions
  {
    type: "button-primary",
    name: "Primary & Loading Button",
    category: "Buttons",
    description: "Primary interactive button with loading state and bidirectional motion.",
    defaultProps: { label: "Submit Data", variant: "primary", loading: false, disabled: false },
    supportedProps: ["label", "variant", "loading", "disabled"],
    editableProperties: [
      { key: "label", label: "Button Label", type: "string" },
      { key: "variant", label: "Variant", type: "select", options: ["primary", "secondary", "outline", "ghost"] },
      { key: "loading", label: "Loading State", type: "boolean" },
      { key: "disabled", label: "Disabled", type: "boolean" },
    ],
    supportedVariants: ["primary", "secondary", "outline", "ghost", "loading"],
    childrenSupport: true,
    eventSupport: true,
  },
  {
    type: "button-fab",
    name: "Floating Action Button (FAB)",
    category: "Buttons",
    description: "Floating action button with luminous glow and icon rotation.",
    defaultProps: { label: "Add", icon: "Plus" },
    supportedProps: ["label", "icon"],
    editableProperties: [
      { key: "label", label: "Tooltip / Label", type: "string" },
    ],
    supportedVariants: ["floating"],
    childrenSupport: false,
    eventSupport: true,
  },

  // 2. Cards & Containers
  {
    type: "card-profile",
    name: "Profile & Glassmorphism Card",
    category: "Cards",
    description: "Profile card with glassmorphism surface, avatar, status badge, and action button.",
    defaultProps: { title: "Bintang Prasetyo", subtitle: "Creative Technologist", verified: true },
    supportedProps: ["title", "subtitle", "verified"],
    editableProperties: [
      { key: "title", label: "Name / Title", type: "string" },
      { key: "subtitle", label: "Role / Subtitle", type: "string" },
      { key: "verified", label: "Verified Badge", type: "boolean" },
    ],
    supportedVariants: ["glass", "solid", "gradient"],
    childrenSupport: true,
    eventSupport: false,
  },
  {
    type: "card-pricing",
    name: "Pricing & Feature Card",
    category: "Cards",
    description: "Pricing card for digital services or products with feature checklist.",
    defaultProps: { planName: "Pro Tier", price: "$49", period: "month" },
    supportedProps: ["planName", "price", "period"],
    editableProperties: [
      { key: "planName", label: "Plan Name", type: "string" },
      { key: "price", label: "Price", type: "string" },
      { key: "period", label: "Billing Period", type: "string" },
    ],
    supportedVariants: ["standard", "featured"],
    childrenSupport: true,
    eventSupport: true,
  },

  // 3. Loading & Feedback
  {
    type: "feedback-spinner",
    name: "Spinner & Progress Loader",
    category: "Feedback",
    description: "Modern orbital loading spinner and animated progress bar.",
    defaultProps: { size: "md", text: "Processing data..." },
    supportedProps: ["size", "text"],
    editableProperties: [
      { key: "text", label: "Loading Text", type: "string" },
      { key: "size", label: "Size", type: "select", options: ["sm", "md", "lg"] },
    ],
    supportedVariants: ["spinner", "skeleton", "progress"],
    childrenSupport: false,
    eventSupport: false,
  },
  {
    type: "feedback-toast",
    name: "Toast & Alert Notification",
    category: "Feedback",
    description: "Floating status toast notification with dismiss button and status indicator.",
    defaultProps: { message: "Changes saved to database successfully.", type: "success" },
    supportedProps: ["message", "type"],
    editableProperties: [
      { key: "message", label: "Message", type: "string" },
      { key: "type", label: "Notification Type", type: "select", options: ["success", "error", "info", "warning"] },
    ],
    supportedVariants: ["success", "error", "info", "warning"],
    childrenSupport: false,
    eventSupport: true,
  },

  // 4. Form Elements
  {
    type: "form-input",
    name: "Interactive Form & Input",
    category: "Forms",
    description: "Text input, select dropdown, toggle switch, and submission validation.",
    defaultProps: { placeholder: "Enter email address...", label: "Email Address", required: true },
    supportedProps: ["placeholder", "label", "required", "errorState"],
    editableProperties: [
      { key: "label", label: "Field Label", type: "string" },
      { key: "placeholder", label: "Placeholder", type: "string" },
      { key: "required", label: "Required", type: "boolean" },
    ],
    supportedVariants: ["text", "email", "password", "select", "toggle"],
    childrenSupport: false,
    eventSupport: true,
  },

  // 5. Navigation
  {
    type: "nav-tabs",
    name: "Animated Tabs & Stepper",
    category: "Navigation",
    description: "Interactive tab navigation with a fluid sliding pill indicator.",
    defaultProps: { activeTab: "Overview", items: "Overview, Analytics, Settings" },
    supportedProps: ["activeTab", "items"],
    editableProperties: [
      { key: "activeTab", label: "Default Active Tab", type: "string" },
    ],
    supportedVariants: ["pill", "underline", "stepper"],
    childrenSupport: true,
    eventSupport: true,
  },

  // 6. Data Display
  {
    type: "data-accordion",
    name: "Accordion & Expandable List",
    category: "Data Display",
    description: "Responsive accordion component for FAQs or structured expandable content.",
    defaultProps: { title: "How does this system work?", isOpen: false },
    supportedProps: ["title", "isOpen"],
    editableProperties: [
      { key: "title", label: "Accordion Title", type: "string" },
      { key: "isOpen", label: "Initially Open", type: "boolean" },
    ],
    supportedVariants: ["default", "bordered"],
    childrenSupport: true,
    eventSupport: true,
  },

  // 7. Overlays
  {
    type: "overlay-modal",
    name: "Modal Dialog & Drawer",
    category: "Overlays",
    description: "Modal dialog with backdrop blur, close button, and smooth entrance animation.",
    defaultProps: { title: "Confirm Action", isOpen: true },
    supportedProps: ["title", "isOpen"],
    editableProperties: [
      { key: "title", label: "Modal Title", type: "string" },
      { key: "isOpen", label: "Default Open State", type: "boolean" },
    ],
    supportedVariants: ["modal", "drawer", "popover"],
    childrenSupport: true,
    eventSupport: true,
  },

  // 8. Advanced Components
  {
    type: "advanced-gallery",
    name: "Image Gallery & Carousel",
    category: "Advanced",
    description: "Interactive image gallery with dot pagination and swipe navigation.",
    defaultProps: { title: "Featured Creative Works" },
    supportedProps: ["title"],
    editableProperties: [
      { key: "title", label: "Gallery Title", type: "string" },
    ],
    supportedVariants: ["carousel", "grid", "masonry"],
    childrenSupport: true,
    eventSupport: true,
  }
];

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
    description: "Tombol interaktif utama dengan status loading dan animasi dua arah.",
    defaultProps: { label: "Kirim Data", variant: "primary", loading: false, disabled: false },
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
    description: "Tombol aksi mengambang dengan efek glow dan rotasi ikon.",
    defaultProps: { label: "Tambah", icon: "Plus" },
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
    description: "Kartu profil dengan efek glassmorphism, avatar, badge status, dan tombol aksi.",
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
    description: "Kartu harga untuk layanan atau produk digital dengan daftar fitur.",
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
    description: "Indikator pemuatan orbital modern dan bilah progres animasi.",
    defaultProps: { size: "md", text: "Memproses data..." },
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
    description: "Notifikasi status mengambang dengan tombol tutup dan indikator sukses/error.",
    defaultProps: { message: "Perubahan berhasil disimpan ke database.", type: "success" },
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
    description: "Input teks, select dropdown, switch toggle, dan validasi submit.",
    defaultProps: { placeholder: "Masukkan alamat email...", label: "Email Address", required: true },
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
    description: "Navigasi tab interaktif dengan animasi geser cair (fluid sliding pill).",
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
    description: "Komponen akordeon responsif untuk FAQ atau tampilan data terstruktur.",
    defaultProps: { title: "Bagaimana cara kerja sistem ini?", isOpen: false },
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
    description: "Dialog modal dengan latar belakang blur, tombol tutup, dan animasi masuk.",
    defaultProps: { title: "Konfirmasi Tindakan", isOpen: true },
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
    description: "Galeri gambar interaktif dengan indikator titik dan navigasi geser.",
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

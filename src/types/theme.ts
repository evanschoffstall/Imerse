import type {
  CampaignStyle as PrismaCampaignStyle,
  Theme as PrismaTheme,
} from "@prisma/client";

// Base types from Prisma
export type Theme = PrismaTheme;
export type CampaignStyle = PrismaCampaignStyle;

// Extended types with relations
export type ThemeWithRelations = Theme & {
  createdBy?: {
    id: string;
    name: string;
    email: string;
  } | null;
};

export type CampaignStyleWithRelations = CampaignStyle & {
  campaign: {
    id: string;
    name: string;
    slug: string;
  };
  theme?: {
    id: string;
    name: string;
    slug: string;
  } | null;
};

// Color configuration
export type ColorPalette = {
  primary?: string;
  secondary?: string;
  accent?: string;
  background?: string;
  foreground?: string;
  muted?: string;
  mutedForeground?: string;
  border?: string;
  input?: string;
  ring?: string;
  destructive?: string;
  destructiveForeground?: string;
  // Custom colors
  headerBackground?: string;
  headerText?: string;
  sidebarBackground?: string;
  sidebarText?: string;
  cardBackground?: string;
  linkColor?: string;
};

// Font configuration
export type FontConfig = {
  heading?: string;
  body?: string;
  mono?: string;
  sizes?: {
    xs?: string;
    sm?: string;
    base?: string;
    lg?: string;
    xl?: string;
    "2xl"?: string;
    "3xl"?: string;
    "4xl"?: string;
  };
  weights?: {
    normal?: number;
    medium?: number;
    semibold?: number;
    bold?: number;
  };
};

// Layout configuration
export type LayoutConfig = {
  maxWidth?: string;
  sidebarWidth?: string;
  headerHeight?: string;
  spacing?: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  };
  borderRadius?: {
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  };
};

// Form types
export type CreateThemeInput = {
  name: string;
  description?: string;
  colors?: ColorPalette;
  fonts?: FontConfig;
  layout?: LayoutConfig;
  customCSS?: string;
  isPublic?: boolean;
};

export type UpdateThemeInput = Partial<CreateThemeInput>;

export type UpdateCampaignStyleInput = {
  themeId?: string | null;
  headerImage?: string;
  colors?: ColorPalette;
  fonts?: FontConfig;
  customCSS?: string;
};

// Filter types
export type ThemeFilters = {
  isOfficial?: boolean;
  isPublic?: boolean;
  search?: string;
};

// Pre-built themes
export type PrebuiltTheme = {
  id: string;
  name: string;
  description: string;
  preview?: string;
  colors: ColorPalette;
  fonts?: FontConfig;
};

export const DEFAULT_THEMES: PrebuiltTheme[] = [
  {
    id: "default",
    name: "Default",
    description: "Clean and modern default theme",
    colors: {
      primary: "#3b82f6",
      secondary: "#64748b",
      accent: "#8b5cf6",
      background: "#ffffff",
      foreground: "#0f172a",
      muted: "#f1f5f9",
      mutedForeground: "#64748b",
    },
  },
  {
    id: "dark",
    name: "Dark Mode",
    description: "Easy on the eyes dark theme",
    colors: {
      primary: "#60a5fa",
      secondary: "#94a3b8",
      accent: "#a78bfa",
      background: "#0f172a",
      foreground: "#f8fafc",
      muted: "#1e293b",
      mutedForeground: "#94a3b8",
    },
  },
  {
    id: "fantasy",
    name: "Fantasy",
    description: "Warm fantasy-inspired theme",
    colors: {
      primary: "#d97706",
      secondary: "#78716c",
      accent: "#dc2626",
      background: "#fef3c7",
      foreground: "#292524",
      headerBackground: "#78350f",
      headerText: "#fef3c7",
    },
  },
  {
    id: "scifi",
    name: "Sci-Fi",
    description: "Futuristic blue theme",
    colors: {
      primary: "#06b6d4",
      secondary: "#6366f1",
      accent: "#8b5cf6",
      background: "#0c1222",
      foreground: "#e0f2fe",
      headerBackground: "#1e3a8a",
      headerText: "#e0f2fe",
    },
  },
  {
    id: "nature",
    name: "Nature",
    description: "Earth tones and greens",
    colors: {
      primary: "#16a34a",
      secondary: "#84cc16",
      accent: "#eab308",
      background: "#f7fee7",
      foreground: "#14532d",
      headerBackground: "#15803d",
      headerText: "#f7fee7",
    },
  },
];

// CSS utility types
export type CSSVariable = {
  name: string;
  value: string;
};

export type CSSRule = {
  selector: string;
  properties: Record<string, string>;
};

// Theme preview
export type ThemePreview = {
  theme: Theme;
  sampleContent: {
    title: string;
    text: string;
    card: boolean;
    button: boolean;
  };
};

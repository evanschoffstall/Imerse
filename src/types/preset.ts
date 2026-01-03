// Preset Types (Phase 25)

export interface PresetType {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PresetTypeWithRelations extends PresetType {
  presets?: Preset[];
  _count?: {
    presets: number;
  };
}

export interface Preset {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  config: PresetConfig;
  isPublic: boolean;
  isOfficial: boolean;
  category: string | null;
  tags: string[];
  typeId: string;
  campaignId: string | null;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PresetWithRelations extends Preset {
  type?: PresetType;
  campaign?: {
    id: string;
    name: string;
  };
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
}

// Preset Configuration (varies by type)

export type PresetConfig =
  | CalendarPresetConfig
  | AttributePresetConfig
  | ThemePresetConfig
  | Record<string, any>;

// Calendar Preset

export interface CalendarPresetConfig {
  name: string;
  months: MonthConfig[];
  weekdays?: string[];
  epochs?: EpochConfig[];
  moons?: MoonConfig[];
  seasons?: SeasonConfig[];
  intercalary?: IntercalaryConfig[];
}

export interface MonthConfig {
  name: string;
  length: number;
  type: "standard" | "intercalary";
}

export interface EpochConfig {
  name: string;
  abbreviation: string;
  date: string; // YYYY-MM-DD
}

export interface MoonConfig {
  name: string;
  cycle: number; // days per cycle
  phaseOffset: number;
}

export interface SeasonConfig {
  name: string;
  month: number;
  day: number;
}

export interface IntercalaryConfig {
  name: string;
  position: number; // Which month to insert after (0-based)
  length: number;
}

// Attribute Preset

export interface AttributePresetConfig {
  attributes: PresetAttribute[];
  groups?: AttributeGroup[];
}

export interface PresetAttribute {
  name: string;
  type: string;
  value?: any;
  options?: string[];
  isPrivate?: boolean;
  group?: string;
}

export interface AttributeGroup {
  name: string;
  icon?: string;
  position: number;
}

// Theme Preset

export interface ThemePresetConfig {
  colors: Record<string, string>;
  fonts?: Record<string, string>;
  spacing?: Record<string, string>;
  customCss?: string;
}

// Preset Categories

export const PRESET_CATEGORIES = {
  CALENDAR: "calendar",
  ATTRIBUTE: "attribute",
  THEME: "theme",
  LAYOUT: "layout",
  WORKFLOW: "workflow",
} as const;

export const PRESET_CATEGORY_LABELS: Record<string, string> = {
  calendar: "Calendar Systems",
  attribute: "Attribute Templates",
  theme: "Visual Themes",
  layout: "Layout Configurations",
  workflow: "Workflow Automation",
};

// Popular Calendar Presets

export const POPULAR_CALENDAR_PRESETS = [
  "Gregorian",
  "Harptos (Forgotten Realms)",
  "Imperial Calendar (Warhammer)",
  "Golarian Calendar (Pathfinder)",
  "Lunar Calendar",
  "Solar Calendar",
];

// Helper Functions

export function getPresetCategoryLabel(category: string | null): string {
  if (!category) return "Uncategorized";
  return PRESET_CATEGORY_LABELS[category] || category;
}

export function filterPresets(
  presets: Preset[],
  filters: {
    category?: string;
    search?: string;
    tags?: string[];
    isPublic?: boolean;
    isOfficial?: boolean;
  }
): Preset[] {
  let filtered = [...presets];

  if (filters.category) {
    filtered = filtered.filter((p) => p.category === filters.category);
  }

  if (filters.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(search) ||
        p.description?.toLowerCase().includes(search) ||
        p.tags.some((tag) => tag.toLowerCase().includes(search))
    );
  }

  if (filters.tags && filters.tags.length > 0) {
    filtered = filtered.filter((p) =>
      filters.tags!.some((tag) => p.tags.includes(tag))
    );
  }

  if (filters.isPublic !== undefined) {
    filtered = filtered.filter((p) => p.isPublic === filters.isPublic);
  }

  if (filters.isOfficial !== undefined) {
    filtered = filtered.filter((p) => p.isOfficial === filters.isOfficial);
  }

  return filtered;
}

export function sortPresets(
  presets: Preset[],
  sortBy: "name" | "date" | "popular" = "name",
  order: "asc" | "desc" = "asc"
): Preset[] {
  const sorted = [...presets].sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === "date") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    // For 'popular', we'd need usage stats - for now, sort by official then public
    if (sortBy === "popular") {
      if (a.isOfficial !== b.isOfficial) {
        return a.isOfficial ? -1 : 1;
      }
      if (a.isPublic !== b.isPublic) {
        return a.isPublic ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

  return order === "desc" ? sorted.reverse() : sorted;
}

export function groupPresetsByCategory(
  presets: Preset[]
): Record<string, Preset[]> {
  const grouped: Record<string, Preset[]> = {};

  for (const preset of presets) {
    const category = preset.category || "other";
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(preset);
  }

  return grouped;
}

export function getAllPresetTags(presets: Preset[]): string[] {
  const tagSet = new Set<string>();

  for (const preset of presets) {
    for (const tag of preset.tags) {
      tagSet.add(tag);
    }
  }

  return Array.from(tagSet).sort();
}

export function validatePreset(preset: Partial<Preset>): string[] {
  const errors: string[] = [];

  if (!preset.name?.trim()) {
    errors.push("Preset name is required");
  }

  if (!preset.typeId) {
    errors.push("Preset type is required");
  }

  if (!preset.config || typeof preset.config !== "object") {
    errors.push("Preset configuration is required");
  }

  // Type-specific validation
  if (preset.config) {
    // Calendar preset validation
    if (isCalendarPreset(preset.config)) {
      if (!preset.config.months || preset.config.months.length === 0) {
        errors.push("Calendar preset must have at least one month");
      }
    }

    // Attribute preset validation
    if (isAttributePreset(preset.config)) {
      if (!preset.config.attributes || preset.config.attributes.length === 0) {
        errors.push("Attribute preset must have at least one attribute");
      }
    }
  }

  return errors;
}

function isCalendarPreset(
  config: PresetConfig
): config is CalendarPresetConfig {
  return "months" in config;
}

function isAttributePreset(
  config: PresetConfig
): config is AttributePresetConfig {
  return "attributes" in config;
}

function isThemePreset(config: PresetConfig): config is ThemePresetConfig {
  return "colors" in config;
}

export async function applyPreset(
  preset: Preset,
  targetId: string,
  targetType: string
): Promise<boolean> {
  // This would be implemented in the API
  // For now, just validate that the preset can be applied

  if (!preset.config) {
    throw new Error("Preset has no configuration");
  }

  // Type-specific application logic would go here

  return true;
}

export function exportPreset(preset: Preset): string {
  // Export preset as JSON
  const exported = {
    name: preset.name,
    description: preset.description,
    category: preset.category,
    tags: preset.tags,
    type: preset.typeId,
    config: preset.config,
    version: "1.0.0",
    exported: new Date().toISOString(),
  };

  return JSON.stringify(exported, null, 2);
}

export function importPreset(json: string): Partial<Preset> {
  try {
    const data = JSON.parse(json);

    return {
      name: data.name,
      description: data.description,
      category: data.category,
      tags: data.tags || [],
      config: data.config,
      isPublic: false,
      isOfficial: false,
    };
  } catch (error) {
    throw new Error("Invalid preset JSON");
  }
}

// Popular preset templates

export function createGregorianCalendarPreset(): Partial<Preset> {
  return {
    name: "Gregorian Calendar",
    description: "Standard real-world calendar system",
    category: "calendar",
    tags: ["real-world", "standard", "gregorian"],
    isPublic: true,
    isOfficial: true,
    config: {
      name: "Gregorian Calendar",
      months: [
        { name: "January", length: 31, type: "standard" },
        { name: "February", length: 28, type: "standard" },
        { name: "March", length: 31, type: "standard" },
        { name: "April", length: 30, type: "standard" },
        { name: "May", length: 31, type: "standard" },
        { name: "June", length: 30, type: "standard" },
        { name: "July", length: 31, type: "standard" },
        { name: "August", length: 31, type: "standard" },
        { name: "September", length: 30, type: "standard" },
        { name: "October", length: 31, type: "standard" },
        { name: "November", length: 30, type: "standard" },
        { name: "December", length: 31, type: "standard" },
      ],
      weekdays: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      seasons: [
        { name: "Spring", month: 2, day: 20 },
        { name: "Summer", month: 5, day: 21 },
        { name: "Fall", month: 8, day: 22 },
        { name: "Winter", month: 11, day: 21 },
      ],
    } as CalendarPresetConfig,
  };
}

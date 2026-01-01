export type AttributeType = "text" | "number" | "boolean" | "date" | "url";

export interface Attribute {
  id: string;
  entityType: string;
  entityId: string;
  key: string;
  value: string;
  type: AttributeType;
  category?: string | null;
  order: number;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
  campaignId: string;
  campaign?: {
    id: string;
    name: string;
  };
  createdById: string;
  createdBy?: {
    id: string;
    name: string | null;
    email: string;
  };
}

export interface AttributeFormData {
  key: string;
  value: string;
  type: AttributeType;
  category?: string;
  order?: number;
  isPrivate?: boolean;
}

export interface AttributeGroup {
  category: string;
  attributes: Attribute[];
}

// Helper function to parse attribute value based on type
export function parseAttributeValue(attribute: Attribute): any {
  switch (attribute.type) {
    case "number":
      const num = parseFloat(attribute.value);
      return isNaN(num) ? attribute.value : num;
    case "boolean":
      return attribute.value === "true" || attribute.value === "1";
    case "date":
      return attribute.value;
    case "url":
      return attribute.value;
    case "text":
    default:
      return attribute.value;
  }
}

// Helper function to format attribute value for display
export function formatAttributeValue(attribute: Attribute): string {
  switch (attribute.type) {
    case "boolean":
      return parseAttributeValue(attribute) ? "Yes" : "No";
    case "url":
      return attribute.value;
    default:
      return attribute.value;
  }
}

// Group attributes by category
export function groupAttributesByCategory(
  attributes: Attribute[]
): AttributeGroup[] {
  const grouped = new Map<string, Attribute[]>();

  attributes.forEach((attr) => {
    const category = attr.category || "General";
    if (!grouped.has(category)) {
      grouped.set(category, []);
    }
    grouped.get(category)!.push(attr);
  });

  return Array.from(grouped.entries())
    .map(([category, attributes]) => ({
      category,
      attributes: attributes.sort((a, b) => a.order - b.order),
    }))
    .sort((a, b) => {
      // Put "General" last
      if (a.category === "General") return 1;
      if (b.category === "General") return -1;
      return a.category.localeCompare(b.category);
    });
}

export const ATTRIBUTE_TYPES: { value: AttributeType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "boolean", label: "Boolean (Yes/No)" },
  { value: "date", label: "Date" },
  { value: "url", label: "URL" },
];

export const COMMON_ATTRIBUTE_CATEGORIES = [
  "Stats",
  "Skills",
  "Properties",
  "Equipment",
  "Abilities",
  "Traits",
  "General",
] as const;

// Attribute Template Types (Phase 23)

export interface AttributeTemplate {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  config: AttributeTemplateConfig;
  entityType: string | null; // character, location, item, quest, etc. - null means applies to all
  isPublic: boolean;
  position: number;
  campaignId: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AttributeTemplateWithRelations extends AttributeTemplate {
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

// Template Configuration

export interface AttributeTemplateConfig {
  attributes: TemplateAttribute[];
  rules?: TemplateRule[];
}

export interface TemplateAttribute {
  name: string;
  type: string; // string, number, textarea, select, multiselect
  value?: string | number | string[]; // Default value
  options?: string[]; // For select/multiselect types
  randomType?: "none" | "list" | "range" | "dice"; // How to generate random value
  randomConfig?: RandomConfig;
  isPrivate?: boolean;
}

export interface RandomConfig {
  // For list type
  list?: string[];

  // For range type
  min?: number;
  max?: number;

  // For dice type
  dice?: string; // e.g., "2d6", "1d20+5"

  // For all types
  allowEmpty?: boolean;
  weight?: Record<string, number>; // Weighted random selection
}

export interface TemplateRule {
  condition: string; // e.g., "type === 'warrior'"
  action: "set" | "add" | "multiply" | "hide" | "show";
  target: string; // attribute name
  value?: any;
}

// Entity Types Constants

export const ENTITY_TYPES = {
  ALL: null,
  CHARACTER: "character",
  LOCATION: "location",
  ITEM: "item",
  QUEST: "quest",
  EVENT: "event",
  JOURNAL: "journal",
  FAMILY: "family",
  ORGANISATION: "organisation",
  RACE: "race",
} as const;

export const ENTITY_TYPE_LABELS: Record<string, string> = {
  character: "Characters",
  location: "Locations",
  item: "Items",
  quest: "Quests",
  event: "Events",
  journal: "Journals",
  family: "Families",
  organisation: "Organisations",
  race: "Races",
};

// Attribute Types

export const ATTRIBUTE_TYPES = {
  STRING: "string",
  NUMBER: "number",
  TEXTAREA: "textarea",
  SELECT: "select",
  MULTISELECT: "multiselect",
  CHECKBOX: "checkbox",
} as const;

export const ATTRIBUTE_TYPE_LABELS: Record<string, string> = {
  string: "Text",
  number: "Number",
  textarea: "Long Text",
  select: "Dropdown",
  multiselect: "Multi-Select",
  checkbox: "Checkbox",
};

// Random Generation Types

export const RANDOM_TYPES = {
  NONE: "none",
  LIST: "list",
  RANGE: "range",
  DICE: "dice",
} as const;

export const RANDOM_TYPE_LABELS: Record<string, string> = {
  none: "No Random",
  list: "From List",
  range: "Number Range",
  dice: "Dice Roll",
};

// Helper Functions

export function getEntityTypeLabel(entityType: string | null): string {
  if (!entityType) return "All Entities";
  return ENTITY_TYPE_LABELS[entityType] || entityType;
}

export function getAttributeTypeLabel(type: string): string {
  return ATTRIBUTE_TYPE_LABELS[type] || type;
}

export function getRandomTypeLabel(type: string): string {
  return RANDOM_TYPE_LABELS[type] || type;
}

export function generateRandomValue(
  attribute: TemplateAttribute
): string | number | string[] | null {
  if (!attribute.randomType || attribute.randomType === "none") {
    return attribute.value || null;
  }

  const config = attribute.randomConfig;

  if (
    attribute.randomType === "list" &&
    config?.list &&
    config.list.length > 0
  ) {
    // Weighted random selection if weights are provided
    if (config.weight) {
      const totalWeight = Object.values(config.weight).reduce(
        (sum, w) => sum + w,
        0
      );
      let random = Math.random() * totalWeight;

      for (const item of config.list) {
        const weight = config.weight[item] || 1;
        if (random < weight) {
          return item;
        }
        random -= weight;
      }
    }

    // Simple random selection
    return config.list[Math.floor(Math.random() * config.list.length)];
  }

  if (
    attribute.randomType === "range" &&
    config?.min !== undefined &&
    config?.max !== undefined
  ) {
    return (
      Math.floor(Math.random() * (config.max - config.min + 1)) + config.min
    );
  }

  if (attribute.randomType === "dice" && config?.dice) {
    return rollDice(config.dice);
  }

  return attribute.value || null;
}

function rollDice(notation: string): number {
  // Parse dice notation like "2d6+3", "1d20", "3d10-2"
  const match = notation.match(/(\d+)d(\d+)([\+\-]\d+)?/);

  if (!match) return 0;

  const count = parseInt(match[1], 10);
  const sides = parseInt(match[2], 10);
  const modifier = match[3] ? parseInt(match[3], 10) : 0;

  let total = 0;
  for (let i = 0; i < count; i++) {
    total += Math.floor(Math.random() * sides) + 1;
  }

  return total + modifier;
}

export function applyTemplate(
  template: AttributeTemplate,
  entityData: Record<string, any> = {}
): Record<string, any> {
  const result: Record<string, any> = { ...entityData };
  const config = template.config as AttributeTemplateConfig;

  // Apply attributes
  for (const attr of config.attributes) {
    // Skip if attribute already has a value and we're not overwriting
    if (result[attr.name] !== undefined) continue;

    // Generate value
    if (attr.randomType && attr.randomType !== "none") {
      result[attr.name] = generateRandomValue(attr);
    } else {
      result[attr.name] = attr.value || null;
    }
  }

  // Apply rules
  if (config.rules) {
    for (const rule of config.rules) {
      try {
        // Evaluate condition (simple equality check for now)
        // In production, use a safer expression evaluator
        const shouldApply = evaluateCondition(rule.condition, result);

        if (shouldApply) {
          applyRule(rule, result);
        }
      } catch (error) {
        console.error("Error applying rule:", rule, error);
      }
    }
  }

  return result;
}

function evaluateCondition(
  condition: string,
  data: Record<string, any>
): boolean {
  // Simple condition evaluation - in production, use a proper expression parser
  // Examples: "type === 'warrior'", "level > 5"
  const eqMatch = condition.match(/^(\w+)\s*===\s*'([^']+)'$/);
  if (eqMatch) {
    const [, key, value] = eqMatch;
    return data[key] === value;
  }

  const gtMatch = condition.match(/^(\w+)\s*>\s*(\d+)$/);
  if (gtMatch) {
    const [, key, value] = gtMatch;
    return Number(data[key]) > Number(value);
  }

  return false;
}

function applyRule(rule: TemplateRule, data: Record<string, any>): void {
  const { action, target, value } = rule;

  switch (action) {
    case "set":
      data[target] = value;
      break;
    case "add":
      data[target] = (Number(data[target]) || 0) + Number(value);
      break;
    case "multiply":
      data[target] = (Number(data[target]) || 0) * Number(value);
      break;
    case "hide":
      data[`_hide_${target}`] = true;
      break;
    case "show":
      data[`_hide_${target}`] = false;
      break;
  }
}

export function validateTemplate(
  template: Partial<AttributeTemplate>
): string[] {
  const errors: string[] = [];

  if (!template.name?.trim()) {
    errors.push("Template name is required");
  }

  if (!template.config || typeof template.config !== "object") {
    errors.push("Template configuration is required");
  } else {
    const config = template.config as AttributeTemplateConfig;

    if (!config.attributes || !Array.isArray(config.attributes)) {
      errors.push("Template must have attributes array");
    } else if (config.attributes.length === 0) {
      errors.push("Template must have at least one attribute");
    } else {
      // Validate each attribute
      config.attributes.forEach((attr, index) => {
        if (!attr.name?.trim()) {
          errors.push(`Attribute ${index + 1}: name is required`);
        }
        if (!attr.type) {
          errors.push(`Attribute ${index + 1}: type is required`);
        }
        if (
          (attr.type === "select" || attr.type === "multiselect") &&
          (!attr.options || attr.options.length === 0)
        ) {
          errors.push(
            `Attribute ${
              index + 1
            }: options are required for select/multiselect type`
          );
        }
      });
    }
  }

  return errors;
}

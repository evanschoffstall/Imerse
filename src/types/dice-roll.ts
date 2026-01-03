import { User } from "./index";

export interface DiceRoll {
  id: string;
  name: string;
  system: string | null;
  parameters: string; // Dice expression (3d6+2, 1d20+{character.strength})
  isPrivate: boolean;
  campaignId: string;
  createdById: string;
  characterId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DiceRollWithRelations extends DiceRoll {
  campaign: {
    id: string;
    name: string;
  };
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  character?: {
    id: string;
    name: string;
  } | null;
  results?: DiceRollResult[];
  _count?: {
    results: number;
  };
}

export interface DiceRollResult {
  id: string;
  results: string; // JSON string of roll details
  isPrivate: boolean;
  diceRollId: string;
  createdById: string;
  createdAt: Date;
}

export interface DiceRollResultWithRelations extends DiceRollResult {
  diceRoll: DiceRoll;
  createdBy: User;
}

export interface DiceRollFormData {
  name: string;
  system?: string;
  parameters: string;
  characterId?: string;
  isPrivate?: boolean;
}

// Roll result structure
export interface RollDetails {
  expression: string; // Original expression
  substituted: string; // After character attribute substitution
  rolls: RollDetail[]; // Individual die rolls
  total: number;
  breakdown: string; // Human-readable breakdown
}

export interface RollDetail {
  type: string; // 'd6', 'd20', 'modifier', etc.
  value: number;
  sides?: number; // For dice
}

// Dice expression patterns
export const DICE_PATTERN = /(\d+)d(\d+)/gi;
export const MODIFIER_PATTERN = /([+-]\d+)/g;
export const CHARACTER_ATTR_PATTERN = /\{character\.([a-zA-Z0-9_]+)\}/gi;

// Common dice systems
export const DICE_SYSTEMS = [
  "d20", // D&D 5e, Pathfinder
  "d100", // Percentile systems
  "custom",
] as const;

// Helper: Parse dice expression
export function parseDiceExpression(expression: string): {
  valid: boolean;
  parts: string[];
  error?: string;
} {
  try {
    const normalized = expression.replace(/\s+/g, "").toLowerCase();
    const parts: string[] = [];

    // Check for character attributes
    const attrMatches = normalized.match(CHARACTER_ATTR_PATTERN);
    if (attrMatches) {
      parts.push(...attrMatches);
    }

    // Check for dice notation
    const diceMatches = normalized.match(DICE_PATTERN);
    if (diceMatches) {
      parts.push(...diceMatches);
    }

    // Check for modifiers
    const modMatches = normalized.match(MODIFIER_PATTERN);
    if (modMatches) {
      parts.push(...modMatches);
    }

    if (parts.length === 0 && normalized.length > 0) {
      return {
        valid: false,
        parts: [],
        error: "Invalid dice expression format",
      };
    }

    return {
      valid: true,
      parts,
    };
  } catch (error) {
    return {
      valid: false,
      parts: [],
      error: "Failed to parse expression",
    };
  }
}

// Helper: Format roll result for display
export function formatRollResult(details: RollDetails): string {
  return `${details.expression} = ${details.total} (${details.breakdown})`;
}

// Helper: Get roll details from JSON string
export function getRollDetails(results: string): RollDetails {
  try {
    return JSON.parse(results);
  } catch {
    return {
      expression: "Error",
      substituted: "Error",
      rolls: [],
      total: 0,
      breakdown: "Invalid roll data",
    };
  }
}

import { RollDetail, RollDetails } from "@/types/dice-roll";

// Character attributes type
interface CharacterAttributes {
  [key: string]: string | number;
}

/**
 * Main dice rolling function
 * Supports expressions like: 3d6+2, 1d20+{character.strength}, 2d10-1, etc.
 */
export function rollDice(
  expression: string,
  characterAttributes?: CharacterAttributes
): RollDetails {
  try {
    // Step 1: Substitute character attributes
    const substituted = substituteAttributes(expression, characterAttributes);

    // Step 2: Parse and roll dice
    const rolls: RollDetail[] = [];
    let workingExpression = substituted;

    // Extract all dice notation (XdY)
    const dicePattern = /(\d+)d(\d+)/gi;
    const diceMatches = Array.from(workingExpression.matchAll(dicePattern));

    for (const match of diceMatches) {
      const [fullMatch, countStr, sidesStr] = match;
      const count = parseInt(countStr, 10);
      const sides = parseInt(sidesStr, 10);

      // Roll each die
      let diceTotal = 0;
      for (let i = 0; i < count; i++) {
        const roll = Math.floor(Math.random() * sides) + 1;
        diceTotal += roll;
        rolls.push({
          type: `d${sides}`,
          value: roll,
          sides,
        });
      }

      // Replace dice notation with the total
      workingExpression = workingExpression.replace(
        fullMatch,
        diceTotal.toString()
      );
    }

    // Step 3: Evaluate mathematical expression
    const total = evaluateExpression(workingExpression);

    // Step 4: Build breakdown
    const breakdown = buildBreakdown(rolls, workingExpression);

    return {
      expression,
      substituted,
      rolls,
      total,
      breakdown,
    };
  } catch (error) {
    console.error("Dice rolling error:", error);
    return {
      expression,
      substituted: expression,
      rolls: [],
      total: 0,
      breakdown: "Error rolling dice",
    };
  }
}

/**
 * Substitute character attributes in expression
 * Example: "1d20+{character.strength}" with strength=3 becomes "1d20+3"
 */
function substituteAttributes(
  expression: string,
  attributes?: CharacterAttributes
): string {
  if (!attributes) {
    return expression;
  }

  let result = expression;
  const pattern = /\{character\.([a-zA-Z0-9_]+)\}/gi;

  const matches = Array.from(result.matchAll(pattern));
  for (const match of matches) {
    const [fullMatch, attrName] = match;
    const attrValue = attributes[attrName.toLowerCase()];

    if (attrValue !== undefined) {
      // Convert to string and ensure it's a valid number
      const valueStr = attrValue.toString();
      const valueNum = parseFloat(valueStr);

      if (!isNaN(valueNum)) {
        result = result.replace(fullMatch, valueNum.toString());
      }
    }
  }

  // Clean up any remaining unreplaced attributes (replace with 0)
  result = result.replace(pattern, "0");

  return result;
}

/**
 * Safely evaluate a mathematical expression
 * Supports: +, -, *, /, (, )
 */
function evaluateExpression(expression: string): number {
  try {
    // Remove whitespace
    const cleaned = expression.replace(/\s+/g, "");

    // Validate that expression only contains safe characters
    if (!/^[\d+\-*/().]+$/.test(cleaned)) {
      throw new Error("Invalid characters in expression");
    }

    // Handle edge case of +-X (replace with -X)
    const normalized = cleaned.replace(/\+-/g, "-");

    // Use Function constructor for safe evaluation
    // This is safer than eval() as it doesn't have access to local scope
    const result = Function(`'use strict'; return (${normalized})`)();

    if (typeof result !== "number" || isNaN(result)) {
      throw new Error("Expression did not evaluate to a number");
    }

    return Math.floor(result); // Round down to integer
  } catch (error) {
    console.error("Expression evaluation error:", error);
    return 0;
  }
}

/**
 * Build a human-readable breakdown of the roll
 */
function buildBreakdown(rolls: RollDetail[], finalExpression: string): string {
  if (rolls.length === 0) {
    return finalExpression;
  }

  // Group rolls by die type
  const grouped = rolls.reduce((acc, roll) => {
    const key = roll.type;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(roll.value);
    return acc;
  }, {} as Record<string, number[]>);

  // Build breakdown string
  const parts = Object.entries(grouped).map(([type, values]) => {
    const sum = values.reduce((a, b) => a + b, 0);
    return `${type}: [${values.join(", ")}] = ${sum}`;
  });

  return parts.join(" | ");
}

/**
 * Quick roll function for common dice
 */
export function quickRoll(
  sides: number,
  count: number = 1,
  modifier: number = 0
): RollDetails {
  const expression = `${count}d${sides}${modifier >= 0 ? "+" : ""}${
    modifier !== 0 ? modifier : ""
  }`;
  return rollDice(expression);
}

/**
 * Advantage roll (roll 2d20, take higher)
 */
export function rollWithAdvantage(modifier: number = 0): RollDetails {
  const roll1 = Math.floor(Math.random() * 20) + 1;
  const roll2 = Math.floor(Math.random() * 20) + 1;
  const higher = Math.max(roll1, roll2);
  const total = higher + modifier;

  return {
    expression: `2d20 (advantage)${
      modifier !== 0 ? ` ${modifier >= 0 ? "+" : ""}${modifier}` : ""
    }`,
    substituted: `2d20 (advantage)${
      modifier !== 0 ? ` ${modifier >= 0 ? "+" : ""}${modifier}` : ""
    }`,
    rolls: [
      { type: "d20", value: roll1, sides: 20 },
      { type: "d20", value: roll2, sides: 20 },
    ],
    total,
    breakdown: `Rolls: [${roll1}, ${roll2}] → ${higher} (higher)${
      modifier !== 0 ? ` + ${modifier}` : ""
    }`,
  };
}

/**
 * Disadvantage roll (roll 2d20, take lower)
 */
export function rollWithDisadvantage(modifier: number = 0): RollDetails {
  const roll1 = Math.floor(Math.random() * 20) + 1;
  const roll2 = Math.floor(Math.random() * 20) + 1;
  const lower = Math.min(roll1, roll2);
  const total = lower + modifier;

  return {
    expression: `2d20 (disadvantage)${
      modifier !== 0 ? ` ${modifier >= 0 ? "+" : ""}${modifier}` : ""
    }`,
    substituted: `2d20 (disadvantage)${
      modifier !== 0 ? ` ${modifier >= 0 ? "+" : ""}${modifier}` : ""
    }`,
    rolls: [
      { type: "d20", value: roll1, sides: 20 },
      { type: "d20", value: roll2, sides: 20 },
    ],
    total,
    breakdown: `Rolls: [${roll1}, ${roll2}] → ${lower} (lower)${
      modifier !== 0 ? ` + ${modifier}` : ""
    }`,
  };
}

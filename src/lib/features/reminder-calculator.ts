import type { AgeCalculation, RecurrenceRule } from "@/types/reminder";

/**
 * Calculate age or elapsed time between two calendar dates
 * @param startDate Start date in YYYY-MM-DD format
 * @param endDate End date in YYYY-MM-DD format (defaults to today)
 * @returns Age calculation with years, months, days
 */
export function calculateAge(
  startDate: string,
  endDate?: string
): AgeCalculation {
  const start = parseCalendarDate(startDate);
  const end = endDate ? parseCalendarDate(endDate) : new Date();

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();

  // Adjust for negative days
  if (days < 0) {
    months--;
    const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
    days += prevMonth.getDate();
  }

  // Adjust for negative months
  if (months < 0) {
    years--;
    months += 12;
  }

  // Calculate total days
  const totalDays = Math.floor(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Create display string
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} year${years !== 1 ? "s" : ""}`);
  if (months > 0) parts.push(`${months} month${months !== 1 ? "s" : ""}`);
  if (days > 0 || parts.length === 0)
    parts.push(`${days} day${days !== 1 ? "s" : ""}`);

  return {
    years,
    months,
    days,
    totalDays,
    displayString: parts.join(", "),
  };
}

/**
 * Parse a calendar date string (YYYY-MM-DD) to a Date object
 */
function parseCalendarDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Format a calendar date to YYYY-MM-DD format
 */
export function formatCalendarDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Calculate the next occurrence of a recurring reminder
 * @param baseDate The base date of the reminder (YYYY-MM-DD)
 * @param recurrenceRule The recurrence rule
 * @param currentDate Optional current date (defaults to today)
 * @returns Next occurrence date in YYYY-MM-DD format
 */
export function calculateNextOccurrence(
  baseDate: string,
  recurrenceRule: RecurrenceRule,
  currentDate?: string
): string {
  const base = parseCalendarDate(baseDate);
  const current = currentDate ? parseCalendarDate(currentDate) : new Date();

  let next = new Date(base);

  switch (recurrenceRule.type) {
    case "daily":
      // Add days until we're past current date
      while (next <= current) {
        next.setDate(next.getDate() + recurrenceRule.interval);
      }
      break;

    case "monthly":
      // Add months until we're past current date
      while (next <= current) {
        next.setMonth(next.getMonth() + recurrenceRule.interval);
      }
      break;

    case "yearly":
      // Add years until we're past current date
      while (next <= current) {
        next.setFullYear(next.getFullYear() + recurrenceRule.interval);
      }
      break;

    case "moon":
      // Moon-based recurrence (approximately 29.5 days)
      const lunarCycle = 29.53;
      while (next <= current) {
        next.setDate(
          next.getDate() + Math.round(lunarCycle * recurrenceRule.interval)
        );
      }
      break;
  }

  // Check if we've passed the end date
  if (recurrenceRule.endDate) {
    const endDate = parseCalendarDate(recurrenceRule.endDate);
    if (next > endDate) {
      return recurrenceRule.endDate; // Return the end date as final occurrence
    }
  }

  return formatCalendarDate(next);
}

/**
 * Calculate all upcoming occurrences of a recurring reminder within a date range
 * @param baseDate The base date of the reminder (YYYY-MM-DD)
 * @param recurrenceRule The recurrence rule
 * @param startDate Start of the range (defaults to today)
 * @param endDate End of the range (YYYY-MM-DD)
 * @param maxOccurrences Maximum number of occurrences to return
 * @returns Array of occurrence dates in YYYY-MM-DD format
 */
export function calculateOccurrences(
  baseDate: string,
  recurrenceRule: RecurrenceRule,
  startDate?: string,
  endDate?: string,
  maxOccurrences = 100
): string[] {
  const occurrences: string[] = [];
  const start = startDate ? parseCalendarDate(startDate) : new Date();
  const end = endDate ? parseCalendarDate(endDate) : undefined;
  const ruleEnd = recurrenceRule.endDate
    ? parseCalendarDate(recurrenceRule.endDate)
    : undefined;

  let current = parseCalendarDate(baseDate);

  // Fast-forward to start date
  while (current < start) {
    switch (recurrenceRule.type) {
      case "daily":
        current.setDate(current.getDate() + recurrenceRule.interval);
        break;
      case "monthly":
        current.setMonth(current.getMonth() + recurrenceRule.interval);
        break;
      case "yearly":
        current.setFullYear(current.getFullYear() + recurrenceRule.interval);
        break;
      case "moon":
        const lunarCycle = 29.53;
        current.setDate(
          current.getDate() + Math.round(lunarCycle * recurrenceRule.interval)
        );
        break;
    }
  }

  // Collect occurrences
  while (occurrences.length < maxOccurrences) {
    // Check if we've exceeded the range end or rule end
    if (end && current > end) break;
    if (ruleEnd && current > ruleEnd) break;

    occurrences.push(formatCalendarDate(current));

    // Calculate next occurrence
    switch (recurrenceRule.type) {
      case "daily":
        current.setDate(current.getDate() + recurrenceRule.interval);
        break;
      case "monthly":
        current.setMonth(current.getMonth() + recurrenceRule.interval);
        break;
      case "yearly":
        current.setFullYear(current.getFullYear() + recurrenceRule.interval);
        break;
      case "moon":
        const lunarCycle = 29.53;
        current.setDate(
          current.getDate() + Math.round(lunarCycle * recurrenceRule.interval)
        );
        break;
    }
  }

  return occurrences;
}

/**
 * Calculate days until a specific date
 * @param targetDate Target date in YYYY-MM-DD format
 * @param currentDate Optional current date (defaults to today)
 * @returns Number of days until target (negative if past)
 */
export function daysUntil(targetDate: string, currentDate?: string): number {
  const target = parseCalendarDate(targetDate);
  const current = currentDate ? parseCalendarDate(currentDate) : new Date();

  const diffMs = target.getTime() - current.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Check if a reminder should trigger a notification
 * @param reminderDate The reminder date (YYYY-MM-DD)
 * @param notifyBefore Days before to notify
 * @param currentDate Optional current date (defaults to today)
 * @returns True if notification should be triggered
 */
export function shouldNotify(
  reminderDate: string,
  notifyBefore: number,
  currentDate?: string
): boolean {
  const days = daysUntil(reminderDate, currentDate);
  return days >= 0 && days <= notifyBefore;
}

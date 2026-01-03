import { z } from "zod";

// Calendar Month Configuration
export interface CalendarMonth {
  name: string;
  length: number; // Number of days in the month
  intercalary?: boolean; // Special intercalary/leap month
}

// Calendar Moon Configuration
export interface CalendarMoon {
  name: string;
  cycle: number; // Full cycle length in days
  shift: number; // Phase shift offset in days
  color?: string; // Hex color for visualization
}

// Calendar Season Configuration
export interface CalendarSeason {
  name: string;
  monthStart: number; // Month this season starts (1-based)
  monthEnd: number; // Month this season ends (1-based)
  color?: string; // Hex color for visualization
}

// Calendar Year Configuration (custom names/eras for years)
export type CalendarYears = Record<number, string>;

// Calendar Week Configuration
export type CalendarWeeks = string[];

// Calendar Month Aliases
export type CalendarMonthAliases = Record<number, string>;

// Calendar Weekdays
export type CalendarWeekdays = string[];

// Calendar Parameters (additional settings)
export interface CalendarParameters {
  layout?: "monthly" | "yearly";
  [key: string]: any;
}

// Main Calendar Interface
export interface Calendar {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;

  // Current date
  date?: string | null; // Format: YYYY-MM-DD (e.g., "2024-03-15")

  // Calendar configuration
  months?: CalendarMonth[] | null;
  weekdays?: CalendarWeekdays | null;
  years?: CalendarYears | null;
  seasons?: CalendarSeason[] | null;
  moons?: CalendarMoon[] | null;
  weekNames?: CalendarWeeks | null;
  monthAliases?: CalendarMonthAliases | null;

  // Date formatting
  suffix?: string | null; // e.g., "AD", "BR"
  format?: string | null;

  // Leap year configuration
  hasLeapYear: boolean;
  leapYearAmount?: number | null;
  leapYearMonth?: number | null;
  leapYearOffset?: number | null;
  leapYearStart?: number | null;

  // Advanced settings
  startOffset: number; // Day of week year starts on (0-6)
  skipYearZero: boolean;
  showBirthdays: boolean;
  parameters?: CalendarParameters | null;

  isPrivate: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;

  // Hierarchy
  parentId?: string | null;
  parent?: Calendar | null;
  children?: Calendar[];

  // Relations
  campaignId: string;
  campaign?: {
    id: string;
    name: string;
  };
  createdById: string;
  createdBy?: {
    id: string;
    name: string;
  };

  // Associated weather entries
  weather?: CalendarWeather[];
}

// Calendar Weather Entry
export interface CalendarWeather {
  id: string;

  // Date
  date: string; // YYYY-MM-DD format

  // Weather details
  weatherType?: string | null; // e.g., "clear", "rain", "snow", "storm"
  temperature?: number | null;
  precipitation?: string | null;
  wind?: string | null;
  effect?: string | null;

  createdAt: Date | string;
  updatedAt: Date | string;

  calendarId: string;
  calendar?: Calendar;
}

// Weather Type Options
export const WEATHER_TYPES = [
  "clear",
  "cloudy",
  "rain",
  "drizzle",
  "snow",
  "sleet",
  "hail",
  "storm",
  "thunderstorm",
  "fog",
  "mist",
  "wind",
  "hot",
  "cold",
] as const;

export type WeatherType = (typeof WEATHER_TYPES)[number];

// Calendar Date Parsed
export interface CalendarDate {
  year: number;
  month: number; // 1-based
  day: number;
}

// Form Data Types
export interface CalendarFormData {
  name: string;
  slug?: string;
  description?: string;
  image?: string;

  date?: string;

  months?: CalendarMonth[];
  weekdays?: string[];
  years?: Record<number, string>;
  seasons?: CalendarSeason[];
  moons?: CalendarMoon[];
  weekNames?: string[];
  monthAliases?: Record<number, string>;

  suffix?: string;
  format?: string;

  hasLeapYear?: boolean;
  leapYearAmount?: number;
  leapYearMonth?: number;
  leapYearOffset?: number;
  leapYearStart?: number;

  startOffset?: number;
  skipYearZero?: boolean;
  showBirthdays?: boolean;
  parameters?: CalendarParameters;

  isPrivate?: boolean;
  parentId?: string;
  campaignId: string;
}

export interface CalendarWeatherFormData {
  date: string;
  weatherType?: string;
  temperature?: number;
  precipitation?: string;
  wind?: string;
  effect?: string;
  calendarId: string;
}

// Validation Schemas
export const calendarMonthSchema = z.object({
  name: z.string().min(1, "Month name is required"),
  length: z
    .number()
    .int()
    .min(1, "Month must have at least 1 day")
    .max(366, "Month cannot exceed 366 days"),
  intercalary: z.boolean().optional(),
});

export const calendarMoonSchema = z.object({
  name: z.string().min(1, "Moon name is required"),
  cycle: z
    .number()
    .int()
    .min(1, "Cycle length is required")
    .max(365, "Cycle cannot exceed 365 days"),
  shift: z.number().int().min(0, "Shift must be non-negative"),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color")
    .optional(),
});

export const calendarSeasonSchema = z.object({
  name: z.string().min(1, "Season name is required"),
  monthStart: z.number().int().min(1, "Start month is required"),
  monthEnd: z.number().int().min(1, "End month is required"),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color")
    .optional(),
});

export const calendarSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name cannot exceed 255 characters"),
  slug: z.string().optional(),
  description: z.string().optional(),
  image: z.string().url("Must be a valid URL").optional().or(z.literal("")),

  date: z
    .string()
    .regex(/^-?\d{1,5}-\d{1,2}-\d{1,2}$/, "Date must be in YYYY-MM-DD format")
    .optional(),

  months: z.array(calendarMonthSchema).optional(),
  weekdays: z.array(z.string().min(1, "Weekday name is required")).optional(),
  years: z
    .record(z.string().regex(/^\d+$/, "Year key must be a number"), z.string())
    .optional(),
  seasons: z.array(calendarSeasonSchema).optional(),
  moons: z.array(calendarMoonSchema).optional(),
  weekNames: z.array(z.string().min(1, "Week name is required")).optional(),
  monthAliases: z
    .record(z.string().regex(/^\d+$/, "Month key must be a number"), z.string())
    .optional(),

  suffix: z.string().max(50, "Suffix cannot exceed 50 characters").optional(),
  format: z.string().max(100, "Format cannot exceed 100 characters").optional(),

  hasLeapYear: z.boolean().optional(),
  leapYearAmount: z
    .number()
    .int()
    .min(1, "Leap year amount must be at least 1")
    .optional(),
  leapYearMonth: z
    .number()
    .int()
    .min(1, "Leap year month must be at least 1")
    .optional(),
  leapYearOffset: z
    .number()
    .int()
    .min(1, "Leap year offset must be at least 1")
    .optional(),
  leapYearStart: z.number().int().optional(),

  startOffset: z
    .number()
    .int()
    .min(0, "Start offset must be non-negative")
    .max(6, "Start offset cannot exceed 6")
    .optional(),
  skipYearZero: z.boolean().optional(),
  showBirthdays: z.boolean().optional(),
  parameters: z.record(z.string(), z.any()).optional(),

  isPrivate: z.boolean().optional(),
  parentId: z.string().optional(),
  campaignId: z.string().min(1, "Campaign is required"),
});

export const calendarWeatherSchema = z.object({
  date: z
    .string()
    .regex(/^-?\d{1,5}-\d{1,2}-\d{1,2}$/, "Date must be in YYYY-MM-DD format"),
  weatherType: z
    .string()
    .max(100, "Weather type cannot exceed 100 characters")
    .optional(),
  temperature: z.number().optional().nullable(),
  precipitation: z
    .string()
    .max(100, "Precipitation cannot exceed 100 characters")
    .optional()
    .nullable(),
  wind: z
    .string()
    .max(100, "Wind cannot exceed 100 characters")
    .optional()
    .nullable(),
  effect: z
    .string()
    .max(500, "Effect cannot exceed 500 characters")
    .optional()
    .nullable(),
  calendarId: z.string().min(1, "Calendar is required"),
});

// Helper Functions
export function parseCalendarDate(
  dateString?: string | null
): CalendarDate | null {
  if (!dateString) return null;

  const isNegative = dateString.startsWith("-");
  const parts = dateString.replace(/^-/, "").split("-");

  if (parts.length !== 3) return null;

  const year = parseInt(parts[0], 10) * (isNegative ? -1 : 1);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

  return { year, month, day };
}

export function formatCalendarDate(
  date: CalendarDate,
  calendar: Calendar
): string {
  const { year, month, day } = date;
  const months = calendar.months || [];
  const years = calendar.years || {};

  const monthName = months[month - 1]?.name || month.toString();
  const yearName = years[year] || year.toString();
  const suffix = calendar.suffix || "";

  return `${day} ${monthName}, ${yearName}${suffix ? " " + suffix : ""}`;
}

export function getDaysInMonth(month: number, calendar: Calendar): number {
  const months = calendar.months || [];
  return months[month - 1]?.length || 30;
}

export function getDaysInYear(calendar: Calendar): number {
  const months = calendar.months || [];
  return months.reduce((total, month) => total + month.length, 0);
}

export function isLeapYear(year: number, calendar: Calendar): boolean {
  if (!calendar.hasLeapYear) return false;
  if (!calendar.leapYearOffset || !calendar.leapYearStart) return false;

  const yearsSinceStart = year - calendar.leapYearStart;
  return (
    yearsSinceStart >= 0 && yearsSinceStart % calendar.leapYearOffset === 0
  );
}

export function getMonthName(month: number, calendar: Calendar): string {
  const months = calendar.months || [];
  const aliases = calendar.monthAliases || {};

  // Check for alias first
  if (aliases[month]) return aliases[month];

  // Otherwise use month name
  return months[month - 1]?.name || `Month ${month}`;
}

export function getWeekdayName(day: number, calendar: Calendar): string {
  const weekdays = calendar.weekdays || [];
  const index = day % weekdays.length;
  return weekdays[index] || `Day ${day}`;
}

// Date Calculator Utilities
export function addDays(
  date: CalendarDate,
  days: number,
  calendar: Calendar
): CalendarDate {
  let { year, month, day } = date;
  const months = calendar.months || [];

  if (months.length === 0) {
    throw new Error("Calendar has no months defined");
  }

  // Add days
  day += days;

  // Handle forward movement
  while (day > getDaysInMonth(month, calendar)) {
    day -= getDaysInMonth(month, calendar);
    month++;

    if (month > months.length) {
      month = 1;
      year++;

      // Skip year zero if configured
      if (calendar.skipYearZero && year === 0) {
        year = 1;
      }
    }
  }

  // Handle backward movement
  while (day < 1) {
    month--;

    if (month < 1) {
      month = months.length;
      year--;

      // Skip year zero if configured
      if (calendar.skipYearZero && year === 0) {
        year = -1;
      }
    }

    day += getDaysInMonth(month, calendar);
  }

  return { year, month, day };
}

export function subtractDays(
  date: CalendarDate,
  days: number,
  calendar: Calendar
): CalendarDate {
  return addDays(date, -days, calendar);
}

export function daysBetween(
  date1: CalendarDate,
  date2: CalendarDate,
  calendar: Calendar
): number {
  // Convert both dates to day-of-calendar (days since year 1, month 1, day 1)
  const days1 = dateToDayOfCalendar(date1, calendar);
  const days2 = dateToDayOfCalendar(date2, calendar);

  return Math.abs(days2 - days1);
}

function dateToDayOfCalendar(date: CalendarDate, calendar: Calendar): number {
  let totalDays = 0;
  const daysPerYear = getDaysInYear(calendar);

  // Add full years
  if (date.year > 1) {
    totalDays += (date.year - 1) * daysPerYear;
  } else if (date.year < 1) {
    totalDays -= Math.abs(date.year) * daysPerYear;
  }

  // Add full months in current year
  for (let m = 1; m < date.month; m++) {
    totalDays += getDaysInMonth(m, calendar);
  }

  // Add days in current month
  totalDays += date.day;

  return totalDays;
}

export function getDayOfWeek(date: CalendarDate, calendar: Calendar): number {
  const weekdays = calendar.weekdays || [];
  if (weekdays.length === 0) return 0;

  const totalDays = dateToDayOfCalendar(date, calendar);
  const startOffset = calendar.startOffset || 0;

  return (totalDays - 1 + startOffset) % weekdays.length;
}

export function getDayOfYear(date: CalendarDate, calendar: Calendar): number {
  let dayOfYear = 0;

  // Add days from previous months
  for (let m = 1; m < date.month; m++) {
    dayOfYear += getDaysInMonth(m, calendar);
  }

  // Add days in current month
  dayOfYear += date.day;

  return dayOfYear;
}

export function calculateAge(
  birthDate: CalendarDate,
  currentDate: CalendarDate,
  calendar: Calendar
): number {
  let age = currentDate.year - birthDate.year;

  // Check if birthday has occurred this year
  if (
    currentDate.month < birthDate.month ||
    (currentDate.month === birthDate.month && currentDate.day < birthDate.day)
  ) {
    age--;
  }

  return age;
}

export function isSameDate(date1: CalendarDate, date2: CalendarDate): boolean {
  return (
    date1.year === date2.year &&
    date1.month === date2.month &&
    date1.day === date2.day
  );
}

export function isDateBefore(
  date1: CalendarDate,
  date2: CalendarDate
): boolean {
  if (date1.year !== date2.year) return date1.year < date2.year;
  if (date1.month !== date2.month) return date1.month < date2.month;
  return date1.day < date2.day;
}

export function isDateAfter(date1: CalendarDate, date2: CalendarDate): boolean {
  if (date1.year !== date2.year) return date1.year > date2.year;
  if (date1.month !== date2.month) return date1.month > date2.month;
  return date1.day > date2.day;
}

export function getDateRange(
  startDate: CalendarDate,
  endDate: CalendarDate,
  calendar: Calendar
): CalendarDate[] {
  const dates: CalendarDate[] = [];
  let current = { ...startDate };

  while (!isDateAfter(current, endDate)) {
    dates.push({ ...current });
    current = addDays(current, 1, calendar);
  }

  return dates;
}

export function formatDateShort(date: CalendarDate): string {
  const year = date.year < 0 ? `-${Math.abs(date.year)}` : date.year.toString();
  const month = date.month.toString().padStart(2, "0");
  const day = date.day.toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

import type { Whiteboard as PrismaWhiteboard } from "@prisma/client";

// Base types from Prisma
export type Whiteboard = PrismaWhiteboard;

// Extended types with relations
export type WhiteboardWithRelations = Whiteboard & {
  campaign: {
    id: string;
    name: string;
    slug: string;
  };
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
};

// Canvas element types
export type WhiteboardElementType =
  | "rectangle"
  | "circle"
  | "arrow"
  | "text"
  | "sticky"
  | "image"
  | "line"
  | "path";

export type Point = {
  x: number;
  y: number;
};

export type BaseElement = {
  id: string;
  type: WhiteboardElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  opacity?: number;
  locked?: boolean;
  zIndex?: number;
};

export type RectangleElement = BaseElement & {
  type: "rectangle";
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  cornerRadius?: number;
};

export type CircleElement = BaseElement & {
  type: "circle";
  radius: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
};

export type ArrowElement = BaseElement & {
  type: "arrow";
  points: [Point, Point]; // Start and end points
  stroke?: string;
  strokeWidth?: number;
  arrowheadSize?: number;
};

export type TextElement = BaseElement & {
  type: "text";
  text: string;
  fontSize?: number;
  fontFamily?: string;
  fill?: string;
  align?: "left" | "center" | "right";
  bold?: boolean;
  italic?: boolean;
};

export type StickyNoteElement = BaseElement & {
  type: "sticky";
  text: string;
  color?: string; // Background color
  fontSize?: number;
};

export type ImageElement = BaseElement & {
  type: "image";
  src: string; // Image URL
  aspectRatio?: number;
};

export type LineElement = BaseElement & {
  type: "line";
  points: Point[];
  stroke?: string;
  strokeWidth?: number;
  lineCap?: "butt" | "round" | "square";
};

export type PathElement = BaseElement & {
  type: "path";
  points: Point[];
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  closed?: boolean;
};

export type WhiteboardElement =
  | RectangleElement
  | CircleElement
  | ArrowElement
  | TextElement
  | StickyNoteElement
  | ImageElement
  | LineElement
  | PathElement;

// Whiteboard content structure
export type WhiteboardContent = {
  version: string; // Schema version for migrations
  background?: string; // Background color or image
  grid?: {
    enabled: boolean;
    size: number;
    color?: string;
  };
  elements: WhiteboardElement[];
};

// Drawing tools
export type DrawingTool =
  | "select"
  | "rectangle"
  | "circle"
  | "arrow"
  | "text"
  | "sticky"
  | "line"
  | "draw"
  | "eraser"
  | "pan";

export type ToolConfig = {
  tool: DrawingTool;
  stroke?: string;
  fill?: string;
  strokeWidth?: number;
  fontSize?: number;
  color?: string;
};

// Form types
export type CreateWhiteboardInput = {
  name: string;
  description?: string;
  template?: string;
  isPrivate?: boolean;
  campaignId: string;
};

export type UpdateWhiteboardInput = Partial<CreateWhiteboardInput> & {
  content?: WhiteboardContent;
  thumbnail?: string;
};

// Filter types
export type WhiteboardFilters = {
  campaignId?: string;
  search?: string;
  isPrivate?: boolean;
  template?: string;
};

// Template types
export type WhiteboardTemplate = {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  content: WhiteboardContent;
};

export const DEFAULT_TEMPLATES: WhiteboardTemplate[] = [
  {
    id: "blank",
    name: "Blank Canvas",
    description: "Start with a blank whiteboard",
    content: {
      version: "1.0",
      elements: [],
    },
  },
  {
    id: "brainstorm",
    name: "Brainstorming Session",
    description: "Grid of sticky notes for ideation",
    content: {
      version: "1.0",
      elements: [],
    },
  },
  {
    id: "flowchart",
    name: "Flowchart",
    description: "Connected shapes for process mapping",
    content: {
      version: "1.0",
      grid: {
        enabled: true,
        size: 20,
      },
      elements: [],
    },
  },
];

// Collaboration types (for future real-time features)
export type WhiteboardCursor = {
  userId: string;
  userName: string;
  x: number;
  y: number;
  color: string;
};

export type WhiteboardAction =
  | { type: "add"; element: WhiteboardElement }
  | { type: "update"; elementId: string; changes: Partial<WhiteboardElement> }
  | { type: "delete"; elementId: string }
  | { type: "reorder"; elementIds: string[] };

// Export types
export type ExportFormat = "png" | "pdf" | "json";

export type ExportOptions = {
  format: ExportFormat;
  quality?: number; // For image exports (0-1)
  scale?: number; // Scale factor
  background?: boolean; // Include background
};

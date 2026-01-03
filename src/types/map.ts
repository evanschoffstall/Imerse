export interface Map {
  id: string;
  name: string;
  slug: string;
  type?: string;
  description?: string;
  image?: string;
  grid?: any;
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
    name?: string;
    email: string;
  };
  layers?: MapLayer[];
  markers?: MapMarker[];
  groups?: MapGroup[];
}

export interface MapLayer {
  id: string;
  name: string;
  image?: string;
  entry?: string;
  position: number;
  width?: number;
  height?: number;
  opacity: number;
  isVisible: boolean;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
  mapId: string;
  map?: Map;
  createdById: string;
  createdBy?: {
    id: string;
    name: string;
  };
}

export interface MapGroup {
  id: string;
  name: string;
  position: number;
  isShown: boolean;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
  mapId: string;
  map?: Map;
  parentId?: string;
  parent?: MapGroup;
  children?: MapGroup[];
  markers?: MapMarker[];
  createdById: string;
  createdBy?: {
    id: string;
    name: string;
  };
}

export interface MapMarker {
  id: string;
  name: string;
  entry?: string;
  longitude: number;
  latitude: number;
  shape: MarkerShape;
  size: number;
  colour: string;
  fontColour: string;
  icon?: string;
  customIcon?: string;
  customShape?: string;
  opacity: number;
  circleRadius?: number;
  polygonStyle?: Record<string, any>;
  isDraggable: boolean;
  isPopupless: boolean;
  pinSize?: number;
  css?: string;
  entityId?: string;
  entityType?: string;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
  mapId: string;
  map?: Map;
  groupId?: string;
  group?: MapGroup;
  createdById: string;
  createdBy?: {
    id: string;
    name: string;
  };
}

export type MarkerShape = "marker" | "circle" | "label" | "polygon";

export interface MapLayerFormData {
  name: string;
  image?: string;
  entry?: string;
  position?: number;
  width?: number;
  height?: number;
  opacity?: number;
  isVisible?: boolean;
  isPrivate?: boolean;
}

export interface MapGroupFormData {
  name: string;
  position?: number;
  isShown?: boolean;
  isPrivate?: boolean;
  parentId?: string;
}

export interface MapMarkerFormData {
  name: string;
  entry?: string;
  longitude: number;
  latitude: number;
  shape?: MarkerShape;
  size?: number;
  colour?: string;
  fontColour?: string;
  icon?: string;
  customIcon?: string;
  customShape?: string;
  opacity?: number;
  circleRadius?: number;
  polygonStyle?: Record<string, any>;
  isDraggable?: boolean;
  isPopupless?: boolean;
  pinSize?: number;
  css?: string;
  entityId?: string;
  entityType?: string;
  isPrivate?: boolean;
  groupId?: string;
}

export interface MapFormData {
  name: string;
  type?: string;
  description?: string;
  image?: string;
  isPrivate?: boolean;
}

export const MAP_TYPES = [
  "World",
  "Continent",
  "Region",
  "Kingdom",
  "City",
  "Town",
  "Village",
  "Dungeon",
  "Building",
  "Room",
  "Battle",
  "Tactical",
  "Political",
  "Travel",
  "Other",
] as const;

export type MapType = (typeof MAP_TYPES)[number];

export const MARKER_SHAPES: MarkerShape[] = [
  "marker",
  "circle",
  "label",
  "polygon",
];

export const DEFAULT_MARKER_COLORS = [
  "#ff0000", // Red
  "#00ff00", // Green
  "#0000ff", // Blue
  "#ffff00", // Yellow
  "#ff00ff", // Magenta
  "#00ffff", // Cyan
  "#ff8800", // Orange
  "#8800ff", // Purple
  "#ffffff", // White
  "#000000", // Black
];

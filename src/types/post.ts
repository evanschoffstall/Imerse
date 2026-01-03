// Types for Posts & Forums System (Phase 21)

export interface Post {
  id: string;
  name: string;
  entry: string | null;
  isPrivate: boolean;
  isPinned: boolean;
  position: number;
  layoutId: string | null;
  settings: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  campaignId: string;
  createdById: string;
  characterId: string | null;
  locationId: string | null;
  itemId: string | null;
  questId: string | null;
  eventId: string | null;
  journalId: string | null;
  familyId: string | null;
  organisationId: string | null;
}

export interface PostWithRelations extends Post {
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
  };
  location?: {
    id: string;
    name: string;
  };
  tags?: PostTagWithTag[];
  permissions?: PostPermission[];
}

export interface PostTag {
  id: string;
  postId: string;
  tagId: string;
}

export interface PostTagWithTag extends PostTag {
  tag: {
    id: string;
    name: string;
    color: string | null;
  };
}

export interface PostPermission {
  id: string;
  permission: number; // 0 = view, 1 = edit, 2 = deny
  postId: string;
  roleId: string | null;
  userId: string | null;
}

export interface PostFormData {
  name: string;
  entry?: string;
  isPrivate?: boolean;
  isPinned?: boolean;
  position?: number;
  layoutId?: string | null;
  settings?: Record<string, any>;
  characterId?: string | null;
  locationId?: string | null;
  itemId?: string | null;
  questId?: string | null;
  eventId?: string | null;
  journalId?: string | null;
  familyId?: string | null;
  organisationId?: string | null;
  tagIds?: string[];
}

// Post Layouts (from phpapp)
export const POST_LAYOUTS = {
  ONE_COLUMN: "1-column",
  TWO_COLUMN: "2-column",
  THREE_COLUMN: "3-column",
  ABILITIES: "abilities",
  ATTRIBUTES: "attributes",
  ASSETS: "assets",
  INVENTORY: "inventory",
  REMINDERS: "reminders",
  CHILDREN: "children",
} as const;

export type PostLayoutType = (typeof POST_LAYOUTS)[keyof typeof POST_LAYOUTS];

export const POST_LAYOUT_NAMES: Record<PostLayoutType, string> = {
  [POST_LAYOUTS.ONE_COLUMN]: "1 Column",
  [POST_LAYOUTS.TWO_COLUMN]: "2 Column",
  [POST_LAYOUTS.THREE_COLUMN]: "3 Column",
  [POST_LAYOUTS.ABILITIES]: "Abilities",
  [POST_LAYOUTS.ATTRIBUTES]: "Attributes",
  [POST_LAYOUTS.ASSETS]: "Assets",
  [POST_LAYOUTS.INVENTORY]: "Inventory",
  [POST_LAYOUTS.REMINDERS]: "Reminders",
  [POST_LAYOUTS.CHILDREN]: "Children",
};

// Permission levels
export const POST_PERMISSIONS = {
  VIEW: 0,
  EDIT: 1,
  DENY: 2,
} as const;

export type PostPermissionLevel =
  (typeof POST_PERMISSIONS)[keyof typeof POST_PERMISSIONS];

export const POST_PERMISSION_NAMES: Record<PostPermissionLevel, string> = {
  [POST_PERMISSIONS.VIEW]: "View",
  [POST_PERMISSIONS.EDIT]: "Edit",
  [POST_PERMISSIONS.DENY]: "Deny",
};

// Helper functions
export function formatPostLayout(layout: string | null): string {
  if (!layout) return POST_LAYOUT_NAMES[POST_LAYOUTS.ONE_COLUMN];
  return POST_LAYOUT_NAMES[layout as PostLayoutType] || layout;
}

export function formatPostPermission(permission: number): string {
  return POST_PERMISSION_NAMES[permission as PostPermissionLevel] || "Unknown";
}

export function getPostEntityType(post: Post): string | null {
  if (post.characterId) return "character";
  if (post.locationId) return "location";
  if (post.itemId) return "item";
  if (post.questId) return "quest";
  if (post.eventId) return "event";
  if (post.journalId) return "journal";
  if (post.familyId) return "family";
  if (post.organisationId) return "organisation";
  return null;
}

export function getPostEntityId(post: Post): string | null {
  return (
    post.characterId ||
    post.locationId ||
    post.itemId ||
    post.questId ||
    post.eventId ||
    post.journalId ||
    post.familyId ||
    post.organisationId ||
    null
  );
}

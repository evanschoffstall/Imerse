// Gallery & Image Management Types (Phase 22)

export interface Image {
  id: string;
  name: string;
  ext: string;
  size: number; // KB
  width: number | null;
  height: number | null;
  focusX: number | null;
  focusY: number | null;
  isFolder: boolean;
  isDefault: boolean;
  visibility: number; // 0 = all, 1 = admin, 2 = admin & self, 3 = self, 4 = members
  campaignId: string;
  folderId: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ImageWithRelations extends Image {
  campaign?: {
    id: string;
    name: string;
  };
  creator?: {
    id: string;
    name: string;
    email: string;
  };
  folder?: Image | null;
  images?: Image[];
  entityAssets?: EntityAsset[];
  imageMentions?: ImageMention[];
}

export interface ImageMention {
  id: string;
  imageId: string;
  characterId: string | null;
  locationId: string | null;
  postId: string | null;
  createdAt: Date;
}

export interface EntityAsset {
  id: string;
  imageId: string;
  characterId: string | null;
  locationId: string | null;
  metadata: Record<string, any> | null;
  createdAt: Date;
}

// Image Visibility Constants
export const IMAGE_VISIBILITY = {
  ALL: 0,
  ADMIN: 1,
  ADMIN_SELF: 2,
  SELF: 3,
  MEMBERS: 4,
} as const;

export const IMAGE_VISIBILITY_LABELS: Record<number, string> = {
  [IMAGE_VISIBILITY.ALL]: "All",
  [IMAGE_VISIBILITY.ADMIN]: "Admin Only",
  [IMAGE_VISIBILITY.ADMIN_SELF]: "Admin & Self",
  [IMAGE_VISIBILITY.SELF]: "Self Only",
  [IMAGE_VISIBILITY.MEMBERS]: "Members",
};

// Helper Functions

export function getImagePath(image: Image, campaignId: string): string {
  return `/uploads/${campaignId}/${image.id}.${image.ext}`;
}

export function getImageUrl(
  image: Image,
  campaignId: string,
  baseUrl: string = ""
): string {
  return `${baseUrl}${getImagePath(image, campaignId)}`;
}

export function getThumbnailUrl(
  image: Image,
  campaignId: string,
  width: number = 200,
  height: number = 200,
  baseUrl: string = ""
): string {
  // If focus point is set, use it
  if (image.focusX !== null && image.focusY !== null) {
    return `${baseUrl}/api/images/${image.id}/thumbnail?w=${width}&h=${height}&fx=${image.focusX}&fy=${image.focusY}`;
  }

  return `${baseUrl}/api/images/${image.id}/thumbnail?w=${width}&h=${height}`;
}

export function formatFileSize(sizeInKB: number): string {
  if (sizeInKB < 1024) {
    return `${sizeInKB} KB`;
  }

  const sizeInMB = sizeInKB / 1024;
  return `${sizeInMB.toFixed(2)} MB`;
}

export function isImageFile(ext: string): boolean {
  const imageExts = ["jpg", "jpeg", "png", "gif", "webp", "svg"];
  return imageExts.includes(ext.toLowerCase());
}

export function hasThumbnail(ext: string): boolean {
  const thumbExts = ["jpg", "jpeg", "png", "gif", "webp"];
  return thumbExts.includes(ext.toLowerCase());
}

export function isSvg(ext: string): boolean {
  return ext.toLowerCase() === "svg";
}

export function isFont(ext: string): boolean {
  const fontExts = ["woff", "woff2", "ttf", "otf"];
  return fontExts.includes(ext.toLowerCase());
}

export function getImageIcon(image: Image): string {
  if (image.isFolder) {
    return "📁";
  }

  if (isImageFile(image.ext)) {
    return "🖼️";
  }

  if (isFont(image.ext)) {
    return "🔤";
  }

  return "📄";
}

// Sort Functions

export function sortImages(
  images: Image[],
  sortBy: "name" | "date" | "size",
  order: "asc" | "desc" = "asc"
): Image[] {
  const sorted = [...images].sort((a, b) => {
    // Folders always come first
    if (a.isFolder && !b.isFolder) return -1;
    if (!a.isFolder && b.isFolder) return 1;

    // Then sort by selected field
    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    } else if (sortBy === "date") {
      return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
    } else if (sortBy === "size") {
      return a.size - b.size;
    }

    return 0;
  });

  return order === "desc" ? sorted.reverse() : sorted;
}

// Filter Functions

export function filterImagesByName(
  images: Image[],
  searchTerm: string
): Image[] {
  if (!searchTerm.trim()) return images;

  const term = searchTerm.toLowerCase();
  return images.filter((img) => img.name.toLowerCase().includes(term));
}

export function getUsageCount(image: ImageWithRelations): number {
  let count = 0;

  if (image.entityAssets) {
    count += image.entityAssets.length;
  }

  if (image.imageMentions) {
    count += image.imageMentions.length;
  }

  return count;
}

export function isUsed(image: ImageWithRelations): boolean {
  return getUsageCount(image) > 0;
}

// Breadcrumb Helper

export interface Breadcrumb {
  id: string | null;
  name: string;
  path: string;
}

export function buildBreadcrumbs(
  currentFolder: ImageWithRelations | null,
  allImages: Image[]
): Breadcrumb[] {
  const breadcrumbs: Breadcrumb[] = [
    { id: null, name: "Gallery", path: "/gallery" },
  ];

  if (!currentFolder) return breadcrumbs;

  // Build path by traversing up the folder hierarchy
  const path: Image[] = [];
  let current: Image | null = currentFolder;

  while (current) {
    path.unshift(current);
    current = allImages.find((img) => img.id === current!.folderId) || null;
  }

  path.forEach((folder) => {
    breadcrumbs.push({
      id: folder.id,
      name: folder.name,
      path: `/gallery?folderId=${folder.id}`,
    });
  });

  return breadcrumbs;
}

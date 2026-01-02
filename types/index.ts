export interface Campaign {
  id: string;
  name: string;
  description?: string;
  slug: string;
  visibility: "public" | "private";
  image?: string;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
}

export interface Character {
  id: string;
  name: string;
  title?: string;
  type?: string;
  age?: string;
  sex?: string;
  pronouns?: string;
  location?: string;
  family?: string;
  description?: string;
  image?: string;
  campaignId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Location {
  id: string;
  name: string;
  type?: string;
  parentLocation?: string;
  description?: string;
  image?: string;
  map?: string;
  campaignId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Re-export specific types
export * from "./calendar";
export * from "./campaign";
export * from "./character";
export * from "./event";
export * from "./family";
export * from "./item";
export * from "./journal";
export * from "./location";
export * from "./map";
export * from "./note";
export * from "./notification";
export * from "./organisation";
export * from "./preset";
export * from "./quest";
export * from "./race";
export * from "./relation";
export * from "./reminder";
export { type SearchFilters, type SearchResult } from "./search";
export * from "./tag";
export * from "./timeline";
export * from "./whiteboard";

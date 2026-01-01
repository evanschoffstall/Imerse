import { Campaign } from "./campaign";
import { Character } from "./character";
import { User } from "./index";

export interface Conversation {
  id: string;
  name: string;
  target: "users" | "characters"; // Who can participate
  isPrivate: boolean;
  isClosed: boolean;
  campaignId: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationWithRelations extends Conversation {
  campaign: Campaign;
  createdBy: User;
  messages?: ConversationMessage[];
  participants?: ConversationParticipant[];
  _count?: {
    messages: number;
    participants: number;
  };
}

export interface ConversationMessage {
  id: string;
  message: string;
  conversationId: string;
  userId: string | null; // If message is from user
  characterId: string | null; // If message is from character
  createdById: string; // Who actually created it (always a user)
  createdAt: Date;
}

export interface ConversationMessageWithRelations extends ConversationMessage {
  conversation: Conversation;
  user?: User | null;
  character?: Character | null;
  createdBy: User;
}

export interface ConversationParticipant {
  id: string;
  conversationId: string;
  userId: string | null; // If participant is user
  characterId: string | null; // If participant is character
  createdAt: Date;
}

export interface ConversationParticipantWithRelations
  extends ConversationParticipant {
  conversation: Conversation;
  user?: User | null;
  character?: Character | null;
}

export interface ConversationFormData {
  name: string;
  target?: "users" | "characters";
  isPrivate?: boolean;
  participantIds?: string[]; // IDs of users or characters
}

export interface MessageFormData {
  message: string;
  authorType: "user" | "character";
  authorId?: string; // character ID if authorType is character
}

// Conversation target types
export const CONVERSATION_TARGETS = ["users", "characters"] as const;

export type ConversationTarget = (typeof CONVERSATION_TARGETS)[number];

// Helper: Get author name from message
export function getMessageAuthor(
  message: ConversationMessageWithRelations
): string {
  if (message.character) {
    return message.character.name;
  }
  if (message.user) {
    return message.user.name;
  }
  return "Unknown";
}

// Helper: Get participant name
export function getParticipantName(
  participant: ConversationParticipantWithRelations
): string {
  if (participant.character) {
    return participant.character.name;
  }
  if (participant.user) {
    return participant.user.name;
  }
  return "Unknown";
}

// Helper: Check if messages are from same author (for grouping)
export function isSameAuthor(
  msg1: ConversationMessageWithRelations,
  msg2: ConversationMessageWithRelations
): boolean {
  if (msg1.userId && msg2.userId) {
    return msg1.userId === msg2.userId;
  }
  if (msg1.characterId && msg2.characterId) {
    return msg1.characterId === msg2.characterId;
  }
  return false;
}

// Helper: Check if messages are close in time (for grouping)
export function isCloseInTime(
  msg1: ConversationMessage,
  msg2: ConversationMessage,
  minutes: number = 5
): boolean {
  const diff = Math.abs(
    new Date(msg1.createdAt).getTime() - new Date(msg2.createdAt).getTime()
  );
  return diff < minutes * 60 * 1000;
}

// Helper: Format timestamp for messages
export function formatMessageTime(date: Date): string {
  const now = new Date();
  const messageDate = new Date(date);
  const diffMs = now.getTime() - messageDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) {
    return "Just now";
  }
  if (diffMins < 60) {
    return `${diffMins}m ago`;
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  return messageDate.toLocaleDateString();
}

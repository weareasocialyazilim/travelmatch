/**
 * Message Type Definitions
 * Discriminated Union Pattern for type-safe message handling
 */

export type MessageType = 'text' | 'image' | 'location' | 'system';

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface MessageLocation {
  latitude: number;
  longitude: number;
  address?: string;
}

/**
 * Base message interface - shared properties
 */
export interface BaseMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  type: MessageType;
  status: MessageStatus;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
}

/**
 * Discriminated union members
 */
export interface TextMessage extends BaseMessage {
  type: 'text';
  content: string;
}

export interface ImageMessage extends BaseMessage {
  type: 'image';
  image_url: string;
  thumbnail_url?: string;
  caption?: string;
}

export interface LocationMessage extends BaseMessage {
  type: 'location';
  location: MessageLocation;
}

export interface SystemMessage extends BaseMessage {
  type: 'system';
  system_type: 'user_joined' | 'user_left' | 'trip_created' | 'trip_cancelled';
  metadata?: Record<string, unknown>;
}

/**
 * Discriminated Union - TypeScript will narrow the type based on 'type' field
 */
export type Message = TextMessage | ImageMessage | LocationMessage | SystemMessage;

/**
 * Type Guards for runtime type checking
 */
export function isTextMessage(msg: Message): msg is TextMessage {
  return msg.type === 'text';
}

export function isImageMessage(msg: Message): msg is ImageMessage {
  return msg.type === 'image';
}

export function isLocationMessage(msg: Message): msg is LocationMessage {
  return msg.type === 'location';
}

export function isSystemMessage(msg: Message): msg is SystemMessage {
  return msg.type === 'system';
}

/**
 * Message creation input types
 */
export interface CreateTextMessageData {
  conversation_id: string;
  sender_id: string;
  content: string;
}

export interface CreateImageMessageData {
  conversation_id: string;
  sender_id: string;
  image_url: string;
  thumbnail_url?: string;
  caption?: string;
}

export interface CreateLocationMessageData {
  conversation_id: string;
  sender_id: string;
  location: MessageLocation;
}

import { CoreMessage, TextPart, ImagePart, FilePart } from "ai";

/**
 * Our internal attachment format (from transformAttachments)
 */
export type APIAttachment = {
  type: "image" | "pdf" | "text" | "file";
  url: string;
  mimeType: string;
};

/**
 * Our internal message format (from messagesToSubmit)
 */
export type APIMessage = {
  id: string;
  content: string;
  role: "user" | "assistant" | "system";
  attachments?: APIAttachment[];
};

/**
 * Convex message with attachments (input format)
 */
type ConvexMessageWithAttachments = {
  messageId: string;
  content: string;
  role: "user" | "assistant" | "system";
  attachments: Array<{
    attachmentType: string;
    attachmentUrl: string;
    mimeType: string;
    status?: string;
  }>;
};

/**
 * Convert our APIAttachment to AI SDK's message parts
 */
export function convertAttachmentToParts(
  attachment: APIAttachment
): ImagePart | FilePart {
  if (attachment.type === "image") {
    return {
      type: "image",
      image: attachment.url, // AI SDK accepts URLs directly
      mimeType: attachment.mimeType,
    } satisfies ImagePart;
  } else {
    // For PDF, text, and other file types, use FilePart
    return {
      type: "file",
      data: attachment.url, // AI SDK accepts URLs for file data
      mimeType: attachment.mimeType,
    } satisfies FilePart;
  }
}

/**
 * Convert our APIMessage to AI SDK's CoreMessage format
 * Always uses parts format for consistency
 */
export function convertMessageToCoreMessage(message: APIMessage): CoreMessage {
  const textPart: TextPart = {
    type: "text",
    text: message.content,
  };

  // Always use parts format for consistency
  const parts: (TextPart | ImagePart | FilePart)[] = [textPart];

  // Add attachment parts if they exist
  if (message.attachments && message.attachments.length > 0) {
    const attachmentParts = message.attachments.map(convertAttachmentToParts);
    parts.push(...attachmentParts);
  }

  return {
    role: message.role,
    content: parts,
  } as CoreMessage;
}

/**
 * Convert array of our APIMessages to AI SDK's CoreMessage array
 */
export function convertMessagesToCoreMessages(
  messages: APIMessage[]
): CoreMessage[] {
  return messages.map(convertMessageToCoreMessage);
}

/**
 * Conversion from Convex messages directly to validated CoreMessages
 */
export function convertConvexMessagesToCoreMessages(
  messages: ConvexMessageWithAttachments[],
  newUserMessage?: { content: string; attachments?: APIAttachment[] }
): CoreMessage[] {
  const result: CoreMessage[] = [];

  // Process existing messages
  for (const message of messages) {
    // Skip empty content messages
    if (!message.content.trim()) continue;

    const textPart: TextPart = {
      type: "text",
      text: message.content,
    };

    const parts: (TextPart | ImagePart | FilePart)[] = [textPart];

    // Process attachments inline (no intermediate array)
    if (message.attachments) {
      for (const attachment of message.attachments) {
        // Skip deleted attachments
        if (attachment.status === "deleted") continue;

        const attachmentType = attachment.attachmentType as
          | "image"
          | "pdf"
          | "text"
          | "file";

        if (attachmentType === "image") {
          parts.push({
            type: "image",
            image: attachment.attachmentUrl,
            mimeType: attachment.mimeType,
          } satisfies ImagePart);
        } else {
          parts.push({
            type: "file",
            data: attachment.attachmentUrl,
            mimeType: attachment.mimeType,
          } satisfies FilePart);
        }
      }
    }

    result.push({
      role: message.role,
      content: parts,
    } as CoreMessage);
  }

  // Add new user message if provided
  if (newUserMessage && newUserMessage.content.trim()) {
    const textPart: TextPart = {
      type: "text",
      text: newUserMessage.content,
    };

    const parts: (TextPart | ImagePart | FilePart)[] = [textPart];

    // Process new message attachments
    if (newUserMessage.attachments) {
      for (const attachment of newUserMessage.attachments) {
        if (attachment.type === "image") {
          parts.push({
            type: "image",
            image: attachment.url,
            mimeType: attachment.mimeType,
          } satisfies ImagePart);
        } else {
          parts.push({
            type: "file",
            data: attachment.url,
            mimeType: attachment.mimeType,
          } satisfies FilePart);
        }
      }
    }

    result.push({
      role: "user",
      content: parts,
    } as CoreMessage);
  }

  return result;
}

/**
 * Helper to validate that a message has valid content for AI SDK
 * Now expects parts format since we always use it
 */
export function validateCoreMessage(message: CoreMessage): boolean {
  if (!message.role || !message.content) {
    return false;
  }

  // We now always use array format, so content should be an array
  if (Array.isArray(message.content)) {
    return (
      message.content.length > 0 &&
      message.content.some((part) => {
        if (part.type === "text") {
          return part.text.trim().length > 0;
        }
        if (part.type === "image") {
          return !!part.image;
        }
        if (part.type === "file") {
          return !!part.data;
        }
        return false;
      })
    );
  }

  // Fallback for any legacy string content (shouldn't happen with our converter)
  if (typeof message.content === "string") {
    return message.content.trim().length > 0;
  }

  return false;
}

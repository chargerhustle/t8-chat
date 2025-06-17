// import { OpenAIProviderOptions } from '@ai-sdk/openai';
// import { GoogleGenerativeAIProviderOptions } from '@ai-sdk/google'; // Uncomment if using Google

export type ModelFeature = "vision" | "documents" | "reasoning" | "search";
export type AttachmentType = "image" | "pdf" | "docx";

export interface ModelConfig {
  id: string; // Unique identifier for dropdown keys and selection
  provider: string; // e.g. 'openai', 'google'
  model: string; // e.g. 'gpt-4.1-2025-04-14' - actual model ID for API calls
  displayName: string;
  features: ModelFeature[];
  allowedAttachmentTypes: AttachmentType[];
  allowedMIMETypes: string[];
  defaultProviderOptions?: Record<string, unknown>; // Use specific types if needed
  description: string;
}

// Default model used across the application for fallbacks
export const DEFAULT_MODEL = "gpt-4.1-2025-04-14";

export const MODEL_CONFIGS: ModelConfig[] = [
  // OpenAI models
  {
    id: "gpt-4.1-2025-04-14",
    provider: "openai",
    model: "gpt-4.1-2025-04-14",
    displayName: "GPT-4.1",
    features: ["vision", "documents"],
    allowedAttachmentTypes: ["image", "pdf", "docx"],
    allowedMIMETypes: [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
      "application/pdf",
    ],
    defaultProviderOptions: {},
    description: "Newest non-reasoning model",
  },
  {
    id: "gpt-4.1-mini-2025-04-14",
    provider: "openai",
    model: "gpt-4.1-mini-2025-04-14",
    displayName: "GPT-4.1 Mini",
    features: ["vision", "documents"],
    allowedAttachmentTypes: ["image", "pdf", "docx"],
    allowedMIMETypes: [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
      "application/pdf",
    ],
    defaultProviderOptions: {},
    description: "Smaller version of GPT-4.1",
  },
  {
    id: "gpt-4o-2024-08-06",
    provider: "openai",
    model: "gpt-4o-2024-08-06",
    displayName: "GPT-4o",
    features: ["vision", "documents"],
    allowedAttachmentTypes: ["image", "pdf", "docx"],
    allowedMIMETypes: [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
      "application/pdf",
    ],
    defaultProviderOptions: {},
    description: "Standart ChatGPT model",
  },
  {
    id: "o4-mini-2025-04-16",
    provider: "openai",
    model: "o4-mini-2025-04-16",
    displayName: "o4-mini",
    features: ["vision", "documents", "reasoning"],
    allowedAttachmentTypes: ["image", "pdf", "docx"],
    allowedMIMETypes: [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
      "application/pdf",
    ],
    defaultProviderOptions: { openai: { reasoningEffort: "low" } },
    description: "OpenAI's best small reasoning model",
  },
  // Google Gemini models
  {
    id: "gemini-2.5-pro-exp-03-25",
    provider: "google",
    model: "gemini-2.5-pro-exp-03-25",
    displayName: "Gemini 2.5 Pro",
    features: ["vision", "documents", "reasoning", "search"],
    allowedAttachmentTypes: ["image", "pdf"],
    allowedMIMETypes: [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
      "image/heic",
      "application/pdf",
    ],
    defaultProviderOptions: { useSearchGrounding: false },
    description: "Google's best reasoning model",
  },
  {
    id: "gemini-2.0-flash",
    provider: "google",
    model: "gemini-2.0-flash",
    displayName: "Gemini 2.0 Flash",
    features: ["vision", "documents", "search"],
    allowedAttachmentTypes: ["image", "pdf"],
    allowedMIMETypes: [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
      "image/heic",
      "application/pdf",
    ],
    defaultProviderOptions: { useSearchGrounding: false },
    description: "Fast and stable model",
  },
  {
    id: "gemini-2.0-flash-lite",
    provider: "google",
    model: "gemini-2.0-flash-lite",
    displayName: "Gemini 2.0 Flash Lite",
    features: ["vision", "documents"],
    allowedAttachmentTypes: ["image", "pdf"],
    allowedMIMETypes: [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
      "image/heic",
      "application/pdf",
    ],
    defaultProviderOptions: {},
    description: "Lightweight, cost-effective, and supports PDF upload.",
  },
  {
    id: "gemini-2.5-flash-normal",
    provider: "google",
    model: "gemini-2.5-flash-preview-04-17",
    displayName: "Gemini 2.5 Flash",
    features: ["vision", "documents", "search"],
    allowedAttachmentTypes: ["image", "pdf"],
    allowedMIMETypes: [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
      "image/heic",
      "application/pdf",
    ],
    defaultProviderOptions: {
      useSearchGrounding: false,
    },
    description: "Gemini 2.5 Flash without thinking mode.",
  },
  {
    id: "gemini-2.5-flash-thinking",
    provider: "google",
    model: "gemini-2.5-flash-preview-04-17",
    displayName: "Gemini 2.5 Flash (Thinking)",
    features: ["vision", "documents", "reasoning", "search"],
    allowedAttachmentTypes: ["image", "pdf"],
    allowedMIMETypes: [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
      "image/heic",
      "application/pdf",
    ],
    defaultProviderOptions: {
      useSearchGrounding: false,
      thinkingConfig: {
        includeThoughts: true,
        thinkingBudget: 1024,
      },
    },
    description: 'Gemini 2.5 Flash with "thinking" enabled.',
  },
];

/**
 * Get the display name for a model by its ID
 * @param modelId - The model ID to look up
 * @returns The display name if found, otherwise the modelId as fallback
 */
export function getModelDisplayName(modelId: string): string {
  const modelConfig = MODEL_CONFIGS.find((config) => config.id === modelId);
  return modelConfig?.displayName || modelId;
}

// import { OpenAIProviderOptions } from '@ai-sdk/openai';
// import { GoogleGenerativeAIProviderOptions } from '@ai-sdk/google'; // Uncomment if using Google

export type ModelFeature = "vision" | "documents" | "reasoning" | "search";
export type AttachmentType = "image" | "pdf" | "docx";
export type StreamingType = "word" | "line";

export interface ModelConfig {
  id: string; // Unique identifier for dropdown keys and selection
  provider: string; // e.g. 'openai', 'google'
  model: string; // e.g. 'gpt-4.1-2025-04-14' - actual model ID for API calls
  displayName: string;
  features: ModelFeature[];
  allowedAttachmentTypes: AttachmentType[];
  allowedMIMETypes: string[];
  defaultProviderOptions?: Record<string, unknown>; // Use specific types if needed
  description: string; // Short description for dropdowns and quick reference
  longDescription: string; // Detailed description for settings page
  experimental: boolean; // Whether the model is experimental
  new: boolean; // Whether the model is new
  premium: boolean; // Whether the model is premium
  icon: string; // Icon identifier (e.g. 'openai', 'google', 'claude')
  streaming: StreamingType; // Streaming type: "word" or "line"
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
    longDescription:
      "GPT-4.1 is a flagship large language model optimized for advanced instruction following, real-world software engineering, and long-context reasoning. It outperforms GPT-4o and GPT-4.5 across coding (54.6% SWE-bench Verified), instruction compliance (87.4% IFEval), and multimodal understanding benchmarks.",
    experimental: false,
    new: false,
    premium: false,
    icon: "openai",
    streaming: "word",
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
    longDescription:
      "GPT-4.1 Mini is a mid-sized model delivering performance competitive with GPT-4o at substantially lower latency. It has a very large context window and scores 45.1% on hard instruction evals, 35.8% on MultiChallenge, and 84.1% on IFEval. Mini also shows strong coding ability (e.g., 31.6% on Aider's polyglot diff benchmark) and vision understanding.",
    experimental: false,
    new: false,
    premium: false,
    icon: "openai",
    streaming: "word",
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
    longDescription:
      "OpenAI's flagship non-reasoning model. Works with text and images. Relatively smart. Good at most things.",
    experimental: false,
    new: false,
    premium: false,
    icon: "openai",
    streaming: "word",
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
    longDescription:
      "A small, fast, even smarter reasoning model. o3-mini was great, this is even better. Good at science, math, and coding, even if it's not as good at CSS.",
    experimental: false,
    new: false,
    premium: true,
    icon: "openai",
    streaming: "word",
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
    longDescription:
      "Google's most advanced model, excelling at complex reasoning and problem-solving. Particularly strong at tackling difficult code challenges, mathematical proofs, and STEM problems. With its massive context window, it can deeply analyze large codebases, datasets and technical documents to provide comprehensive solutions.",
    experimental: true,
    new: false,
    premium: true,
    icon: "google",
    streaming: "line",
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
    longDescription:
      "Google's flagship model, known for speed and accuracy (and also web search!). Not quite as smart as Claude 3.5 Sonnet, but WAY faster and cheaper. Also has an insanely large context window (it can handle a lot of data).",
    experimental: false,
    new: false,
    premium: false,
    icon: "google",
    streaming: "line",
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
    longDescription:
      "Similar to 2.0 Flash, but even faster. Not as smart, but still good at most things.",
    experimental: false,
    new: true,
    premium: false,
    icon: "google",
    streaming: "line",
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
    longDescription:
      "Google's state of the art fast model, known for speed and accuracy (and also web search!). Not quite as smart as Claude Sonnet, but WAY faster and cheaper. Also has an insanely large context window (it can handle a lot of data).",
    experimental: true,
    new: false,
    premium: false,
    icon: "google",
    streaming: "line",
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
    longDescription:
      'Google\'s state of the art fast model, known for speed and accuracy, now with support for "thinking". These "thinking" capabilities enable it to provide responses with greater accuracy and nuanced context handling.',
    experimental: true,
    new: true,
    premium: true,
    icon: "google",
    streaming: "line",
  },
];

/**
 * Get the display name for a model by its model string (API identifier)
 * @param modelString - The model string to look up (e.g., "gemini-2.5-flash-preview-04-17")
 * @returns The display name if found, otherwise the modelString as fallback
 */
export function getModelDisplayName(modelString: string): string {
  const modelConfig = MODEL_CONFIGS.find(
    (config) => config.model === modelString
  );
  return modelConfig?.displayName || modelString;
}

/**
 * Get the streaming type for a model by its model string (API identifier)
 * @param modelString - The model string to look up (e.g., "gemini-2.5-flash-preview-04-17")
 * @returns The streaming type if found, otherwise "word" as fallback
 */
export function getModelStreamingType(modelString: string): StreamingType {
  const modelConfig = MODEL_CONFIGS.find(
    (config) => config.model === modelString
  );
  return modelConfig?.streaming || "word";
}

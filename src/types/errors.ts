// Universal Error Types for AI Web Chat Application
// This file consolidates all error types used throughout the application

// ============================================================================
// BASE ERROR TYPES
// ============================================================================

export interface BaseError {
  type: string;
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

// ============================================================================
// SPECIFIC ERROR TYPES
// ============================================================================

export interface APIKeyError extends BaseError {
  type: "missing_api_keys" | "missing_key" | "invalid_key";
  provider?: string;
  setupUrl?: string;
}

export interface AuthenticationError extends BaseError {
  type: "authentication_error" | "unauthorized";
}

export interface ValidationError extends BaseError {
  type: "validation_error" | "invalid_request";
  field?: string;
}

export interface ProviderError extends BaseError {
  type: "unsupported_provider" | "provider_error" | "model_error";
  provider?: string;
}

export interface NetworkError extends BaseError {
  type: "network_error" | "timeout" | "connection_failed";
}

export interface StreamingError extends BaseError {
  type: "streaming_error" | "stream_interrupted" | "stream_failed";
  streamId?: string;
}

export interface InternalError extends BaseError {
  type: "internal_error" | "server_error" | "unknown_error";
}

export interface RateLimitError extends BaseError {
  type: "rate_limit" | "quota_exceeded";
  retryAfter?: number;
}

// ============================================================================
// UNION TYPES
// ============================================================================

export type ChatError =
  | APIKeyError
  | AuthenticationError
  | ValidationError
  | ProviderError
  | NetworkError
  | StreamingError
  | InternalError
  | RateLimitError;

// ============================================================================
// ERROR METADATA FOR UI DISPLAY
// ============================================================================

export interface ErrorDisplayConfig {
  title: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
  severity: "error" | "warning" | "info";
}

// ============================================================================
// ERROR MAPPING UTILITIES
// ============================================================================

export const ERROR_DISPLAY_MAP: Record<string, ErrorDisplayConfig> = {
  // API Key Errors
  missing_api_keys: {
    title: "API keys are required.",
    description: "Please configure your API keys to continue.",
    actionText: "Configure API keys",
    actionHref: "/settings/api-keys",
    severity: "error",
  },
  missing_key: {
    title: "Missing API key.",
    actionText: "Configure API keys",
    actionHref: "/settings/api-keys",
    severity: "error",
  },
  invalid_key: {
    title: "Invalid API key.",
    description: "Please check your API key configuration.",
    actionText: "Configure API keys",
    actionHref: "/settings/api-keys",
    severity: "error",
  },

  // Authentication Errors
  authentication_error: {
    title: "Authentication required.",
    description: "Please sign in to continue.",
    actionText: "Sign in",
    actionHref: "/auth/signin",
    severity: "error",
  },
  unauthorized: {
    title: "Access denied.",
    description: "You don't have permission to perform this action.",
    severity: "error",
  },

  // Validation Errors
  validation_error: {
    title: "Invalid request.",
    description: "Please check your input and try again.",
    severity: "error",
  },

  // Provider Errors
  unsupported_provider: {
    title: "Unsupported AI provider.",
    description: "This AI model is not currently supported.",
    severity: "error",
  },
  provider_error: {
    title: "AI provider error.",
    description: "There was an issue with the AI service.",
    severity: "error",
  },

  // Network Errors
  network_error: {
    title: "Network error.",
    description: "Please check your connection and try again.",
    severity: "error",
  },
  timeout: {
    title: "Request timed out.",
    description: "The request took too long to complete.",
    severity: "error",
  },

  // Streaming Errors
  streaming_error: {
    title: "Streaming error.",
    description: "There was an issue with the response stream.",
    severity: "error",
  },
  stream_interrupted: {
    title: "Stream interrupted.",
    description: "The response was interrupted unexpectedly.",
    severity: "warning",
  },

  // Internal Errors
  internal_error: {
    title: "Internal server error.",
    description: "Something went wrong on our end.",
    severity: "error",
  },
  server_error: {
    title: "Server error.",
    description: "The server encountered an error.",
    severity: "error",
  },
  unknown_error: {
    title: "Unknown error.",
    description: "An unexpected error occurred.",
    severity: "error",
  },

  // Rate Limit Errors
  rate_limit: {
    title: "Rate limit exceeded.",
    description: "Too many requests. Please wait before trying again.",
    severity: "warning",
  },
  quota_exceeded: {
    title: "Quota exceeded.",
    description: "You've reached your usage limit.",
    actionText: "Upgrade plan",
    actionHref: "/settings/billing",
    severity: "error",
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get error display configuration for a given error type
 */
export function getErrorDisplayConfig(
  errorType: string,
  customMessage?: string
): ErrorDisplayConfig {
  const config = ERROR_DISPLAY_MAP[errorType];

  if (!config) {
    return {
      title: customMessage || "An error occurred.",
      severity: "error",
    };
  }

  // Override title with custom message if provided
  if (customMessage) {
    return {
      ...config,
      title: customMessage,
    };
  }

  return config;
}

/**
 * Convert legacy error format to ChatError
 */
export function normalizeChatError(error: any): ChatError {
  if (typeof error === "string") {
    return {
      type: "unknown_error",
      message: error,
    };
  }

  if (error && typeof error === "object") {
    return {
      type: error.type || "unknown_error",
      message: error.message || "An error occurred",
      code: error.code,
      details: error.details,
      ...error, // Preserve any additional fields
    };
  }

  return {
    type: "unknown_error",
    message: "An unexpected error occurred",
  };
}

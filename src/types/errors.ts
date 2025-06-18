// Unified Error Type System for AI Chat Application
// This file defines all error types and their display strategies

// ============================================================================
// CORE ERROR TYPES
// ============================================================================

/**
 * Error severity levels that determine how errors are displayed
 */
export type ErrorSeverity = "low" | "medium" | "high" | "critical";

/**
 * Error categories that determine WHERE errors are displayed
 */
export type ErrorDisplayType = "toast" | "inline" | "boundary" | "server";

/**
 * Specific error types for better categorization and handling
 */
export type ErrorType =
  // Authentication & Authorization
  | "authentication_required"
  | "unauthorized"

  // API Key & Provider Errors (BYOK)
  | "api_key_error"
  | "provider_error"

  // Rate Limiting & Quotas
  | "rate_limit_exceeded"
  | "quota_exceeded"
  | "usage_limit_warning" // Changed from usage_limit_reached

  // Network & Connectivity
  | "network_error"
  | "connection_timeout"
  | "server_unavailable"

  // Validation & Input
  | "validation_error"
  | "file_too_large"
  | "unsupported_file_type"

  // Data & Resources
  | "not_found"
  | "thread_not_found"

  // Chat & AI Specific
  | "chat_generation_failed"
  | "stream_interrupted"

  // System & Server
  | "server_error"
  | "database_error"
  | "internal_error"
  | "maintenance_mode"

  // Client & Browser
  | "browser_not_supported"
  | "feature_not_available"
  | "clipboard_error"

  // Generic
  | "unknown_error";

/**
 * Centralized action IDs enum for all possible error actions
 */
export enum ErrorActionId {
  SIGNIN = "signin",
  HOME = "home",
  SETTINGS = "settings",
  RETRY = "retry",
  UPGRADE = "upgrade",
  RESUME = "resume",
}

/**
 * Centralized action definitions with consistent labels and variants
 */
export const ERROR_ACTIONS: Record<
  ErrorActionId,
  Omit<ErrorAction, "action">
> = {
  [ErrorActionId.SIGNIN]: {
    id: ErrorActionId.SIGNIN,
    label: "Sign In",
  },
  [ErrorActionId.HOME]: {
    id: ErrorActionId.HOME,
    label: "Go Home",
  },
  [ErrorActionId.SETTINGS]: {
    id: ErrorActionId.SETTINGS,
    label: "Configure API Keys",
  },
  [ErrorActionId.RETRY]: {
    id: ErrorActionId.RETRY,
    label: "Try Again",
  },
  [ErrorActionId.UPGRADE]: {
    id: ErrorActionId.UPGRADE,
    label: "Upgrade Plan",
  },
  [ErrorActionId.RESUME]: {
    id: ErrorActionId.RESUME,
    label: "Resume",
  },
};

/**
 * Context information about where/when the error occurred
 */
export interface ErrorContext {
  // Location context
  component?: string;
  function?: string;
  route?: string;

  // User context
  userId?: string;
  threadId?: string;
  messageId?: string;

  // Technical context
  timestamp: number;
  userAgent?: string;
  url?: string;

  // Additional metadata
  metadata?: Record<string, unknown>;
}

/**
 * Actions that users can take to resolve or handle the error
 */
export interface ErrorAction {
  id: ErrorActionId;
  label: string;
  variant?: "primary" | "secondary" | "destructive" | "outline";
  action: () => void | Promise<void>;
  href?: string; // For navigation actions
}

// ============================================================================
// UNIFIED ERROR INTERFACE
// ============================================================================

/**
 * Main unified error interface that all errors should conform to
 */
export interface AppError {
  // Unique identifier for this error instance
  id: string;

  // Error classification
  type: ErrorType;
  severity: ErrorSeverity;
  displayType: ErrorDisplayType;

  // User-facing content
  title: string;
  message: string;
  details?: string; // Technical details (shown in dev mode)

  // Context and metadata
  context: ErrorContext;

  // User actions
  actions?: ErrorAction[];

  // Display options
  dismissible?: boolean;
  autoHide?: boolean;
  duration?: number; // For toast notifications

  // Recovery options
  retryable?: boolean;
  retryAction?: () => Promise<void>;

  // Additional data
  originalError?: unknown; // Original error object for debugging
}

// ============================================================================
// DISPLAY TYPE SPECIFIC INTERFACES
// ============================================================================

/**
 * Toast notification errors (Sonner)
 * For minor errors that don't interrupt the user flow
 */
export interface ToastError extends AppError {
  displayType: "toast";
  severity: "low" | "medium";
  autoHide: boolean;
  duration?: number;
}

/**
 * Inline message errors
 * Displayed in place of assistant messages for chat-related errors
 */
export interface InlineError extends AppError {
  displayType: "inline";
  severity: "medium" | "high";
  messageId: string; // Which message this error replaces
  threadId: string;
  retryable: boolean;
}

/**
 * Error boundary errors
 * Full-page errors for critical application failures
 */
export interface BoundaryError extends AppError {
  displayType: "boundary";
  severity: "high" | "critical";
  fallbackComponent?: React.ComponentType;
  showErrorDetails?: boolean;
}

/**
 * Server errors
 * Backend/Convex errors that shouldn't reach the UI in normal flow
 */
export interface ServerError extends AppError {
  displayType: "server";
  severity: "high" | "critical";
  statusCode?: number;
  endpoint?: string;
  requestId?: string;
}

// ============================================================================
// ERROR MAPPING & CONFIGURATION
// ============================================================================

/**
 * Configuration for how each error type should be displayed
 */
export interface ErrorDisplayConfig {
  displayType: ErrorDisplayType;
  severity: ErrorSeverity;
  title: string;
  message: string;
  actions?: ErrorActionId[];
  retryable?: boolean;
  autoHide?: boolean;
  duration?: number;
}

/**
 * Mapping of error types to their display configurations
 */
export const ERROR_DISPLAY_MAP: Record<ErrorType, ErrorDisplayConfig> = {
  // Authentication & Authorization
  authentication_required: {
    displayType: "boundary",
    severity: "high",
    title: "Authentication Required",
    message: "Please sign in to continue using the application.",
    actions: [ErrorActionId.SIGNIN],
  },

  unauthorized: {
    displayType: "boundary",
    severity: "high",
    title: "Access Denied",
    message: "You don't have permission to perform this action.",
    actions: [ErrorActionId.HOME],
  },

  // API Key & Provider Errors (BYOK)
  api_key_error: {
    displayType: "inline",
    severity: "medium",
    title: "API Key Issue",
    message:
      "There's an issue with your API key. Please check your configuration in Settings.",
    actions: [ErrorActionId.SETTINGS, ErrorActionId.RETRY],
    retryable: true,
  },

  provider_error: {
    displayType: "inline",
    severity: "medium",
    title: "Provider Error",
    message: "There was an issue with the AI service. Please try again.",
    actions: [ErrorActionId.RETRY],
    retryable: true,
  },

  // Rate Limiting & Quotas
  rate_limit_exceeded: {
    displayType: "inline",
    severity: "medium",
    title: "Rate Limit Exceeded",
    message:
      "You're sending messages too quickly. Please wait a moment and try again.",
    actions: [ErrorActionId.RETRY],
    retryable: true,
  },

  quota_exceeded: {
    displayType: "inline",
    severity: "medium",
    title: "Usage Quota Exceeded",
    message:
      "You've reached your usage limit. Please upgrade your plan or try again later.",
    actions: [ErrorActionId.UPGRADE, ErrorActionId.RETRY],
    retryable: true,
  },

  usage_limit_warning: {
    displayType: "toast",
    severity: "low",
    title: "Usage Limit Warning",
    message:
      "You're approaching your usage limit. Consider upgrading your plan.",
    duration: 5000,
  },

  // Network & Connectivity
  network_error: {
    displayType: "inline",
    severity: "medium",
    title: "Network Error",
    message: "Please check your internet connection and try again.",
    actions: [ErrorActionId.RETRY],
    retryable: true,
  },

  connection_timeout: {
    displayType: "inline",
    severity: "medium",
    title: "Connection Timeout",
    message: "The request took too long to complete. Please try again.",
    actions: [ErrorActionId.RETRY],
    retryable: true,
  },

  server_unavailable: {
    displayType: "boundary",
    severity: "high",
    title: "Service Unavailable",
    message: "The service is temporarily unavailable. Please try again later.",
    actions: [ErrorActionId.RETRY, ErrorActionId.HOME],
    retryable: true,
  },

  // Validation & Input
  validation_error: {
    displayType: "toast",
    severity: "low",
    title: "Validation Error",
    message:
      "Something is not as it should be. Please check your input and try again.",
    duration: 5000,
  },

  file_too_large: {
    displayType: "toast",
    severity: "medium",
    title: "File Too Large",
    message: "The selected file is too large. Please choose a smaller file.",
    duration: 5000,
  },

  unsupported_file_type: {
    displayType: "toast",
    severity: "medium",
    title: "Unsupported File Type",
    message: "This file type is not supported. Please choose a different file.",
    duration: 5000,
  },

  // Data & Resources
  not_found: {
    displayType: "boundary",
    severity: "medium",
    title: "Not Found",
    message: "The requested resource could not be found.",
    actions: [ErrorActionId.HOME],
  },

  thread_not_found: {
    displayType: "boundary",
    severity: "medium",
    title: "Thread Not Found",
    message:
      "The conversation you're looking for doesn't exist or has been deleted.",
    actions: [ErrorActionId.HOME],
  },

  // Chat & AI Specific
  chat_generation_failed: {
    displayType: "inline",
    severity: "medium",
    title: "Generation Failed",
    message: "Failed to generate a response. Please try again.",
    actions: [ErrorActionId.RETRY],
    retryable: true,
  },

  stream_interrupted: {
    displayType: "inline",
    severity: "medium",
    title: "Stream Interrupted",
    message: "The response was interrupted.",
    //actions: [ErrorActionId.RESUME],
    retryable: true,
  },

  // System & Server
  server_error: {
    displayType: "server",
    severity: "high",
    title: "Server Error",
    message: "An internal server error occurred.",
    retryable: true,
  },

  database_error: {
    displayType: "server",
    severity: "critical",
    title: "Database Error",
    message: "A database error occurred.",
    retryable: false,
  },

  internal_error: {
    displayType: "boundary",
    severity: "high",
    title: "Internal Error",
    message:
      "An unexpected error occurred. Please try again or contact support.",
    actions: [ErrorActionId.RETRY, ErrorActionId.HOME],
    retryable: true,
  },

  maintenance_mode: {
    displayType: "boundary",
    severity: "high",
    title: "Maintenance Mode",
    message:
      "The application is currently under maintenance. Please try again later.",
    actions: [ErrorActionId.RETRY],
    retryable: true,
  },

  // Client & Browser
  browser_not_supported: {
    displayType: "boundary",
    severity: "high",
    title: "Browser Not Supported",
    message:
      "Your browser is not supported. Please use a modern browser like Chrome, Firefox, or Safari.",
  },

  feature_not_available: {
    displayType: "toast",
    severity: "medium",
    title: "Feature Not Available",
    message: "This feature is not available in your browser.",
    duration: 5000,
  },

  clipboard_error: {
    displayType: "toast",
    severity: "low",
    title: "Clipboard Error",
    message: "Failed to copy to clipboard.",
    duration: 3000,
  },

  // Generic
  unknown_error: {
    displayType: "toast",
    severity: "medium",
    title: "Unknown Error",
    message: "An unexpected error occurred. Please try again.",
    actions: [ErrorActionId.RETRY],
    retryable: true,
    duration: 5000,
  },
};

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Union type of all possible error display types
 */
export type AnyAppError =
  | ToastError
  | InlineError
  | BoundaryError
  | ServerError;

/**
 * Error creation options
 */
export interface CreateErrorOptions {
  type: ErrorType;
  context?: Partial<ErrorContext>;
  overrides?: Partial<AppError>;
  originalError?: unknown;
  // For dynamic validation errors
  dynamicMessage?: string;
}

/**
 * Error handler function type
 */
export type ErrorHandler = (error: AppError) => void | Promise<void>;

/**
 * Error recovery function type
 */
export type ErrorRecoveryFn = () => void | Promise<void>;

/**
 * Extract only the error types that are configured as toast errors
 */
export type ToastErrorType =
  | "usage_limit_warning"
  | "validation_error"
  | "file_too_large"
  | "unsupported_file_type"
  | "feature_not_available"
  | "clipboard_error"
  | "unknown_error";

/**
 * Extract only the error types that are configured as inline errors
 */
export type InlineErrorType =
  | "api_key_error"
  | "provider_error"
  | "rate_limit_exceeded"
  | "quota_exceeded"
  | "network_error"
  | "connection_timeout"
  | "chat_generation_failed"
  | "stream_interrupted";

/**
 * Extract only the error types that are configured as boundary errors
 */
export type BoundaryErrorType =
  | "authentication_required"
  | "unauthorized"
  | "server_unavailable"
  | "not_found"
  | "thread_not_found"
  | "internal_error"
  | "maintenance_mode"
  | "browser_not_supported";

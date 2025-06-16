import {
  AppError,
  ErrorType,
  CreateErrorOptions,
  ErrorContext,
  ErrorActionId,
  ERROR_ACTIONS,
  ERROR_DISPLAY_MAP,
  AnyAppError,
} from "../types/errors";

// ============================================================================
// ERROR HANDLER FUNCTIONS
// ============================================================================

function generateErrorId(): string {
  return `error_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

function createBaseContext(context?: Partial<ErrorContext>): ErrorContext {
  return {
    timestamp: Date.now(),
    userAgent:
      typeof window !== "undefined" ? window.navigator.userAgent : undefined,
    url: typeof window !== "undefined" ? window.location.href : undefined,
    ...context,
  };
}

function createActions(actionIds?: ErrorActionId[]): AppError["actions"] {
  if (!actionIds?.length) return undefined;

  return actionIds.map((id) => ({
    ...ERROR_ACTIONS[id],
    action: () => {
      // Actions will be implemented by the consuming components
      console.warn(`Action ${id} not implemented`);
    },
  }));
}

export function createError(options: CreateErrorOptions): AnyAppError {
  const config = ERROR_DISPLAY_MAP[options.type];
  const context = createBaseContext(options.context);

  const baseError: AppError = {
    id: generateErrorId(),
    type: options.type,
    severity: config.severity,
    displayType: config.displayType,
    title: config.title,
    message: options.dynamicMessage || config.message,
    context,
    actions: createActions(config.actions),
    dismissible: config.displayType === "toast",
    autoHide: config.autoHide,
    duration: config.duration,
    retryable: config.retryable,
    originalError: options.originalError,
    ...options.overrides,
  };

  return baseError as AnyAppError;
}

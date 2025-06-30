import type { ServerToolkit } from "../types";
import { memoryToolkitServer } from "./memory/server";
import { exaToolkitServer, createExaToolkitServer } from "./exa/server";
import {
  Toolkits,
  type ServerToolkitNames,
  type ServerToolkitParameters,
} from "./shared";

type ServerToolkits = {
  [K in Toolkits]: ServerToolkit<
    ServerToolkitNames[K],
    ServerToolkitParameters[K]
  >;
};

export const serverToolkits: ServerToolkits = {
  [Toolkits.Memory]: memoryToolkitServer,
  [Toolkits.Exa]: exaToolkitServer,
};

/**
 * Gets the appropriate server toolkit, with model-specific optimizations
 * @param server - The toolkit ID
 * @param model - Optional model ID for toolkit optimization
 * @returns ServerToolkit instance
 */
export function getServerToolkit<T extends Toolkits>(
  server: T,
  model?: string
): ServerToolkit<ServerToolkitNames[T], ServerToolkitParameters[T]> {
  // Handle model-aware toolkits
  switch (server) {
    case Toolkits.Exa:
      // Create model-specific Exa toolkit if model is provided
      return (
        model ? createExaToolkitServer(model) : serverToolkits[server]
      ) as ServerToolkit<ServerToolkitNames[T], ServerToolkitParameters[T]>;

    default:
      // For other toolkits, use the default
      return serverToolkits[server];
  }
}

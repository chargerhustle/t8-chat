import type { ClientToolkit } from "../types";
import {
  Toolkits,
  type ServerToolkitNames,
  type ServerToolkitParameters,
} from "./shared";

import { memoryClientToolkit } from "./memory/client";

type ClientToolkits = {
  [K in Toolkits]: ClientToolkit<
    ServerToolkitNames[K],
    ServerToolkitParameters[K]
  >;
};

export const clientToolkits: ClientToolkits = {
  [Toolkits.Memory]: memoryClientToolkit,
};

export function getClientToolkit<T extends Toolkits>(
  server: T
): ClientToolkit<ServerToolkitNames[T], ServerToolkitParameters[T]> {
  return clientToolkits[server];
}

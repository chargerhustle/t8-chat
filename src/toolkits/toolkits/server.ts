import type { ServerToolkit } from "../types";
import { memoryToolkitServer } from "./memory/server";
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
};

export function getServerToolkit<T extends Toolkits>(
  server: T
): ServerToolkit<ServerToolkitNames[T], ServerToolkitParameters[T]> {
  return serverToolkits[server];
}

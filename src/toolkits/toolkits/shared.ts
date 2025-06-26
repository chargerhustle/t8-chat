import type { memoryParameters } from "./memory/base";
import type { MemoryTools } from "./memory/tools";

export enum Toolkits {
  Memory = "memory",
}

export type ServerToolkitNames = {
  [Toolkits.Memory]: MemoryTools;
};

export type ServerToolkitParameters = {
  [Toolkits.Memory]: typeof memoryParameters.shape;
};

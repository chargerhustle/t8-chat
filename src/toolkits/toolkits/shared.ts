import type { memoryParameters } from "./memory/base";
import type { MemoryTools } from "./memory/tools";
import type { exaParameters } from "./exa/base";
import type { ExaTools } from "./exa/tools";

export enum Toolkits {
  Memory = "memory",
  Exa = "exa",
}

export type ServerToolkitNames = {
  [Toolkits.Memory]: MemoryTools;
  [Toolkits.Exa]: ExaTools;
};

export type ServerToolkitParameters = {
  [Toolkits.Memory]: typeof memoryParameters.shape;
  [Toolkits.Exa]: typeof exaParameters.shape;
};

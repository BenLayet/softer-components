import type { ComponentContract } from "../../component-contract/component-contract";
import type { StatePathString } from "../values/state";

export type ContextsDef = Record<symbol, ComponentContract>;
export type ContextsPath<TContexts extends ContextsDef = ContextsDef> = {
  [K in keyof TContexts & symbol]: StatePathString<TContexts[K]>;
};

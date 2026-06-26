import type { ComponentContract } from "../../component-contract/component-contract";
import { Payload } from "../../component-contract/payload";

// State happens to have the same definition as Payload, but we want to keep it separate for clarity.
export type State = Payload;
export type StatePathString<TComponentContract extends ComponentContract> =
  string & {
    readonly __contract: TComponentContract;
  };

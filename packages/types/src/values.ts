import { ComponentContract } from "./component-contract";

/**
 * Provides access to computed values (from selectors) and child values
 * This is the runtime interface for accessing global state without exposing the state itself
 */
export type Values<
  TComponentContract extends ComponentContract = ComponentContract,
> = {
  /** Computed values from selectors - call these functions to get current values */
  selectors: {
    [K in keyof TComponentContract["values"]]: () => TComponentContract["values"][K];
  };
  /** Child component values - access nested component values here */
  children: ChildrenValues<TComponentContract>;
};
export type ChildrenValues<
  TComponentContract extends ComponentContract = ComponentContract,
> = {
  [ChildName in keyof TComponentContract["children"]]: {
    [ChildKey: string]: Values<TComponentContract["children"][ChildName]>;
  };
};

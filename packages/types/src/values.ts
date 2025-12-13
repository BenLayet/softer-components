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
  children: ChildrenValues<TComponentContract["children"]>;
};
export type ChildrenValues<
  TChildren extends Record<string, ComponentContract> = Record<
    string,
    ComponentContract
  >,
> = {
  [ChildName in keyof TChildren]: {
    [ChildKey: string]: Values<TChildren[ChildName]>;
  };
};

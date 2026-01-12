import { ChildInstanceContract, ComponentContract } from "./component-contract";

/**
 * Provides access to computed values (from selectors) and child values
 * This is the runtime interface for accessing global state without exposing the state itself
 */
export type Values<
  TComponentContract extends ComponentContract = ComponentContract,
> = {
  /** Computed values from selectors - call these functions to get current values */
  values: {
    [K in keyof TComponentContract["values"]]: () => TComponentContract["values"][K];
  };
  /** Child component values - access nested component values here */
  childrenValues: ChildrenValues<TComponentContract["children"]>;
};
export type ChildrenValues<
  TChildren extends Record<string, ComponentContract & ChildInstanceContract> =
    Record<string, ComponentContract>,
> = {
  [ChildName in keyof TChildren]: TChildren[ChildName] extends {
    isCollection: true;
  }
    ? {
        [ChildKey: string]: Values<TChildren[ChildName]>;
      }
    :
        | Values<TChildren[ChildName]>
        | (TChildren[ChildName] extends {
            isOptional: true;
          }
            ? undefined
            : never);
};

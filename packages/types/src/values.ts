import {
  ChildrenContract,
  ComponentContract,
  ValuesContract,
} from "./component-contract";

/**
 * Provides access to computed values (from selectors) and child values
 * This is the runtime interface for accessing global state without exposing the state itself
 */
export type Values<
  TComponentContract extends ComponentContract = ComponentContract,
> = {
  /** Computed values from selectors - call these functions to get current values */
  values: OwnValues<TComponentContract>;
  /** Child component values - access nested component values here */
  childrenValues: ChildrenValues<TComponentContract["children"]>;
  /** Context component values */
  contextsValues: ContextsValues<TComponentContract["context"]>;
};

export type OwnValues<TComponentContract extends ComponentContract> =
  TComponentContract["values"] extends ValuesContract
    ? {
        [K in keyof TComponentContract["values"]]: () => TComponentContract["values"][K];
      }
    : {};

export type ContextsValues<
  TContexts extends undefined | Record<string, ComponentContract> = undefined,
> =
  TContexts extends Record<string, ComponentContract>
    ? _ContextsValues<TContexts>
    : never;
type _ContextsValues<TContexts extends Record<string, ComponentContract>> = {
  [ContextName in keyof TContexts]: Values<TContexts[ContextName]>;
};
export type ChildrenValues<
  TChildren extends ChildrenContract | undefined = ChildrenContract,
> = TChildren extends ChildrenContract
  ? {
      [ChildName in keyof TChildren]: TChildren[ChildName] extends {
        type: "collection";
      }
        ? {
            [ChildKey: string]: Values<TChildren[ChildName]>;
          }
        :
            | Values<TChildren[ChildName]>
            | (TChildren[ChildName] extends {
                type: "optional";
              }
                ? undefined
                : never);
    }
  : {};

import {
  ChildrenContract,
  ComponentContract,
  ValuesContract,
} from "../../component-contract/component-contract";
import type { ContextsDef } from "../dependencies/contexts-def";

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
};

export type OwnValues<TComponentContract extends ComponentContract> =
  TComponentContract["values"] extends ValuesContract
    ? {
        [K in keyof TComponentContract["values"]]: () => TComponentContract["values"][K];
      }
    : {};

export type ContextsValues<
  TContexts extends undefined | ContextsDef = ContextsDef,
> = TContexts extends ContextsDef ? _ContextsValues<TContexts> : never;
type _ContextsValues<TContexts extends ContextsDef> = {
  [ContextSymbol in keyof TContexts & symbol]: Values<TContexts[ContextSymbol]>;
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

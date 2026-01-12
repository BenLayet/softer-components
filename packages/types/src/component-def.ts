import { ChildConfig, ChildrenInstancesDefs } from "./children";
import { ComponentContract } from "./component-contract";
import { InternalEventForwarders } from "./event-forwarder";
import { Selectors } from "./selectors";
import { Values } from "./values";

/**
 * Definition of a component
 * @param TComponentContract - Contract of the component.
 */
export type ComponentDef<TComponentContract extends ComponentContract = any> = {
  initialState?: TComponentContract["state"];
  selectors?: Selectors<
    TComponentContract["state"],
    TComponentContract["children"]
  >;
  uiEvents?: (keyof TComponentContract["events"] & string)[];
  updaters?: {
    [EventName in keyof TComponentContract["events"]]?: (
      params: Values<TComponentContract> & {
        state: TComponentContract["state"]; //mutable
        children: ChildrenInstancesDefs<TComponentContract["children"]>; //mutable
        payload: TComponentContract["events"][EventName]["payload"];
      },
    ) => void | TComponentContract["state"];
  };
  eventForwarders?: InternalEventForwarders<TComponentContract>;
  childrenComponentDefs?: {
    [ChildName in keyof TComponentContract["children"]]: ComponentDef<
      Omit<
        TComponentContract["children"][ChildName],
        "isCollection" | "isOptional"
      >
    >;
  };
  initialChildren?: ChildrenInstancesDefs<TComponentContract["children"]>;
  childrenConfig?: {
    [ChildName in keyof TComponentContract["children"]]?: ChildConfig<
      TComponentContract,
      TComponentContract["children"][ChildName]
    >;
  };
  effects?: EffectsDef<keyof TComponentContract["events"] & string>;
};

export type EffectsDef<TEventNames extends string> = {
  [TEventName in TEventNames]?: TEventNames[];
};

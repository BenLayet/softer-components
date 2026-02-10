import { ChildConfig, ChildrenInstancesDefs } from "./children";
import { ComponentContract } from "./component-contract";
import { Effects } from "./effects";
import { InternalEventForwarders } from "./event-forwarder";
import { Selectors } from "./selectors";
import { State } from "./state";
import { Values } from "./values";

/**
 * Definition of a component
 * @param TComponentContract - Contract of the component.
 */
export type ComponentDef<
  TComponentContract extends ComponentContract = any,
  TState extends State = any,
> = {
  initialState?: TState;
  selectors?: Selectors<TState, TComponentContract["children"]>;
  uiEvents?: (keyof TComponentContract["events"] & string)[];
  updaters?: {
    [EventName in keyof TComponentContract["events"]]?: (
      params: Values<TComponentContract> & {
        state: TState; //mutable
        children: ChildrenInstancesDefs<TComponentContract["children"]>; //mutable
        payload: TComponentContract["events"][EventName]["payload"];
      },
    ) => void | TState;
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
  effects?: Effects<TComponentContract>;
};

export type EffectsDef<TEventNames extends string> = {
  [TEventName in TEventNames]?: TEventNames[];
};

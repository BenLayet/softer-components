import { ChildConfig, ChildrenInstancesDefs } from "./children";
import { ComponentContract } from "./component-contract";
import { Effects } from "./effects";
import { InternalEventForwarders } from "./event-forwarder";
import { Selectors } from "./selectors";
import { State } from "./state";
import { Values } from "./values";

export type ChildrenComponentDefs<
  TComponentContract extends ComponentContract = any,
> = {
  [K in keyof TComponentContract["children"]]: ComponentDef<
    Omit<TComponentContract["children"][K], "isCollection" | "isOptional">
  >;
};
type ChildrenConfig<TComponentContract extends ComponentContract = any> = {
  [K in keyof TComponentContract["children"]]?: ChildConfig<
    TComponentContract,
    TComponentContract["children"][K]
  >;
};
type Updaters<
  TComponentContract extends ComponentContract = any,
  TState extends State = any,
> = {
  [EventName in keyof TComponentContract["events"]]?: (
    params: Values<TComponentContract> & {
      state: TState; //mutable
      children: ChildrenInstancesDefs<TComponentContract["children"]>; //mutable
      payload: TComponentContract["events"][EventName]["payload"];
    },
  ) => void | TState;
};
type UiEvents<TComponentContract extends ComponentContract = any> =
  (keyof TComponentContract["events"] & string)[];

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
  uiEvents?: UiEvents<TComponentContract>;
  updaters?: Updaters<TComponentContract, TState>;
  eventForwarders?: InternalEventForwarders<TComponentContract>;
  childrenComponentDefs?: ChildrenComponentDefs<TComponentContract>;
  initialChildren?: ChildrenInstancesDefs<TComponentContract["children"]>;
  childrenConfig?: ChildrenConfig<TComponentContract>;
  effects?: Effects<TComponentContract>;
} & ContextPart<TComponentContract>;

export type EffectsDef<TEventNames extends string> = {
  [TEventName in TEventNames]?: TEventNames[];
};

type ContextPart<TComponentContract extends ComponentContract = any> =
  TComponentContract["requiredContext"] extends Record<
    string,
    ComponentContract
  >
    ? {
        contextDefs: {
          [K in keyof TComponentContract["requiredContext"]]: string;
        };
        contextConfig?: {
          [K in keyof TComponentContract["requiredContext"]]?: ChildConfig<
            TComponentContract,
            TComponentContract["requiredContext"][K]
          >;
        };
      }
    : {
        contextDefs?: never;
        contextConfig?: never;
      };

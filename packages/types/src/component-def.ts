import {
  ChildrenComponentDefs,
  ChildrenConfig,
  ChildrenInstancesDefs,
} from "./children";
import { ComponentContract, ContextContract } from "./component-contract";
import { ContextsConfig } from "./context";
import { Effects } from "./effects";
import { InternalEventForwarders } from "./event-forwarder";
import { Selectors } from "./selectors";
import { State } from "./state";
import { ChildrenUpdaters, StateUpdaters } from "./updaters";

export type UiEvents<TComponentContract extends ComponentContract = any> =
  (keyof TComponentContract["events"] & string)[];

/**
 * Definition of a component
 * @param TComponentContract - Contract of the component.
 */
export type ComponentDef<
  TComponentContract extends ComponentContract = {},
  TState extends State = undefined,
> = {
  readonly initialState?: TState;
  readonly selectors?: Selectors<
    TState,
    TComponentContract["children"],
    TComponentContract["context"]
  >;
  readonly uiEvents?: UiEvents<TComponentContract>;
  readonly stateUpdaters?: StateUpdaters<TComponentContract, TState>;
  readonly childrenUpdaters?: ChildrenUpdaters<TComponentContract>;
  readonly eventForwarders?: InternalEventForwarders<TComponentContract>;
  readonly childrenComponentDefs?: ChildrenComponentDefs<TComponentContract>;
  readonly initialChildren?: ChildrenInstancesDefs<
    TComponentContract["children"]
  >;
  readonly childrenConfig?: ChildrenConfig<TComponentContract>;
} & ContextPart<TComponentContract> &
  EffectsPart<TComponentContract>;

type ContextPart<TComponentContract extends ComponentContract = any> =
  TComponentContract extends { context: ContextContract }
    ? {
        contextDefs: {
          [K in keyof TComponentContract["context"]]: string;
        };
        contextsConfig?: ContextsConfig<TComponentContract>;
      }
    : {
        contextDefs?: never;
        contextsConfig?: never;
      };

type EffectsPart<TComponentContract extends ComponentContract> = {
  effects?: Effects<TComponentContract>;
};

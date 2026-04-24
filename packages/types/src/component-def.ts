import {
  ChildrenComponentDefs,
  ChildrenConfig,
  ChildrenInstancesDefs,
} from "./children";
import {
  ChildrenContract,
  ComponentContract,
  ContextContract,
} from "./component-contract";
import {
  ExtractEventNames,
  ExtractUiEvents,
} from "./component-contract-helpers";
import { ContextsConfig, ContextsDef } from "./context";
import { State } from "./data";
import { Effects } from "./effects";
import { InternalEventForwarders } from "./event-forwarder";
import { Selectors } from "./selectors";
import { ChildrenUpdaters, StateUpdaters } from "./updaters";
import { IfAny, IfNonEmptyRecord } from "./util";

/**
 * Definition of a component
 * @param TComponentContract - Contract of the component.
 */
export type ComponentDef<
  TComponentContract extends ComponentContract = any,
  TState extends State = any, // cannot use IfAny<TComponentContract, any, undefined>, because ComponentContract cannot be inferred in ContractOfComponentDef<T extends ComponentDef> which is necessary in ValuesProviders
> = {
  /** Phantom property to preserve the contract type for inference. Never set at runtime. */
  readonly __contract__?: TComponentContract;
} & IfAny<
  TComponentContract,
  {
    readonly initialState?: State;
    readonly selectors?: Selectors<any, any, any>;
    readonly allEvents?: readonly string[];
    readonly uiEvents?: readonly string[];
    readonly stateUpdaters?: StateUpdaters<any, any>;
    readonly eventForwarders?: InternalEventForwarders<any>;
    readonly initialChildren?: Record<string, string[] | boolean | undefined>;
    readonly childrenUpdaters?: ChildrenUpdaters<any>;
    readonly childrenConfig?: ChildrenConfig<any>;
    readonly childrenComponentDefs?: Record<string, ComponentDef>;
    readonly contextsConfig?: ContextsConfig<any>;
    readonly contextsDef?: ContextsDef<any>;
    readonly effects?: Effects<any>;
  },
  StatePart<TState> &
    SelectorsPart<TComponentContract, TState> &
    EventsPart<TComponentContract, TState> &
    ChildrenPart<TComponentContract> &
    ContextsPart<TComponentContract>
>;

type NO_STATE_DEFINED = "State is undefined, cannot define initialState";
type StatePart<TState extends State> = TState extends undefined
  ? {
      initialState?: NO_STATE_DEFINED;
    }
  : IfAny<
      TState,
      {
        initialState?: State;
      },
      {
        initialState: TState;
      }
    >;

type NO_CHILDREN_DEFINED = never;
type ChildrenPart<TComponentContract extends ComponentContract> =
  TComponentContract extends { children: ChildrenContract }
    ? {
        readonly childrenComponentDefs: ChildrenComponentDefs<TComponentContract>;
        readonly childrenConfig?: ChildrenConfig<TComponentContract>;
        readonly childrenUpdaters?: ChildrenUpdaters<TComponentContract>;
      } & (TComponentContract["children"][keyof TComponentContract["children"]] extends {
        type: "collection";
      }
        ? {
            readonly initialChildren: ChildrenInstancesDefs<
              TComponentContract["children"]
            >; //initialChildren is required if at least one of the children is a collection
          }
        : {
            readonly initialChildren?: ChildrenInstancesDefs<
              TComponentContract["children"]
            >;
          })
    : {
        readonly childrenComponentDefs?: NO_CHILDREN_DEFINED;
        readonly initialChildren?: NO_CHILDREN_DEFINED;
        readonly childrenConfig?: NO_CHILDREN_DEFINED;
        readonly childrenUpdaters?: NO_CHILDREN_DEFINED;
      };

type NO_VALUES_DEFINED = never;
type SelectorsPart<
  TComponentContract extends ComponentContract,
  TState extends State,
> = IfNonEmptyRecord<
  TComponentContract["values"],
  {
    readonly selectors: Selectors<
      TState,
      TComponentContract["children"],
      TComponentContract["context"]
    >;
  },
  {
    readonly selectors?: NO_VALUES_DEFINED;
  }
>;
type NO_EVENTS_DEFINED = never;
type EventsPart<
  TComponentContract extends ComponentContract,
  TState extends State,
> = IfNonEmptyRecord<
  TComponentContract["events"],
  {
    readonly allEvents: ExtractEventNames<TComponentContract>;
    readonly stateUpdaters?: StateUpdaters<TComponentContract, TState>;
    readonly childrenUpdaters?: ChildrenUpdaters<TComponentContract>;
    readonly eventForwarders?: InternalEventForwarders<TComponentContract>;
    readonly effects?: Effects<TComponentContract>;
  } & (ExtractUiEvents<TComponentContract> extends never | []
    ? {
        readonly uiEvents?: [];
      }
    : {
        readonly uiEvents: ExtractUiEvents<TComponentContract>;
      }),
  {
    readonly allEvents?: NO_EVENTS_DEFINED;
    readonly uiEvents?: NO_EVENTS_DEFINED;
    readonly stateUpdaters?: NO_EVENTS_DEFINED;
    readonly childrenUpdaters?: NO_EVENTS_DEFINED;
    readonly eventForwarders?: NO_EVENTS_DEFINED;
    readonly effects?: NO_EVENTS_DEFINED;
  }
>;

type NO_CONTEXT_DEFINED = never;
type ContextsPart<TComponentContract extends ComponentContract> =
  TComponentContract extends { context: ContextContract }
    ? {
        contextsDef: ContextsDef<TComponentContract>;
        contextsConfig?: ContextsConfig<TComponentContract>;
      }
    : {
        contextsDef?: NO_CONTEXT_DEFINED;
        contextsConfig?: NO_CONTEXT_DEFINED;
      };

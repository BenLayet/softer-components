import {
  ChildrenComponentDefs,
  ChildrenConfig,
  ChildrenInstancesDefs,
} from "./children";
import {
  ChildrenContract,
  ComponentContract,
  ContextContract,
  EventsContract,
  ValuesContract,
} from "./component-contract";
import { ContextsConfig, ContextsDef } from "./context";
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
  TComponentContract extends ComponentContract = any,
  TState extends State = TComponentContract extends never ? any : undefined,
> = StatePart<TState> &
  SelectorsPart<TComponentContract, TState> &
  EventPart<TComponentContract, TState> &
  ChildrenPart<TComponentContract> &
  ContextPart<TComponentContract>;

type NO_STATE_DEFINED = "State is undefined, cannot define initialState";
type StatePart<TState extends State> = TState extends undefined
  ? {
      initialState?: NO_STATE_DEFINED;
    }
  : {
      initialState: TState;
    };

type NO_CHILDREN_DEFINED = "No children defined in the contract";
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
            readonly initialChildren: ChildrenInstancesDefs<TComponentContract>; //initialChildren is required if at least one of the children is a collection
          }
        : {
            readonly initialChildren?: ChildrenInstancesDefs<TComponentContract>;
          })
    : {
        readonly childrenComponentDefs?: NO_CHILDREN_DEFINED;
        readonly initialChildren?: NO_CHILDREN_DEFINED;
        readonly childrenConfig?: NO_CHILDREN_DEFINED;
        readonly childrenUpdaters?: NO_CHILDREN_DEFINED;
      };

type NO_VALUES_DEFINED = "No values defined in the contract";
type SelectorsPart<
  TComponentContract extends ComponentContract,
  TState extends State,
> = TComponentContract extends { values: ValuesContract }
  ? {
      readonly selectors?: Selectors<
        TState,
        TComponentContract["children"],
        TComponentContract["context"]
      >;
    }
  : {
      readonly selectors?: NO_VALUES_DEFINED;
    };
type NO_EVENTS_DEFINED = "No events defined in the contract";
type EventPart<
  TComponentContract extends ComponentContract,
  TState extends State,
> = TComponentContract extends { events: EventsContract }
  ? {
      readonly uiEvents?: UiEvents<TComponentContract>;
      readonly stateUpdaters?: StateUpdaters<TComponentContract, TState>;
      readonly childrenUpdaters?: ChildrenUpdaters<TComponentContract>;
      readonly eventForwarders?: InternalEventForwarders<TComponentContract>;
      readonly effects?: Effects<TComponentContract>;
    }
  : {
      readonly uiEvents?: NO_EVENTS_DEFINED;
      readonly stateUpdaters?: NO_EVENTS_DEFINED;
      readonly childrenUpdaters?: NO_EVENTS_DEFINED;
      readonly eventForwarders?: NO_EVENTS_DEFINED;
      readonly effects?: NO_EVENTS_DEFINED;
    };

type NO_CONTEXT_DEFINED = "No context defined in the contract";
type ContextPart<TComponentContract extends ComponentContract> =
  TComponentContract extends { context: ContextContract }
    ? {
        contextDefs: ContextsDef<TComponentContract>;
        contextsConfig?: ContextsConfig<TComponentContract>;
      }
    : {
        contextDefs?: NO_CONTEXT_DEFINED;
        contextsConfig?: NO_CONTEXT_DEFINED;
      };

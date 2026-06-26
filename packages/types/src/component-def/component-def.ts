import {
  ChildrenContract,
  ComponentContract,
} from "../component-contract/component-contract";
import { ExtractUiEvents } from "../component-contract/component-contract-extractors";
import { ChildrenInstancesDefs } from "./dependencies/children-instances-def";
import type { ContextsDef, ContextsPath } from "./dependencies/contexts-def";
import { Effects } from "./events/effects";
import {
  ChildrenEventForwarders,
  ContextsEventForwarders,
  InternalEventForwarders,
} from "./events/event-forwarder";
import { ChildrenUpdaters, StateUpdaters } from "./events/updaters";
import { Selectors } from "./values/selectors";
import { State } from "./values/state";

/**
 * Definition of a component
 * @param TComponentContract - Contract of the component.
 */
export type ComponentDef<
  TComponentContract extends ComponentContract = any,
  TState extends State = any, // cannot use IfAny<TComponentContract, any, undefined>, because ComponentContract cannot be inferred in ContractOfComponentDef<T extends ComponentDef> which is necessary in ValuesProviders
  TContextsDef extends ContextsDef = any,
> = {
  /** Phantom property to preserve the contract type for inference. Never set at runtime. */
  readonly __contract__?: TComponentContract;
  readonly __contextsDef__?: TContextsDef;
} & IfAny<
  TComponentContract,
  {
    readonly initialState?: State;
    readonly selectors?: Selectors<any, any, any>;
    readonly uiEvents?: readonly string[];
    readonly stateUpdaters?: StateUpdaters<any, any>;
    readonly initialChildren?: Record<string, string[] | boolean | undefined>;
    readonly childrenUpdaters?: ChildrenUpdaters<any>;
    readonly eventForwarders?: {
      readonly internal?: InternalEventForwarders<any>;
      readonly children?: ChildrenEventForwarders<any>;
      readonly contexts?: ContextsEventForwarders<any, any>;
    };
    readonly config?: {
      readonly childrenDefs?: Record<string, ComponentDef>;
      readonly contextsPath?: ContextsPath;
      readonly effects?: Effects<any>;
    };
  },
  StatePart<TState> &
    SelectorsPart<TComponentContract, TState, TContextsDef> &
    EventsPart<TComponentContract, TState> &
    ChildrenPart<TComponentContract> &
    ContextsPart<TComponentContract, TContextsDef>
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
        readonly eventForwarders?: {
          readonly children: ChildrenEventForwarders<TComponentContract>;
        };
        readonly config?: {
          readonly childrenDefs: ChildrenComponentDefs<TComponentContract>;
        };
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
        readonly initialChildren?: NO_CHILDREN_DEFINED;
        readonly config?: {
          readonly childrenDefs?: NO_CHILDREN_DEFINED;
        };
        readonly childrenUpdaters?: NO_CHILDREN_DEFINED;
      };

export type ChildrenComponentDefs<
  TComponentContract extends ComponentContract = ComponentContract,
> = TComponentContract["children"] extends ChildrenContract
  ? {
      [K in keyof TComponentContract["children"]]: ComponentDef<
        Omit<TComponentContract["children"][K], "type">
      >;
    }
  : never;

type NO_VALUES_DEFINED = never;
type SelectorsPart<
  TComponentContract extends ComponentContract,
  TState extends State,
  TContexts extends ContextsDef,
> = IfNonEmptyRecord<
  TComponentContract["values"],
  {
    readonly selectors: Selectors<
      TState,
      TComponentContract["children"],
      TContexts
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
    readonly stateUpdaters?: StateUpdaters<TComponentContract, TState>;
    readonly childrenUpdaters?: ChildrenUpdaters<TComponentContract>;
    readonly eventForwarders?: {
      readonly internal?: InternalEventForwarders<TComponentContract>;
    };
    readonly config?: {
      readonly effects?: Effects<TComponentContract>;
    };
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
    readonly config?: {
      readonly effects?: NO_EVENTS_DEFINED;
    };
  }
>;

type NO_CONTEXT_DEFINED = never;
type ContextsPart<
  TComponentContract extends ComponentContract,
  TContexts extends ContextsDef,
> = TContexts extends ContextsDef
  ? {
      readonly config?: {
        readonly contextsPath: ContextsPath<TContexts>;
      };
      readonly eventForwarders?: {
        readonly contexts?: ContextsEventForwarders<
          TComponentContract,
          TContexts
        >;
      };
    }
  : {
      readonly config?: {
        readonly contextsPath?: NO_CONTEXT_DEFINED;
      };
    };

export type ComponentDefConfig<
  TComponentContract extends ComponentContract,
  TContextsDef extends ContextsDef = {},
> = IfNonEmptyRecord<
  TComponentContract["children"],
  {
    readonly childrenDefs: ChildrenComponentDefs<TComponentContract>;
  },
  {}
> &
  IfNonEmptyRecord<
    TContextsDef,
    {
      readonly contextsPath: ContextsPath<TContextsDef>;
    },
    {}
  > &
  IfNonEmptyRecord<
    TComponentContract["events"],
    {
      readonly effects?: Effects<TComponentContract>;
    },
    {
      readonly effects?: never;
    }
  >;
/***************************************************************************************************************
 * // --- app-utilities to detect `any` and branch in conditional types ---
 * // Detect `any`: true when T is `any`, false otherwise
 ****************************************************************************************************************/

type IsAny<T> = 0 extends 1 & T ? true : false;
// IfAny: choose one of two branches depending on whether T is `any`
type IfAny<T, Y, N = never> = IsAny<T> extends true ? Y : N;
type IsNonEmptyRecord<T> =
  T extends Record<any, any>
    ? [keyof T] extends [never]
      ? false
      : true
    : false;
type IfNonEmptyRecord<T, Then, Else = never> =
  IsNonEmptyRecord<T> extends true ? Then : Else;

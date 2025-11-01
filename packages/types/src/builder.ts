import { D } from "vitest/dist/chunks/reporters.d.BFLkQcL6.js";
import {
  ComponentConstraints,
  ComponentDef,
  EventHandler,
  EventHandlers,
  NewEventHandlers,
  NewSelectors,
  Selector,
  State,
  Event,
} from "./softer-component-types";

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// componentDefBuilder
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export type DefaultContract = {
  constructorArgument: undefined;
  selectorValues: {};
  eventPayloads: {};
  children: {};
};
export type DefaultConstraints = {
  internal: { state: {} };
  contract: DefaultContract;
};
export const defaultComponentDef: ComponentDef<DefaultConstraints> = {
  initialState: {},
  selectors: {},
  eventHandlers: {},
  children: {},
};

//TODO remove () => if not needed
export const componentDefBuilder = () => ({
  withInitialState,
  withEventHandlers: withEventHandlers<DefaultConstraints>(defaultComponentDef),
  build: () => defaultComponentDef,
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// withInitialState
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
export type DefaultConstraintsWithState<TState extends State> = {
  internal: { state: TState };
  contract: DefaultContract;
};

const withInitialState = <TState extends State>(initialState: TState) => {
  type NewComponentConstraints = DefaultConstraintsWithState<TState>;
  const newBeingBuilt: ComponentDef<NewComponentConstraints> = {
    initialState,
    selectors: {},
    eventHandlers: {},
    children: {},
  };

  return {
    withSelectors: withSelectors<NewComponentConstraints>(newBeingBuilt),
    withEventHandlers: withEventHandlers<NewComponentConstraints>(
      newBeingBuilt as any
    ),
    build: () => newBeingBuilt,
  };
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// withSelector
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
export type AddSelectorsToConstraints<
  TConstraints extends ComponentConstraints,
  TSelectors extends NewSelectors<TConstraints>,
> = TConstraints & {
  contract: {
    selectorValues: ValuesOfSelectors<TSelectors>;
  };
};
type ValuesOfSelectors<TSelectors extends Record<string, Selector<any, any>>> =
  {
    [K in keyof TSelectors]: TSelectors[K] extends Selector<any, infer V>
      ? V
      : never;
  };
const withSelectors =
  <TConstraints extends ComponentConstraints>(
    componentDef: ComponentDef<TConstraints>
  ) =>
  <TSelectors extends NewSelectors<TConstraints>>(selectors: TSelectors) => {
    type NewComponentConstraints = AddSelectorsToConstraints<
      TConstraints,
      TSelectors
    >;
    const newBeingBuilt = {
      ...componentDef,
      selectors: {
        ...componentDef.selectors,
        ...selectors,
      },
    };

    return {
      withSelectors: withSelectors<NewComponentConstraints>(
        newBeingBuilt as any
      ),
      withEventHandlers: withEventHandlers<NewComponentConstraints>(
        newBeingBuilt as any
      ),
      build: () =>
        newBeingBuilt as any as ComponentDef<NewComponentConstraints>,
    };
  };
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// withEventHandlers
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
export type AddEventHandlersToConstraints<
  TConstraints extends ComponentConstraints,
  TEventHandlers extends Record<string, EventHandler<any, any, any>>,
> = TConstraints & {
  contract: {
    eventPayloads: EventHandlersToEventsDef<TEventHandlers>;
  };
};
export type EventHandlersToEventsDef<
  TEventHandlers extends EventHandlers<any, any>,
> = {
  [TEventName in keyof TEventHandlers]: TEventHandlers[TEventName] extends EventHandler<
    any,
    Event<TEventName & string, infer TPayload>,
    any
  >
    ? TPayload
    : never;
};

const withEventHandlers =
  <TConstraints extends ComponentConstraints>(
    componentDef: ComponentDef<TConstraints>
  ) =>
  <TNewEventHandlers extends NewEventHandlers<TConstraints>>(
    eventHandlers: TNewEventHandlers
  ) => {
    type NewComponentConstraints = AddEventHandlersToConstraints<
      TConstraints,
      TNewEventHandlers
    >;
    const newBeingBuilt = {
      ...componentDef,
      eventHandlers: {
        ...componentDef.eventHandlers,
        ...eventHandlers,
      },
    };

    return {
      withEventHandlers: withEventHandlers<NewComponentConstraints>(
        newBeingBuilt as any
      ),
      build: () => newBeingBuilt as ComponentDef<NewComponentConstraints>,
    };
  };

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Utility Types
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
type Assign<T, U> = Omit<T, keyof U> & U;

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
  StateUpdater,
  OptionalValue,
} from "./softer-component-types";
import { T } from "vitest/dist/chunks/environment.d.cL3nLXbE.js";

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
  withEventHandlers: withStateUpdater<DefaultConstraints>(defaultComponentDef),
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
    withStateUpdater: withStateUpdater<NewComponentConstraints>(
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
      withStateUpdater: withStateUpdater<NewComponentConstraints>(
        newBeingBuilt as any
      ),
      build: () =>
        newBeingBuilt as any as ComponentDef<NewComponentConstraints>,
    };
  };
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// withStateUpdater
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
export type AddStateUpdaterToConstraints<
  TConstraints extends ComponentConstraints,
  TEventName extends string,
  TStateUpdater extends StateUpdater<
    TConstraints["internal"]["state"],
    OptionalValue
  >,
> = TConstraints & {
  contract: {
    eventPayloads: TConstraints["contract"]["eventPayloads"] & {
      [K in TEventName]: TStateUpdater extends StateUpdater<any, infer TPayload>
        ? { payload: TPayload }
        : { payload: OptionalValue };
    };
  };
};

const withStateUpdater =
  <TConstraints extends ComponentConstraints>(
    componentDef: ComponentDef<TConstraints>
  ) =>
  <
    TEventName extends string,
    TStateUpdater extends StateUpdater<TConstraints["internal"]["state"], any>,
  >(
    eventName: TEventName,
    stateUpdater: TStateUpdater
  ) => {
    type NewComponentConstraints = AddStateUpdaterToConstraints<
      TConstraints,
      TEventName,
      TStateUpdater
    >;
    const newBeingBuilt = {
      ...componentDef,
      eventHandlers: {
        ...componentDef.eventHandlers,
        [eventName]: {
          ...componentDef.eventHandlers[eventName],
          stateUpdater,
        },
      },
    };

    return {
      withStateUpdater: withStateUpdater<NewComponentConstraints>(
        newBeingBuilt as any
      ),
      build: () => newBeingBuilt as ComponentDef<NewComponentConstraints>,
    };
  };

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Utility Types
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
type Assign<T, U> = Omit<T, keyof U> & U;

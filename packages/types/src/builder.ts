import {
  ComponentConstraints,
  ComponentDef,
  Event,
  EventHandler,
  EventsDefToEventUnion,
  NewSelectors,
  OptionalValue,
  Payload,
  Selector,
  State,
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
  withEvent: withEvent<DefaultConstraints>(defaultComponentDef),
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
    withEvent: withEvent<NewComponentConstraints>(newBeingBuilt as any),
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
      withEvent: withEvent<NewComponentConstraints>(newBeingBuilt as any),
      build: () =>
        newBeingBuilt as any as ComponentDef<NewComponentConstraints>,
    };
  };

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// withEvent
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
export type AddEventHandlerToConstraints<
  TConstraints extends ComponentConstraints,
  TEventName extends string,
  TEventHandler extends EventHandler<any, any, any>,
> = TConstraints & {
  contract: {
    eventPayloads: TConstraints["contract"]["eventPayloads"] &
      TEventHandler extends EventHandler<
      any,
      Event<TEventName & string, infer TPayload>,
      any
    >
      ? {
          [K in TEventName]: { payload: TPayload };
        }
      : {
          [K in TEventName]: { payload: OptionalValue };
        };
  };
};

const withEvent =
  <TConstraints extends ComponentConstraints>(
    componentDef: ComponentDef<TConstraints>
  ) =>
  <TPayload extends Payload, TEventName extends string>(
    eventName: TEventName,
    eventHandler = {} as EventHandler<
      TConstraints["internal"]["state"],
      Event<TEventName & string, TPayload>,
      EventsDefToEventUnion<TConstraints["contract"]["eventPayloads"]>
    >
  ) => {
    type TEventHandler = EventHandler<
      TConstraints["internal"]["state"],
      Event<TEventName & string, TPayload>,
      EventsDefToEventUnion<TConstraints["contract"]["eventPayloads"]>
    >;
    type NewComponentConstraints = AddEventHandlerToConstraints<
      TConstraints,
      TEventName,
      TEventHandler
    >;
    const newBeingBuilt = {
      ...componentDef,
      eventHandlers: {
        ...componentDef.eventHandlers,
        [eventName]: eventHandler ?? {}, //TODO set defaults for stateUpdater and forwarding
      },
    };

    return {
      withEvent: withEvent<NewComponentConstraints>(newBeingBuilt as any),
      build: () => newBeingBuilt as ComponentDef<NewComponentConstraints>,
    };
  };

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Utility Types
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
type Assign<T, U> = Omit<T, keyof U> & U;

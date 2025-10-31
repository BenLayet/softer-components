import {
  ComponentConstraints,
  ComponentDef,
  EventHandlers,
  NewEventHandlers,
  Selectors,
  State,
} from "./softer-component-types";

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// componentDefBuilder
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//TODO remove () => if not needed
export const componentDefBuilder = () => ({
  withInitialState,
  withEventHandlers: withEventHandlers<DefaultConstraints>(defaultComponentDef),
  build: () => defaultComponentDef,
});

type DefaultConstraints = {
  state: {};
  internalEvents: {};
  contract: {
    forUi: { uiEvents: {}; uiValues: {}; children: {} };
    forParent: {
      outputValues: {};
      outputEvents: {};
      inputCommandEvents: {};
      constructWith: undefined;
    };
  };
};
const defaultComponentDef: ComponentDef<DefaultConstraints> = {
  initialState: {},
  selectors: {},
  eventHandlers: {},
  children: {},
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// withInitialState
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const withInitialState = <TState extends State>(initialState: TState) => {
  type NewComponentConstraints = AddStateToConstraints<
    DefaultConstraints,
    TState
  >;
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
type AddStateToConstraints<
  TConstraints extends ComponentConstraints,
  TState extends State,
> = Assign<
  TConstraints,
  {
    state: TState;
  }
>;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// withSelector
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
export type AddSelectorsToConstraints<
  TConstraints extends ComponentConstraints,
  TSelectors extends Selectors<TConstraints["state"]>,
  TSelectorConfig extends { forUi?: boolean; forParent?: boolean },
> = Assign<
  TConstraints,
  {
    contract: {
      forUi: TConstraints["contract"]["forUi"] &
        (TSelectorConfig extends { forUi: true }
          ? {
              uiValues: TConstraints["contract"]["forUi"]["uiValues"] & {
                [K in keyof TSelectors]: ReturnType<TSelectors[K]>;
              };
            }
          : {});
      forParent: TConstraints["contract"]["forParent"] &
        (TSelectorConfig extends { forParent: true }
          ? {
              outputValues: TConstraints["contract"]["forParent"]["outputValues"] & {
                [K in keyof TSelectors]: ReturnType<TSelectors[K]>;
              };
            }
          : {});
    };
  }
>;

const withSelectors =
  <TConstraints extends ComponentConstraints>(
    componentDef: ComponentDef<TConstraints>
  ) =>
  <
    TSelectorConfig extends { forUi?: boolean; forParent?: boolean } = {
      forUi: true;
      forParent: true;
    },
    TSelectors extends Selectors<TConstraints["state"], any> = Selectors<
      TConstraints["state"],
      any
    >,
  >(
    selectors: TSelectors,
    _config?: TSelectorConfig
  ) => {
    type NewComponentConstraints = AddSelectorsToConstraints<
      TConstraints,
      TSelectors,
      TSelectorConfig
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
        newBeingBuilt as any //TODO check with EXPERT why 'as any' is needed here;
      ),
      withEventHandlers: withEventHandlers<NewComponentConstraints>(
        newBeingBuilt as any
      ),
      build: () => newBeingBuilt as ComponentDef<NewComponentConstraints>,
    };
  };
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// withEventHandlers
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
export type AddEventHandlersToConstraints<
  TConstraints extends ComponentConstraints,
  TEventHandlers extends NewEventHandlers<TConstraints>,
> = TConstraints & {
  internalEvents: TEventHandlers;
};

const withEventHandlers =
  <TConstraints extends ComponentConstraints>(
    componentDef: ComponentDef<TConstraints>
  ) =>
  <TEventHandler extends NewEventHandlers<TConstraints>>(
    eventHandlers: TEventHandler
  ) => {
    type NewComponentConstraints = AddEventHandlersToConstraints<
      TConstraints,
      TEventHandler
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

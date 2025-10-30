import {
  ComponentConstraints,
  ComponentDef,
  Selectors,
  State,
} from "./softer-component-types";

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// componentDefBuilder
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//TODO remove () => if not needed
export const componentDefBuilder = () => ({
  withInitialState,
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
  const newBeingBuilt = {
    initialState,
    selectors: {},
    eventHandlers: {},
    children: {},
  } as any; //TODO check with EXPERT why 'as any' is needed here;

  type NewComponentConstraints = AddStateToConstraints<
    DefaultConstraints,
    TState
  >;
  return {
    withSelectors: withSelectors<NewComponentConstraints>(newBeingBuilt),
    build: () => newBeingBuilt as ComponentDef<NewComponentConstraints>,
  };
};
type AddStateToConstraints<
  TConstraints extends ComponentConstraints,
  TState extends State,
> = Omit<TConstraints, "state" | "contract"> & {
  state: TState;
  contract: Omit<TConstraints["contract"], "forParent"> & {
    forParent: Omit<TConstraints["contract"]["forParent"], "constructWith"> & {
      constructWith: TState | undefined;
    };
  };
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// withSelector
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
type AddSelectorToConstraints<
  TConstraints extends ComponentConstraints,
  TSelectors extends Selectors<ComponentConstraints>,
  TSelectorConfig extends { forUi?: boolean; forParent?: boolean },
> = ComponentConstraints &
  (TSelectorConfig extends { forParent: true }
    ? AddSelectorToParentContract<TConstraints, TSelectors>
    : {}) &
  (TSelectorConfig extends { forUi: true }
    ? AddSelectorToUiContract<TConstraints, TSelectors>
    : {});
type AddSelectorToParentContract<
  TConstraints extends ComponentConstraints,
  TSelectors extends Selectors<ComponentConstraints>,
> = ComponentConstraints & {
  contract: {
    forParent: {
      outputValues: TConstraints["contract"]["forParent"]["outputValues"] & {
        [K in keyof TSelectors]: ReturnType<TSelectors[K]>;
      };
    };
  };
};
type AddSelectorToUiContract<
  TConstraints extends ComponentConstraints,
  TSelectors extends Selectors<ComponentConstraints>,
> = ComponentConstraints & {
  contract: {
    forUi: {
      uiValues: TConstraints["contract"]["forUi"]["uiValues"] & {
        [K in keyof TSelectors]: ReturnType<TSelectors[K]>;
      };
    };
  };
};

const withSelectors =
  <TConstraints extends ComponentConstraints>(
    componentDef: ComponentDef<TConstraints>
  ) =>
  <
    TSelectorConfig extends { forUi?: boolean; forParent?: boolean } = {
      forUi: true;
      forParent: true;
    },
    TSelectors extends Selectors<TConstraints> = Selectors<TConstraints>,
  >(
    selectors: TSelectors
  ) => {
    const newBeingBuilt = {
      ...componentDef,
      selectors: {
        ...componentDef.selectors,
        ...selectors,
      },
    } as any; //TODO check with EXPERT why 'as any' is needed here;

    type NewComponentConstraints = AddSelectorToConstraints<
      TConstraints,
      TSelectors,
      TSelectorConfig
    >;
    return {
      build: () => newBeingBuilt as ComponentDef<NewComponentConstraints>,
    };
  };

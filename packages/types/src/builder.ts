import { T } from "vitest/dist/chunks/environment.d.cL3nLXbE.js";
import {
  ComponentConstraints,
  ComponentDef,
  OptionalValue,
  Selector,
  Selectors,
  State,
  Value,
} from "./softer-component-types";

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// componentDefBuilder
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//TODO remove () => if not needed
export const componentDefBuilder = () => ({
  withStateConstructor,
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
  stateConstructor: () => ({}),
  selectors: {},
  eventHandlers: {},
  children: {},
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// withStateConstructor
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const withStateConstructor = <
  TStateConstructor extends (constructWith: any) => State,
>(
  stateConstructor: TStateConstructor
) => {
  const newBeingBuilt = {
    stateConstructor,
    selectors: {},
    eventHandlers: {},
    children: {},
  } as any; //TODO check with EXPERT why 'as any' is needed here;

  type NewComponentConstraints = AddStateConstructorToConstraints<
    DefaultConstraints,
    TStateConstructor
  >;
  return {
    withSelectors: withSelectors<NewComponentConstraints>(newBeingBuilt),
    build: () => newBeingBuilt as ComponentDef<NewComponentConstraints>,
  };
};
type AddStateConstructorToConstraints<
  TConstraints extends ComponentConstraints,
  TStateConstructor extends (constructWith: any) => State,
> = Omit<TConstraints, "state" | "contract"> & {
  state: ReturnType<TStateConstructor>;
  contract: Omit<TConstraints["contract"], "forParent"> & {
    forParent: Omit<TConstraints["contract"]["forParent"], "constructWith"> & {
      constructWith: TStateConstructor extends (
        constructWith: infer TConstructWith
      ) => State
        ? TConstructWith
        : undefined;
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

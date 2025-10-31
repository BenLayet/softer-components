import { describe, expect, it } from "vitest";
import {
  AddSelectorsToConstraints,
  componentDefBuilder,
} from "../../types/src/builder";
import {
  ComponentConstraints,
  ComponentDef,
  ExtractForParentContract,
  ExtractUiContract as ExtractForUiContract,
  NewEventHandlers,
  Selector,
  Selectors,
} from "./softer-component-types";

const defaultComponentDef = {
  initialState: {},
  selectors: {},
  eventHandlers: {},
  children: {},
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Type testing utilities
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
export type Equal<X, Y> = X extends Y ? (Y extends X ? true : false) : false;
export type NotEqual<X, Y> = X extends Y ? (Y extends X ? false : true) : true;
export type Expect<T extends true> = T; // Test that two types are equal
let ignoreUnread: any;
if (ignoreUnread) {
  console.log(ignoreUnread);
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Type testing utilities
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
describe("componentDefBuilder", () => {
  it("returns a builder with withStateConstructor and build", () => {
    // WHEN
    const componentDef = componentDefBuilder().build();
    type ActualForUiContract = ExtractForUiContract<typeof componentDef>;
    type ActualForParentContract = ExtractForParentContract<
      typeof componentDef
    >;

    // THEN
    // Type check
    let v1: Equal<
      ActualForUiContract,
      { uiValues: {}; uiEvents: {}; children: {} }
    > = true;
    ignoreUnread = v1;

    let v2: Equal<
      ActualForParentContract,
      {
        outputValues: {};
        outputEvents: {};
        inputCommandEvents: {};
        constructWith: undefined;
      }
    > = true;
    ignoreUnread = v2;

    // Runtime check
    expect(componentDef.initialState).toEqual({}); // default state is empty object
    expect(componentDef.selectors).toEqual({});
    expect(componentDef.eventHandlers).toEqual({});
    expect(componentDef.children).toEqual({});
  });

  it("allows setting initialState with withInitialState", () => {
    // GIVEN
    const initialState = { count: 0 };
    // WHEN
    const componentDef = componentDefBuilder()
      .withInitialState(initialState)
      .build();
    type ActualForUiContract = ExtractForUiContract<typeof componentDef>;
    type ActualForParentContract = ExtractForParentContract<
      typeof componentDef
    >;

    // THEN
    // Type check
    let v1: Equal<
      ActualForUiContract,
      { uiValues: {}; uiEvents: {}; children: {} }
    > = true;
    ignoreUnread = v1;

    let v2: Equal<
      ActualForParentContract,
      {
        outputValues: {};
        outputEvents: {};
        inputCommandEvents: {};
        constructWith: undefined;
      }
    > = true;
    ignoreUnread = v2;

    // Runtime check
    expect(componentDef.initialState).toBe(initialState);
    expect(componentDef.selectors).toEqual({});
    expect(componentDef.eventHandlers).toEqual({});
    expect(componentDef.children).toEqual({});
  });

  it("allows adding one selector with withSelectors", () => {
    // GIVEN
    const initialState = { count: 0 };
    const selectors = {
      count: (state: typeof initialState) => state.count,
    };

    // WHEN
    const componentDef = componentDefBuilder()
      .withInitialState(initialState)
      .withSelectors(selectors)
      .build();
    type ActualComponentDef = typeof componentDef;

    type ActualForParentContract = ExtractForParentContract<
      typeof componentDef
    >;
    type ActualForUiContract = ExtractForUiContract<typeof componentDef>;

    //THEN
    type ExpectedUIContract = {
      uiValues: { count: number };
      uiEvents: {};
      children: {};
    };
    ignoreUnread as Expect<Equal<ActualForUiContract, ExpectedUIContract>>;

    type ExpectedForParentContract = {
      outputValues: { count: number };
      outputEvents: {};
      inputCommandEvents: {};
      constructWith: undefined;
    };
    ignoreUnread as Expect<
      Equal<ActualForParentContract, ExpectedForParentContract>
    >;

    type ExpectedComponentDef = ComponentDef<{
      state: typeof initialState;
      internalEvents: {};
      contract: {
        forUi: {
          uiValues: { count: number };
          children: {};
          uiEvents: {};
        };
        forParent: {
          outputValues: { count: number };
          outputEvents: {};
          inputCommandEvents: {};
          constructWith: undefined;
        };
      };
    }>;
    ignoreUnread as Expect<Equal<ActualComponentDef, ExpectedComponentDef>>;
    // Runtime check
    const selected = componentDef.selectors.count({ count: 42 });
    expect(selected).toBe(42);
  });

  it("allows adding one selector forUi with withSelectors", () => {
    // GIVEN
    const initialState = { count: 0 };
    const selectors = {
      count: (state: typeof initialState) => state.count,
    };

    // WHEN
    const componentDef = componentDefBuilder()
      .withInitialState(initialState)
      .withSelectors(selectors, { forUi: true })
      .build();
    type ActualComponentDef = typeof componentDef;
    type ActualForParentContract = ExtractForParentContract<
      typeof componentDef
    >;
    type ActualForUiContract = ExtractForUiContract<typeof componentDef>;

    //THEN

    ignoreUnread as Expect<
      Equal<ActualForUiContract["uiValues"], { count: number }>
    >;
    ignoreUnread as Expect<
      Equal<
        ActualForParentContract,
        {
          outputValues: {};
          outputEvents: {};
          inputCommandEvents: {};
          constructWith: undefined;
        }
      >
    >;

    type ExpectedComponentDef = ComponentDef<{
      state: typeof initialState;
      internalEvents: {};
      contract: {
        forUi: {
          uiValues: { count: number };
          children: {};
          uiEvents: {};
        };
        forParent: {
          outputValues: {};
          outputEvents: {};
          inputCommandEvents: {};
          constructWith: undefined;
        };
      };
    }>;
    ignoreUnread as Expect<Equal<ActualComponentDef, ExpectedComponentDef>>;
    // Runtime check
    const selected = componentDef.selectors.count({ count: 42 });
    expect(selected).toBe(42);
  });

  it("allows adding 3 selectors with withSelectors", () => {
    // GIVEN
    const initialState = { count: 0, name: "" };
    type MyState = typeof initialState;
    const selector1 = {
      count: (state: MyState) => state.count,
    };
    const selector2 = {
      name: (state: MyState) => state.name,
    };
    const selector3 = {
      both: (state: MyState) => state,
    };

    // WHEN
    const componentDef = componentDefBuilder()
      .withInitialState(initialState)
      .withSelectors(selector1, { forParent: true })
      .withSelectors(selector2, { forUi: true })
      .withSelectors(selector3)
      .build();
    type ActualComponentDef = typeof componentDef;

    //THEN
    type ExpectedComponentDef = ComponentDef<{
      state: typeof initialState;
      internalEvents: {};
      contract: {
        forUi: {
          uiValues: { name: string; both: MyState };
          children: {};
          uiEvents: {};
        };
        forParent: {
          outputValues: { count: number; both: MyState };
          outputEvents: {};
          inputCommandEvents: {};
          constructWith: undefined;
        };
      };
    }>;
    ignoreUnread as Expect<Equal<ActualComponentDef, ExpectedComponentDef>>;
    // Runtime check
    const count = componentDef.selectors.count({ count: 42, name: "test" });
    expect(count).toBe(42);
    const name = componentDef.selectors.name({ count: 42, name: "test" });
    expect(name).toBe("test");
  });

  it("allows setting one event handler", () => {
    // GIVEN
    const initialState = { count: 0 };
    const eventHandlers = {
      incrementByAmount: {
        stateUpdater: (state: typeof initialState, amount: number) => ({
          count: state.count + amount,
        }),
      },
    };

    // WHEN
    const componentDef = componentDefBuilder()
      .withInitialState(initialState)
      .withEventHandlers<typeof eventHandlers>(eventHandlers)
      .build();

    type ActualForUiContract = ExtractForUiContract<typeof componentDef>;
    type ActualForParentContract = ExtractForParentContract<
      typeof componentDef
    >;

    // THEN
    // Type check
    let v1: Equal<
      ActualForUiContract,
      { uiValues: {}; uiEvents: {}; children: {} }
    > = true;
    ignoreUnread = v1;

    let v2: Equal<
      ActualForParentContract,
      {
        outputValues: {};
        outputEvents: {};
        inputCommandEvents: {};
        constructWith: undefined;
      }
    > = true;
    ignoreUnread = v2;

    // Runtime check
    expect(componentDef.initialState).toBe(initialState);
    expect(componentDef.selectors).toEqual({});
    expect(componentDef.eventHandlers).toEqual({});
    expect(componentDef.children).toEqual({});
  });
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// TYPE UTILITIES TESTS
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
type MyState = { count: number };
type MyNumberSelector = (state: MyState) => number;
type MyStringSelector = (state: MyState) => string;
type MyConstraints = {
  state: MyState;
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
//////////////////////////////////////////////
//Selector assignments tests
/////////////////////////////////////////////

{
  type T1 = Expect<MyNumberSelector extends Selector<MyState> ? true : false>; // OK
  type T2 = Expect<MyStringSelector extends Selector<MyState> ? true : false>; // OK
  type T3 = Expect<
    { count: MyNumberSelector } extends Selectors<MyState> ? true : false
  >; // OK
  type T4 = Expect<
    {
      count: MyNumberSelector;
      str: MyStringSelector;
    } extends Selectors<MyState>
      ? true
      : false
  >; // OK
  type T5 = Expect<
    { count: MyNumberSelector } extends Selectors<MyConstraints["state"]>
      ? true
      : false
  >; // OK
}
//////////////////////////////////////////////
// AddSelectorsToConstraints tests
//////////////////////////////////////////////
{
  type C1 = AddSelectorsToConstraints<
    MyConstraints,
    { count: MyNumberSelector },
    { forUi: true; forParent: true }
  >;
}

//////////////////////////////////////////////
// AddEventHandlersToConstraints tests
//////////////////////////////////////////////
{
  type AddEventHandlersToConstraints<
    TConstraints extends ComponentConstraints,
    TEventHandlers extends NewEventHandlers<TConstraints>,
  > = Assign<
    TConstraints,
    {
      internalEvents: TEventHandlers;
    }
  >;

  type C2 = AddEventHandlersToConstraints<
    MyConstraints,
    {
      incrementByAmount: {
        stateUpdater: (state: MyState, amount: number) => MyState;
      };
    }
  >;
  type T1 = Expect<
    C2["internalEvents"] extends ComponentConstraints["internalEvents"]
      ? true
      : false
  >; // OK
  type T2 = Expect<
    MyConstraints["internalEvents"] extends ComponentConstraints["internalEvents"]
      ? true
      : false
  >; // OK
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Utility Types
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
type Assign<T, U> = Omit<T, keyof U> & U;

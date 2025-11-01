import { describe, expect, it } from "vitest";
import {
  AddEventHandlersToConstraints,
  AddSelectorsToConstraints,
  componentDefBuilder,
  DefaultConstraintsWithState,
  EventHandlersToEventsDef,
} from "../../types/src/builder";
import {
  EventHandlers,
  ExtractConstraints,
  ExtractContract,
  NewEventHandlers,
  OptionalValue,
  Selector,
  Selectors,
} from "./softer-component-types";
import { Equal, Expect, ignore } from "./type-testing-utiliy.test";

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Type testing utilities
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
describe("componentDefBuilder", () => {
  it("returns a builder with withStateConstructor and build", () => {
    // WHEN
    const componentDef = componentDefBuilder().build();
    type ActualContract = ExtractContract<typeof componentDef>;

    //THEN
    type ExpectedContract = {
      constructorArgument: undefined;
      selectorValues: {};
      eventPayloads: {};
      children: {};
    };
    type t1 = Expect<Equal<ActualContract, ExpectedContract>>;
    ignore.unread as t1;

    // Runtime check
    expect(componentDef.initialState).toEqual({}); // default state is empty object
    expect(componentDef.selectors).toEqual({});
    expect(componentDef.eventHandlers).toEqual({});
    expect(componentDef.children).toEqual({});
  });

  it("allows setting initialState with withInitialState", () => {
    // GIVEN
    const initialState = { count: 0 };
    type MyState = typeof initialState;

    // WHEN
    const componentDef = componentDefBuilder()
      .withInitialState(initialState)
      .build();

    type ActualContract = ExtractContract<typeof componentDef>;
    type ActualConstraints = ExtractConstraints<typeof componentDef>;

    // THEN
    type ExpectedContract = {
      constructorArgument: undefined;
      selectorValues: {};
      eventPayloads: {};
      children: {};
    };
    type t1 = Expect<Equal<ActualContract, ExpectedContract>>;
    ignore.unread as t1;

    type ExpectedConstraints = {
      internal: { state: MyState };
      contract: ExpectedContract;
    };
    type t2 = Expect<Equal<ActualConstraints, ExpectedConstraints>>;
    ignore.unread as t2;

    // Runtime check
    expect(componentDef.initialState).toBe(initialState);
    expect(componentDef.selectors).toEqual({});
    expect(componentDef.eventHandlers).toEqual({});
    expect(componentDef.children).toEqual({});
  });

  it("allows adding one selector with withSelectors", () => {
    // GIVEN
    const initialState = { count: 0 };
    type MyState = typeof initialState;
    const selectors = {
      count: (state: MyState) => state.count,
    };

    // WHEN
    const componentDef = componentDefBuilder()
      .withInitialState(initialState)
      .withSelectors(selectors)
      .build();
    type ActualContract = ExtractContract<typeof componentDef>;

    //THEN
    type ExpectedContract = {
      constructorArgument: undefined;
      selectorValues: { count: number };
      eventPayloads: {};
      children: {};
    };
    ignore.unread as Expect<Equal<ActualContract, ExpectedContract>>;

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
      .withSelectors(selector1)
      .withSelectors(selector2)
      .withSelectors(selector3)
      .build();
    type ActualContract = ExtractContract<typeof componentDef>;

    //THEN
    type ExpectedContract = {
      constructorArgument: undefined;
      selectorValues: { count: number; name: string; both: MyState };
      eventPayloads: {};
      children: {};
    };
    ignore.unread as Expect<Equal<ActualContract, ExpectedContract>>;

    // Runtime check
    const count = componentDef.selectors.count({ count: 42, name: "test" });
    expect(count).toBe(42);
    const name = componentDef.selectors.name({ count: 42, name: "test" });
    expect(name).toBe("test");
  });

  it("allows setting one event handler", () => {
    // GIVEN
    const initialState = { count: 0 };
    type MyState = typeof initialState;
    let builder1 = componentDefBuilder().withInitialState(initialState);

    const eventHandlers: NewEventHandlers<
      DefaultConstraintsWithState<MyState>
    > = {
      incrementByAmount: {
        stateUpdater: (state: MyState, amount: number) => ({
          count: state.count + amount,
        }),
      },
    };

    // WHEN
    let builder2 = builder1.withEventHandlers(eventHandlers);
    const componentDef = builder2.build();

    type ActualContract = ExtractContract<typeof componentDef>;
    type ActualEventPayload = ActualContract["eventPayloads"];

    // THEN
    type ExpectedContract = {
      constructorArgument: undefined;
      selectorValues: {};
      eventPayloads: { incrementByAmount: { payload: number } };
      children: {};
    };
    ignore.unread as Expect<Equal<ActualContract, ExpectedContract>>;

    // Runtime check
    expect(componentDef.initialState).toBe(initialState);
    expect(componentDef.selectors).toEqual({});
    expect(componentDef.eventHandlers).toEqual({});
    expect(componentDef.children).toEqual({});
  });
  it("allows setting two event handlers with a forwarder", () => {
    // GIVEN
    const initialState = { count: 0 };
    type MyState = typeof initialState;

    // WHEN
    const componentDef = componentDefBuilder()
      .withInitialState(initialState)
      .withStateUpdater(
        "incrementByAmount",
        (state: MyState, amount: number) => ({
          count: state.count + amount,
        })
      )
      .withEventForwarder("buttonClicked", "incrementByAmount")

      .withEventHandlers({
        incrementRequested: {
          stateUpdater: (state) => ({ count: state.count + 1 }),
        },
        buttonClicked: {
          forwarders: [{ to: "incrementRequested" }],
        },
      })
      .build();

    type ActualContract = ExtractContract<typeof componentDef>;

    // THEN
    type ExpectedContract = {
      constructorArgument: undefined;
      selectorValues: {};
      eventPayloads: { incrementByAmount: number };
      children: {};
    };
    ignore.unread as Expect<Equal<never, ExpectedContract>>;

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
  internal: { state: MyState };
  contract: {
    constructorArgument: undefined;
    selectorValues: {};
    eventPayloads: {};
    children: {};
  };
};
//////////////////////////////////////////////
//Selector assignments tests
/////////////////////////////////////////////

{
  type T1 = Expect<MyNumberSelector extends Selector<MyState> ? true : false>; // OK
  type T2 = Expect<MyStringSelector extends Selector<MyState> ? true : false>; // OK
  type T3 = Expect<
    { count: MyNumberSelector } extends Selectors<MyConstraints> ? true : false
  >; // OK
  type T4 = Expect<
    {
      count: MyNumberSelector;
      str: MyStringSelector;
    } extends Selectors<MyConstraints>
      ? true
      : false
  >; // OK
  type T5 = Expect<
    { count: MyNumberSelector } extends Selectors<MyConstraints> ? true : false
  >; // OK
}
//////////////////////////////////////////////
// AddSelectorsToConstraints tests
//////////////////////////////////////////////
{
  type C1 = AddSelectorsToConstraints<
    MyConstraints,
    { count: MyNumberSelector }
  >;
}

//////////////////////////////////////////////
// AddEventHandlersToConstraints tests
//////////////////////////////////////////////
{
  type N1 = NewEventHandlers<MyConstraints>;
  const newEventHandlers: N1 = {
    incrementByAmount: {
      stateUpdater: (state: MyState, amount: number) => ({
        count: state.count + amount,
      }),
    },
  };
  ignore.unread = newEventHandlers;
  type C1 = AddEventHandlersToConstraints<
    MyConstraints,
    typeof newEventHandlers
  >;
}
//////////////////////////////////////////////
// EventHandlersToEventsDef tests
//////////////////////////////////////////////
{
  const eventHandlers = {
    incrementByAmountRequested: {
      stateUpdater: (state: MyState, amount: number) => ({
        count: state.count + amount,
      }),
    },
    incrementRequested: {
      stateUpdater: (state: MyState) => ({
        count: state.count + 1,
      }),
      forwarders: [{ to: "incrementByAmountRequested" }],
    },
  } satisfies EventHandlers<MyState, any>;
  // CHECK
  type Actual = EventHandlersToEventsDef<typeof eventHandlers>;
  //payload of incrementByAmountRequested has the be a number
  //payload of incrementRequested does NOT have to be undefined, a Value is OK and would be ignored by the updater
  type Expected = {
    incrementByAmountRequested: number;
    incrementRequested: OptionalValue;
  };
  type T = Expect<Equal<Actual, Expected>>;
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Utility Types
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
type Assign<T, U> = Omit<T, keyof U> & U;

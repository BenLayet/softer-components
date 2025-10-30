import {
  ComponentDef,
  EventHandlers,
  Selector,
  ExtractEventsDef,
  ChildrenDef,
  EventForwarderDef,
  ExtractCommandsDef,
  Selectors,
  StateUpdater,
  EventsDef,
} from "./softer-component-types";
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// test utilities
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
let ignoreUnread: unknown = undefined;
export type Equal<X, Y> = X extends Y ? (Y extends X ? true : false) : false;
export type Expect<T extends true> = T; // Test that two types are equal

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GIVEN type definitions
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
type MyState = { count: number };
type MyEventsDef = {
  incrementRequested: { payload: number };
  decrementRequested: { payload: number };
  logRequested: { payload: string };
};
type MyCommandsDef = {
  reset: { payload: undefined };
};
type MyChildrenDef = ChildrenDef<MyState, MyEventsDef>;
type MyComponentDef = ComponentDef<
  MyState,
  MyEventsDef,
  MyCommandsDef
>;

type MySelectors = {
  count: Selector<MyState, number>;
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Expect 
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ExtractEventsDef
type TExtractEventsDef = Expect<Equal<MyEventsDef, ExtractEventsDef<MyComponentDef>>>;
ignoreUnread = null as any as TExtractEventsDef;
// ExtractCommandsDef
type TExtractCommandsDef = Expect<Equal<MyCommandsDef, ExtractCommandsDef<MyComponentDef>>>;
ignoreUnread = null as any as TExtractCommandsDef;


type BuiltFromParts = ComponentDef<
  MyComponentDef["initialState"] & {},
  ExtractEventsDef<MyComponentDef>,
  ExtractCommandsDef<MyComponentDef>
>;

/*
../../redux-adapter/src/softer-hooks.ts:53:39 - error TS2344: Type 'TSelectors[K]' does not satisfy the constraint '(...args: any) => any'.
  Type 'TSelectors[keyof TSelectors]' is not assignable to type '(...args: any) => any'.
    Type 'TSelectors[string] | TSelectors[number] | TSelectors[symbol]' is not assignable to type '(...args: any) => any'.
      Type 'TSelectors[string]' is not assignable to type '(...args: any) => any'.

53   [K in keyof TSelectors]: ReturnType<TSelectors[K]>;
                                         ~~~~~~~~~~~~~
*/

type ResolvedSelectors<TSelectors extends Selectors<any> | undefined> = TSelectors extends Selectors ? {
  [K in keyof TSelectors]: ReturnType<TSelectors[K]>;
} : {};
type S = MyComponentDef["selectors"];
type RS = ResolvedSelectors<S>;

type TestSelectors = Expect<Equal<RS, MySelectors>>;    




////////////////
//Test state updater
////////////////
const testStateUpdater: StateUpdater<{count:number}, number> = (state, payload) => ({ ...state, count: state.count + payload });
{

// Initial state definition
const initialState = {
  listName: "",
};

// Events type declaration
type ListSelectEvents = {
  listNameChanged: { payload: string };
  createNewListClicked: { payload: undefined };
  createNewListRequested: { payload: string };
  openPreviousListRequested: { payload: undefined };
};

// Component definition
export const listSelectDef = {
  initialState,
  selectors: {
    name: state => state.listName,
  },
  events: {
    listNameChanged: {
      stateUpdater: (state, payload) => ({ ...state, listName: payload }),
    },
    createNewListClicked: {
      forwarders: [
        {
          to: "createNewListRequested",
          withPayload: state => state.listName,
        },
      ],
    },
  },
} satisfies ComponentDef<typeof initialState, ListSelectEvents>;

type EventsDefToUiDispatchers<TEventsDef extends EventsDef | undefined> =
  TEventsDef extends EventsDef
    ? {
        [K in keyof TEventsDef &
          string]: TEventsDef[K]["payload"] extends undefined
          ? () => void
          : (payload: TEventsDef[K]["payload"]) => void;
      }
    : {};

    type E = ExtractEventsDef<typeof listSelectDef>;

    type UiD = EventsDefToUiDispatchers<ExtractEventsDef<typeof listSelectDef>>;

}




/////////////
// Test EventsDefToUiDispatchers
/////////////

type EventsDefToUiDispatchers<TEventsDef extends EventsDef | undefined> = TEventsDef extends EventsDef ? {
  [K in keyof TEventsDef & string]: TEventsDef[K]["payload"] extends undefined
    ? () => void
    : (payload: TEventsDef[K]["payload"]) => void;
} : {}  ;


type TComponentDef = Expect<Equal<ComponentDef, BuiltFromParts>>;






// ComponentDef type matches the defined MyComponentDef
const child1Def: ComponentDef<
  {},
  { clicked: { payload: undefined } }
> = {
  initialState: {},
  selectors: {},
  events: {
    clicked: {},
  },
  children: {},
};

const myComponentDef : ComponentDef<MyState, MyEventsDef, MyCommandsDef> = {
  initialState: { count: 0 },
  selectors: {
    count: (state) => state.count,
  },
  children: {
    child1: child1Def
  },
  events: {
    incrementRequested: {
      forwarders: [{
        to: "logRequested",
        onCondition: (state) => state.count > 10,
        //TODO withPayload should be compulsory here
      }],
    },
    decrementRequested: {},
  },
};
ignoreUnread = myComponentDef;

// Assert MyComponentDef is equal to ComponentDef built from its parts




















type T = Expect<Equal<MyComponentDef, ComponentDef<
  MyComponentDef["initialState"],
  ExtractEventsDef<MyComponentDef>,
  ExtractCommandsDef<MyComponentDef>,
>>>;
ignoreUnread = null as any as T;



///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GIVEN constants of previously defined types
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const initialState: MyState = { count: 0 };
const selectors: MySelectors = {
  count: (state) => state.count,
};
const children: MyChildrenDef = {
  child1: { initialState: {}, selectors: {}, events: {}, children: {} },
};
const events: EventHandlers<MyState, MyEventsDef> = {
  incrementRequested: {
    forwarders: [{
      to: "decrementRequested",
      onCondition: (state) => state.count > 10,
    }],
  },
  decrementRequested: {
  },
};

let myComponentDef: ComponentDef<
  MyState,
  MyEventsDef
> = {
  initialState,
  selectors,
  children,
  events,
};
ignoreUnread = myComponentDef;

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Assert AnyComponentDef accepts different ComponentDefs
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const anyComponentDef1: AnyComponentDef = myComponentDef;
ignoreUnread = anyComponentDef1;
function acceptAnyComponentDef(def: AnyComponentDef) {
  ignoreUnread = def;
}
acceptAnyComponentDef(myComponentDef);







xport const counterComponentDef = componentDefBuilder
  .initialState({
    count: 0,
  })
  .selectors({
    count: (state) => state.count,
  })
  .events<{
    incrementRequested: undefined;
    decrementRequested: undefined;
  }>({
    incrementRequested: {
      stateUpdater: (state) => ({ ...state, count: state.count + 1 }),
    },
    decrementRequested: {
      stateUpdater: (state) => ({ ...state, count: state.count - 1 }),
    }
  })
  .build();















///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Assert type of events is correct
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const event1: ChildrenDefToEvent<MyChildrenDef> = {
  type: "child1/incrementRequested",
  payload: 42,
};
const event2: PayloadsToEvent<MyPayloads> = {
  type: "decrementRequested",
  payload: 42,
};
ignoreUnread = event1;
ignoreUnread = event2;

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Assert EventForwarderDef onEvent and thenDispatch types are correct
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const outputEventForwarder: EventForwarderDef<
  MyState,
  PayloadsToEvent<MyPayloads>,
  ChildrenDefToEvent<MyChildrenDef>
> = {
  onEvent: "incrementRequested",
  thenDispatch: "child1/incrementRequested",
  withPayload: (_, previousPayload) => previousPayload + 1,
};
const inputEventForwarder: EventForwarderDef<
  MyState,
  ChildrenDefToEvent<MyChildrenDef>,
  PayloadsToEvent<MyPayloads>
> = {
  onEvent: "child1/decrementRequested",
  thenDispatch: "decrementRequested",
  withPayload: (_, previousPayload) => previousPayload + 1,
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Assert converting Payloads to Events and vice versa works
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Payload
type Test1 = Expect<
  Equal<MyPayloads, EventHandlersToPayloads<EventHandlers<any, MyPayloads>>>
>;
ignoreUnread = null as any as Test1;

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Assert ComponentDef is unchanged when converting Payloads to Events and Payloads
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//ComponentDef
type T1 = MyComponentDef["input"];
type T2 = ComponentDef<
  MyComponentDef["initialState"] & {},
  MyComponentDef["selectors"],
  EventHandlersToPayloads<MyComponentDef["events"]>,
  MyComponentDef["children"]
>["input"];
type Test3 = Expect<Equal<T1, T2>>;
ignoreUnread = null as any as Test3;

type Test4 = Expect<
  Equal<
    MyComponentDef["output"],
    ComponentDef<
      MyComponentDef["initialState"] & {},
      MyComponentDef["selectors"],
      EventHandlersToPayloads<MyComponentDef["events"]>,
      MyComponentDef["children"]
    >["output"]
  >
>;
ignoreUnread = null as any as Test4;

type Test5 = Expect<
  Equal<
    MyComponentDef,
    ComponentDef<
      MyComponentDef["initialState"] & {},
      MyComponentDef["selectors"],
      EventHandlersToPayloads<MyComponentDef["events"]>,
      MyComponentDef["children"]
    >
  >
>;
ignoreUnread = null as any as Test5;

const myComponentDef2: ComponentDef<
  MyComponentDef["initialState"] & {},
  MyComponentDef["selectors"],
  EventHandlersToPayloads<MyComponentDef["events"]>,
  MyComponentDef["children"]
> = myComponentDef;
ignoreUnread = myComponentDef2;

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Assert selectors can be changed, building a new ComponentDef
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
type MySelectors2 = {
  counterString: (state: MyState) => string;
};
const selectors2: MySelectors2 = {
  counterString: (state) => state.count.toString(),
};
const componentWithNewSelector: ComponentDef<
  MyComponentDef["initialState"] & {},
  MySelectors2,
  EventHandlersToPayloads<MyComponentDef["events"]>,
  MyComponentDef["children"]
> = {
  ...myComponentDef,
  selectors: selectors2,
};
ignoreUnread = componentWithNewSelector;

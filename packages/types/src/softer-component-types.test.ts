import {
  ComponentDef,
  EventForwarderDef,
  EventsDef,
  Event,
  PayloadsToEvent,
  Selector,
  InternalEventForwarderDef,
  EventsDefToPayloads,
  ChildrenDefToEvent,
  AnyComponentDef,
  ChildrenDef,
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
type MySelectors = {
  count: Selector<MyState, number>;
};
type MyPayloads = {
  incrementRequested: number;
  decrementRequested: number;
};
type MyChildrenDef = {
  child1: {
    componentDef: {
      events: {
        incrementRequested: {
          stateUpdater: (state: MyState, payload: number) => MyState;
        };
        decrementRequested: {
          stateUpdater: (state: MyState, payload: number) => MyState;
        };
      };
    };
  };
};
type MyComponentDef = ComponentDef<
  MyState,
  MySelectors,
  MyPayloads,
  MyChildrenDef
>;

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GIVEN constants of previously defined types
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const initialState: MyState = { count: 0 };
const selectors: MySelectors = {
  count: (state) => state.count,
};
const children: MyChildrenDef = {
  child1: {
    componentDef: {
      events: {
        incrementRequested: {
          stateUpdater: (state, payload) => ({ count: state.count + payload }),
        },
        decrementRequested: {
          stateUpdater: (state, payload) => ({ count: state.count - payload }),
        },
      },
    },
  },
};
const ifd: InternalEventForwarderDef<
  MyState,
  Event<"incrementRequested", number>,
  Event<"decrementRequested", number>
> = {
  to: "decrementRequested",
  onCondition: (state) => state.count > 10,
};
const events: EventsDef<MyState, MyPayloads> = {
  incrementRequested: {
    forwarders: [ifd],
  },
  decrementRequested: {
    forwarders: [
      {
        to: "incrementRequested",
        onCondition: (state) => state.count < 0,
      },
    ],
  },
};
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
// Assert output type is correct
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const output = [outputEventForwarder];
const input = [inputEventForwarder];
let myComponentDef: ComponentDef<
  MyState,
  MySelectors,
  MyPayloads,
  MyChildrenDef
> = {
  initialState,
  selectors,
  children,
  events,
  output,
  input,
};
ignoreUnread = myComponentDef;
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Assert converting Payloads to Events and vice versa works
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Payload
type Test1 = Expect<
  Equal<MyPayloads, EventsDefToPayloads<EventsDef<any, MyPayloads>>>
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
  EventsDefToPayloads<MyComponentDef["events"]>,
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
      EventsDefToPayloads<MyComponentDef["events"]>,
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
      EventsDefToPayloads<MyComponentDef["events"]>,
      MyComponentDef["children"]
    >
  >
>;
ignoreUnread = null as any as Test5;

const myComponentDef2: ComponentDef<
  MyComponentDef["initialState"] & {},
  MyComponentDef["selectors"],
  EventsDefToPayloads<MyComponentDef["events"]>,
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
  EventsDefToPayloads<MyComponentDef["events"]>,
  MyComponentDef["children"]
> = {
  ...myComponentDef,
  selectors: selectors2,
};
ignoreUnread = componentWithNewSelector;

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Assert AnyComponentDef accepts different ComponentDefs
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const anyComponentDef1: AnyComponentDef = myComponentDef;
ignoreUnread = anyComponentDef1;

const anyComponentDef2: AnyComponentDef = componentWithNewSelector;
ignoreUnread = anyComponentDef2;

function acceptAnyComponentDef(def: AnyComponentDef) {
  ignoreUnread = def;
}
acceptAnyComponentDef(myComponentDef);
acceptAnyComponentDef(componentWithNewSelector);

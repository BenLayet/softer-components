import { OptionalValue } from "../dist";
import { Equal, Expect, ignore, NotEqual } from "./type-testing-utiliy-test";
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Covariant, Contravariant, Invariant type tests
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
type Covariant<T> = { covariant: T };
type Contravariant<T> = { contravariant: (arg: T) => void };

type Invariant<T> = { covariant: T; contravariant: (arg: T) => void };

let a: Invariant<string> = {
  covariant: "yes",
  contravariant: (arg: string) => {
    console.log(arg);
  },
};
let b: Invariant<"hello"> = {
  covariant: "hello",
  contravariant: (arg: "hello") => {
    console.log(arg);
  },
};
let c: Invariant<any> = {
  covariant: true,
  contravariant: (arg: string) => {
    console.log(arg);
  },
};

//@ts-expect-error
b = a; // Error
//@ts-expect-error
a = b; // Error
b = c; // OK
c = b; // OK
a = c; // OK
c = a; // OK

function testAny<I extends Invariant<any>>(arg: I) {
  console.log(arg);
}

testAny(a);
testAny(b); // OK
testAny(c); // OK

function testString<I extends Invariant<string>>(arg: I) {
  console.log(arg);
}

testString(a); // OK
//@ts-expect-error
testString(b); // Error
testString(c); // OK

function testHello<I extends Invariant<"hello">>(arg: I) {
  console.log(arg);
}

//@ts-expect-error
testHello(a); // Error
testHello(b); // OK
testHello(c); // OK

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Array covariance 'bug'
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

let stringArray: string[];
let oneTwoThreeArray: "one"[] = ["one"];

stringArray = oneTwoThreeArray; // OK !!!
stringArray[0] = "two"; // OK !!!

const first = oneTwoThreeArray[0]; // "two" inferred as "one"
//@ts-expect-error
oneTwoThreeArray[0] = "four"; // Error
//@ts-expect-error
oneTwoThreeArray = stringArray; // Error

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// never type tests
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
{
  type A = {
    b: never;
  };
  type T = Expect<NotEqual<A, never>>; // never does not propagate through object types
  ignore.unread as T;
}
{
  // Object types preserve structure, even with never properties
  type ObjectWithNever = {
    validProp: string;
    impossibleProp: never; // This property can never exist
  };

  // The object type itself is valid, just one property is impossible
  type IsObject = Expect<NotEqual<ObjectWithNever, never>>; // ✅ true

  // I CANNOT create the object with the impossible property
  // @ts-expect-error
  const obj: ObjectWithNever = {
    validProp: "hello",
    // impossibleProp: // Cannot assign anything here
  };
  ignore.unread = obj;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// withStateConstructor
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
{
  type Value = number | string;
  type State = Value;
  type StateConstructor = (constructWith: Value) => State;
  const constructor: (constructWith: string) => number = parseInt;

  function withStateConstructor<
    TStateConstructor extends (constructWith: any) => State,
  >(stateConstructor: TStateConstructor) {
    type S = ReturnType<TStateConstructor>;
    const newBeingBuilt: ComponentDef<S> = {
      stateConstructor: stateConstructor as any, //TODO check with EXPERT why 'as any' is needed here
    };

    return {
      build: () => newBeingBuilt,
    };
  }

  type ComponentDef<T extends State = State> = {
    stateConstructor: (constructWith: any) => T;
  };

  type Test1 = Expect<string extends State ? true : false>; // ✅ true
  type Test2 = Expect<
    string extends ReturnType<(constructWith: any) => State> ? true : false
  >; // ✅ true
  type Test3 = Expect<
    Value extends ReturnType<(constructWith: any) => State> ? true : false
  >; // ✅ true
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Nested intersections type tests
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
{
  type A = { level1: { level2: { a: string } } };
  type B = { level1: { level2: { b: number } } };
  type C = A & B;
  const c: C = {
    level1: {
      level2: {
        a: "hello",
        b: 42,
      },
    },
  };
  type Test1 = Expect<Equal<C["level1"]["level2"]["a"], string>>; // ✅ true
  type Test2 = Expect<Equal<C["level1"]["level2"]["b"], number>>; // ✅ true
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Recursive type builder
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
{
  function recursiveTypeBuilder<T extends object>(
    obj: T
  ): {
    addProperty<K extends string, V>(
      key: K,
      value: V
    ): ReturnType<typeof recursiveTypeBuilder<T & { [P in K]: V }>>;
    build(): T;
  } {
    return {
      addProperty<K extends string, V>(
        key: K,
        value: V
      ): ReturnType<typeof recursiveTypeBuilder<T & { [P in K]: V }>> {
        const newObj = {
          ...obj,
          [key]: value,
        } as T & { [P in K]: V };
        return recursiveTypeBuilder(newObj);
      },
      build(): T {
        return obj;
      },
    };
  }

  const built = recursiveTypeBuilder({})
    .addProperty("name", "Alice")
    .addProperty("age", 30)
    .build();

  type Test1 = Expect<Equal<typeof built, { name: string; age: number }>>; // ✅ true
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Unused generic type parameters are bivariant but can be useful
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
{
  type ObjectWithUnusedConfig<Config, T> = { value: T };
  type UnusedConfigIsBivariant1 = Expect<
    ObjectWithUnusedConfig<boolean, string> extends { value: string }
      ? true
      : false
  >;
  type UnusedConfigIsBivariant2 = Expect<
    { value: string } extends ObjectWithUnusedConfig<boolean, string>
      ? true
      : false
  >;
  type ExtractConfig<C> =
    C extends ObjectWithUnusedConfig<infer Config, any> ? Config : never;

  type T = ExtractConfig<ObjectWithUnusedConfig<number, string>>;
  type ButCanBeExtracted = Expect<
    Equal<number, ExtractConfig<ObjectWithUnusedConfig<number, string>>>
  >;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// functions with generic and default type parameters, and can be useful
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
{
  type ObjectWithUnusedConfig<Config, T> = {
    value: T;
  };
  type UnusedConfigIsBivariant1 = Expect<
    ObjectWithUnusedConfig<boolean, string> extends { value: string }
      ? true
      : false
  >;
  type UnusedConfigIsBivariant2 = Expect<
    { value: string } extends ObjectWithUnusedConfig<boolean, string>
      ? true
      : false
  >;
  type ExtractConfig<C> =
    C extends ObjectWithUnusedConfig<infer Config, any> ? Config : never;
  type ButCanBeExtracted = Expect<
    NotEqual<
      ExtractConfig<ObjectWithUnusedConfig<boolean, string>>,
      ExtractConfig<ObjectWithUnusedConfig<number, string>>
    >
  >;
  type ConfigIsBivariant2 = Expect<
    boolean extends ExtractConfig<ObjectWithUnusedConfig<boolean, string>>
      ? true
      : false
  >;

  function genericFunction<Config = {}, T = string>(
    arg?: T
  ): ObjectWithUnusedConfig<Config, T> {
    return { value: arg as T };
  }
  const result1 = genericFunction(); // Uses default types
  const result2 = genericFunction<{}, number>(42); // Uses default Config, T as number
  const result3 = genericFunction<{ forUi: true; forParent: false }, boolean>(
    true
  ); // Both Config and T specified

  type Test1 = Expect<
    Equal<typeof result1, ObjectWithUnusedConfig<{}, string>>
  >; // ✅ true

  type Test2 = Expect<
    Equal<
      typeof result2,
      ObjectWithUnusedConfig<{ forUi: boolean; forParent: boolean }, number>
    >
  >; // ✅ true

  type Test3 = Expect<
    Equal<
      typeof result3,
      ObjectWithUnusedConfig<{ forUi: true; forParent: false }, boolean>
    >
  >; // ✅ true
}
////////////////////////////////////////////////////////////////////////////////////////////////
// withInitialState
////////////////////////////////////////////////////////////////////////////////////////////////
{
  const test: Exclude<string, "one"> = "one" as const;
  ignore.unread = test;
  type Test3 = Expect<Equal<Exclude<string, "one">, string>>;
  ignore.unread as Test3;
}

////////////////////////////////////////////////////////////////////////////////////////////////
// satisfies
////////////////////////////////////////////////////////////////////////////////////////////////
{
  type ComponentDef<TState = {}> = {
    initialState: TState;
    selector: (state: TState) => any;
  };

  const componentDef = {
    initialState: { count: 0 },
    selector: (state) => state.count,
  } satisfies ComponentDef<{ count: number }>;
}

////////////////////////////////////////////////////////////////////////////////////////////////
// Partial type parameter resolution
////////////////////////////////////////////////////////////////////////////////////////////////
{
  type ComponentContract = {
    a: string;
    b: number;
  };
  const test: Partial<ComponentContract> = { a: "hello" };
  ignore.unread = test;
  type ComponentDef<TPartialContract extends Partial<ComponentContract>> = {
    readonly contract: TPartialContract;
  };

  const def: ComponentDef<{}> = {
    contract: {},
  };
}

////////////////////////////////////////////////////////////////////////////////////////////////
// Bounded fields type check with satisfies
////////////////////////////////////////////////////////////////////////////////////////////////
{
  type EventsContract = Record<
    string,
    { payload: string | number | undefined }
  >;
  type ComponentDef<TEventContract extends EventsContract = EventsContract> = {
    payloadFactories: {
      [K in keyof TEventContract]: (
        payload: TEventContract[K]["payload"]
      ) => TEventContract[K]["payload"];
    };
    stateUpdater?: {
      [K in keyof TEventContract]?: (
        state: {},
        payload: TEventContract[K]["payload"]
      ) => {};
    };
    eventForwarders?: {
      from: keyof TEventContract;
      to: keyof TEventContract;
      withPayload?: (state: {}) => TEventContract[keyof TEventContract]["payload"];
    };
  };

  function componentDefConsumer<TComponentDef extends ComponentDef<any>>(
    def: TComponentDef
  ) {
    ignore.unread = def;
  }

  const componentDef: ComponentDef<{
    eventA: { payload: string };
    eventB: { payload: number };
  }> = {
    payloadFactories: {
      eventA: (payload: string) => payload,
      eventB: (payload: number) => payload,
    },
    stateUpdater: {
      eventA: (state: {}, payload: string) => ({ ...state, payload }),
      // eventB: (state, payload: string) => state, // This would cause a type error
    },
  };
  componentDefConsumer(componentDef);
}

////////////////////////////////////////////////////////////////////////////////////////////////
// Children event matching listeners
////////////////////////////////////////////////////////////////////////////////////////////////
{
  type EventsContract = Record<
    string,
    { payload: string | number | undefined }
  >;
  type ChildrenEventContract = Record<string, EventsContract>;
  type ComponentDef<
    TEventContract extends EventsContract,
    TChildrenEventContract extends ChildrenEventContract = {},
  > = {
    payloadFactories: {
      [K in keyof TEventContract]: (
        payload: TEventContract[K]["payload"]
      ) => TEventContract[K]["payload"];
    };
    children: {
      [childName in keyof TChildrenEventContract]: {
        componentDef: ComponentDef<TChildrenEventContract[childName], any>;
        listeners: Array<{
          from: keyof TChildrenEventContract[childName];
          to: keyof TEventContract;
          withPayload?: (state: {}) => TEventContract[keyof TEventContract]["payload"];
        }>;
      };
    };
  };

  const childComponentDef: ComponentDef<{
    eventA: { payload: string };
  }> = {
    payloadFactories: {
      eventA: (payload: string) => payload,
    },
    children: {},
  };

  const parentComponentDef: ComponentDef<
    {
      eventB: { payload: string };
    },
    {
      childComponent: {
        eventA: { payload: string };
      };
    }
  > = {
    payloadFactories: {
      eventB: (payload: string) => payload,
    },
    children: {
      childComponent: {
        componentDef: childComponentDef,
        listeners: [
          {
            from: "eventA",
            to: "eventB",
            withPayload: (state: {}) => "forwarded payload",
          },
        ],
      },
    },
  };
}

////////////////////////////////////////////////////////////////////////////////////////////////
// Children event matching listeners - simplified
////////////////////////////////////////////////////////////////////////////////////////////////
type ChildDef<S = {}> = {
  a: S;
  b: S;
};

type ExtractS<C> = C extends ChildDef<infer S> ? S : never;

type ChildWithContext<TChildDef extends ChildDef<any>> = {
  def: TChildDef;
  context: ExtractS<TChildDef>;
};

type ComponentDef = {
  children: {
    [childName in string]: ChildWithContext<ChildDef<any>>;
  };
};

const componentDef: ComponentDef = {
  children: {
    child1: { def: { a: 1, b: 2 }, context: 1 }, // ✅ context is number
    child2: { def: { a: "hello", b: "world" }, context: 12 }, // ✅ context is string
  },
};
{
  type ChildDef<S = {}> = {
    a: S;
    b: S;
  };

  // Or more simply with a helper:
  type ChildEntry<S> = {
    def: ChildDef<S>;
    context: S;
  };

  type ComponentDef2 = {
    children: {
      [childName in string]: ChildEntry<any>;
    };
  };

  const componentDef2: ComponentDef2 = {
    children: {
      child1: { def: { a: 1, b: 2 }, context: 1 }, // ✅ context is number
      child2: { def: { a: "hello", b: "world" }, context: "hi" }, // ✅ context is string
      // child3: { def: { a: 1, b: 2 }, context: "wrong" },     // ❌ Type error
    },
  };
}
//////////////////////////////////////////////////////////////////////////////////////////////////
// EventsContractToEventUnion
//////////////////////////////////////////////////////////////////////////////////////////////////
{
  type Value =
    | string
    | number
    | boolean
    | Date
    | null
    | { readonly [key: string]: Value }
    | readonly Value[];

  type OptionalValue = Value | undefined;
  type Payload = OptionalValue;

  type Event<
    TEventName extends string = string,
    TPayload extends Payload = Payload,
  > = {
    readonly type: TEventName;
    readonly payload: TPayload;
  };

  type ComponentEventsContract = Record<string, { payload: OptionalValue }>;
  type EventsContractToEventUnion<
    TComponentEventsContract extends ComponentEventsContract,
  > = {
    [TEventName in keyof TComponentEventsContract & string]: Event<
      TEventName,
      TComponentEventsContract[TEventName]["payload"]
    >;
  }[keyof TComponentEventsContract & string];
  type ListEventUnion =
    | { type: "nextItemNameChanged"; payload: string }
    | { type: "nextItemSubmitted"; payload: undefined };
  type ListEvents = {
    nextItemNameChanged: { payload: string };
    nextItemSubmitted: { payload: undefined };
  };

  let event1: EventsContractToEventUnion<ListEvents> = {
    type: "nextItemNameChanged",
    payload: "milk",
  };
  let event2: EventsContractToEventUnion<ListEvents> = {
    type: "nextItemSubmitted",
    payload: undefined,
  };
  let event1b: ListEventUnion = {
    type: "nextItemNameChanged",
    payload: "milk",
  };
  let event2b: ListEventUnion = {
    type: "nextItemSubmitted",
    payload: undefined,
  };
  ignore.unread = event1 = event1b = event2 = event2b;

  type Extracted = EventsContractToEventUnion<ListEvents>;

  ignore.unread as Expect<Extracted extends ListEventUnion ? true : false>;
  ignore.unread as Expect<ListEventUnion extends Extracted ? true : false>;
  ignore.unread as Expect<Equal<ListEventUnion, Extracted>>;
  ignore.unread as Expect<Equal<Extracted, ListEventUnion>>;
  ignore.unread as Expect<Equal<ListEventUnion, ListEventUnion>>;
  ignore.unread as Expect<Equal<ListEventUnion, ListEventUnion>>;
}
///////////////////////////////////////////////////////////////////////////////////////////////////
// Distibution EventUnionToEventUnion
///////////////////////////////////////////////////////////////////////////////////////////////////
{
  type Value =
    | string
    | number
    | boolean
    | Date
    | null
    | { readonly [key: string]: Value }
    | readonly Value[];

  type OptionalValue = Value | undefined;
  type Payload = OptionalValue;
  type State = OptionalValue;
  type WithPayloadDef<
    TState extends State,
    TFromPayload extends Payload,
    TToPayload extends Payload,
  > = TToPayload extends undefined
    ? {
        readonly withPayload?: never;
      }
    : TFromPayload extends TToPayload
      ? {
          readonly withPayload?: (
            state: TState & {},
            payload: TFromPayload
          ) => TToPayload;
        }
      : {
          readonly withPayload: (
            state: TState & {}, //TODO use ResolvedSelectors instead of TState
            payload: TFromPayload
          ) => TToPayload;
        };

  type T1 = WithPayloadDef<string, string, string>;
  ignore.unread as T1;
  type T2 = WithPayloadDef<string, number, string>;
  ignore.unread as T2;
  type T3 = WithPayloadDef<string, number, undefined>;
  ignore.unread as T3;
  const c1: T3 = {}; // withPayload is optional
  ignore.unread = c1;
  //const c2: T3 = { withPayload: () => {} }; // withPayload cannot be provided)};
}
////////////////////////////////////////////////////////////////////////////////////////////////////////
// Circular type references in type tests
////////////////////////////////////////////////////////////////////////////////////////////////////////
{
  type A = { b: B };
  type B = { a: A };

  const a: A = { b: { a: { b: { a: { b: {} as B } } } } };
  ignore.unread = a;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////
// Bivariant type parameters, with permissive defaults
////////////////////////////////////////////////////////////////////////////////////////////////////////
{
  //
  type ComponentDef<TValue extends {} = any> = {
    selector: () => TValue;
    updater: (values: TValue) => void;
  };

  const t1: ComponentDef<string> extends ComponentDef ? true : false = true;
  ignore.unread = a;

  const t2: ComponentDef = {
    selector: () => 42,
    updater: (values) => {
      console.log(values);
    },
  };
  ignore.unread = t2;
}

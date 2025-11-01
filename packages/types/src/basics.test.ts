import { Equal, Expect, ignore, NotEqual } from "./type-testing-utiliy.test";
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

  type ComponentDef<T extends State = State> = {
    stateConstructor: (constructWith: any) => T;
  };

  function withStateConstructor<
    TStateConstructor extends (constructWith: Value) => State,
  >(stateConstructor: TStateConstructor) {
    type S = ReturnType<TStateConstructor>;
    const newBeingBuilt: ComponentDef<S> = {
      stateConstructor,
    };

    return {
      build: () => newBeingBuilt,
    };
  }

  type Test1 = Expect<string extends State ? true : false>; // ✅ true
  type Test2 = Expect<
    string extends ReturnType<(constructWith: any) => State> ? true : false
  >; // ✅ true
  type Test3 = Expect<
    Value extends ReturnType<(constructWith: any) => State> ? true : false
  >; // ✅ true
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

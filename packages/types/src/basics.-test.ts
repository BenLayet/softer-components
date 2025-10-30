//type DoNothing<T> = { a:string};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// test utilities
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
let ignoreUnread: unknown = undefined;
export type Equal<X, Y> = X extends Y ? (Y extends X ? true : false) : false;
export type NotEqual<X, Y> = X extends Y ? (Y extends X ? false : true) : true;
export type Expect<T extends true> = T; // Test that two types are equal
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
  ignoreUnread = obj;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// withStateConstructor
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
{
  type Value = number | string;
  type State = Value;
  type StateConstructor = (constructWith: Value) => State;

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
  type A = { level1: { level2: { a: undefined } } };
  type B = { level1: { level2: { a: number } } };
  type C = A & B;
  const c: C = {
    level1: {
      level2: {
        a: "hello",
      },
    },
  };
  type Test1 = Expect<Equal<C["level1"]["level2"]["a"], string>>; // ✅ true
  type Test2 = Expect<Equal<C["level1"]["level2"]["b"], number>>; // ✅ true
}

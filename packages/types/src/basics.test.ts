//type DoNothing<T> = { a:string};

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

b = a; // Error
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
testString(b); // Error
testString(c); // OK

function testHello<I extends Invariant<"hello">>(arg: I) {
  console.log(arg);
}

testHello(a); // Error
testHello(b); // OK
testHello(c); // OK

let stringArray: string[];
let oneTwoThreeArray: "one"[] = ["one"];

stringArray = oneTwoThreeArray; // OK !!!
stringArray[0] = "two"; // OK !!!

const first = oneTwoThreeArray[0]; // "two" inferred as "one"
//@ts-expect-error
oneTwoThreeArray[0] = "four"; // Error
//@ts-expect-error
oneTwoThreeArray = stringArray; // Error

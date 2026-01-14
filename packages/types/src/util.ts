export type IfAny<T, Y, N> = 0 extends 1 & T ? Y : N;
export type IsAny<T> = IfAny<T, true, false>;

/*
type T = IsAny<any>; // true
type F = IsAny<string>; // false
type F2 = IsAny<boolean>; // false
type F3 = IsAny<unknown>; // false

*/

// --- utilities to detect `any` and branch in conditional types ---
// Detect `any`: true when T is `any`, false otherwise
export type IsAny<T> = 0 extends 1 & T ? true : false;
// IfAny: choose one of two branches depending on whether T is `any`
export type IfAny<T, Y, N = never> = IsAny<T> extends true ? Y : N;
export type IsNonEmptyRecord<T> =
  T extends Record<any, any>
    ? [keyof T] extends [never]
      ? false
      : true
    : false;
export type IfNonEmptyRecord<T, Then, Else = never> =
  IsNonEmptyRecord<T> extends true ? Then : Else;
/*
TODO remove tests
type Contract = {events: {allEvents: string[]}};
const t2 :IsNonEmptyRecord<{}> = false;
const t3 :IsNonEmptyRecord<Contract> = true;
const t4 :IsNonEmptyRecord<Contract["events"]> = true;
const t5 :IsNonEmptyRecord<Contract["values"]> = false;

 */

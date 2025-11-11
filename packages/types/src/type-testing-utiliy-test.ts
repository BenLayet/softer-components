///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Type testing utilities
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
export const ignore: { unread: any } = { unread: undefined };
type _IsNever<X> = [X] extends [never] ? true : false;
type _IsAnyNever<X, Y> = _IsNever<X> extends true ? true : _IsNever<Y>;
type _AreBothNever<X, Y> = _IsNever<X> extends false ? false : _IsNever<Y>;
type _EqualKnowingNeitherIsNever<X, Y> = [X] extends [Y]
  ? [Y] extends [X]
    ? true
    : false
  : false;
export type Equal<X, Y> =
  _IsAnyNever<X, Y> extends true
    ? _AreBothNever<X, Y> extends true
      ? true
      : false
    : _EqualKnowingNeitherIsNever<X, Y>;
export type NotEqual<X, Y> = Equal<X, Y> extends true ? false : true;
export type Expect<T extends Exclude<true, never>> = T; // Test that two types are equal

// should not be marked as error in IDE
ignore.unread as Expect<NotEqual<never, {}>>;
ignore.unread as Expect<Equal<never, never>>;
ignore.unread as Expect<Equal<string, string>>;
ignore.unread as Expect<NotEqual<string, number>>;
ignore.unread as Expect<Equal<"a", "a">>;
ignore.unread as Expect<Equal<"a" | "b", "a" | "b">>;
const test1: _IsAnyNever<never, {}> = true;
ignore.unread = test1;
const test2: Equal<never, {}> = false;
ignore.unread = test2;
const test3: _IsNever<never> = true;
ignore.unread = test3;

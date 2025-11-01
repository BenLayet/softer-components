///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Type testing utilities
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
export const ignore: { unread: any } = { unread: undefined };
type _EqualOrNever<X, Y> = X extends Y ? (Y extends X ? true : false) : false;
export type Equal<X, Y> =
  _EqualOrNever<X, Y> extends never ? false : _EqualOrNever<X, Y>;
export type NotEqual<X, Y> = Equal<X, Y> extends true ? false : true;
export type Expect<T extends Exclude<true, never>> = T; // Test that two types are equal

type test = Expect<NotEqual<never, {}>>; // should not be marked as error in IDE
ignore.unread as test;

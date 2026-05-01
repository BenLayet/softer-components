export function assertIsNotUndefined<T>(
  value: T | undefined,
): asserts value is T {
  if (value === undefined) throw new Error("value should not be undefined");
}

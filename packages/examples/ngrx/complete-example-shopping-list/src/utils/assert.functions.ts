export function assertIsNotUndefined<T>(value: T | undefined): asserts value is T {
  if (value === undefined) throw new Error("value should not be undefined");
}
export function throwIfUndefined<T>(
  value: T | undefined,
  errorMessage = "value should not be undefined",
): T {
  if (value === undefined) throw new Error(errorMessage);
  return value;
}

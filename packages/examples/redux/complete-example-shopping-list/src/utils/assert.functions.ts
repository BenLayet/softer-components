export function assertIsNotUndefined<T>(
  value: T | undefined,
  errorMessage = "value should not be undefined",
): asserts value is T {
  if (value === undefined) throw new Error(errorMessage);
}
export function throwIfUndefined<T>(
  value: T | undefined,
  errorMessage = "value should not be undefined",
): T {
  if (value === undefined) throw new Error(errorMessage);
  return value;
}

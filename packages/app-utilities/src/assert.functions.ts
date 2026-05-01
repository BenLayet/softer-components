export function assertIsNotUndefined<T>(
  value: T | undefined,
  message?: string,
): asserts value is T {
  if (typeof value === "undefined") {
    throw new Error(message ?? "Value is not defined");
  }
}

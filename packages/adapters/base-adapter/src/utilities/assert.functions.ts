export const isUndefined = (value: any) => typeof value === "undefined";
export function isNotUndefined<T>(value: T | undefined | void): value is T {
  return !isUndefined(value);
}

export function assertIsNotUndefined<T>(
  value: T | undefined,
  message?: string,
): asserts value is T {
  if (isUndefined(value)) {
    throw new Error(message ?? "Value is not defined");
  }
}
export function assertIsNotSymbol<T>(
  value: T | symbol,
  message?: string,
): asserts value is T {
  if (typeof value === "symbol") {
    throw new Error(message ?? "Value should not be a symbol");
  }
}

export function assertIsSymbol<T>(
  value: T | symbol,
  message?: string,
): asserts value is symbol {
  if (typeof value !== "symbol") {
    throw new Error(message ?? "Value should be a symbol");
  }
}

// A variant that throws and also returns the narrowed value for convenience.
export function ensureIsNotUndefined<T>(
  value: T | undefined,
  message?: string,
): T {
  assertIsNotUndefined(value, message);
  return value;
}

export function assertIsArray(
  value: unknown,
  message?: string,
): asserts value is any[] {
  if (!Array.isArray(value)) {
    throw new Error(message ?? `Expected array, got ${typeof value}`);
  }
}

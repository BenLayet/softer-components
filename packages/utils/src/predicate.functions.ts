export const not = (predicate: (value: any) => boolean) => {
  return (value: any) => !predicate(value);
};
export const and = (...predicates: Array<(value: any) => boolean>) => {
  return (value: any) => predicates.every((predicate) => predicate(value));
};
export const or = (...predicates: Array<(value: any) => boolean>) => {
  return (value: any) => predicates.some((predicate) => predicate(value));
};

export const isNull = (value: any) => value === null;
export const isNotNull = not(isNull);
export const isUndefined = (value: any) => typeof value === "undefined";
export function isNotUndefined<T>(value: T | undefined | void): value is T {
  return !isUndefined(value);
}

export function assertIsNotUndefined<T>(
  value: T | undefined,
  message?: string
): asserts value is T {
  if (isUndefined(value)) {
    throw new Error(message || "Value is not defined");
  }
}

export function assertIsString(
  value: unknown,
  message?: string
): asserts value is string {
  if (typeof value !== "string") {
    throw new Error(message || `Expected string, got ${typeof value}`);
  }
}

export function assertIsNumber(
  value: unknown,
  message?: string
): asserts value is number {
  if (typeof value !== "number") {
    throw new Error(message || `Expected number, got ${typeof value}`);
  }
}

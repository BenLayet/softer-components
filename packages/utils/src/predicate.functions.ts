export const not = <T = any>(predicate: (value: T) => boolean) => {
  return (value: T) => !predicate(value);
};
export const and = <T = any>(...predicates: Array<(value: T) => boolean>) => {
  return (value: T) => predicates.every(predicate => predicate(value));
};
export const or = <T = any>(...predicates: Array<(value: T) => boolean>) => {
  return (value: T) => predicates.some(predicate => predicate(value));
};

export const isEmptyString = (value: any) => value === "";
export const isNotEmptyString = not(isEmptyString);
export const isNull = (value: any) => value === null;
export const isNotNull = not(isNull);
export const isUndefined = (value: any) => typeof value === "undefined";
export function isNotUndefined<T>(value: T | undefined | void): value is T {
  return !isUndefined(value);
}

export function assertValueIsUndefined<T>(
  container: { [key: string]: T | undefined },
  message?: string,
): asserts container is { [key: string]: undefined } {
  if (isNotUndefined(Object.values(container)[0])) {
    throw new Error(
      message ||
        `Value of ${Object.keys(container)[0]} is not undefined when it should be`,
    );
  }
}

export function assertValueIsNotUndefined<T>(
  container: { [key: string]: T | undefined },
  message?: string,
): asserts container is { [key: string]: T } {
  if (isUndefined(Object.values(container)[0])) {
    throw new Error(
      message || `- Value of ${Object.keys(container)[0]} is not defined`,
    );
  }
}

export function assertIsNotUndefined<T>(
  value: T | undefined,
  message?: string,
): asserts value is T {
  if (isUndefined(value)) {
    throw new Error(message || "Value is not defined");
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

export function assertIsString(
  value: unknown,
  message?: string,
): asserts value is string {
  if (typeof value !== "string") {
    throw new Error(message || `Expected string, got ${typeof value}`);
  }
}

export function assertIsNumber(
  value: unknown,
  message?: string,
): asserts value is number {
  if (typeof value !== "number") {
    throw new Error(message || `Expected number, got ${typeof value}`);
  }
}

export function assertIsArray(
  value: unknown,
  message?: string,
): asserts value is any[] {
  if (!Array.isArray(value)) {
    throw new Error(message || `Expected array, got ${typeof value}`);
  }
}

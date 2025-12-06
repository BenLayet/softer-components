export const not = <T = any>(predicate: (value: T) => boolean) => {
  return (value: T) => !predicate(value);
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

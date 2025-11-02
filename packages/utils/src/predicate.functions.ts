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
export const isUndefined = (value: any) => value === undefined;
export const isDefined = not(isUndefined);

export const not = <T = unknown>(predicate: (value: T) => boolean) => {
  return (value: T) => !predicate(value);
};
export const and = <T = unknown>(...predicates: ((value: T) => boolean)[]) => {
  return (value: T) => predicates.every((predicate) => predicate(value));
};
export const or = <T = unknown>(...predicates: ((value: T) => boolean)[]) => {
  return (value: T) => predicates.some((predicate) => predicate(value));
};

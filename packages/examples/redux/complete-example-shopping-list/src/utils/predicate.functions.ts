export const not = <T = any>(predicate: (value: T) => boolean) => {
  return (value: T) => !predicate(value);
};
export const and = <T = any>(...predicates: Array<(value: T) => boolean>) => {
  return (value: T) => predicates.every(predicate => predicate(value));
};
export const or = <T = any>(...predicates: Array<(value: T) => boolean>) => {
  return (value: T) => predicates.some(predicate => predicate(value));
};

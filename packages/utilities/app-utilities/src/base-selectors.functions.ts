import type { State } from "@softer-components/types";

export const createBaseSelectors = <T extends Record<string, State>>(
  initialState: T,
): BaseSelectors<T> =>
  Object.fromEntries(
    Object.keys(initialState).map(key => [key, (state: T) => state[key]]),
  ) as BaseSelectors<T>;

export type BaseSelectors<T extends Record<string, State>> = {
  [K in keyof T]: (state: T) => T[K];
};

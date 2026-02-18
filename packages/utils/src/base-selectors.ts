import { OptionalValue, State } from "@softer-components/types";

type SelectableState = {
  [key: string]: OptionalValue;
};
type BaseSelectors<T extends State> = T extends SelectableState
  ? {
      [K in keyof T]: (state: T) => T[K];
    }
  : { state: (state: T) => T };

function isSelectableState(state: State): state is SelectableState {
  return typeof state === "object" && state !== null && !Array.isArray(state);
}

export function createBaseSelectors<T extends State>(
  initialState: T,
): BaseSelectors<T> {
  if (isSelectableState(initialState)) {
    return Object.fromEntries(
      Object.keys(initialState).map(key => [
        key,
        (state: T) => (isSelectableState(state) ? state[key] : undefined),
      ]),
    ) as BaseSelectors<T>;
  } else {
    return {
      state: (state: T) => state,
    } as BaseSelectors<T>;
  }
}

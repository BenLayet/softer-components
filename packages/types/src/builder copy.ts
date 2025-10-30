export const componentDefBuilder = () => {
  const withStateConstructor = <
    TStateConstructor extends (constructWith: any) => any,
  >(
    stateConstructor: TStateConstructor
  ) => {
    type TState = ReturnType<TStateConstructor>;

    return {
      withSelectors: <
        TSelectors extends Record<string, (state: TState) => any>,
      >(
        selectors: TSelectors
      ) => ({
        build: () => ({
          stateConstructor,
          selectors,
          eventHandlers: {},
          children: {},
        }),
      }),
      build: () => ({
        stateConstructor,
        selectors: {} as Record<string, (state: TState) => any>,
        eventHandlers: {},
        children: {},
      }),
    };
  };

  return {
    withStateConstructor,
    build: () => ({
      stateConstructor: (constructWith: any) => ({}),
      selectors: {},
      eventHandlers: {},
      children: {},
    }),
  };
};

import { describe, it, expect } from "vitest";

describe("componentDefBuilder", () => {
  it("returns a builder with withStateConstructor and build", () => {
    const componentDef = componentDefBuilder().build();
    const initialState = componentDef.stateConstructor(undefined);
    expect(initialState).toEqual({}); // default state is empty object
    expect(componentDef.selectors).toEqual({});
    expect(componentDef.eventHandlers).toEqual({});
    expect(componentDef.children).toEqual({});
  });

  it("allows setting stateConstructor with withStateConstructor", () => {
    const myConstructor = (constructWith: number) => ({
      count: constructWith ?? 0,
    });
    const componentDef = componentDefBuilder()
      .withStateConstructor(myConstructor)
      .build();

    expect(componentDef.stateConstructor).toBe(myConstructor);

    const initialState = componentDef.stateConstructor(42);
    expect(initialState).toEqual({ count: 42 });
    expect(componentDef.selectors).toEqual({});
    expect(componentDef.eventHandlers).toEqual({});
    expect(componentDef.children).toEqual({});
  });

  it("allows adding selectors with withSelectors", () => {
    const componentDef = componentDefBuilder()
      .withStateConstructor(() => ({
        count: 0,
      }))
      .withSelectors({
        count: (state) => state.count, // ✅ Now properly typed as { count: number }
      })
      .build();

    // ✅ This should now be type-safe
    const result = componentDef.selectors.count({ count: 42 });
    expect(result).toBe(42);
    expect(componentDef.selectors).toEqual({
      count: expect.any(Function),
    });
  });
});

import { describe, it, expect } from "vitest";
import { componentDefBuilder } from "../../types/src/builder";

const defaultComponentDef = {
  initialState: {},
  selectors: {},
  eventHandlers: {},
  children: {},
};
describe("componentDefBuilder", () => {
  it("returns a builder with withStateConstructor and build", () => {
    const componentDef = componentDefBuilder().build();
    const initialState = componentDef.stateConstructor(undefined);
    expect(initialState).toEqual({}); // default state is empty object
    expect(componentDef.selectors).toEqual({});
    expect(componentDef.eventHandlers).toEqual({});
    expect(componentDef.children).toEqual({});
  });
  it("allows setting initialState with withInitialState", () => {
    const initialState = { count: 0 };
    const componentDef = componentDefBuilder()
      .withInitialState(initialState)
      .build();

    const componentDef2: typeof componentDef = {
      ...defaultComponentDef,
      initialState,
    };

    expect(componentDef.initialState).toBe(initialState);
    expect(componentDef.selectors).toEqual({});
    expect(componentDef.eventHandlers).toEqual({});
    expect(componentDef.children).toEqual({});
  });

  it("allows adding selectors with withSelectors", () => {
    const initialState = { count: 0 };
    const componentDef = componentDefBuilder()
      .withInitialState(initialState)
      .withSelectors({
        count: (state) => state.count,
      })
      .build();

    const componentDef2: typeof componentDef = {
      ...defaultComponentDef,
      initialState,
      selectors: {
        count: (state: { count: number }) => state.count,
      },
    };
    componentDef.selectors.count({ count: 42 });
    expect(componentDef.selectors).toEqual({
      count: expect.any(Function),
    });
  });
});

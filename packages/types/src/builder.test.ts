import { describe, it, expect } from "vitest";
import { componentDefBuilder } from "../../types/src/builder";

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
        count: (state) => state.count,
      })
      .build();

    componentDef.selectors.count({ count: "qdsf" });
    expect(componentDef.selectors).toEqual({
      count: expect.any(Function),
    });
  });
});

import { describe, expect, it } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureSofterStore } from "./softer-store";
import { useSofter, useSofterSelectors } from "./softer-hooks";
import { ComponentDef } from "@softer-components/types";
import React from "react";

describe("useSofter with memoization", () => {
  it("should memoize selectors and prevent unnecessary re-renders", () => {
    // GIVEN a component with computed values
    type CounterContract = {
      state: { count: number };
      values: { doubled: number; tripled: number };
      events: { incrementRequested: { payload: undefined } };
      children: {};
    };

    const counterDef: ComponentDef<CounterContract> = {
      initialState: { count: 0 },
      selectors: {
        doubled: (state) => state.count * 2,
        tripled: (state) => state.count * 3,
      },
      uiEvents: ["incrementRequested"],
      updaters: {
        incrementRequested: ({ state }) => {
          state.count += 1;
        },
      },
    };

    const store = configureSofterStore(counterDef);

    // WHEN using the hook
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result, rerender } = renderHook(
      () => useSofterSelectors<CounterContract["values"]>(""),
      { wrapper },
    );

    const initialValues = result.current;
    expect(initialValues.doubled).toBe(0);
    expect(initialValues.tripled).toBe(0);

    // Force re-render without state change
    rerender();

    // THEN values should be memoized (same reference)
    expect(result.current).toBe(initialValues); // ✅ Same object reference
  });

  it("should update when state changes", () => {
    // GIVEN a component with state
    type CounterContract = {
      state: { count: number };
      values: { doubled: number };
      events: { increment: { payload: undefined } };
      children: {};
    };

    const counterDef: ComponentDef<CounterContract> = {
      initialState: { count: 0 },
      selectors: {
        doubled: (state) => state.count * 2,
      },
      uiEvents: ["increment"],
      updaters: {
        increment: ({ state }) => {
          state.count += 1;
        },
      },
    };

    const store = configureSofterStore(counterDef);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useSofter<CounterContract>(""), {
      wrapper,
    });

    const initialValues = result.current[0];
    expect(initialValues.doubled).toBe(0);

    // WHEN dispatching event
    act(() => {
      result.current[1].increment();
    });

    // THEN values should update
    const updatedValues = result.current[0];
    expect(updatedValues.doubled).toBe(2);

    // AND should be a different reference
    expect(updatedValues).not.toBe(initialValues);
  });

  it("should handle filtered lists with memoization", () => {
    // GIVEN a list component with items
    type ItemContract = {
      state: { name: string; active: boolean };
      values: { displayName: string };
      events: {};
      children: {};
    };

    type ListContract = {
      state: { filter: string };
      values: { activeItemCount: number };
      events: { setFilter: { payload: string } };
      children: {
        itemRows: ItemContract;
      };
    };

    const itemDef: ComponentDef<ItemContract> = {
      initialState: { name: "", active: true },
      selectors: {
        displayName: (state) => state.name,
      },
    };

    const listDef: ComponentDef<ListContract> = {
      initialState: { filter: "" },
      selectors: {
        activeItemCount: () => 0, // Would count from children
      },
      uiEvents: ["setFilter"],
      updaters: {
        setFilter: ({ state, payload }) => {
          state.filter = payload;
        },
      },
      childrenComponents: {
        itemRows: itemDef,
      },
      initialChildrenKeys: { itemRows: [] },
    };

    const store = configureSofterStore(listDef);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result, rerender } = renderHook(() => useSofter<ListContract>(""), {
      wrapper,
    });

    const [, , initialChildren] = result.current;

    // Force re-render
    rerender();

    // THEN
    expect(result.current[2]).toBe(initialChildren); // ✅ Same reference
  });
});

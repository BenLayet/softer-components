import { ComponentDef, EventsContract } from "@softer-components/types";
import { act, renderHook } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import { describe, expect, it } from "vitest";

import { useSofter, useSofterSelectors } from "./softer-hooks";
import { configureSofterStore } from "./softer-store";

describe("useSofter with memoization", () => {
  it("should memoize selectors and prevent unnecessary re-renders", () => {
    // GIVEN a component with computed values
    type CounterContract = {
      state: { count: number };
      values: { doubled: number; tripled: number };
      events: EventsContract<"incrementRequested", {}, ["incrementRequested"]>;
    };

    const counterDef: ComponentDef<CounterContract, { count: number }> = {
      initialState: { count: 0 },
      selectors: {
        doubled: state => state.count * 2,
        tripled: state => state.count * 3,
      },
      uiEvents: ["incrementRequested"],
      stateUpdaters: {
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
      () => useSofterSelectors<CounterContract>(""),
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
      events: {
        eventName: "increment";
        payloads: {};
        uiEvents: ["increment"];
      };
    };

    const counterDef: ComponentDef<CounterContract, { count: number }> = {
      initialState: { count: 0 },
      uiEvents: ["increment"],
      selectors: {
        doubled: state => state.count * 2,
      },
      stateUpdaters: {
        // @ts-ignore
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
    type ItemState = { name: string };
    type ItemContract = {
      values: { name: string };
    };

    const itemDef: ComponentDef<ItemContract, ItemState> = {
      initialState: { name: "test" },
      selectors: {
        name: state => state.name,
      },
    };

    type ListState = { filter: string };
    type ListContract = {
      state: ListState;
      values: { filteredItemNames: string[] };
      children: {
        itemRows: ItemContract & { type: "collection" };
      };
    };

    const listDef: ComponentDef<ListContract, ListState> = {
      initialState: { filter: "test" },
      selectors: {
        filteredItemNames: (state, childrenValues) =>
          Object.values(childrenValues.itemRows)
            .map(item => item.values.name())
            .filter(name => name.includes(state.filter)),
      },
      childrenComponentDefs: {
        itemRows: itemDef,
      },
      initialChildren: { itemRows: ["1", "2", "3"] },
    };

    const store = configureSofterStore(listDef);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result, rerender } = renderHook(() => useSofter<ListContract>(""), {
      wrapper,
    });

    // THEN
    //before rerender
    const initialValues = result.current[0];
    const initialChildren = result.current[2];
    expect(initialChildren).toEqual({
      itemRows: ["/itemRows:1", "/itemRows:2", "/itemRows:3"],
    });
    expect(initialValues.filteredItemNames).toEqual(["test", "test", "test"]);

    // WHEN re-rendering without state change
    rerender();

    // THEN
    expect(result.current[0]).toBe(initialValues); // ✅ Same reference
    expect(result.current[2]).toBe(initialChildren); // ✅ Same reference
  });
});

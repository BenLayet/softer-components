import { ComponentDef, EventsContract } from "@softer-components/types";
import { INPUTTED_BY_USER } from "@softer-components/utils";
import { describe, expect, it, vi } from "vitest";

import { SofterNgrxDispatchers } from "./softer-ngrx-dispatchers";
import { SofterNgrxEventMapper } from "./softer-ngrx-event-mapper";

describe("SofterNgrxDispatchers", () => {
  const PREFIX = "☁️";
  const eventMapper = new SofterNgrxEventMapper(PREFIX);

  const counterDef: ComponentDef<
    {
      events: EventsContract<
        ["incremented", "decremented", "setCountRequested"]
      >;
    },
    { count: number }
  > = {
    initialState: { count: 0 },
    allEvents: ["incremented", "decremented", "setCountRequested"],
    uiEvents: ["incremented", "decremented", "setCountRequested"],
    stateUpdaters: {
      incremented: ({ state }) => {
        state.count++;
      },
      decremented: ({ state }) => {
        state.count--;
      },
      setCountRequested: ({ state, payload }) => {
        state.count = payload as number;
      },
    },
  };

  const createMockStore = () => ({
    dispatch: vi.fn(),
    select: vi.fn(),
    pipe: vi.fn(),
  });

  describe("createDispatchers", () => {
    it("creates dispatchers for all UI events", () => {
      const mockStore = createMockStore();
      const dispatchers = new SofterNgrxDispatchers(
        counterDef as ComponentDef,
        mockStore as any,
        eventMapper,
      );

      // Use empty string "" for root path
      const actions = dispatchers.createDispatchers("");

      expect(actions).toHaveProperty("incremented");
      expect(actions).toHaveProperty("decremented");
      expect(actions).toHaveProperty("setCountRequested");
      expect(typeof actions.incremented).toBe("function");
      expect(typeof actions.decremented).toBe("function");
      expect(typeof actions.setCountRequested).toBe("function");
    });

    it("dispatches action without payload", () => {
      const mockStore = createMockStore();
      const dispatchers = new SofterNgrxDispatchers(
        counterDef as ComponentDef,
        mockStore as any,
        eventMapper,
      );

      const actions = dispatchers.createDispatchers("");
      actions.incremented();

      expect(mockStore.dispatch).toHaveBeenCalledTimes(1);
      expect(mockStore.dispatch).toHaveBeenCalledWith({
        type: `☁️|${INPUTTED_BY_USER}||incremented`,
        payload: undefined,
      });
    });

    it("dispatches action with payload", () => {
      const mockStore = createMockStore();
      const dispatchers = new SofterNgrxDispatchers(
        counterDef as ComponentDef,
        mockStore as any,
        eventMapper,
      );

      const actions = dispatchers.createDispatchers("");
      actions.setCountRequested(42);

      expect(mockStore.dispatch).toHaveBeenCalledWith({
        type: `☁️|${INPUTTED_BY_USER}||setCountRequested`,
        payload: 42,
      });
    });

    it("includes state path in action type for nested components", () => {
      const childDef: ComponentDef<
        { events: EventsContract<["clicked"]> },
        { clicked: boolean }
      > = {
        initialState: { clicked: false },
        allEvents: ["clicked"],
        uiEvents: ["clicked"],
      };

      const parentDef: ComponentDef<
        {
          children: { child: { events: EventsContract<["clicked"]> } };
        },
        {}
      > = {
        initialState: {},
        childrenComponentDefs: { child: childDef },
      };

      const mockStore = createMockStore();
      const dispatchers = new SofterNgrxDispatchers(
        parentDef as ComponentDef,
        mockStore as any,
        eventMapper,
      );

      const actions = dispatchers.createDispatchers("/child:main");
      actions.clicked();

      expect(mockStore.dispatch).toHaveBeenCalledWith({
        type: `☁️|${INPUTTED_BY_USER}|/child:main|clicked`,
        payload: undefined,
      });
    });

    it("returns empty object for component with no UI events", () => {
      const noEventsDef: ComponentDef<{}, { data: string }> = {
        initialState: { data: "" },
      };

      const mockStore = createMockStore();
      const dispatchers = new SofterNgrxDispatchers(
        noEventsDef,
        mockStore as any,
        eventMapper,
      );

      const actions = dispatchers.createDispatchers("");

      expect(actions).toEqual({});
    });
  });
});

import { describe, it, expect, vi } from "vitest";

import { generateEventsToForward } from "./event-forwarding";
import { ComponentDef } from "@softer-components/types";
import { GlobalEvent } from "./utils.type";
import { StateManager } from "./state-manager";

describe("event forwarding tests", () => {
  it("generates an event from a simple event forwarder", () => {
    // GIVEN
    const componentDef = {
      eventForwarders: [
        {
          from: "btnClicked",
          to: "incrementRequested",
        },
      ],
    };
    const event: GlobalEvent = {
      name: "btnClicked",
      payload: undefined,
      componentPath: [],
    };
    const stateManager = {} as StateManager;
    stateManager.getChildrenKeys = vi.fn().mockReturnValue({});

    // WHEN
    const result = generateEventsToForward(
      {},
      componentDef,
      event,
      stateManager,
    );

    // THEN
    expect(result).toEqual([
      {
        name: "incrementRequested",
        payload: undefined,
        componentPath: [],
      },
    ]);
  });
  it("generates an event from a parent listener", () => {
    // GIVEN
    const child = {};
    const componentDef = {
      childrenComponents: {
        child,
      },
      childrenConfig: {
        child: {
          listeners: [
            {
              from: "btnClicked",
              to: "incrementRequested",
            },
          ],
        },
      },
    };
    const event: GlobalEvent = {
      name: "btnClicked",
      payload: undefined,
      componentPath: [["child", "0"]],
    };
    const stateManager = {} as StateManager;
    stateManager.getChildrenKeys = vi
      .fn()
      .mockImplementation((path) =>
        path.length === 0 ? { child: ["0"] } : {},
      );

    // WHEN
    const result = generateEventsToForward(
      {},
      componentDef,
      event,
      stateManager,
    );

    // THEN
    expect(result).toEqual([
      {
        name: "incrementRequested",
        payload: undefined,
        componentPath: [],
      },
    ]);
  });
  it("generates a command event to a child", () => {
    // GIVEN
    const child = {};
    const componentDef = {
      childrenComponents: {
        child,
      },
      childrenConfig: {
        child: {
          commands: [
            {
              from: "btnClicked",
              to: "incrementRequested",
              toKeys: () => ["0"],
            },
          ],
        },
      },
    };
    const event: GlobalEvent = {
      name: "btnClicked",
      payload: undefined,
      componentPath: [],
    };
    const stateManager = {} as StateManager;
    stateManager.getChildrenKeys = vi
      .fn()
      .mockImplementation((path) =>
        path.length === 0 ? { child: ["0"] } : {},
      );

    // WHEN
    const result = generateEventsToForward(
      {},
      componentDef,
      event,
      stateManager,
    );

    // THEN
    expect(result).toEqual([
      {
        name: "incrementRequested",
        payload: undefined,
        componentPath: [["child", "0"]],
      },
    ]);
  });

  const conditions = [
    {
      isPassing: true,
      expectsEvents: [
        {
          name: "incrementRequested",
          payload: undefined,
          componentPath: [],
        },
      ],
    },
    { isPassing: false, expectsEvents: [] },
  ];
  conditions.forEach(({ isPassing, expectsEvents }) =>
    it(
      "generates an event from a conditional event forwarder, isPassing=" +
        isPassing,
      () => {
        // GIVEN
        const componentDef: ComponentDef<{
          state: { isPassing: boolean };
          events: {
            btnClicked: { payload: undefined };
            incrementRequested: { payload: undefined };
          };
          children: {};
          values: { isPassing: boolean };
        }> = {
          selectors: {
            isPassing: (state) => state.isPassing,
          },
          eventForwarders: [
            {
              from: "btnClicked",
              to: "incrementRequested",
              onCondition: ({ values }) => values.isPassing(),
            },
          ],
        };
        const event: GlobalEvent = {
          name: "btnClicked",
          payload: undefined,
          componentPath: [],
        };

        const stateManager = {} as StateManager;
        stateManager.selectValue = vi.fn().mockReturnValue(isPassing);
        stateManager.getChildrenKeys = vi.fn().mockReturnValue({});

        // WHEN
        const result = generateEventsToForward(
          {},
          componentDef,
          event,
          stateManager,
        );

        // THEN
        expect(result).toEqual(expectsEvents);
      },
    ),
  );

  it("generates an event with a different payload", () => {
    // GIVEN
    const componentDef: ComponentDef<{
      state: { nextPayload: number };
      events: {
        btnClicked: { payload: undefined };
        incrementRequested: { payload: number };
      };
      children: {};
      values: { nextPayload: number };
    }> = {
      selectors: { nextPayload: (state) => state.nextPayload },
      eventForwarders: [
        {
          from: "btnClicked",
          to: "incrementRequested",
          withPayload: ({ values }) => values.nextPayload(),
        },
      ],
    };
    const event: GlobalEvent = {
      name: "btnClicked",
      payload: undefined,
      componentPath: [],
    };

    const stateManager = {} as StateManager;
    stateManager.selectValue = vi.fn().mockReturnValue(42);
    stateManager.getChildrenKeys = vi.fn().mockReturnValue({});
    // WHEN

    const result = generateEventsToForward(
      {},
      componentDef,
      event,
      stateManager,
    );

    // THEN
    expect(result).toEqual([
      {
        name: "incrementRequested",
        payload: 42,
        componentPath: [],
      },
    ]);
  });

  it("generates a command event to a specific child with a key", () => {
    // GIVEN
    const child = {};
    const componentDef = {
      childrenComponents: {
        child,
      },
      childrenConfig: {
        child: {
          commands: [
            {
              from: "btnClicked",
              to: "incrementRequested",
              toKeys: () => ["key1", "key2"],
            },
          ],
        },
      },
    };
    const event: GlobalEvent = {
      name: "btnClicked",
      payload: undefined,
      componentPath: [],
    };
    const stateManager = {} as StateManager;
    stateManager.getChildrenKeys = vi.fn().mockReturnValue({});

    // WHEN

    const result = generateEventsToForward(
      {},
      componentDef,
      event,
      stateManager,
    );

    // THEN
    expect(result).toEqual([
      {
        name: "incrementRequested",
        payload: undefined,
        componentPath: [["child", "key1"]],
      },
      {
        name: "incrementRequested",
        payload: undefined,
        componentPath: [["child", "key2"]],
      },
    ]);
  });
});

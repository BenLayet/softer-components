import { ComponentDef, EventsContract } from "@softer-components/types";
import { describe, expect, it, vi } from "vitest";

import { ContextEventManager } from "./context-event-manager";
import { generateEventsToForward } from "./event-forwarding";
import {
  FORWARDED_FROM_CHILD_TO_PARENT,
  FORWARDED_FROM_PARENT_TO_CHILD,
  FORWARDED_INTERNALLY,
  GlobalEvent,
} from "./global-event";
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
      statePath: [],
    };
    const stateManager = {} as StateManager;
    stateManager.getChildrenKeys = vi.fn().mockReturnValue({});
    const contextEventManager = {} as ContextEventManager;
    contextEventManager.generateEvents = vi.fn().mockReturnValue([]);

    // WHEN
    const result = generateEventsToForward(
      {},
      componentDef,
      event,
      stateManager,
      contextEventManager,
    );

    // THEN
    expect(result).toEqual([
      {
        name: "incrementRequested",
        payload: undefined,
        statePath: [],
        source: FORWARDED_INTERNALLY,
      },
    ]);
  });
  it("generates an event from a parent listener", () => {
    // GIVEN
    const child = {};
    const componentDef = {
      childrenComponentDefs: {
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
      statePath: [["child", "0"]],
    };
    const stateManager = {} as StateManager;
    stateManager.getChildrenKeys = vi
      .fn()
      .mockImplementation(path => (path.length === 0 ? { child: ["0"] } : {}));
    const contextEventManager = {} as ContextEventManager;
    contextEventManager.generateEvents = vi.fn().mockReturnValue([]);

    // WHEN
    const result = generateEventsToForward(
      {},
      componentDef,
      event,
      stateManager,
      contextEventManager,
    );

    // THEN
    expect(result).toEqual([
      {
        name: "incrementRequested",
        payload: undefined,
        statePath: [],
        source: FORWARDED_FROM_CHILD_TO_PARENT,
      },
    ]);
  });
  it("generates a command event to a child", () => {
    // GIVEN
    const child = {};
    const componentDef = {
      childrenComponentDefs: {
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
      statePath: [],
    };
    const stateManager = {} as StateManager;
    stateManager.getChildrenKeys = vi
      .fn()
      .mockImplementation(path => (path.length === 0 ? { child: ["0"] } : {}));
    const contextEventManager = {} as ContextEventManager;
    contextEventManager.generateEvents = vi.fn().mockReturnValue([]);

    // WHEN
    const result = generateEventsToForward(
      {},
      componentDef,
      event,
      stateManager,
      contextEventManager,
    );

    // THEN
    expect(result).toEqual([
      {
        name: "incrementRequested",
        payload: undefined,
        statePath: [["child", "0"]],
        source: FORWARDED_FROM_PARENT_TO_CHILD,
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
          statePath: [],
          source: FORWARDED_INTERNALLY,
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
        type Contract = {
          events: EventsContract<
            "btnClicked" | "incrementRequested",
            {},
            ["btnClicked"]
          >;
          values: { isPassing: boolean };
        };
        type State = { isPassing: boolean };
        const componentDef: ComponentDef<Contract, State> = {
          initialState: { isPassing },
          uiEvents: ["btnClicked"],
          selectors: {
            isPassing: state => state.isPassing,
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
          statePath: [],
        };

        const stateManager = {} as StateManager;
        stateManager.selectValue = vi.fn().mockReturnValue(isPassing);
        stateManager.getChildrenKeys = vi.fn().mockReturnValue({});
        const contextEventManager = {} as ContextEventManager;
        contextEventManager.generateEvents = vi.fn().mockReturnValue([]);

        // WHEN
        const result = generateEventsToForward(
          {},
          componentDef as ComponentDef,
          event,
          stateManager,
          contextEventManager,
        );

        // THEN
        expect(result).toEqual(expectsEvents);
      },
    ),
  );

  it("generates an event with a different payload", () => {
    // GIVEN
    type Contract = {
      events: EventsContract<
        "btnClicked" | "incrementRequested",
        { incrementRequested: number },
        ["btnClicked"]
      >;
      values: { nextPayload: number };
    };
    type State = { nextPayload: number };
    const componentDef: ComponentDef<Contract, State> = {
      initialState: { nextPayload: 42 },
      uiEvents: ["btnClicked"],
      selectors: { nextPayload: state => state.nextPayload },
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
      statePath: [],
    };

    const stateManager = {} as StateManager;
    stateManager.selectValue = vi.fn().mockReturnValue(42);
    stateManager.getChildrenKeys = vi.fn().mockReturnValue({});
    const contextEventManager = {} as ContextEventManager;
    contextEventManager.generateEvents = vi.fn().mockReturnValue([]);

    // WHEN
    const result = generateEventsToForward(
      {},
      componentDef as ComponentDef,
      event,
      stateManager,
      contextEventManager,
    );

    // THEN
    expect(result).toEqual([
      {
        name: "incrementRequested",
        payload: 42,
        statePath: [],
        source: FORWARDED_INTERNALLY,
      },
    ]);
  });

  it("generates a command event to a specific child with a key", () => {
    // GIVEN
    const child = {};
    const componentDef = {
      childrenComponentDefs: {
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
      statePath: [],
    };
    const stateManager = {} as StateManager;
    stateManager.getChildrenKeys = vi.fn().mockReturnValue({});
    const contextEventManager = {} as ContextEventManager;
    contextEventManager.generateEvents = vi.fn().mockReturnValue([]);

    // WHEN
    const result = generateEventsToForward(
      {},
      componentDef,
      event,
      stateManager,
      contextEventManager,
    );

    // THEN
    expect(result).toEqual([
      {
        name: "incrementRequested",
        payload: undefined,
        statePath: [["child", "key1"]],
        source: FORWARDED_FROM_PARENT_TO_CHILD,
      },
      {
        name: "incrementRequested",
        payload: undefined,
        statePath: [["child", "key2"]],
        source: FORWARDED_FROM_PARENT_TO_CHILD,
      },
    ]);
  });
});

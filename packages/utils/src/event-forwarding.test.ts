import { describe, it, expect } from "vitest";

import { generateEventsToForward } from "./event-forwarding";
import { ComponentDef } from "@softer-components/types";
import { GlobalEvent } from "./constants";

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

    // WHEN
    const result = generateEventsToForward(componentDef, {}, event);

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
      componentPath: [["child"]],
    };
    const globalStateTree = {
      "#": {
        child: {}, //child needs to exist in state tree
      },
    };

    // WHEN
    const result = generateEventsToForward(
      componentDef,
      globalStateTree,
      event
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
    const globalStateTree = {
      "#": {
        child: {}, //child needs to exist in state tree
      },
    };

    // WHEN
    const result = generateEventsToForward(
      componentDef,
      globalStateTree,
      event
    );

    // THEN
    expect(result).toEqual([
      {
        name: "incrementRequested",
        payload: undefined,
        componentPath: [["child", undefined]],
      },
    ]);
  });

  it("generates an event from a conditional event forwarder", () => {
    // GIVEN
    const componentDef = {
      selectors: { isPassing: (state) => state.isPassing },
      eventForwarders: [
        {
          from: "btnClicked",
          to: "incrementRequested",
          onCondition: ({ selectors }) => selectors.isPassing(),
        },
      ],
    };
    const event: GlobalEvent = {
      name: "btnClicked",
      payload: undefined,
      componentPath: [],
    };

    // WHEN passing condition met
    const result1 = generateEventsToForward(
      componentDef,
      { "@": { isPassing: true } },
      event
    );

    // THEN
    expect(result1).toEqual([
      {
        name: "incrementRequested",
        payload: undefined,
        componentPath: [],
      },
    ]);
    // WHEN passing condition NOT met
    const result2 = generateEventsToForward(
      componentDef,
      { "@": { isPassing: false } },
      event
    );

    // THEN
    expect(result2).toEqual([]);
  });
  it("generates an event with a different payload", () => {
    // GIVEN
    const componentDef = {
      selectors: { nextPayload: (state) => state.nextPayload },
      eventForwarders: [
        {
          from: "btnClicked",
          to: "incrementRequested",
          withPayload: ({ selectors }) => selectors.nextPayload(),
        },
      ],
    };
    const event: GlobalEvent = {
      name: "btnClicked",
      payload: undefined,
      componentPath: [],
    };

    // WHEN passing condition met
    const result1 = generateEventsToForward(
      componentDef,
      { "@": { nextPayload: 42 } },
      event
    );

    // THEN
    expect(result1).toEqual([
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
          isCollection: true,
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
    const globalStateTree = {
      "#": {
        child: {}, //child needs to exist in state tree
      },
    };

    // WHEN
    const result = generateEventsToForward(
      componentDef,
      globalStateTree,
      event
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

import { describe, it, expect } from "vitest";

import { generateEventsToForward } from "./event-forwarding";
import { ComponentDef } from "@softer-components/types";

describe("event forwarding tests", () => {
  it("generates an event from a simple event forwarder", () => {
    //GIVEN a simple component forwarding events
    const rootComponentDef: ComponentDef<
      undefined,
      {
        clicked: { payload: undefined };
        processed: { payload: undefined };
      },
      {}
    > = {
      eventForwarders: [
        {
          from: "clicked",
          to: "processed",
        },
      ],
    };
    const globalState = {
      "/": {},
    };
    const event = { type: "/clicked", payload: undefined };

    //WHEN  generating events to forward
    const result = generateEventsToForward(
      rootComponentDef,
      globalState,
      event
    );

    expect(result).toEqual([
      {
        type: "/processed",
        payload: undefined,
      },
    ]);
  });

  it("generates an event from a conditional event forwarder", () => {
    //GIVEN a simple component forwarding events
    const rootComponentDef: ComponentDef<
      undefined,
      {
        clicked: { payload: boolean };
        processed: { payload: boolean };
      },
      {}
    > = {
      eventForwarders: [
        {
          from: "clicked",
          to: "processed",
          onCondition: (_, payload) => payload === true,
        },
      ],
    };
    const globalState = {
      "/": {},
    };
    const event = { type: "/clicked", payload: true };

    //WHEN  generating events to forward
    const result = generateEventsToForward(
      rootComponentDef,
      globalState,
      event
    );

    expect(result).toEqual([
      {
        type: "/processed",
        payload: true,
      },
    ]);
  });

  it("does not generate an event when the condition is not met", () => {
    //GIVEN a simple component forwarding events
    const rootComponentDef: ComponentDef<
      undefined,
      {
        clicked: { payload: boolean };
        processed: { payload: boolean };
      },
      {}
    > = {
      eventForwarders: [
        {
          from: "clicked",
          to: "processed",
          onCondition: (_, payload) => payload === true,
        },
      ],
    };
    const globalState = {
      "/": {},
    };
    const event = { type: "/clicked", payload: false };

    //WHEN  generating events to forward
    const result = generateEventsToForward(
      rootComponentDef,
      globalState,
      event
    );

    expect(result).toEqual([]);
  });

  it("generates simple command to child", () => {
    //GIVEN a simple component with one child
    const child1Def: ComponentDef<
      {},
      { doSomething: { payload: undefined } },
      {}
    > = {};
    const rootComponentDef: ComponentDef<
      undefined,
      {
        clicked: { payload: undefined };
      },
      {}
    > = {
      children: {
        child1: {
          ...child1Def,
          commands: [{ from: "clicked", to: "doSomething" }],
        },
      },
    };
    const globalState = {
      "/": {},
    };
    const event = { type: "/clicked", payload: undefined };

    //WHEN  generating events to forward
    const result = generateEventsToForward(
      rootComponentDef,
      globalState,
      event
    );

    expect(result).toEqual([
      {
        type: "/child1/doSomething",
        payload: undefined,
      },
    ]);
  });

  it("generates an event from a child listener", () => {
    //GIVEN a simple component with one child
    const child1Def: ComponentDef<{}, { clicked: { payload: undefined } }, {}> =
      {};
    const rootComponentDef: ComponentDef<
      {},
      { child1Selected: { payload: undefined } },
      {}
    > = {
      children: {
        child1: {
          ...child1Def,
          listeners: [{ from: "clicked", to: "child1Selected" }],
        },
      },
    };
    const globalState = {
      "/": {},
      "/child1/": {},
    };
    const event = { type: "/child1/clicked", payload: undefined };

    //WHEN  generating events to forward
    const result = generateEventsToForward(
      rootComponentDef,
      globalState,
      event
    );

    expect(result).toEqual([
      {
        type: "/child1Selected",
        payload: undefined,
      },
    ]);
  });
});

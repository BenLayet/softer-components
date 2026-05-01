import type {
  ComponentDef,
} from "@softer-components/types";
import {
  generateEventsToForward,
  updateSofterRootState,
} from "@softer-components/base-adapter";
import type {
  ContextEventManager,
  EffectsManager,
  GlobalEvent,
  StateManager,
  StateTree,
} from "@softer-components/base-adapter";
import { describe, expect, it, vi, beforeEach } from "vitest";

import type { EventProcessorListener } from "./event-processor";
import { whenEventOccurs } from "./event-processor";

vi.mock("@softer-components/base-adapter", async () => {
  const actual = await vi.importActual<typeof import("@softer-components/base-adapter")>(
    "@softer-components/base-adapter",
  );
  return {
    ...actual,
    generateEventsToForward: vi.fn(),
    updateSofterRootState: vi.fn(),
  };
});

const mockedGenerateEventsToForward = vi.mocked(generateEventsToForward);
const mockedUpdateSofterRootState = vi.mocked(updateSofterRootState);

const createDeferred = () => {
  let resolve!: () => void;
  const promise = new Promise<void>(r => {
    resolve = r;
  });
  return { promise, resolve };
};

describe("whenEventOccurs", () => {
  const rootState = {} as StateTree;
  const rootComponentDef = {} as ComponentDef;
  const stateManager = {} as StateManager;
  const contextEventManager = {} as ContextEventManager;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates state, notifies the listener, generates forwarded events, and runs effects", async () => {
    const log: string[] = [];
    const event: GlobalEvent = { name: "clicked", statePath: [], payload: 1 };
    const listener: EventProcessorListener = {
      stateUpdated: vi.fn(() => {
        log.push("listener");
      }),
    };
    const effectsManager = {
      eventOccurred: vi.fn(async () => {
        log.push("effects");
      }),
    } as unknown as EffectsManager;

    mockedUpdateSofterRootState.mockImplementation(() => {
      log.push("update");
    });
    mockedGenerateEventsToForward.mockImplementation(() => {
      log.push("forward");
      return [];
    });

    await whenEventOccurs(
      rootState,
      rootComponentDef,
      stateManager,
      effectsManager,
      contextEventManager,
      listener,
    )(event);

    expect(log).toEqual(["update", "listener", "forward", "effects"]);
    expect(mockedUpdateSofterRootState).toHaveBeenCalledWith(
      rootState,
      rootComponentDef,
      event,
      stateManager,
    );
    expect(listener.stateUpdated).toHaveBeenCalledWith(event, rootState);
    expect(mockedGenerateEventsToForward).toHaveBeenCalledWith(
      rootState,
      rootComponentDef,
      event,
      stateManager,
      contextEventManager,
    );
    expect(effectsManager.eventOccurred).toHaveBeenCalledWith(
      event,
      rootState,
      expect.any(Function),
    );
  });

  it("starts forwarded events before current effects and waits for all async work", async () => {
    const log: string[] = [];
    const rootEvent: GlobalEvent = { name: "root", statePath: [], payload: undefined };
    const forwardedEvent: GlobalEvent = {
      name: "forwarded",
      statePath: [["child", "0"]],
      payload: undefined,
    };
    const rootEffect = createDeferred();
    const forwardedEffect = createDeferred();

    mockedUpdateSofterRootState.mockImplementation((_, __, eventArg) => {
      log.push(`update:${eventArg.name}`);
    });
    mockedGenerateEventsToForward.mockImplementation((_, __, eventArg) => {
      log.push(`forward:${eventArg.name}`);
      return eventArg.name === "root" ? [forwardedEvent] : [];
    });

    const effectsManager = {
      eventOccurred: vi.fn((eventArg: GlobalEvent) => {
        log.push(`effects:${eventArg.name}`);
        return eventArg.name === "root"
          ? rootEffect.promise
          : forwardedEffect.promise;
      }),
    } as unknown as EffectsManager;

    let settled = false;
    const processingPromise = whenEventOccurs(
      rootState,
      rootComponentDef,
      stateManager,
      effectsManager,
      contextEventManager,
    )(rootEvent).then(() => {
      settled = true;
    });

    await Promise.resolve();

    expect(log).toEqual([
      "update:root",
      "forward:root",
      "update:forwarded",
      "forward:forwarded",
      "effects:forwarded",
      "effects:root",
    ]);
    expect(settled).toBe(false);

    rootEffect.resolve();
    await Promise.resolve();
    expect(settled).toBe(false);

    forwardedEffect.resolve();
    await processingPromise;
    expect(settled).toBe(true);
  });

  it("lets effects dispatch follow-up events through the provided callback", async () => {
    const log: string[] = [];
    const rootEvent: GlobalEvent = {
      name: "submitted",
      statePath: [],
      payload: undefined,
    };
    const effectDispatchedEvent: GlobalEvent = {
      name: "succeeded",
      statePath: [],
      payload: "ok",
    };

    mockedUpdateSofterRootState.mockImplementation((_, __, eventArg) => {
      log.push(`update:${eventArg.name}`);
    });
    mockedGenerateEventsToForward.mockReturnValue([]);

    const effectsManager = {
      eventOccurred: vi.fn(
        async (
          eventArg: GlobalEvent,
          _state: StateTree,
          dispatchEvent: (event: GlobalEvent) => Promise<void>,
        ) => {
          log.push(`effects:${eventArg.name}`);
          if (eventArg.name === "submitted") {
            await dispatchEvent(effectDispatchedEvent);
          }
        },
      ),
    } as unknown as EffectsManager;

    await whenEventOccurs(
      rootState,
      rootComponentDef,
      stateManager,
      effectsManager,
      contextEventManager,
    )(rootEvent);

    expect(log).toEqual([
      "update:submitted",
      "effects:submitted",
      "update:succeeded",
      "effects:succeeded",
    ]);
    expect(effectsManager.eventOccurred).toHaveBeenCalledTimes(2);
    expect(mockedUpdateSofterRootState).toHaveBeenNthCalledWith(
      2,
      rootState,
      rootComponentDef,
      effectDispatchedEvent,
      stateManager,
    );
  });

  it("works without a listener", async () => {
    const event: GlobalEvent = { name: "clicked", statePath: [], payload: undefined };
    const effectsManager = {
      eventOccurred: vi.fn().mockResolvedValue(undefined),
    } as unknown as EffectsManager;

    mockedGenerateEventsToForward.mockReturnValue([]);
    mockedUpdateSofterRootState.mockImplementation(() => undefined);

    await expect(
      whenEventOccurs(
        rootState,
        rootComponentDef,
        stateManager,
        effectsManager,
        contextEventManager,
      )(event),
    ).resolves.toEqual([undefined]);
  });
});



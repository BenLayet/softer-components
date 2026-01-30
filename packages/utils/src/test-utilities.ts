import {
  ComponentContract,
  ComponentDef,
  Effects,
  Selector,
  State,
} from "@softer-components/types";
import { expect } from "vitest";

import { findComponentDef } from "./component-def-tree";
import { componentPathToString } from "./component-path";
import { EffectsManager } from "./effects-manager";
import { generateEventsToForward } from "./event-forwarding";
import { isUndefined } from "./predicate.functions";
import { updateSofterRootState } from "./reducer";
import { RelativePathStateReader } from "./relative-path-state-manager";
import { initializeRootState } from "./state-initializer";
import { OWN_VALUE_KEY, Tree } from "./tree";
import { TreeStateManager } from "./tree-state-manager";
import { ComponentPath, GlobalEvent } from "./utils.type";
import { createChildrenValues } from "./value-providers";

type TestStore = {
  rootState: Tree<State>;
  rootComponentDef: ComponentDef;
  stateManager: TreeStateManager;
  effectsManager: EffectsManager<any>;
};
export const givenRootComponent = <
  TComponentContract extends ComponentContract,
>(
  rootComponentDef: ComponentDef<TComponentContract>,
) => {
  const stateManager = new TreeStateManager();
  const effectsManager = new EffectsManager(rootComponentDef, stateManager);
  const rootState: Tree<State> = { [OWN_VALUE_KEY]: undefined };
  initializeRootState(rootState, rootComponentDef, stateManager);
  const testStore: TestStore = {
    rootComponentDef,
    stateManager,
    rootState,
    effectsManager,
  };
  return {
    withEffects: withEffects(testStore),
    when: whenEventSequenceOccurs(testStore),
    thenExpect: thenExpect(testStore),
  };
};
const withEffects =
  (testStore: TestStore) =>
  (effects: { [componentPath: string]: Effects<any> }) => {
    Object.entries(effects).forEach(([componentPathStr, componentEffects]) =>
      testStore.effectsManager.configureEffects(
        componentPathStr as any,
        componentEffects,
      ),
    );
    return {
      withEffects: withEffects(testStore),
      when: whenEventSequenceOccurs(testStore),
      thenExpect: thenExpect(testStore),
    };
  };

const whenEventSequenceOccurs =
  (testStore: TestStore) => (input: GlobalEvent[] | GlobalEvent) => {
    // Normalize to an array
    const globalEvents: GlobalEvent[] = Array.isArray(input) ? input : [input];

    globalEvents.forEach(whenEventOccurs(testStore));
    return {
      and: whenEventSequenceOccurs(testStore),
      thenExpect: thenExpect(testStore),
    };
  };
const whenEventOccurs = (testStore: any) => (globalEvent: GlobalEvent) => {
  let previousStateStr = "";
  if (process.env.SOFTER_DEBUG) {
    previousStateStr = JSON.stringify(testStore.rootState);
    console.log(
      globalEvent.name,
      componentPathToString(globalEvent.componentPath),
      JSON.stringify(globalEvent.payload),
    );
  }
  //reducer
  updateSofterRootState(
    testStore.rootState,
    testStore.rootComponentDef,
    globalEvent,
    testStore.stateManager,
  );
  if (process.env.SOFTER_DEBUG) {
    console.log(
      JSON.stringify(diff(JSON.parse(previousStateStr), testStore.rootState)),
    );
  }

  //event forwarding
  const newEvents = generateEventsToForward(
    testStore.rootState,
    testStore.rootComponentDef,
    globalEvent,
    testStore.stateManager,
  );
  newEvents.forEach(whenEventOccurs(testStore));

  //effects
  testStore.effectsManager.eventOccurred(
    globalEvent,
    testStore.rootState,
    whenEventOccurs(testStore),
  );
};

const thenExpect =
  (testStore: TestStore): any =>
  (componentPath: ComponentPath) => {
    const componentDef = findComponentDef(
      testStore.rootComponentDef,
      componentPath,
    );
    const componentState = testStore.stateManager.readState(
      testStore.rootState,
      componentPath,
    );
    return {
      ...Object.fromEntries(
        Object.entries(componentDef.selectors ?? {}).map(
          ([selectorName, selector]) => [
            selectorName,
            expectWrapper(
              componentState,
              selector,
              componentPath,
              selectorName,
              testStore,
            ),
          ],
        ),
      ),
      toBeUndefined: () => expect(componentState).toBe(undefined),
    };
  };

const expectWrapper = (
  componentState: State,
  selector: Selector<any>,
  componentPath: ComponentPath,
  selectorName: string,
  testStore: TestStore,
) => {
  if (isUndefined(componentState)) {
    return expect(
      undefined,
      `state at ${componentPathToString(componentPath)} is undefined.`,
    );
  }
  let value: any;
  try {
    const relativeStateReader = new RelativePathStateReader(
      testStore.rootState,
      testStore.stateManager,
      componentPath,
    );
    const componentDef = findComponentDef(
      testStore.rootComponentDef,
      componentPath,
    );
    const children = createChildrenValues(componentDef, relativeStateReader);
    value = selector(componentState, children);
    return expect(value);
  } catch (e: any) {
    return expect(
      undefined,
      `cannot read value of ${selectorName} at ${componentPathToString(componentPath)}.${e.message}.`,
    );
  }
};
// typescript
type DiffType = "added" | "removed" | "changed";
type DiffEntry = { type: DiffType; from?: any; to?: any };
type DiffResult = Record<string, DiffEntry>;

const isObject = (v: any) => v !== null && typeof v === "object";
const isPlainObject = (v: any) =>
  isObject(v) &&
  (v.constructor === Object || (Array.isArray(v) && v.constructor === Array));

export function diff(a: any, b: any): DiffResult {
  const result: DiffResult = {};

  function rec(pa: any, pb: any, path: string) {
    if (Object.is(pa, pb)) return;

    const paIsObj = isPlainObject(pa);
    const pbIsObj = isPlainObject(pb);

    if (paIsObj && pbIsObj) {
      // both arrays
      if (Array.isArray(pa) && Array.isArray(pb)) {
        const max = Math.max(pa.length, pb.length);
        for (let i = 0; i < max; i++) {
          rec(pa[i], pb[i], `${path}[${i}]`);
        }
        return;
      }

      // both plain objects
      const keys = new Set([
        ...Object.keys(pa || {}),
        ...Object.keys(pb || {}),
      ]);
      for (const k of keys) {
        const nextPath = path ? `${path}.${k}` : k;
        rec(pa ? pa[k] : undefined, pb ? pb[k] : undefined, nextPath);
      }
      return;
    }

    // types differ or primitives differ -> record change/add/remove
    if (pa === undefined && pb !== undefined) {
      result[path || "$"] = { type: "added", to: pb };
    } else if (pa !== undefined && pb === undefined) {
      result[path || "$"] = { type: "removed", from: pa };
    } else {
      result[path || "$"] = { type: "changed", from: pa, to: pb };
    }
  }

  rec(a, b, "");
  return result;
}

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
  effectsManager: EffectsManager;
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
      testStore.effectsManager.registerEffects(
        componentPathStr,
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
  if (process.env.SOFTER_DEBUG) {
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

  //console.log(JSON.stringify(testStore.state, null, 2));

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

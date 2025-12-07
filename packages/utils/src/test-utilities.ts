import {
  ComponentContract,
  ComponentDef,
  Effects,
  State,
} from "@softer-components/types";
import { expect } from "vitest";
import { findComponentDef } from "./component-def-tree";
import { componentPathToString } from "./component-path";
import { EffectsManager } from "./effects-manager";
import { generateEventsToForward } from "./event-forwarding";
import { isUndefined } from "./predicate.functions";
import { updateSofterRootState } from "./reducer";
import { initializeRootState } from "./state-initializer";
import { TreeStateManager } from "./tree-state-manager";
import { ComponentPath, GlobalEvent } from "./utils.type";

export const givenRootComponent = <
  TComponentContract extends ComponentContract,
>(
  rootComponentDef: ComponentDef<TComponentContract>
) => {
  const stateManager = new TreeStateManager();
  const effectsManager = new EffectsManager(rootComponentDef, stateManager);
  const state = {};
  initializeRootState(state, rootComponentDef, stateManager);
  const testStore = { rootComponentDef, stateManager, state, effectsManager };
  return {
    withEffects: withEffects(testStore),
    when: whenEventSequenceOccurs(testStore),
    thenExpect: thenExpect(testStore),
  };
};
const withEffects =
  (testStore: any) => (effects: { [componentPath: string]: Effects }) => {
    Object.entries(effects).forEach(([componentPathStr, componentEffects]) =>
      testStore.effectsManager.registerEffects(
        componentPathStr,
        componentEffects
      )
    );
    return {
      withEffects: withEffects(testStore),
      when: whenEventSequenceOccurs(testStore),
      thenExpect: thenExpect(testStore),
    };
  };

const whenEventSequenceOccurs =
  (testStore: any) => (input: GlobalEvent[] | GlobalEvent) => {
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
      JSON.stringify(globalEvent.payload)
    );
  }
  //reducer
  updateSofterRootState(
    testStore.state,
    testStore.rootComponentDef,
    globalEvent,
    testStore.stateManager
  );

  //console.log(JSON.stringify(testStore.state, null, 2));

  //event forwarding
  const newEvents = generateEventsToForward(
    testStore.state,
    testStore.rootComponentDef,
    globalEvent,
    testStore.stateManager
  );
  newEvents.forEach(whenEventOccurs(testStore));

  //effects
  testStore.effectsManager.eventOccurred(
    globalEvent,
    testStore.state,
    whenEventOccurs(testStore)
  );
};

const thenExpect =
  (testContext: any): any =>
  (componentPath: ComponentPath) => {
    const componentDef = findComponentDef(
      testContext.rootComponentDef,
      componentPath
    );
    const componentState = testContext.stateManager.readState(
      testContext.state,
      componentPath
    );
    return {
      ...Object.fromEntries(
        Object.entries(componentDef.selectors).map(
          ([selectorName, selector]) => [
            selectorName,
            expectWrapper(
              componentState,
              selector,
              componentPath,
              selectorName
            ),
          ]
        )
      ),
      toBeUndefined: () => expect(componentState).toBe(undefined),
    };
  };

const expectWrapper = (
  componentState: State,
  selector,
  componentPath,
  selectorName
) => {
  if (isUndefined(componentState)) {
    return expect(
      undefined,
      `state at ${componentPathToString(componentPath)} is undefined.`
    );
  }
  let value: any;
  try {
    value = selector(componentState);
    return expect(value);
  } catch (e) {
    return expect(
      undefined,
      `cannot read value of ${selectorName} at ${componentPathToString(componentPath)}. ${e.message}.`
    );
  }
};

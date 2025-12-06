import { TreeStateManager } from "./tree-state-manager";
import { initializeRootState } from "./state-initializer";
import {
  ComponentContract,
  ComponentDef,
  Payload,
} from "@softer-components/types";
import { updateSofterRootState } from "./reducer";
import { findComponentDef } from "./component-def-tree";
import {
  eventNameWithoutComponentPath,
  stringToComponentPath,
} from "./component-path";
import { EffectsManager } from "./effects-manager";
import { Effects } from "./effects";
import { generateEventsToForward } from "./event-forwarding";

export const givenRootComponent = <
  TComponentContract extends ComponentContract,
>(
  rootComponentDef: ComponentDef<TComponentContract>,
) => {
  const stateManager = new TreeStateManager();
  const effectsManager = new EffectsManager(rootComponentDef, stateManager);
  const state = {};
  initializeRootState(state, rootComponentDef, stateManager);
  const testStore = { rootComponentDef, stateManager, state, effectsManager };
  return {
    withEffects: withEffects(testStore),
    when: whenEventOccurs(testStore),
    thenExpect: thenExpectComponentAtPath(testStore),
  };
};
const withEffects =
  (testStore: any) => (effects: { [componentPath: string]: Effects }) => {
    Object.entries(effects).forEach(([componentPathStr, componentEffects]) =>
      testStore.effectsManager.registerEffects(
        componentPathStr,
        componentEffects,
      ),
    );
    return {
      withEffects: withEffects(testStore),
      when: whenEventOccurs(testStore),
      thenExpect: thenExpectComponentAtPath(testStore),
    };
  };

const whenEventOccurs =
  (testStore: any) =>
  (eventNameWithPath: string, payload: Payload = undefined) => {
    const globalEvent = {
      name: eventNameWithoutComponentPath(eventNameWithPath),
      componentPath: stringToComponentPath(eventNameWithPath),
      payload,
    };
    updateSofterRootState(
      testStore.state,
      testStore.rootComponentDef,
      globalEvent,
      testStore.stateManager,
    );
    generateEventsToForward(
      testStore.state,
      testStore.rootComponentDef,
      globalEvent,
      testStore.stateManager,
    ).forEach((event) => whenEventOccurs(testStore)(event.name, event.payload));
    return {
      and: whenEventOccurs(testStore),
      thenExpect: thenExpectComponentAtPath(testStore),
    };
  };

const thenExpectComponentAtPath = (testContext: any) => (path: string) => {
  const componentPath = stringToComponentPath(path);
  const componentDef = findComponentDef(
    testContext.rootComponentDef,
    componentPath,
  );
  const componentState = testContext.stateManager.readState(
    testContext.state,
    componentPath,
  );
  return Object.fromEntries(
    Object.entries(componentDef.selectors).map(([selectorName, selector]) => [
      selectorName,
      expect(selector(componentState)),
    ]),
  );
};

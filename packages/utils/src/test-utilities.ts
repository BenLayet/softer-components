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

export const givenRootComponent = <
  TComponentContract extends ComponentContract,
>(
  rootComponentDef: ComponentDef<TComponentContract>,
) => {
  const stateManager = new TreeStateManager();
  const state = {};
  initializeRootState(state, rootComponentDef, stateManager);
  const testContext = { rootComponentDef, stateManager, state };
  return {
    whenEventOccurs: whenEventOccurs(testContext),
    thenExpectComponentAtPath: thenExpectComponentAtPath(testContext),
  };
};

const whenEventOccurs =
  (testContext: any) =>
  (eventNameWithPath: string, payload: Payload = undefined) => {
    const globalEvent = {
      name: eventNameWithoutComponentPath(eventNameWithPath),
      componentPath: stringToComponentPath(eventNameWithPath),
      payload,
    };
    updateSofterRootState(
      testContext.state,
      testContext.rootComponentDef,
      globalEvent,
      testContext.stateManager,
    );
    return {
      andEventOccurs: whenEventOccurs(testContext),
      thenExpectComponentAtPath: thenExpectComponentAtPath(testContext),
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

import {
  ComponentContract,
  ComponentDef,
  State,
  Values,
} from "@softer-components/types";
import { assertValueIsNotUndefined } from "./predicate.functions";
import { RelativePathStateReader } from "./relative-path-state-manager";

/**
 * Create Values provider for a component given its definition and state
 */
export function createValueProviders<
  TComponentContract extends ComponentContract = ComponentContract,
>(
  componentDef: ComponentDef<TComponentContract>,
  stateReader: RelativePathStateReader,
): Values<TComponentContract> {
  // Create own values
  const selectors = createOwnSelectors(componentDef, stateReader);

  // Create children's values
  const childrenKeys = stateReader.getChildrenKeys();
  const children = Object.fromEntries(
    Object.entries(childrenKeys).map(([childName, childKeys]) => {
      const childDef = componentDef.childrenComponents?.[childName];
      assertValueIsNotUndefined({ [childName]: childDef });

      const childInstancesValueProviders = Object.fromEntries(
        childKeys.map((key) => {
          const childValueProviders = createValueProviders(
            childDef,
            stateReader.childStateReader(childName, key),
          );
          return [key, childValueProviders];
        }),
      );
      return [childName, childInstancesValueProviders];
    }),
  );

  return { selectors, children } as Values<TComponentContract>;
}

function createOwnSelectors<
  TComponentContract extends ComponentContract = ComponentContract,
>(
  componentDef: ComponentDef<TComponentContract>,
  stateReader: RelativePathStateReader,
): Values<TComponentContract>["selectors"] {
  const selectorsDef = componentDef.selectors || {};
  return Object.fromEntries(
    Object.entries(selectorsDef).map(([selectorName, selector]) => [
      selectorName,
      () => stateReader.selectValue(selector as (state: State) => unknown),
    ]),
  ) as Values<TComponentContract>["selectors"];
}

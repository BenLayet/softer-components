import {
  ChildrenValues,
  ComponentContract,
  ComponentDef,
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
  stateReader: RelativePathStateReader
): Values<TComponentContract> {
  // Create children's values
  const children = createChildrenValues(componentDef, stateReader);

  // Create own values
  const selectors = createOwnSelectors(componentDef, stateReader, children);

  return { selectors, children } as Values<TComponentContract>;
}

function createOwnSelectors<
  TComponentContract extends ComponentContract = ComponentContract,
>(
  componentDef: ComponentDef<TComponentContract>,
  stateReader: RelativePathStateReader,
  children: Values<TComponentContract>["children"]
): Values<TComponentContract>["selectors"] {
  const selectorsDef = componentDef.selectors || {};
  return Object.fromEntries(
    Object.entries(selectorsDef).map(([selectorName, selector]) => [
      selectorName,
      () => stateReader.selectValue(selector as any, children),
    ])
  ) as Values<TComponentContract>["selectors"];
}

export function createChildrenValues<
  TComponentContract extends ComponentContract = ComponentContract,
>(
  componentDef: ComponentDef<TComponentContract>,
  stateReader: RelativePathStateReader
): ChildrenValues<TComponentContract> {
  const childrenKeys = stateReader.getChildrenKeys();
  return Object.fromEntries(
    Object.entries(childrenKeys).map(([childName, childKeys]) => {
      const childDef = componentDef.childrenComponents?.[childName];
      assertValueIsNotUndefined({ [childName]: childDef });

      const childInstancesValueProviders = Object.fromEntries(
        childKeys.map((key) => {
          const childValueProviders = createValueProviders(
            childDef,
            stateReader.childStateReader(childName, key)
          );
          return [key, childValueProviders];
        })
      );
      return [childName, childInstancesValueProviders];
    })
  ) as ChildrenValues<TComponentContract>;
}

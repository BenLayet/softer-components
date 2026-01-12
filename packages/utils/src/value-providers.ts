import {
  ChildrenValues,
  ComponentContract,
  ComponentDef,
  Values,
} from "@softer-components/types";

import { isCollectionChild } from "./component-def-tree";
import {
  assertIsNotUndefined,
  assertValueIsNotUndefined,
} from "./predicate.functions";
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
  // Create children's values
  const childrenValues = createChildrenValues(componentDef, stateReader);

  assertValueIsNotUndefined({ childrenValues });

  // Create own values
  const values = createOwnValues(componentDef, stateReader, childrenValues);

  return {
    values,
    childrenValues,
  } as Values<TComponentContract>;
}

function createOwnValues<
  TComponentContract extends ComponentContract = ComponentContract,
>(
  componentDef: ComponentDef<TComponentContract>,
  stateReader: RelativePathStateReader,
  childrenValues: Values<TComponentContract>["childrenValues"],
): Values<TComponentContract>["values"] {
  const selectorsDef = componentDef.selectors || {};
  return Object.fromEntries(
    Object.entries(selectorsDef).map(([selectorName, selector]) => [
      selectorName,
      () => {
        assertValueIsNotUndefined({ childrenValues });
        return stateReader.selectValue(selector as any, childrenValues);
      },
    ]),
  ) as Values<TComponentContract>["values"];
}

export function createChildrenValues<
  TComponentContract extends ComponentContract = ComponentContract,
>(
  componentDef: ComponentDef<TComponentContract>,
  stateReader: RelativePathStateReader,
): ChildrenValues<TComponentContract["children"]> {
  const childrenKeys = stateReader.getChildrenKeys();
  assertValueIsNotUndefined({ childrenKeys });
  return Object.fromEntries(
    Object.entries(childrenKeys).map(([childName, childKeys]) => {
      const childDef = componentDef.childrenComponentDefs?.[childName];
      assertIsNotUndefined(
        childDef,
        `Child component '${childName}' not found in childrenComponents`,
      );

      if (isCollectionChild(componentDef, childName)) {
        const childInstancesValueProviders = Object.fromEntries(
          childKeys.map(key => {
            const childValueProviders = createValueProviders(
              childDef,
              stateReader.childStateReader(childName, key),
            );
            return [key, childValueProviders];
          }),
        );
        return [childName, childInstancesValueProviders];
      } else {
        if (childKeys.length === 0) {
          return [childName, undefined];
        }
        if (childKeys.length > 1) {
          throw new Error(
            `Multiple instances found for non-collection child '${childName}'. Keys = ${JSON.stringify(
              childKeys,
            )}`,
          );
        }
        return [
          childName,
          createValueProviders(
            childDef,
            stateReader.firstChildStateReader(childName),
          ),
        ];
      }
    }),
  ) as ChildrenValues<TComponentContract["children"]>;
}

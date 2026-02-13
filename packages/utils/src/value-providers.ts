import {
  ChildrenValues,
  ComponentContract,
  ComponentDef,
  ContextsValues,
  Values,
} from "@softer-components/types";

import {
  findComponentDefFromStatePath,
  isCollectionChild,
} from "./component-def-tree";
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
  rootComponentDef: ComponentDef,
  stateReader: RelativePathStateReader,
): Values<TComponentContract> {
  // Create children's values
  const childrenValues = createChildrenValues(rootComponentDef, stateReader);
  assertIsNotUndefined(
    childrenValues,
    "childrenValues should not be undefined",
  );
  // Create contexts' values
  const contextsValues = createContextsValues(
    rootComponentDef,
    stateReader,
  ) as ContextsValues;
  assertIsNotUndefined(
    contextsValues,
    "contextsValues should not be undefined",
  );

  // Create own values
  const values = createOwnValues(
    rootComponentDef,
    stateReader,
    childrenValues,
    contextsValues,
  );

  return {
    values,
    childrenValues,
    contextsValues,
  } as unknown as Values<TComponentContract>;
}

function createOwnValues(
  rootComponentDef: ComponentDef,
  stateReader: RelativePathStateReader,
  childrenValues: ChildrenValues,
  contextsValues: ContextsValues,
) {
  const componentDef = findComponentDefFromStatePath(
    rootComponentDef,
    stateReader.currentPath,
  );
  const selectorsDef = componentDef.selectors || {};
  return Object.fromEntries(
    Object.entries(selectorsDef).map(([selectorName, selector]) => [
      selectorName,
      () => {
        assertValueIsNotUndefined({ childrenValues });
        return stateReader.selectValue(
          selector as any,
          childrenValues,
          contextsValues,
        );
      },
    ]),
  );
}

function createChildrenValues(
  rootComponentDef: ComponentDef,
  stateReader: RelativePathStateReader,
): ChildrenValues {
  const componentDef = findComponentDefFromStatePath(
    rootComponentDef,
    stateReader.currentPath,
  );
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
              rootComponentDef,
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
            rootComponentDef,
            stateReader.firstChildStateReader(childName),
          ),
        ];
      }
    }),
  ) as ChildrenValues;
}

export function createContextsValues(
  rootComponentDef: ComponentDef,
  stateReader: RelativePathStateReader,
): ContextsValues {
  const componentDef = findComponentDefFromStatePath(
    rootComponentDef,
    stateReader.currentPath,
  );
  return Object.fromEntries(
    Object.entries(componentDef.contextDefs ?? {}).map(
      ([contextName, contextRelativePath]) => {
        const stateReaderForContext =
          stateReader.forRelativePath(contextRelativePath);
        return [
          contextName,
          createValueProviders(rootComponentDef, stateReaderForContext),
        ];
      },
    ),
  ) as ContextsValues;
}

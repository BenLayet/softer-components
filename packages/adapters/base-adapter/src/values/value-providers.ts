import {
  ChildrenValues,
  ComponentDef,
  ContextsValues,
  ValuesOfComponentDef,
} from "@softer-components/types";

import {
  findComponentDefFromStatePath,
  isCollectionChild,
} from "../state/component-def-tree";
import { RelativePathStateReader } from "../state/relative-path-state-manager";
import { assertIsNotUndefined } from "../utilities/assert.functions";

/**
 * Create Values provider for a component given its definition and state
 */
export function createValueProviders<TComponentDef extends ComponentDef>(
  rootComponentDef: TComponentDef,
  stateReader: RelativePathStateReader,
): ValuesOfComponentDef<TComponentDef> {
  const genericRootComponentDef = rootComponentDef as ComponentDef;
  // Create children's values
  const childrenValues = createChildrenValues(
    genericRootComponentDef,
    stateReader,
  );
  assertIsNotUndefined(
    childrenValues,
    "childrenValues should not be undefined",
  );
  // Create contexts' values
  const contextsValues = createContextsValues(
    genericRootComponentDef,
    stateReader,
  );
  assertIsNotUndefined(
    contextsValues,
    "contextsValues should not be undefined",
  );

  // Create own values
  const values = createOwnValues(
    genericRootComponentDef,
    stateReader,
    childrenValues,
    contextsValues,
  );

  return {
    values,
    childrenValues,
    contextsValues,
  } as unknown as ValuesOfComponentDef<TComponentDef>;
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
        assertIsNotUndefined(
          childrenValues,
          "childrenValues should not be undefined",
        );
        assertIsNotUndefined(
          contextsValues,
          "contextsValues should not be undefined",
        );
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
  assertIsNotUndefined(childrenKeys, "childrenKeys should not be undefined");
  const childrenComponentDefs = componentDef.config?.childrenDefs;
  if (typeof childrenComponentDefs !== "object") {
    return {} as ChildrenValues;
  }
  return Object.fromEntries(
    Object.entries(childrenKeys).map(([childName, childKeys]) => {
      const childDef = childrenComponentDefs[childName];
      assertIsNotUndefined(
        childDef,
        `Child component '${childName}' not found in childrenComponents`,
      );

      if (isCollectionChild(componentDef, childName)) {
        const childInstancesValueProviders = Object.fromEntries(
          childKeys.map(key => {
            const childValueProviders = createValueProviders<any>(
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
          createValueProviders<any>(
            rootComponentDef,
            stateReader.firstChildStateReader(childName),
          ),
        ];
      }
    }),
  ) as ChildrenValues;
}

function createContextsValues(
  rootComponentDef: ComponentDef,
  stateReader: RelativePathStateReader,
): ContextsValues {
  const componentDef = findComponentDefFromStatePath(
    rootComponentDef,
    stateReader.currentPath,
  );
  const contextsPath = componentDef.config?.contextsPath;
  if (contextsPath === undefined) {
    return {} as ContextsValues;
  }
  return Object.fromEntries(
    Object.getOwnPropertySymbols(contextsPath).map(contextSymbol => {
      const absolutePath = contextsPath[contextSymbol];
      assertIsNotUndefined(absolutePath);
      const stateReaderForContext = stateReader.forAbsolutePath(absolutePath);
      return [
        contextSymbol,
        createValueProviders<any>(rootComponentDef, stateReaderForContext),
      ];
    }),
  ) as ContextsValues;
}

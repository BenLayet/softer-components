import {
  ComponentDef,
  Values,
  Values as ValueProviders,
} from "@softer-components/types";
import { assertValueIsNotUndefined } from "./predicate.functions";
import { RelativePathStateReader } from "./relative-path-state-manager";

/**
 * Create Values provider for a component given its definition and state
 */
export function createValueProviders(
  componentDef: ComponentDef,
  stateReader: RelativePathStateReader,
): ValueProviders {
  // Create own values
  const values = createOwnValueProviders(componentDef, stateReader);

  // Create children's values
  const childrenKeys = stateReader.getChildrenKeys();
  const children = Object.fromEntries(
    Object.entries(childrenKeys).map(([childName, childKeys]) => {
      const childDef = componentDef.childrenComponents?.[childName];
      assertValueIsNotUndefined({ childDef });

      const collectionChildValueProviders = Object.fromEntries(
        childKeys.map((key) => {
          const childValueProviders = createValueProviders(
            childDef,
            stateReader.childStateReader(childName, key),
          );
          return [key, childValueProviders];
        }),
      );
      return [childName, collectionChildValueProviders];
    }),
  );

  return { values, children };
}

function createOwnValueProviders(
  componentDef: ComponentDef,
  stateReader: RelativePathStateReader,
): Values["values"] {
  const selectorsDef = componentDef.selectors || {};
  return Object.fromEntries(
    Object.entries(selectorsDef).map(([selectorName, selector]) => [
      selectorName,
      () => stateReader.selectValue(selector),
    ]),
  );
}

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
  const childrenNodes = stateReader.getChildrenNodes();
  const children = Object.fromEntries(
    Object.entries(childrenNodes).map(([childName, childNode]) => {
      const childDef = componentDef.childrenComponents?.[childName];
      assertValueIsNotUndefined({ childDef });

      const isCollection =
        componentDef.childrenConfig?.[childName].isCollection ?? false;

      if (isCollection) {
        const keys = (childNode ?? []) as string[];
        const collectionChildValueProviders = Object.fromEntries(
          keys.map((key) => {
            const childValueProviders = createValueProviders(
              childDef,
              stateReader.childStateReader(childName, key),
            );
            return [key, childValueProviders];
          }),
        );
        return [childName, collectionChildValueProviders];
      } else {
        return [
          childName,
          createValueProviders(
            childDef,
            stateReader.childStateReader(childName),
          ),
        ];
      }
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
      () => stateReader.selectValue(selectorName, selector),
    ]),
  );
}

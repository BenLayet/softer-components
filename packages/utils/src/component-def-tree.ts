import {
  ChildrenComponentDefs,
  ComponentContract,
  ComponentDef,
} from "@softer-components/types";

import { StatePath } from "./state-tree";

/**
 * Find the component definition at the given path within the root component definition
 * @param componentDef - Root component definition
 * @param statePath - Path to the desired component
 * @returns Component definition at the given path
 */
export const findComponentDef = <T extends ComponentContract = any>(
  componentDef: ComponentDef<T>,
  statePath: StatePath,
): ComponentDef => {
  if (statePath.length === 0) {
    return componentDef as ComponentDef;
  }
  const children =
    componentDef.childrenComponentDefs ?? ({} as ChildrenComponentDefs<T>);
  const childName = statePath[0][0];
  const child = children[childName];
  if (!child) {
    throw new Error(
      `invalid path: childName = '${childName}' not found. Valid children names = ${JSON.stringify(Object.keys(children))}`,
    );
  }
  return findComponentDef(child, statePath.slice(1));
};

export function isCollectionChild(
  componentDef: ComponentDef,
  childName: string,
): boolean {
  const initialChildInstancesDef = componentDef.initialChildren?.[childName];
  return Array.isArray(initialChildInstancesDef);
}

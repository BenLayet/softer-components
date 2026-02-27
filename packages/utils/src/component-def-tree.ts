import {
  ChildrenInstancesDefs,
  ComponentContract,
  ComponentDef,
} from "@softer-components/types";

import { StatePath } from "./path";

/**
 * Find the component definition at the given path within the root component definition
 * @param componentDef - Root component definition
 * @param statePath - Path to the desired component
 * @returns Component definition at the given path
 */
export const findComponentDefFromStatePath = (
  componentDef: ComponentDef,
  statePath: StatePath,
): ComponentDef => {
  return findComponentDefFromComponentPathParts(
    componentDef,
    statePath.map(([componentName]) => componentName),
  );
};
const findComponentDefFromComponentPathParts = (
  componentDef: ComponentDef,
  componentPath: string[],
): ComponentDef => {
  if (componentPath.length === 0) {
    return componentDef as ComponentDef;
  }
  const childName = componentPath[0];
  if (typeof componentDef.childrenComponentDefs !== "object") {
    throw new Error(
      `invalid path: childName = '${childName}' not found. no childrenComponentDefs defined.`,
    );
  }
  const child = componentDef.childrenComponentDefs[childName];
  if (!child) {
    const childrenNames = JSON.stringify(
      Object.keys(componentDef.childrenComponentDefs),
    );
    throw new Error(
      `invalid path: childName = '${childName}' not found. Valid children names = ${childrenNames}`,
    );
  }
  return findComponentDefFromComponentPathParts(child, componentPath.slice(1));
};

export function isCollectionChild<T extends ComponentContract>(
  componentDef: ComponentDef<T>,
  childName: string,
): boolean {
  if (typeof componentDef.initialChildren !== "object") {
    return false;
  }
  const initialChildInstancesDef = (
    componentDef.initialChildren as ChildrenInstancesDefs
  )[childName];
  return Array.isArray(initialChildInstancesDef);
}

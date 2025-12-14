import { ComponentDef } from "@softer-components/types";

import { ComponentPath } from "./utils.type";

/**
 * Find the component definition at the given path within the root component definition
 * @param componentDef - Root component definition
 * @param componentPath - Path to the desired component
 * @returns Component definition at the given path
 */
export const findComponentDef = (
  componentDef: ComponentDef,
  componentPath: ComponentPath,
): ComponentDef => {
  if (componentPath.length === 0) {
    return componentDef;
  }
  const children = componentDef.childrenComponents ?? {};
  const childName = componentPath[0][0];
  const child = children[childName];
  if (!child) {
    throw new Error(
      `invalid path: childName = '${childName}' not found. Valid children names = ${JSON.stringify(Object.keys(children))}`,
    );
  }
  return findComponentDef(child, componentPath.slice(1));
};

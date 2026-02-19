import {
  ChildrenComponentDefs,
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
  const children =
    componentDef.childrenComponentDefs ?? ({} as ChildrenComponentDefs);
  const childName = componentPath[0];
  const child = children[childName];
  if (!child) {
    throw new Error(
      `invalid path: childName = '${childName}' not found. Valid children names = ${JSON.stringify(Object.keys(children))}`,
    );
  }
  return findComponentDefFromComponentPathParts(child, componentPath.slice(1));
};

export function isCollectionChild<T extends ComponentContract>(
  componentDef: ComponentDef<T>,
  childName: string,
): boolean {
  const initialChildInstancesDef =
    componentDef.initialChildren?.[
      childName as keyof ChildrenInstancesDefs<T["children"]>
    ];
  return Array.isArray(initialChildInstancesDef);
}

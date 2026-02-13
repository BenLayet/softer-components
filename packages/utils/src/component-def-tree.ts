import {
  ChildrenComponentDefs,
  ChildrenInstancesDefs,
  ComponentContract,
  ComponentDef,
} from "@softer-components/types";

import { COMPONENT_SEPARATOR, StatePath } from "./path";
import { isNotEmptyString } from "./predicate.functions";

/**
 * Find the component definition at the given path within the root component definition
 * @param componentDef - Root component definition
 * @param statePath - Path to the desired component
 * @returns Component definition at the given path
 */
export const findComponentDefFromStatePath = <
  T extends ComponentContract = any,
>(
  componentDef: ComponentDef<T>,
  statePath: StatePath,
): ComponentDef => {
  return findComponentDefFromComponentPathParts(
    componentDef,
    statePath.map(([componentName]) => componentName),
  );
};
/**
 * Find the component definition at the given path within the root component definition
 * @param componentDef - Root component definition
 * @param componentPath - Path to the desired component
 * @returns Component definition at the given path
 */
export const findComponentDefFromComponentPath = <
  T extends ComponentContract = any,
>(
  componentDef: ComponentDef<T>,
  componentPath: string,
): ComponentDef => {
  return findComponentDefFromComponentPathParts(
    componentDef,
    componentPath.split(COMPONENT_SEPARATOR).filter(isNotEmptyString),
  );
};
const findComponentDefFromComponentPathParts = <
  T extends ComponentContract = any,
>(
  componentDef: ComponentDef<T>,
  componentPath: string[],
): ComponentDef => {
  if (componentPath.length === 0) {
    return componentDef as ComponentDef;
  }
  const children =
    componentDef.childrenComponentDefs ?? ({} as ChildrenComponentDefs<T>);
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

import { ComponentDef } from "@softer-components/types";
export function createComponentDefMap(
  componentDef: ComponentDef,
  parentPath: string = "/"
): Record<string, ComponentDef> {
  const map: Record<string, ComponentDef> = {
    [parentPath]: componentDef,
  };

  for (const [childKey, childDef] of Object.entries(
    componentDef.children ?? {}
  )) {
    const childPath = `${parentPath}${childKey}/`;
    Object.assign(map, createComponentDefMap(childDef, childPath));
  }

  return map;
}

export const extractComponentPathStr = (fullType: string): string => {
  return fullType.slice(0, fullType.lastIndexOf("/") + 1);
};
export const extractComponentDefPath = (fullType: string): string[] => {
  const parts = fullType.split("/");
  if (parts.length < 2) {
    return [];
  }
  return parts.slice(1, -1).map((part) => part.split(":")[0]);
};

export const extractEventName = (fullType: string): string => {
  const lastSlashIndex = fullType.lastIndexOf("/");
  if (lastSlashIndex === -1) {
    return "";
  }
  return fullType.slice(lastSlashIndex + 1);
};

export const findComponentDefFromPathArray = (
  componentDef: ComponentDef<any, any>,
  path: string[]
): ComponentDef<any, any> => {
  if (path.length === 0) {
    return componentDef;
  }
  const children = componentDef.children ?? {};
  const childName = path[0];
  const child = children[childName];
  if (!child) {
    throw new Error(
      `invalid path: childName = '${childName}' not found in children = ${JSON.stringify(Object.keys(children))}`
    );
  }
  return findComponentDefFromPathArray(child, path.slice(1));
};

export const findComponentDef = (
  rootComponentDef: ComponentDef,
  componentPath: string
): ComponentDef =>
  findComponentDefFromPathArray(
    rootComponentDef,
    extractComponentDefPath(componentPath)
  );

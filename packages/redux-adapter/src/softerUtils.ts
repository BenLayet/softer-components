import { ComponentDef, State } from "@softer-components/types";

export const mapComponentTree = (
  componentDef: ComponentDef<any, any, any, any>,
  name: string = "/",
): Record<string, ComponentDef> => {
  const children = componentDef.dependencies?.children ?? {};
  const tree = { [name]: componentDef };
  Object.entries(children).forEach(([childName, childDef]) => {
    Object.assign(tree, mapComponentTree(childDef, `${name}${childName}/`));
  });
  return tree;
};

export const initialStateFromComponentMap = (
  componentDef: Record<string, ComponentDef<any, any, any, any>>,
): Record<string, State> => {
  const initialState: Record<string, State> = {};
  Object.entries(componentDef).forEach(([name, def]) => {
    initialState[name] = def.initialState ?? {};
  });
  return initialState;
};

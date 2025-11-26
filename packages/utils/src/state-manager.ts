import { ChildrenNodes, State } from "@softer-components/types";
import { ComponentPath } from "./utils.type";

export interface StateManager {
  readState: (path: ComponentPath) => State;
  updateState: (path: ComponentPath, state: State) => void;
  createState: (path: ComponentPath, state: State) => void;
  removeStateTree(path: ComponentPath): void;
  getChildrenNodes(path: ComponentPath): ChildrenNodes;
  getChildrenPath(path: ComponentPath): ChildrenPaths;
  selectValue<T>(
    path: ComponentPath,
    selectorName: string,
    selector: (state: State) => T
  ): T;
}
export type ChildrenPaths = Record<string, string[] | string>;

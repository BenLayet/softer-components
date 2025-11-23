import { ChildrenNodes, State } from "@softer-components/types";
import { ComponentPath } from "./utils.type";

export interface StateManager {
  readState: (path: ComponentPath) => State;
  writeState: (path: ComponentPath, state: State) => void;
  removeState(path: ComponentPath): void;
  getChildrenNodes(path: ComponentPath): ChildrenNodes;
  selectValue<T>(
    path: ComponentPath,
    selectorName: string,
    selector: (state: State) => T
  ): T;
}

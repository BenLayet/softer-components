import { ChildrenNodes, State } from "@softer-components/types";
import { ComponentPath } from "./utils.type";
import { StateManager } from "./state-manager";

export class RelativePathStateManager {
  constructor(
    private readonly absolutePathStateManager: StateManager,
    private readonly currentPath: ComponentPath = []
  ) {}
  childStateManager(
    childName: string,
    childKey?: string
  ): RelativePathStateManager {
    return new RelativePathStateManager(this.absolutePathStateManager, [
      ...this.currentPath,
      [childName, childKey],
    ]);
  }
  readState(): State {
    return this.absolutePathStateManager.readState(this.currentPath);
  }
  createState(state: State): void {
    if (this.currentPath.length === 0) {
      this.absolutePathStateManager.updateState(this.currentPath, state);
    } else {
      this.absolutePathStateManager.createState(this.currentPath, state);
    }
  }
  updateState(state: State): void {
    this.absolutePathStateManager.updateState(this.currentPath, state);
  }
  getChildrenNodes(): ChildrenNodes {
    return this.absolutePathStateManager.getChildrenNodes(this.currentPath);
  }
  removeStateTree(): void {
    this.absolutePathStateManager.removeStateTree(this.currentPath);
  }
  selectValue<T>(selectorName: string, selector: (state: State) => T): T {
    return this.absolutePathStateManager.selectValue(
      this.currentPath,
      selectorName,
      selector
    );
  }
}

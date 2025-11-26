import { ChildrenNodes, State } from "@softer-components/types";
import { ComponentPath, GlobalState } from "./utils.type";
import { StateManager } from "./state-manager";

/**
 * Wrapper around StateManager that manages relative paths.
 * All state operations are delegated with the absolute path.
 */
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

  readState(globalState: GlobalState): State {
    return this.absolutePathStateManager.readState(
      globalState,
      this.currentPath
    );
  }

  createState(globalState: GlobalState, state: State): void {
    if (this.currentPath.length === 0) {
      this.absolutePathStateManager.updateState(
        globalState,
        this.currentPath,
        state
      );
    } else {
      this.absolutePathStateManager.createState(
        globalState,
        this.currentPath,
        state
      );
    }
  }

  updateState(globalState: GlobalState, state: State): void {
    this.absolutePathStateManager.updateState(
      globalState,
      this.currentPath,
      state
    );
  }

  getChildrenNodes(globalState: GlobalState): ChildrenNodes {
    return this.absolutePathStateManager.getChildrenNodes(
      globalState,
      this.currentPath
    );
  }

  removeStateTree(globalState: GlobalState): void {
    this.absolutePathStateManager.removeStateTree(
      globalState,
      this.currentPath
    );
  }

  selectValue<T>(
    globalState: GlobalState,
    selectorName: string,
    selector: (state: State) => T
  ): T {
    return this.absolutePathStateManager.selectValue(
      globalState,
      this.currentPath,
      selectorName,
      selector
    );
  }
}

import { ChildrenNodes, State } from "@softer-components/types";
import { ComponentPath, SofterRootState } from "./utils.type";
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

  readState(softerRootState: SofterRootState): State {
    return this.absolutePathStateManager.readState(
      softerRootState,
      this.currentPath
    );
  }

  createState(softerRootState: SofterRootState, state: State): void {
    if (this.currentPath.length === 0) {
      this.absolutePathStateManager.updateState(
        softerRootState,
        this.currentPath,
        state
      );
    } else {
      this.absolutePathStateManager.createState(
        softerRootState,
        this.currentPath,
        state
      );
    }
  }

  updateState(softerRootState: SofterRootState, state: State): void {
    this.absolutePathStateManager.updateState(
      softerRootState,
      this.currentPath,
      state
    );
  }

  getChildrenNodes(softerRootState: SofterRootState): ChildrenNodes {
    return this.absolutePathStateManager.getChildrenNodes(
      softerRootState,
      this.currentPath
    );
  }

  removeStateTree(softerRootState: SofterRootState): void {
    this.absolutePathStateManager.removeStateTree(
      softerRootState,
      this.currentPath
    );
  }

  selectValue<T>(
    softerRootState: SofterRootState,
    selectorName: string,
    selector: (state: State) => T
  ): T {
    return this.absolutePathStateManager.selectValue(
      softerRootState,
      this.currentPath,
      selectorName,
      selector
    );
  }
}

import { ChildrenNodes, State } from "@softer-components/types";
import { ComponentPath, SofterRootState } from "./utils.type";
import { StateManager } from "./state-manager";

/**
 * Wrapper around StateManager that manages relative paths.
 * All state operations are delegated with the absolute path.
 *
 * This state manager is meant to be shortly lived (a new instance for each event and each level while visiting the component tree).
 */
export class RelativePathStateManager {
  constructor(
    private readonly softerRootState: SofterRootState,
    private readonly absolutePathStateManager: StateManager,
    private readonly currentPath: ComponentPath = [],
  ) {}

  childStateManager(
    childName: string,
    childKey?: string,
  ): RelativePathStateManager {
    return new RelativePathStateManager(
      this.softerRootState,
      this.absolutePathStateManager,
      [...this.currentPath, [childName, childKey]],
    );
  }

  readState(): State {
    return this.absolutePathStateManager.readState(
      this.softerRootState,
      this.currentPath,
    );
  }

  createState(state: State): void {
    if (this.currentPath.length === 0) {
      this.absolutePathStateManager.updateState(
        this.softerRootState,
        this.currentPath,
        state,
      );
    } else {
      this.absolutePathStateManager.createState(
        this.softerRootState,
        this.currentPath,
        state,
      );
    }
  }

  updateState(state: State): void {
    this.absolutePathStateManager.updateState(
      this.softerRootState,
      this.currentPath,
      state,
    );
  }

  createEmptyCollectionChild(childName: string): void {
    this.absolutePathStateManager.createEmptyCollectionChild(
      this.softerRootState,
      this.currentPath,
      childName,
    );
  }

  getChildrenNodes(): ChildrenNodes {
    return this.absolutePathStateManager.getChildrenNodes(
      this.softerRootState,
      this.currentPath,
    );
  }

  removeStateTree(): void {
    this.absolutePathStateManager.removeStateTree(
      this.softerRootState,
      this.currentPath,
    );
  }

  selectValue<T>(selectorName: string, selector: (state: State) => T): T {
    return this.absolutePathStateManager.selectValue(
      this.softerRootState,
      this.currentPath,
      selectorName,
      selector,
    );
  }
}

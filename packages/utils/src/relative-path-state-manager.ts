import {
  ChildrenInstancesDefs,
  ChildrenValues,
  State,
} from "@softer-components/types";

import { StateManager, StateReader } from "./state-manager";
import { ChildrenKeys } from "./tree";
import { ComponentPath, SofterRootState } from "./utils.type";

/**
 * Wrapper around StateManager that manages relative paths.
 * All state operations are delegated with the absolute path.
 *
 * This state manager is meant to be shortly lived (a new instance for each event and each level while visiting the component tree).
 */
export class RelativePathStateReader {
  constructor(
    protected readonly softerRootState: SofterRootState,
    private readonly absolutePathStateReader: StateReader,
    protected readonly currentPath: ComponentPath = [],
  ) {}

  childStateReader(
    childName: string,
    childKey: string,
  ): RelativePathStateReader {
    return new RelativePathStateReader(
      this.softerRootState,
      this.absolutePathStateReader,
      [...this.currentPath, [childName, childKey]],
    );
  }
  firstChildStateReader(childName: string): RelativePathStateReader {
    const childKey = this.getChildrenKeys()[childName]?.[0];
    if (!childKey) {
      throw new Error(`No child key found for child ${childName}`);
    }
    return new RelativePathStateReader(
      this.softerRootState,
      this.absolutePathStateReader,
      [...this.currentPath, [childName, childKey]],
    );
  }
  parentStateReader(): RelativePathStateReader {
    if (this.currentPath.length === 0) {
      throw new Error("cannot go up from root");
    }
    return new RelativePathStateReader(
      this.softerRootState,
      this.absolutePathStateReader,
      this.currentPath.slice(0, -1),
    );
  }

  readState(): State {
    return this.absolutePathStateReader.readState(
      this.softerRootState,
      this.currentPath,
    );
  }
  getChildrenKeys(): ChildrenKeys {
    return this.absolutePathStateReader.getChildrenKeys(
      this.softerRootState,
      this.currentPath,
    );
  }

  selectValue<T>(selector: (state: State) => T, children: ChildrenValues): T {
    return this.absolutePathStateReader.selectValue(
      this.softerRootState,
      this.currentPath,
      selector,
      children,
    );
  }
}

/**
 * Wrapper around StateManager that manages relative paths.
 * All state operations are delegated with the absolute path.
 *
 * This state manager is meant to be shortly lived (a new instance for each event and each level while visiting the component tree).
 */
export class RelativePathStateManager extends RelativePathStateReader {
  constructor(
    softerRootState: SofterRootState,
    private readonly absolutePathStateManager: StateManager,
    currentPath: ComponentPath = [],
  ) {
    super(softerRootState, absolutePathStateManager, currentPath);
  }

  childStateManager(
    childName: string,
    childKey: string,
  ): RelativePathStateManager {
    return new RelativePathStateManager(
      this.softerRootState,
      this.absolutePathStateManager,
      [...this.currentPath, [childName, childKey]],
    );
  }
  firstChildStateManager(childName: string): RelativePathStateManager {
    const childKey = this.getChildrenKeys()[childName]?.[0];
    if (!childKey) {
      throw new Error(`No child key found for child ${childName}`);
    }
    return new RelativePathStateManager(
      this.softerRootState,
      this.absolutePathStateManager,
      [...this.currentPath, [childName, childKey]],
    );
  }

  createState(state: State): void {
    this.absolutePathStateManager.createState(
      this.softerRootState,
      this.currentPath,
      state,
    );
  }

  updateState(state: State): void {
    this.absolutePathStateManager.updateState(
      this.softerRootState,
      this.currentPath,
      state,
    );
  }

  initializeChildBranches(childName: string): void {
    this.absolutePathStateManager.initializeChildBranches(
      this.softerRootState,
      this.currentPath,
      childName,
    );
  }

  removeStateTree(): void {
    this.absolutePathStateManager.removeStateTree(
      this.softerRootState,
      this.currentPath,
    );
  }

  reorderChildStates(childName: string, desiredKeys: string[]) {
    this.absolutePathStateManager.reorderChildStates(
      this.softerRootState,
      this.currentPath,
      childName,
      desiredKeys,
    );
  }
}

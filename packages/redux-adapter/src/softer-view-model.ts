import { createSelector } from "@reduxjs/toolkit";
import { ComponentDef } from "@softer-components/types";
import {
  ChildrenKeys,
  INPUTTED_BY_USER,
  RelativePathStateReader,
  StatePath,
  StateTree,
  TreeStateManager,
  createValueProviders,
  findComponentDefFromStatePath,
  statePathToString,
  stringToStatePath,
} from "@softer-components/utils";

import {
  GlobalState,
  ReduxDispatch,
  eventToAction,
  getSofterRootTree,
} from "./softer-mappers";

export type PathOfFirstInstanceOfEachChild = Record<string, string>;
export type ChildrenPaths = Record<string, string[]>;
export type ComponentViewModel = {
  valuesSelector: (globalState: GlobalState) => Record<string, any>;
  pathOfFirstInstanceOfEachChildSelector: (
    globalState: GlobalState,
  ) => PathOfFirstInstanceOfEachChild;
  childrenPathsSelector: (globalState: GlobalState) => ChildrenPaths;
  dispatchers: (
    dispatch: ReduxDispatch,
  ) => Record<string, (payload: any) => void>;
};

export interface SofterViewModel {
  valuesSelector(
    statePathStr: string,
  ): (globalState: GlobalState) => Record<string, any>;
  pathOfFirstInstanceOfEachChildSelector(
    statePathStr: string,
  ): (globalState: GlobalState) => PathOfFirstInstanceOfEachChild;
  childrenPathsSelector(
    statePathStr: string,
  ): (globalState: GlobalState) => ChildrenPaths;
  dispatchers(
    statePathStr: string,
    dispatch: ReduxDispatch,
  ): Record<string, (payload: any) => void>;
}

/**
 * Maintains a map of memoized component view models at each path in the global state tree.
 */
export class SofterApplicationViewModel implements SofterViewModel {
  private readonly componentViewModels: Record<string, ComponentViewModel> = {};
  public readonly stateManager = new TreeStateManager();

  constructor(private readonly rootComponentDef: ComponentDef) {
    this.stateManager.addStateTreeListener({
      onStateRemoved: statePath =>
        delete this.componentViewModels[statePathToString(statePath)],
    });
  }

  valuesSelector(statePathStr: string) {
    return this.componentViewModelAtPath(statePathStr).valuesSelector;
  }
  childrenPathsSelector(statePathStr: string) {
    return this.componentViewModelAtPath(statePathStr).childrenPathsSelector;
  }
  pathOfFirstInstanceOfEachChildSelector(statePathStr: string) {
    return this.componentViewModelAtPath(statePathStr)
      .pathOfFirstInstanceOfEachChildSelector;
  }
  dispatchers(statePathStr: string, dispatch: ReduxDispatch) {
    return this.componentViewModelAtPath(statePathStr).dispatchers(dispatch);
  }

  private componentViewModelAtPath = (
    statePathStr: string,
  ): ComponentViewModel => {
    if (!this.componentViewModels[statePathStr]) {
      this.componentViewModels[statePathStr] = this.createComponentViewModel(
        stringToStatePath(statePathStr),
      );
    }
    return this.componentViewModels[statePathStr];
  };

  private readonly createComponentViewModel = (
    statePath: StatePath,
  ): ComponentViewModel => {
    const childrenSelector = this.createChildrenSelector(
      getSofterRootTree,
      statePath,
    );
    const childrenPathsSelector = this.createChildrenPathsSelector(
      childrenSelector,
      statePath,
    );
    const pathOfFirstInstanceOfEachChildSelector =
      this.createPathOfFirstInstanceOfEachChildSelector(childrenPathsSelector);
    const valuesSelector = this.createValuesSelector(
      getSofterRootTree,
      statePath,
    );
    const dispatchers = this.createDispatchers(statePath);

    return {
      dispatchers,
      childrenPathsSelector,
      pathOfFirstInstanceOfEachChildSelector,
      valuesSelector,
    };
  };
  private createChildrenSelector(
    rootStateSelector: (globalState: GlobalState) => StateTree,
    statePath: StatePath,
  ) {
    return createSelector([rootStateSelector], (rootState: StateTree) =>
      this.stateManager.getChildrenKeys(rootState, statePath),
    );
  }

  private createChildrenPathsSelector(
    childrenSelector: (state: GlobalState) => ChildrenKeys | undefined,
    statePath: StatePath,
  ): (state: GlobalState) => ChildrenPaths {
    return createSelector(
      [childrenSelector],
      (children: Record<string, string[]> | undefined): ChildrenPaths =>
        Object.fromEntries(
          Object.entries(children ?? {}).map(([childName, childKeys]) => [
            childName,
            childKeys.map(key =>
              statePathToString([...statePath, [childName, key]]),
            ),
          ]),
        ),
    );
  }

  private createPathOfFirstInstanceOfEachChildSelector(
    childrenPathsSelector: (state: GlobalState) => ChildrenPaths,
  ) {
    return createSelector([childrenPathsSelector], paths =>
      Object.fromEntries(
        Object.entries(paths).map(([childName, keys]) => [childName, keys[0]]),
      ),
    );
  }

  private createValuesSelector(
    rootStateSelector: (globalState: GlobalState) => StateTree,
    statePath: StatePath,
  ) {
    return createSelector([rootStateSelector], rootState => {
      const values: Record<string, any> = {};
      const valueProviders = createValueProviders(
        this.rootComponentDef as ComponentDef,
        new RelativePathStateReader(rootState, this.stateManager, statePath),
      );
      Object.entries(
        (valueProviders.values ?? {}) as Record<string, () => any>,
      ).forEach(([valueName, valueProvider]) => {
        Object.defineProperty(values, valueName, {
          get() {
            return valueProvider();
          },
          enumerable: false,
          configurable: false,
        });
      });
      return values;
    });
  }

  private createDispatchers(statePath: StatePath) {
    const componentDef = findComponentDefFromStatePath(
      this.rootComponentDef,
      statePath,
    );
    let cachedDispatchers: any;
    return (dispatch: ReduxDispatch) => {
      if (!cachedDispatchers) {
        cachedDispatchers = Object.fromEntries(
          (componentDef.uiEvents ?? []).map(eventName => {
            return [
              eventName,
              (payload: any) =>
                dispatch(
                  eventToAction({
                    statePath: statePath,
                    name: eventName,
                    payload,
                    source: INPUTTED_BY_USER,
                  }),
                ),
            ];
          }),
        ) as any;
      }
      return cachedDispatchers;
    };
  }
}

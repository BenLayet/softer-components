import { createSelector } from "@reduxjs/toolkit";
import { ComponentDef } from "@softer-components/types";
import {
  INPUTTED_BY_USER,
  RelativePathStateReader,
  StatePath,
  TreeStateManager,
  createValueProviders,
  findComponentDef,
  findSubTree,
  isUndefined,
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
    this.stateManager.setRemoveStateTreeListener(
      path => delete this.componentViewModels[statePathToString(path)],
    );
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
    const stateTreeSelector = (globalState: GlobalState) =>
      findSubTree(getSofterRootTree(globalState), statePath);

    const childrenSelector = createSelector([stateTreeSelector], subTree =>
      isUndefined(subTree)
        ? undefined
        : this.stateManager.getChildrenKeys(subTree, []),
    );

    const childrenPathsSelector = createSelector([childrenSelector], children =>
      Object.fromEntries(
        Object.entries(children ?? {}).map(([childName, childKeys]) => [
          childName,
          childKeys.map(key =>
            statePathToString([...statePath, [childName, key]]),
          ),
        ]),
      ),
    );
    const pathOfFirstInstanceOfEachChildSelector = createSelector(
      [childrenPathsSelector],
      paths =>
        Object.fromEntries(
          Object.entries(paths).map(([childName, keys]) => [
            childName,
            keys[0],
          ]),
        ),
    );

    const valuesSelector = createSelector([stateTreeSelector], stateTree => {
      if (isUndefined(stateTree)) {
        return {};
      }
      const values: Record<string, any> = {};
      const componentDef = findComponentDef(this.rootComponentDef, statePath);
      const valueProviders = createValueProviders(
        componentDef,
        new RelativePathStateReader(stateTree, this.stateManager, []),
      );
      Object.entries(valueProviders.values ?? {}).forEach(
        ([valueName, valueProvider]) => {
          Object.defineProperty(values, valueName, {
            get() {
              return valueProvider();
            },
            enumerable: false,
            configurable: false,
          });
        },
      );
      return values;
    });
    const componentDef = findComponentDef(this.rootComponentDef, statePath);
    let cachedDispatchers: any;
    const dispatchers = (dispatch: ReduxDispatch) => {
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

    return {
      dispatchers,
      childrenPathsSelector,
      pathOfFirstInstanceOfEachChildSelector,
      valuesSelector,
    };
  };
}

import { createSelector } from "@reduxjs/toolkit";
import { ComponentDef } from "@softer-components/types";
import {
  ChildrenKeys,
  INPUTTED_BY_USER,
  RelativePathStateReader,
  StatePath,
  StateTree,
  TreeStateManager,
  assertIsNotUndefined,
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

export type ChildrenPaths = Record<
  string,
  string[] | string | (string | undefined)
>;
export type ComponentViewModel = {
  valuesSelector: (globalState: GlobalState) => Record<string, any>;
  childrenPathsSelector: (globalState: GlobalState) => ChildrenPaths;
  dispatchers: (
    dispatch: ReduxDispatch,
  ) => Record<string, (payload: any) => void>;
};

export interface SofterViewModel {
  valuesSelector(
    statePathStr: string,
  ): (globalState: GlobalState) => Record<string, any>;
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
    const childrenSelector = this.createChildrenKeysSelector(
      getSofterRootTree,
      statePath,
    );
    const childrenPathsSelector = this.createChildrenPathsSelector(
      childrenSelector,
      statePath,
    );
    const valuesSelector = this.createValuesSelector(
      getSofterRootTree,
      statePath,
    );
    const dispatchers = this.createDispatchers(statePath);

    return {
      dispatchers,
      childrenPathsSelector,
      valuesSelector,
    };
  };
  private createChildrenKeysSelector(
    rootStateSelector: (globalState: GlobalState) => StateTree,
    statePath: StatePath,
  ) {
    return createSelector([rootStateSelector], (rootState: StateTree) =>
      this.stateManager.getChildrenKeys(rootState, statePath),
    );
  }

  private createChildrenPathsSelector(
    childrenKeysSelector: (state: GlobalState) => ChildrenKeys | undefined,
    statePath: StatePath,
  ): (state: GlobalState) => ChildrenPaths {
    const componentDef = findComponentDefFromStatePath(
      this.rootComponentDef,
      statePath,
    );
    assertIsNotUndefined(
      componentDef,
      "no component definition found at path: " + statePathToString(statePath),
    );
    const initialChildren =
      typeof componentDef.initialChildren === "object"
        ? componentDef.initialChildren
        : {};

    return createSelector(
      [childrenKeysSelector],
      (childrenKeys: Record<string, string[]> | undefined): ChildrenPaths =>
        Object.fromEntries(
          Object.entries(childrenKeys ?? {})
            .map(
              ([childName, childKeys]) =>
                [
                  childName,
                  childKeys.map(key =>
                    statePathToString([...statePath, [childName, key]]),
                  ),
                ] as [string, string[]],
            )
            .map(([childName, childPaths]) => [
              childName,
              Array.isArray(initialChildren[childName]) //use initial children definition to determine if child is collection
                ? childPaths
                : childPaths[0],
            ]),
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

    const uiEvents =
      typeof componentDef.uiEvents === "object" ? componentDef.uiEvents : [];

    return (dispatch: ReduxDispatch) => {
      if (!cachedDispatchers) {
        cachedDispatchers = Object.fromEntries(
          uiEvents.map(eventName => {
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

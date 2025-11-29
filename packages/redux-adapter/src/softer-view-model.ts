import { createSelector } from "@reduxjs/toolkit";
import { ComponentDef } from "@softer-components/types";
import {
  ComponentPath,
  findComponentDef,
  findSubTree,
  isUndefined,
  TreeStateManager,
} from "@softer-components/utils";
import {
  componentPathToString,
  eventToAction,
  getSofterRootTree,
  GlobalState,
  ReduxDispatch,
  stringToComponentPath,
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
    pathStr: string,
  ): (globalState: GlobalState) => Record<string, any>;
  pathOfFirstInstanceOfEachChildSelector(
    pathStr: string,
  ): (globalState: GlobalState) => PathOfFirstInstanceOfEachChild;
  childrenPathsSelector(
    pathStr: string,
  ): (globalState: GlobalState) => ChildrenPaths;
  dispatchers(
    pathStr: string,
    dispatch: ReduxDispatch,
  ): Record<string, (payload: any) => void>;
}

/**
 * Maintains a map of memoized component view models at each path in the global state tree.
 */
export class MemoizedApplicationViewModel implements SofterViewModel {
  private readonly componentViewModels: Record<string, ComponentViewModel> = {};

  constructor(
    private readonly stateManager: TreeStateManager,
    private readonly rootComponentDef: ComponentDef,
  ) {
    this.stateManager.setRemoveStateTreeListener(
      (path) => delete this.componentViewModels[componentPathToString(path)],
    );
  }
  valuesSelector(pathStr: string) {
    return this.componentViewModelAtPath(pathStr).valuesSelector;
  }
  childrenPathsSelector(pathStr: string) {
    return this.componentViewModelAtPath(pathStr).childrenPathsSelector;
  }
  pathOfFirstInstanceOfEachChildSelector(pathStr: string) {
    return this.componentViewModelAtPath(pathStr)
      .pathOfFirstInstanceOfEachChildSelector;
  }
  dispatchers(pathStr: string, dispatch: ReduxDispatch) {
    return this.componentViewModelAtPath(pathStr).dispatchers(dispatch);
  }

  private componentViewModelAtPath = (pathStr: string): ComponentViewModel => {
    if (!this.componentViewModels[pathStr]) {
      this.componentViewModels[pathStr] = this.createComponentViewModel(
        stringToComponentPath(pathStr),
      );
    }
    return this.componentViewModels[pathStr];
  };

  private readonly createComponentViewModel = (
    componentPath: ComponentPath,
  ): ComponentViewModel => {
    const stateTreeSelector = (globalState: GlobalState) =>
      findSubTree(getSofterRootTree(globalState), componentPath);

    const ownStateSelector = createSelector([stateTreeSelector], (subTree) =>
      isUndefined(subTree)
        ? undefined
        : this.stateManager.readState(subTree, []),
    );

    const childrenKeysSelector = createSelector(
      [stateTreeSelector],
      (subTree) =>
        isUndefined(subTree)
          ? undefined
          : this.stateManager.getChildrenKeys(subTree, []),
    );

    const childrenPathsSelector = createSelector(
      [childrenKeysSelector],
      (childrenKeys) =>
        Object.fromEntries(
          Object.entries(childrenKeys ?? {}).map(([childName, childKeys]) => [
            childName,
            childKeys.map((key) =>
              componentPathToString([...componentPath, [childName, key]]),
            ),
          ]),
        ),
    );
    const pathOfFirstInstanceOfEachChildSelector = createSelector(
      [childrenPathsSelector],
      (paths) =>
        Object.fromEntries(
          Object.entries(paths).map(([childName, keys]) => [
            childName,
            keys[0],
          ]),
        ),
    );
    const valuesSelector = createSelector([ownStateSelector], (state) =>
      Object.fromEntries(
        Object.entries(
          findComponentDef(this.rootComponentDef, componentPath).selectors ??
            {},
        ).map(([selectorName, localSelector]) => {
          return [selectorName, localSelector(state)];
        }),
      ),
    );
    const componentDef = findComponentDef(this.rootComponentDef, componentPath);
    const dispatchers = (dispatch: ReduxDispatch) =>
      Object.fromEntries(
        (componentDef.uiEvents ?? []).map((eventName) => {
          return [
            eventName,
            (payload: any) =>
              dispatch(
                eventToAction({ componentPath, name: eventName, payload }),
              ),
          ];
        }),
      ) as any;

    return {
      dispatchers,
      childrenPathsSelector,
      pathOfFirstInstanceOfEachChildSelector,
      valuesSelector,
    };
  };
}

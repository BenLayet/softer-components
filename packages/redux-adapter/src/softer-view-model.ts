import { createSelector } from "@reduxjs/toolkit";
import { ComponentDef } from "@softer-components/types";
import {
  ComponentPath,
  componentPathToString,
  findComponentDef,
  findSubTree,
  isUndefined,
  stringToComponentPath,
  TreeStateManager,
  createValueProviders,
  RelativePathStateReader,
  createChildrenValues,
} from "@softer-components/utils";
import {
  eventToAction,
  getSofterRootTree,
  GlobalState,
  ReduxDispatch,
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
export class SofterApplicationViewModel implements SofterViewModel {
  private readonly componentViewModels: Record<string, ComponentViewModel> = {};
  public readonly stateManager = new TreeStateManager();

  constructor(private readonly rootComponentDef: ComponentDef) {
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

    const valuesSelector = createSelector(
      [stateTreeSelector, ownStateSelector],
      (stateTree, ownState) => {
        if (isUndefined(stateTree)) {
          return {};
        }
        const values: Record<string, any> = {};
        const componentDef = findComponentDef(
          this.rootComponentDef,
          componentPath,
        );
        const children = createChildrenValues(
          componentDef,
          new RelativePathStateReader(stateTree, this.stateManager, []),
        );
        Object.entries(componentDef.selectors ?? {}).forEach(
          ([selectorName, selector]) => {
            Object.defineProperty(values, selectorName, {
              get() {
                return selector(ownState, children);
              },
              enumerable: false,
              configurable: false,
            });
          },
        );
        return values;
      },
    );
    const componentDef = findComponentDef(this.rootComponentDef, componentPath);
    const dispatchers = (dispatch: ReduxDispatch) =>
      Object.fromEntries(
        (componentDef.uiEvents ?? []).map((eventName) => {
          return [
            eventName,
            (payload: any) =>
              dispatch(
                eventToAction({
                  componentPath,
                  name: eventName,
                  payload,
                  source: "🖱️",
                }),
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
